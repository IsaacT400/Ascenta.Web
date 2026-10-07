$ErrorActionPreference = 'Stop'
$DbProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$DbStateRoot = Join-Path $DbProjectRoot '.local'
$DbDataPath = Join-Path $DbStateRoot 'mysql'
$DbCredentialFile = Join-Path $DbStateRoot 'mysql-credentials.json'
$DbProcessFile = Join-Path $DbStateRoot 'mysql-process.json'
$DbPort = 3307

function Get-AscentaMySqlBin {
    if ($env:ASCENTA_MYSQL_BIN) { $candidate = $env:ASCENTA_MYSQL_BIN }
    else { $candidate = Join-Path $env:ProgramFiles 'MySQL\MySQL Server 8.4\bin' }
    if (-not (Test-Path -LiteralPath (Join-Path $candidate 'mysqld.exe'))) {
        throw 'MySQL 8.4 is required. Install MySQL Community Server or set ASCENTA_MYSQL_BIN to its bin directory.'
    }
    return [IO.Path]::GetFullPath($candidate)
}

function Write-AscentaJson($Path, $Value) {
    [IO.File]::WriteAllText($Path, ($Value | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
}

function Get-AscentaDbProcess {
    if (-not (Test-Path -LiteralPath $DbProcessFile)) { return $null }
    $record = Get-Content -LiteralPath $DbProcessFile -Raw | ConvertFrom-Json
    $process = Get-Process -Id $record.processId -ErrorAction SilentlyContinue
    if (-not $process) { return $null }
    if ($process.ProcessName -ne 'mysqld' -or $process.StartTime.ToUniversalTime().Ticks.ToString() -ne $record.startTicks) {
        throw 'The saved database PID belongs to another process; it will not be controlled.'
    }
    if ($process.Path -ne (Join-Path (Get-AscentaMySqlBin) 'mysqld.exe')) {
        throw 'The saved database PID uses another executable; it will not be controlled.'
    }
    if ([IO.Path]::GetFullPath($record.dataPath) -ne $DbDataPath) {
        throw 'The saved database process belongs to another project; it will not be controlled.'
    }
    $processDetails = Get-CimInstance Win32_Process -Filter ("ProcessId = {0}" -f $process.Id) -ErrorAction Stop
    if (-not $processDetails -or $processDetails.CommandLine -notmatch '(?:^|\s)--datadir=(?:"([^"]+)"|(\S+))') {
        throw 'The database command line does not identify its data directory; it will not be controlled.'
    }
    $actualDataPath = if ($matches[1]) { $matches[1] } else { $matches[2] }
    if ([IO.Path]::GetFullPath($actualDataPath) -ne $DbDataPath) {
        throw 'The running database uses another data directory; it will not be controlled.'
    }
    return $process
}

function Invoke-AscentaMySql([string]$BinPath, [string]$Password, [string]$Sql) {
    $previousPassword = $env:MYSQL_PWD
    try {
        $env:MYSQL_PWD = $Password
        $Sql | & (Join-Path $BinPath 'mysql.exe') --no-defaults --protocol=TCP --host=127.0.0.1 --port=$DbPort --user=root --connect-timeout=3 --batch --skip-column-names
        if ($LASTEXITCODE -ne 0) { throw 'The dedicated ASCENTA MySQL command failed. Check .local/mysql/server-error.log.' }
    } finally {
        $env:MYSQL_PWD = $previousPassword
    }
}

function Test-AscentaMySql([string]$BinPath, [string]$Password) {
    $previousPassword = $env:MYSQL_PWD
    try {
        $env:MYSQL_PWD = $Password
        # mysqladmin ping succeeds even when authentication is rejected; SELECT verifies both.
        $start = [Diagnostics.ProcessStartInfo]::new()
        $start.FileName = Join-Path $BinPath 'mysql.exe'
        $start.Arguments = ('--no-defaults --protocol=TCP --host=127.0.0.1 --port={0} --user=root --connect-timeout=1 --batch --skip-column-names --execute="SELECT 1"' -f $DbPort)
        $start.UseShellExecute = $false
        $start.CreateNoWindow = $true
        $start.RedirectStandardOutput = $true
        $start.RedirectStandardError = $true
        $probe = [Diagnostics.Process]::Start($start)
        $probe.WaitForExit()
        return $probe.ExitCode -eq 0
    } finally {
        $env:MYSQL_PWD = $previousPassword
    }
}
