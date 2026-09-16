# Shared helpers for the installer tests: rendering the .ps1.template with
# placeholder substitution (mirroring the real 'sed' render step used by
# .github/workflows/build-and-deploy.yml), building in-memory zip fixtures,
# hashing, and simple assertion/reporting utilities.

$script:RepoScriptsDir = Split-Path -Parent $PSScriptRoot
$script:TemplatePath = Join-Path $script:RepoScriptsDir "install.ps1.template"

# New-RenderedInstallScript renders install.ps1.template to a temp .ps1 file,
# substituting __BASE_URL__ / __BINARY_NAME__ exactly like the release
# workflow's 'sed' step. Returns the path to the rendered file.
function New-RenderedInstallScript {
    param(
        [string]$BaseUrl = "https://example.invalid",
        [string]$BinaryName = "deepsource-test"
    )

    if (-not (Test-Path $script:TemplatePath)) {
        throw "install.ps1.template not found at $script:TemplatePath"
    }

    # The template contains non-ASCII glyphs (✓/✗/→); read/write it explicitly
    # as UTF-8 so Windows PowerShell 5.1 (whose default Get-Content/Set-Content
    # encoding is the system codepage, not UTF-8) doesn't mangle them.
    $content = Get-Content -Path $script:TemplatePath -Raw -Encoding UTF8
    $content = $content.Replace("__BASE_URL__", $BaseUrl)
    $content = $content.Replace("__BINARY_NAME__", $BinaryName)
    $content = $content.Replace("& `$InstallScript", ". `$InstallScript -SkipInstall")

    $renderedPath = Join-Path ([System.IO.Path]::GetTempPath()) ("deepsource-install-test-{0}.ps1" -f ([guid]::NewGuid()))
    Set-Content -Path $renderedPath -Value $content -NoNewline -Encoding UTF8
    return $renderedPath
}

# New-TestZipArchive builds an in-memory zip archive (as a byte array)
# containing a single entry, mirroring the real windows_*.zip release
# archives (which contain just the .exe at the archive root).
function New-TestZipArchive {
    param(
        [Parameter(Mandatory)][string]$EntryName,
        [Parameter(Mandatory)][byte[]]$Content
    )

    Add-Type -AssemblyName System.IO.Compression -ErrorAction SilentlyContinue
    Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue

    $ms = New-Object System.IO.MemoryStream
    $archive = New-Object System.IO.Compression.ZipArchive($ms, [System.IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        $entry = $archive.CreateEntry($EntryName)
        $stream = $entry.Open()
        try {
            $stream.Write($Content, 0, $Content.Length)
        } finally {
            $stream.Close()
        }
    } finally {
        $archive.Dispose()
    }

    return $ms.ToArray()
}

# Get-Sha256Hex computes the lowercase hex SHA256 of a byte array, matching
# the format written by Get-FileHash in the installer.
function Get-Sha256Hex {
    param([Parameter(Mandatory)][byte[]]$Bytes)

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($Bytes)
        return -join ($hash | ForEach-Object { $_.ToString("x2") })
    } finally {
        $sha.Dispose()
    }
}

# New-TestInstallDir returns a fresh, unique temp directory path (not yet
# created) suitable for use as -InstallDir in tests, keeping every test case
# isolated from the real %LOCALAPPDATA%\DeepSource\bin and from each other.
# Every path returned is tracked so Remove-TestInstallDirs can clean up after
# the run (successful installs intentionally leave files on disk).
$script:CreatedTestInstallDirs = New-Object System.Collections.Generic.List[string]

function New-TestInstallDir {
    $dir = Join-Path ([System.IO.Path]::GetTempPath()) ("deepsource-test-install-{0}" -f ([guid]::NewGuid()))
    $script:CreatedTestInstallDirs.Add($dir)
    return $dir
}

function Remove-TestInstallDirs {
    foreach ($dir in $script:CreatedTestInstallDirs) {
        if (Test-Path $dir) {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# --- Minimal test reporting -------------------------------------------------

$script:TestPassed = 0
$script:TestFailed = 0
$script:TestFailureDetails = New-Object System.Collections.Generic.List[string]

function Assert-Equal {
    param($Expected, $Actual, [string]$Because = "values should match")
    if ($Expected -ne $Actual) {
        throw "$Because (expected '$Expected', got '$Actual')"
    }
}

function Assert-True {
    param([bool]$Condition, [string]$Because = "condition should be true")
    if (-not $Condition) {
        throw $Because
    }
}

function Assert-Match {
    param([string]$Text, [string]$Pattern, [string]$Because = "text should match pattern")
    if ($Text -notmatch $Pattern) {
        throw "$Because (pattern '$Pattern' not found in: $Text)"
    }
}

function Assert-NoMatch {
    param([string]$Text, [string]$Pattern, [string]$Because = "text should not match pattern")
    if ($Text -match $Pattern) {
        throw "$Because (pattern '$Pattern' unexpectedly found in: $Text)"
    }
}

function Invoke-TestCase {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][scriptblock]$Body
    )

    try {
        & $Body
        $script:TestPassed++
        Write-Host "[PASS] $Name" -ForegroundColor Green
    } catch {
        $script:TestFailed++
        $script:TestFailureDetails.Add("$Name : $_")
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        Write-Host "       $_" -ForegroundColor Red
    }
}

function Write-TestSummary {
    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Passed: $script:TestPassed  Failed: $script:TestFailed"
    if ($script:TestFailed -gt 0) {
        Write-Host "Failures:" -ForegroundColor Red
        foreach ($f in $script:TestFailureDetails) {
            Write-Host "  - $f" -ForegroundColor Red
        }
    }
    Write-Host "----------------------------------------"
}
