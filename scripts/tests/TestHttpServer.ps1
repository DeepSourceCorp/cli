# Minimal, dependency-free local HTTP server used by the installer tests.
#
# Serves fixed byte-array responses for a small set of routes from a
# background PowerShell instance backed by System.Net.HttpListener. No
# external modules (Pester, etc.) are required; only .NET types already
# shipped with Windows PowerShell 5.1 and PowerShell 7 (pwsh).

function New-TestHttpServer {
    param(
        [int]$Port = 0
    )

    # HttpListener requires exclusive access to a port; retry a few times
    # with a fresh random port if the chosen one is unavailable.
    $attempts = 0
    while ($true) {
        $attempts++
        $tryPort = if ($Port -ne 0) { $Port } else { Get-Random -Minimum 20000 -Maximum 60000 }

        $routes = [hashtable]::Synchronized(@{})
        $requestLog = [System.Collections.ArrayList]::Synchronized(([System.Collections.ArrayList]::new()))

        $ps = [powershell]::Create()
        $null = $ps.AddScript({
            param($port, $routes, $requestLog)

            $listener = New-Object System.Net.HttpListener
            $listener.Prefixes.Add("http://127.0.0.1:$port/")
            $listener.Start()

            while ($listener.IsListening) {
                try {
                    $ctx = $listener.GetContext()
                } catch {
                    break
                }

                $path = $ctx.Request.Url.AbsolutePath
                [void]$requestLog.Add($path)

                if ($routes.ContainsKey($path)) {
                    $route = $routes[$path]
                    $ctx.Response.StatusCode = $route.StatusCode
                    $ctx.Response.ContentType = $route.ContentType
                    $bytes = $route.Bytes
                    $ctx.Response.ContentLength64 = $bytes.Length
                    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $ctx.Response.StatusCode = 404
                }
                $ctx.Response.OutputStream.Close()

                if ($routes.ContainsKey("__stop__")) {
                    $listener.Stop()
                    break
                }
            }
        }).AddArgument($tryPort).AddArgument($routes).AddArgument($requestLog)

        $asyncResult = $ps.BeginInvoke()

        # Actively poll for the listener to accept TCP connections instead of
        # a fixed sleep: background PowerShell instance startup time varies
        # (more so under some hosts/loads), and a fixed short sleep was
        # observed to race the listener's Start() call intermittently.
        $ready = $false
        $deadline = (Get-Date).AddSeconds(5)
        while ((Get-Date) -lt $deadline) {
            if ($ps.InvocationStateInfo.State -eq [System.Management.Automation.PSInvocationState]::Failed) {
                break
            }
            try {
                $client = New-Object System.Net.Sockets.TcpClient
                $client.Connect("127.0.0.1", $tryPort)
                $client.Close()
                $ready = $true
                break
            } catch {
                Start-Sleep -Milliseconds 50
            }
        }

        if (-not $ready) {
            $ps.Stop()
            $ps.Dispose()
            if ($attempts -ge 10) {
                throw "Failed to start test HTTP server after $attempts attempts"
            }
            continue
        }

        return [pscustomobject]@{
            Port         = $tryPort
            BaseUrl      = "http://127.0.0.1:$tryPort"
            Routes       = $routes
            RequestLog   = $requestLog
            PowerShell   = $ps
            AsyncResult  = $asyncResult
        }
    }
}

function Add-TestRoute {
    param(
        [Parameter(Mandatory)] $Server,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][byte[]]$Bytes,
        [int]$StatusCode = 200,
        [string]$ContentType = "application/octet-stream"
    )

    $Server.Routes[$Path] = [pscustomobject]@{
        Bytes       = $Bytes
        StatusCode  = $StatusCode
        ContentType = $ContentType
    }
}

function Get-TestRequestCount {
    param([Parameter(Mandatory)] $Server)
    return $Server.RequestLog.Count
}

function Stop-TestHttpServer {
    param([Parameter(Mandatory)] $Server)

    $Server.Routes["__stop__"] = $true
    # Nudge the blocking GetContext() call so the loop notices the stop flag.
    try {
        Invoke-WebRequest -Uri "$($Server.BaseUrl)/__shutdown__" -UseBasicParsing -TimeoutSec 2 | Out-Null
    } catch {
        # ignored: the listener may already be stopping
    }
    Start-Sleep -Milliseconds 150

    try { $Server.PowerShell.Stop() } catch {}
    try { $Server.PowerShell.Dispose() } catch {}
}
