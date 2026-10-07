[CmdletBinding()]
param()
. (Join-Path $PSScriptRoot 'db-common.ps1')

$envPath = Join-Path $DbProjectRoot '.env'
$configuredUrl = $env:DATABASE_URL
if (-not $configuredUrl -and (Test-Path -LiteralPath $envPath)) {
    $configuredLine = Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
    if ($configuredLine) { $configuredUrl = $configuredLine.Substring('DATABASE_URL='.Length).Trim().Trim('"').Trim("'") }
}
if ($configuredUrl -and $configuredUrl -notmatch '@127\.0\.0\.1:3307/ascenta_local$') {
    Write-Host 'Using the existing DATABASE_URL; the dedicated local MySQL instance is not started.'
    return
}

$mysqlBin = Get-AscentaMySqlBin
New-Item -ItemType Directory -Path $DbStateRoot -Force | Out-Null
if (-not (Test-Path -LiteralPath $DbCredentialFile)) {
    if (Test-Path -LiteralPath $DbDataPath) { throw 'Existing MySQL data has no matching credentials file. Restore credentials; no data will be deleted or reinitialized.' }
    $randomBytes = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $rootPassword = [BitConverter]::ToString($randomBytes).Replace('-', '').ToLowerInvariant()
    $rng.GetBytes($randomBytes)
    $appPassword = [BitConverter]::ToString($randomBytes).Replace('-', '').ToLowerInvariant()
    $rng.Dispose()
    Write-AscentaJson $DbCredentialFile @{ rootPassword = $rootPassword; appPassword = $appPassword; provisioned = $false }
}
$credentials = Get-Content -LiteralPath $DbCredentialFile -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath $DbDataPath)) {
    New-Item -ItemType Directory -Path $DbDataPath | Out-Null
    Write-Host 'Initializing a new, dedicated ASCENTA MySQL data directory on port 3307.'
    $initialize = Start-Process -FilePath (Join-Path $mysqlBin 'mysqld.exe') -ArgumentList @('--no-defaults', '--initialize-insecure', ('--basedir="' + (Split-Path $mysqlBin -Parent) + '"'), ('--datadir="' + $DbDataPath + '"'), ('--log-error="' + (Join-Path $DbDataPath 'initialize.log') + '"')) -PassThru -Wait -WindowStyle Hidden
    if ($initialize.ExitCode -ne 0) { throw 'MySQL initialization failed. See .local/mysql/initialize.log; the data directory was preserved.' }
}

$ownedProcess = Get-AscentaDbProcess
if (-not $ownedProcess) {
    $portProbe = [Net.Sockets.TcpClient]::new()
    try { $portProbe.Connect('127.0.0.1', $DbPort); $portInUse = $true } catch { $portInUse = $false } finally { $portProbe.Dispose() }
    if ($portInUse) { throw 'Port 3307 is occupied by a process without an ASCENTA ownership record. It will not be stopped.' }
    $dbArguments = @('--no-defaults', ('--basedir="' + (Split-Path $mysqlBin -Parent) + '"'), ('--datadir="' + $DbDataPath + '"'), '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF', '--innodb-buffer-pool-size=64M', ('--pid-file="' + (Join-Path $DbDataPath 'ascenta.pid') + '"'), ('--log-error="' + (Join-Path $DbDataPath 'server-error.log') + '"'))
    $ownedProcess = Start-Process -FilePath (Join-Path $mysqlBin 'mysqld.exe') -ArgumentList $dbArguments -PassThru -WindowStyle Hidden
    Write-AscentaJson $DbProcessFile @{ processId = $ownedProcess.Id; startTicks = $ownedProcess.StartTime.ToUniversalTime().Ticks.ToString(); dataPath = $DbDataPath }
}

$ready = $false
$initialPassword = $credentials.rootPassword
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    if (Test-AscentaMySql $mysqlBin $credentials.rootPassword) { $ready = $true; break }
    if (-not $credentials.provisioned -and (Test-AscentaMySql $mysqlBin '')) { $initialPassword = ''; $ready = $true; break }
    if (-not (Get-Process -Id $ownedProcess.Id -ErrorAction SilentlyContinue)) { throw 'ASCENTA MySQL exited during startup. See .local/mysql/server-error.log.' }
    Start-Sleep -Milliseconds 500
}
if (-not $ready) { throw 'ASCENTA MySQL did not become ready. See .local/mysql/server-error.log.' }

if (-not $credentials.provisioned) {
    $sql = @"
CREATE DATABASE IF NOT EXISTS ascenta_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS ascenta_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ascenta'@'127.0.0.1' IDENTIFIED BY '$($credentials.appPassword)';
GRANT ALL PRIVILEGES ON ascenta_local.* TO 'ascenta'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ascenta_test.* TO 'ascenta'@'127.0.0.1';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$($credentials.rootPassword)';
"@
    Invoke-AscentaMySql $mysqlBin $initialPassword $sql | Out-Null
    $credentials.provisioned = $true
    Write-AscentaJson $DbCredentialFile $credentials
}

$settings = [ordered]@{
    NODE_ENV = 'development'; DATA_MODE = 'mysql'; API_PORT = '4000'; WEB_ORIGIN = 'http://localhost:5175'
    SESSION_COOKIE_NAME = 'ascenta_session'; CSRF_COOKIE_NAME = 'ascenta_csrf'; SESSION_TTL_HOURS = '12'; TRUST_PROXY = 'false'
    VITE_API_BASE_URL = '/api/v1'; VITE_CSRF_COOKIE_NAME = 'ascenta_csrf'
    DATABASE_URL = "mysql://ascenta:$($credentials.appPassword)@127.0.0.1:3307/ascenta_local"
    TEST_DATABASE_URL = "mysql://ascenta:$($credentials.appPassword)@127.0.0.1:3307/ascenta_test"
}
$existingLines = if (Test-Path -LiteralPath $envPath) { @(Get-Content -LiteralPath $envPath) } else { @() }
$lines = [Collections.Generic.List[string]]::new()
foreach ($line in $existingLines) {
    if ($line -match '^([^#=]+)=') {
        $key = $matches[1]
        if ($settings.Contains($key)) {
            # Keep user preferences; replace only the local database placeholder.
            if ($key -in @('DATABASE_URL', 'TEST_DATABASE_URL') -and $line -match 'replace-with-local-password') { $lines.Add("$key=$($settings[$key])") }
            else { $lines.Add($line) }
            $settings.Remove($key)
            continue
        }
    }
    $lines.Add($line)
}
foreach ($key in $settings.Keys) { $lines.Add("$key=$($settings[$key])") }
[IO.File]::WriteAllLines($envPath, $lines, [Text.UTF8Encoding]::new($false))
Write-Host 'ASCENTA MySQL ready at 127.0.0.1:3307 (ascenta_local; isolated tests: ascenta_test).'
