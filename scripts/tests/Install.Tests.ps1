# Dependency-light installer tests for scripts/install.ps1.template.
#
# No Pester or other package dependencies are used: this is a plain
# PowerShell script that dot-sources the rendered installer (in test mode),
# exercises it directly, and reports PASS/FAIL per case. It works under both
# Windows PowerShell 5.1 (powershell.exe) and PowerShell 7+ (pwsh).
#
# Run with:
#   powershell -NoProfile -File scripts\tests\Install.Tests.ps1
#   pwsh       -NoProfile -File scripts\tests\Install.Tests.ps1
#
# Exit code is non-zero if any test case fails.

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "TestHttpServer.ps1")
. (Join-Path $PSScriptRoot "TestCommon.ps1")

# Render the template once and dot-source its installer scriptblock without
# running an installation. This defines
# Get-DeepSourcePlatformKey / Install-DeepSourceCli (and $BaseUrl/$BinaryName)
# in this scope.
$renderedPath = New-RenderedInstallScript -BaseUrl "https://example.invalid" -BinaryName "deepsource-test"
try {
    . $renderedPath
} finally {
    Remove-Item -Path $renderedPath -Force -ErrorAction SilentlyContinue
}

Invoke-TestCase "Template placeholders are substituted correctly" {
    Assert-Equal "https://example.invalid" $BaseUrl "rendered BaseUrl"
    Assert-Equal "deepsource-test" $BinaryName "rendered BinaryName"
}

# --- Architecture detection (Get-DeepSourcePlatformKey) ---------------------

Invoke-TestCase "Native ARM64 environment resolves to windows_arm64" {
    $key = Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "ARM64"
    Assert-Equal "windows_arm64" $key "platform key"
}

Invoke-TestCase "Native AMD64 environment resolves to windows_amd64" {
    $key = Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "AMD64"
    Assert-Equal "windows_amd64" $key "platform key"
}

Invoke-TestCase "Emulated x64 PowerShell on ARM64 host resolves to windows_arm64" {
    # Windows sets PROCESSOR_ARCHITEW6432 to the *native* host architecture
    # when the current process (PROCESSOR_ARCHITECTURE) is running under
    # WOW64 emulation, e.g. x64 PowerShell launched on an ARM64 machine.
    $key = Get-DeepSourcePlatformKey -Architew6432 "ARM64" -Architecture "AMD64"
    Assert-Equal "windows_arm64" $key "platform key should prefer PROCESSOR_ARCHITEW6432"
}

Invoke-TestCase "Architecture values normalize case-insensitively and accept aliases" {
    Assert-Equal "windows_amd64" (Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "amd64") "lowercase amd64"
    Assert-Equal "windows_arm64" (Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "Arm64") "mixed-case Arm64"
    Assert-Equal "windows_amd64" (Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "x86_64") "x86_64 alias"
    Assert-Equal "windows_arm64" (Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "aarch64") "aarch64 alias"
    Assert-Equal "windows_arm64" (Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "AARCH64") "uppercase AARCH64 alias"
}

Invoke-TestCase "Unsupported architecture throws a clear error" {
    $threw = $false
    try {
        Get-DeepSourcePlatformKey -Architew6432 $null -Architecture "IA64" | Out-Null
    } catch {
        $threw = $true
        Assert-Match "$_" "Unsupported architecture" "error message"
        Assert-Match "$_" "IA64" "error message should include the offending value"
    }
    Assert-True $threw "expected Get-DeepSourcePlatformKey to throw for an unsupported architecture"
}

Invoke-TestCase "Missing architecture environment info throws a clear error" {
    $threw = $false
    try {
        Get-DeepSourcePlatformKey -Architew6432 $null -Architecture $null | Out-Null
    } catch {
        $threw = $true
        Assert-Match "$_" "Unable to determine processor architecture" "error message"
    }
    Assert-True $threw "expected Get-DeepSourcePlatformKey to throw when no architecture info is available"
}

if ($env:DEEPSOURCE_EXPECTED_PLATFORM) {
    Invoke-TestCase "Real host environment resolves to the expected platform" {
        Assert-Equal $env:DEEPSOURCE_EXPECTED_PLATFORM (Get-DeepSourcePlatformKey) "real host platform key"
    }
}

# --- Install-DeepSourceCli: failure paths that must not touch the network ---

Invoke-TestCase "Unsupported architecture fails before any manifest/archive request" {
    $installDir = New-TestInstallDir
    $output = (Install-DeepSourceCli -BaseUrl "http://127.0.0.1:1" -BinaryName "deepsource-test" `
        -InstallDir $installDir -Architew6432 $null -Architecture "IA64" -PathScope Process 6>&1 | Out-String)

    Assert-Match $output "Unsupported architecture" "should report the architecture problem"
    Assert-NoMatch $output "Failed to fetch manifest" "should fail before attempting a manifest fetch"
    Assert-True (-not (Test-Path $installDir)) "install dir should never be created"
}

# --- Install-DeepSourceCli: end-to-end against a local fixture server -------

function New-FixtureManifestAndServer {
    # Sets up a local HTTP server serving a manifest with distinct ARM64 and
    # AMD64 archives (so tests can prove the correct one was selected) and
    # returns everything the calling test needs.
    $binaryName = "deepsource-test"
    $armContent = [System.Text.Encoding]::UTF8.GetBytes("ARM64-BINARY-CONTENT")
    $amdContent = [System.Text.Encoding]::UTF8.GetBytes("AMD64-BINARY-CONTENT")
    $armZip = New-TestZipArchive -EntryName "$binaryName.exe" -Content $armContent
    $amdZip = New-TestZipArchive -EntryName "$binaryName.exe" -Content $amdContent
    $armSha = Get-Sha256Hex -Bytes $armZip
    $amdSha = Get-Sha256Hex -Bytes $amdZip

    $manifestObj = [ordered]@{
        version   = "9.9.9"
        buildTime = "2026-01-01T00:00:00Z"
        platforms = [ordered]@{
            windows_arm64 = [ordered]@{ archive = "deepsource_9.9.9_windows_arm64.zip"; sha256 = $armSha }
            windows_amd64 = [ordered]@{ archive = "deepsource_9.9.9_windows_amd64.zip"; sha256 = $amdSha }
        }
    }
    $manifestJson = $manifestObj | ConvertTo-Json -Depth 5

    $server = New-TestHttpServer
    Add-TestRoute -Server $server -Path "/manifest.json" -Bytes ([System.Text.Encoding]::UTF8.GetBytes($manifestJson)) -ContentType "application/json"
    Add-TestRoute -Server $server -Path "/build/deepsource_9.9.9_windows_arm64.zip" -Bytes $armZip
    Add-TestRoute -Server $server -Path "/build/deepsource_9.9.9_windows_amd64.zip" -Bytes $amdZip

    return [pscustomobject]@{
        Server      = $server
        BinaryName  = $binaryName
        ArmContent  = $armContent
        AmdContent  = $amdContent
        ArmSha      = $armSha
        AmdSha      = $amdSha
    }
}

Invoke-TestCase "End-to-end install selects the native ARM64 build" {
    $fixture = New-FixtureManifestAndServer
    try {
        $installDir = New-TestInstallDir
        Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
            -InstallDir $installDir -Architew6432 $null -Architecture "ARM64" -PathScope Process 6>$null | Out-Null

        $installedExe = Join-Path $installDir "$($fixture.BinaryName).exe"
        Assert-True (Test-Path $installedExe) "expected $installedExe to exist"
        $installedBytes = [System.IO.File]::ReadAllBytes($installedExe)
        Assert-Equal ([System.Text.Encoding]::UTF8.GetString($fixture.ArmContent)) `
            ([System.Text.Encoding]::UTF8.GetString($installedBytes)) "installed binary should be the ARM64 build"
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
    }
}

if ($env:DEEPSOURCE_EXPECTED_PLATFORM) {
    Invoke-TestCase "End-to-end install uses the real host architecture defaults" {
        $fixture = New-FixtureManifestAndServer
        try {
            $installDir = New-TestInstallDir
            Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
                -InstallDir $installDir -PathScope Process 6>$null | Out-Null

            $expectedContent = if ($env:DEEPSOURCE_EXPECTED_PLATFORM -eq "windows_arm64") {
                $fixture.ArmContent
            } else {
                $fixture.AmdContent
            }
            $installedExe = Join-Path $installDir "$($fixture.BinaryName).exe"
            Assert-True (Test-Path $installedExe) "expected $installedExe to exist"
            $installedBytes = [System.IO.File]::ReadAllBytes($installedExe)
            Assert-Equal ([System.Text.Encoding]::UTF8.GetString($expectedContent)) `
                ([System.Text.Encoding]::UTF8.GetString($installedBytes)) "installed binary should match the real host architecture"
        } finally {
            Stop-TestHttpServer -Server $fixture.Server
        }
    }
}

Invoke-TestCase "End-to-end install selects the native AMD64 build" {
    $fixture = New-FixtureManifestAndServer
    try {
        $installDir = New-TestInstallDir
        Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
            -InstallDir $installDir -Architew6432 $null -Architecture "AMD64" -PathScope Process 6>$null | Out-Null

        $installedExe = Join-Path $installDir "$($fixture.BinaryName).exe"
        Assert-True (Test-Path $installedExe) "expected $installedExe to exist"
        $installedBytes = [System.IO.File]::ReadAllBytes($installedExe)
        Assert-Equal ([System.Text.Encoding]::UTF8.GetString($fixture.AmdContent)) `
            ([System.Text.Encoding]::UTF8.GetString($installedBytes)) "installed binary should be the AMD64 build"
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
    }
}

Invoke-TestCase "Emulated x64 PowerShell on ARM64 host still installs the ARM64 build" {
    $fixture = New-FixtureManifestAndServer
    try {
        $installDir = New-TestInstallDir
        Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
            -InstallDir $installDir -Architew6432 "ARM64" -Architecture "AMD64" -PathScope Process 6>$null | Out-Null

        $installedExe = Join-Path $installDir "$($fixture.BinaryName).exe"
        Assert-True (Test-Path $installedExe) "expected $installedExe to exist"
        $installedBytes = [System.IO.File]::ReadAllBytes($installedExe)
        Assert-Equal ([System.Text.Encoding]::UTF8.GetString($fixture.ArmContent)) `
            ([System.Text.Encoding]::UTF8.GetString($installedBytes)) "installed binary should be the native ARM64 build, not the emulated AMD64 one"
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
    }
}

Invoke-TestCase "Missing manifest entry for the detected platform fails cleanly" {
    # Manifest only advertises windows_amd64; requesting on ARM64 must fail
    # with a clear message and must not create the install directory.
    $binaryName = "deepsource-test"
    $amdContent = [System.Text.Encoding]::UTF8.GetBytes("AMD64-ONLY-CONTENT")
    $amdZip = New-TestZipArchive -EntryName "$binaryName.exe" -Content $amdContent
    $amdSha = Get-Sha256Hex -Bytes $amdZip

    $manifestJson = [ordered]@{
        version   = "9.9.9"
        platforms = [ordered]@{
            windows_amd64 = [ordered]@{ archive = "deepsource_9.9.9_windows_amd64.zip"; sha256 = $amdSha }
        }
    } | ConvertTo-Json -Depth 5

    $server = New-TestHttpServer
    try {
        Add-TestRoute -Server $server -Path "/manifest.json" -Bytes ([System.Text.Encoding]::UTF8.GetBytes($manifestJson)) -ContentType "application/json"
        Add-TestRoute -Server $server -Path "/build/deepsource_9.9.9_windows_amd64.zip" -Bytes $amdZip

        $installDir = New-TestInstallDir
        $output = (Install-DeepSourceCli -BaseUrl $server.BaseUrl -BinaryName $binaryName `
            -InstallDir $installDir -Architew6432 $null -Architecture "ARM64" -PathScope Process 6>&1 | Out-String)

        Assert-Match $output "No build available for windows_arm64" "should report the missing platform"
        Assert-True (-not (Test-Path (Join-Path $installDir "$binaryName.exe"))) "binary should not be installed"
    } finally {
        Stop-TestHttpServer -Server $server
    }
}

Invoke-TestCase "Checksum mismatch fails cleanly and does not install the binary" {
    $fixture = New-FixtureManifestAndServer
    try {
        # Overwrite the ARM64 route with mismatched content but keep the
        # manifest's original (now-stale) sha256, forcing a checksum failure.
        $corruptContent = [System.Text.Encoding]::UTF8.GetBytes("CORRUPTED-ARCHIVE-BYTES-DIFFERENT-LENGTH")
        Add-TestRoute -Server $fixture.Server -Path "/build/deepsource_9.9.9_windows_arm64.zip" -Bytes $corruptContent

        $installDir = New-TestInstallDir
        $output = (Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
            -InstallDir $installDir -Architew6432 $null -Architecture "ARM64" -PathScope Process 6>&1 | Out-String)

        Assert-Match $output "Checksum mismatch" "should report the checksum failure"
        Assert-True (-not (Test-Path (Join-Path $installDir "$($fixture.BinaryName).exe"))) "binary should not be installed"
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
    }
}

Invoke-TestCase "Installer keeps terminating error behavior when caller uses Continue" {
    $fixture = New-FixtureManifestAndServer
    $blockingFile = Join-Path ([System.IO.Path]::GetTempPath()) ("deepsource-blocking-{0}" -f ([guid]::NewGuid()))
    [System.IO.File]::WriteAllText($blockingFile, "not a directory")
    try {
        $previousPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $threw = $false
        try {
            Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
                -InstallDir (Join-Path $blockingFile "child") -Architew6432 $null -Architecture "ARM64" `
                -PathScope Process 6>$null | Out-Null
        } catch {
            $threw = $true
        } finally {
            $ErrorActionPreference = $previousPreference
        }
        Assert-True $threw "filesystem failures must terminate instead of reporting a false successful install"
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
        Remove-Item -Path $blockingFile -Force -ErrorAction SilentlyContinue
    }
}

Invoke-TestCase "PATH is updated only when the install dir is not already present" {
    $fixture = New-FixtureManifestAndServer
    try {
        $installDir = New-TestInstallDir

        # Process-scoped PATH is isolated to this test process only and is
        # never persisted, unlike the real (default) User scope.
        $originalPath = [Environment]::GetEnvironmentVariable("Path", "Process")
        try {
            $output = (Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
                -InstallDir $installDir -Architew6432 $null -Architecture "ARM64" -PathScope Process 6>&1 | Out-String)
            Assert-Match $output "Added " "should report PATH was updated"

            $updatedPath = [Environment]::GetEnvironmentVariable("Path", "Process")
            Assert-True ($updatedPath -like "*$installDir*") "install dir should now be present in PATH"

            # Running again with the dir already present should not re-add it.
            Install-DeepSourceCli -BaseUrl $fixture.Server.BaseUrl -BinaryName $fixture.BinaryName `
                -InstallDir $installDir -Architew6432 $null -Architecture "ARM64" -PathScope Process 6>$null | Out-Null
            $pathAfterSecondInstall = [Environment]::GetEnvironmentVariable("Path", "Process")
            Assert-Equal $updatedPath $pathAfterSecondInstall "second install should not duplicate the PATH entry"
        } finally {
            [Environment]::SetEnvironmentVariable("Path", $originalPath, "Process")
        }
    } finally {
        Stop-TestHttpServer -Server $fixture.Server
    }
}

Remove-TestInstallDirs
Write-TestSummary

if ($script:TestFailed -gt 0) {
    exit 1
}
exit 0
