[CmdletBinding()]
param()
. (Join-Path $PSScriptRoot 'db-common.ps1')
$ownedProcess = Get-AscentaDbProcess
if (-not $ownedProcess) { Write-Host 'The dedicated ASCENTA MySQL instance is already stopped.'; return }
if (-not (Test-Path -LiteralPath $DbCredentialFile)) { throw 'Database credentials are missing; the database will not be force-stopped.' }
$credentials = Get-Content -LiteralPath $DbCredentialFile -Raw | ConvertFrom-Json
$mysqlBin = Get-AscentaMySqlBin
$previousPassword = $env:MYSQL_PWD
try {
    $env:MYSQL_PWD = $credentials.rootPassword
    & (Join-Path $mysqlBin 'mysqladmin.exe') --no-defaults --protocol=TCP --host=127.0.0.1 --port=3307 --user=root --connect-timeout=3 shutdown
    if ($LASTEXITCODE -ne 0) { throw 'Could not gracefully stop the dedicated MySQL instance.' }
    if (-not $ownedProcess.WaitForExit(15000)) { throw 'MySQL is still completing shutdown; its data and process record were preserved.' }
    Remove-Item -LiteralPath $DbProcessFile -ErrorAction SilentlyContinue
    Write-Host 'Dedicated ASCENTA MySQL stopped. Its data is preserved.'
} finally {
    $env:MYSQL_PWD = $previousPassword
}
