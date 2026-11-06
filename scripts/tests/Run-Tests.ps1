# Runs the installer test suite under every available PowerShell host
# (Windows PowerShell 5.1 and PowerShell 7+/pwsh), so a regression that only
# shows up on one host is still caught.
#
# Usage: powershell -NoProfile -File scripts\tests\Run-Tests.ps1

$ErrorActionPreference = "Stop"
$testScript = Join-Path $PSScriptRoot "Install.Tests.ps1"

$hosts = @()
if (Get-Command powershell.exe -ErrorAction SilentlyContinue) {
    $hosts += "powershell.exe"
}
if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    $hosts += "pwsh"
}
if ($hosts.Count -eq 0) {
    throw "Neither powershell.exe nor pwsh was found on PATH"
}

$overallExit = 0
foreach ($h in $hosts) {
    Write-Host ""
    Write-Host "=== Running installer tests under $h ===" -ForegroundColor Yellow
    & $h -NoProfile -NoLogo -File $testScript
    $exit = $LASTEXITCODE
    if ($exit -ne 0) {
        Write-Host "${h}: FAILED (exit $exit)" -ForegroundColor Red
        $overallExit = 1
    } else {
        Write-Host "${h}: OK" -ForegroundColor Green
    }
}

exit $overallExit
