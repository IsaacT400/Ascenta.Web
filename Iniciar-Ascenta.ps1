param([switch]$NoAbrir, [switch]$Demo)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$environmentBefore = @{}
foreach ($name in @('PATH','NODE_ENV','DATA_MODE','API_PORT','WEB_ORIGIN','DOTENV_CONFIG_PATH')) {
    $environmentBefore[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
. (Join-Path $root 'scripts\toolchain.ps1')
. (Join-Path $root 'scripts\server-processes.ps1')
$stateDir = Join-Path $root '.local'
$stateFile = Join-Path $stateDir 'servers.json'
$requestedMode = if ($Demo) { 'demo' } else { 'mysql' }
New-Item -ItemType Directory -Path (Join-Path $stateDir 'logs') -Force | Out-Null
if (Test-Path -LiteralPath $stateFile) {
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    $owned = @($state.processes | Where-Object { Test-AscentaProcess $_ $root })
    if ($owned.Count -gt 0) {
        if ($state.mode -ne $requestedMode) { throw "ASCENTA ya esta iniciado en modo $($state.mode). Detenlo antes de iniciar en modo $requestedMode." }
        if ($owned.Count -eq 2 -and (Test-AscentaUrl 'http://localhost:5175/') -and (Test-AscentaUrl 'http://localhost:4000/api/v1/health')) {
            Write-Output 'ASCENTA ya esta iniciado: http://localhost:5175'
            if (!$NoAbrir) { Start-Process 'http://localhost:5175/' }
            return
        }
        throw 'Hay una instancia ASCENTA incompleta. Ejecuta Detener-Ascenta.ps1 y vuelve a iniciar.'
    }
}
$occupied = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(4000,5175) })
if ($occupied.Count) { throw 'Puerto 4000 o 5175 ocupado. No se ha detenido ningun proceso ajeno. Revisa la instancia antes de continuar.' }
Push-Location -LiteralPath $root
$started = @()
try {
    $env:NODE_ENV = 'development'
    $env:DATA_MODE = $requestedMode
    $env:DOTENV_CONFIG_PATH = Join-Path $root '.env'
    if (!(Test-Path -LiteralPath (Join-Path $root 'node_modules\.modules.yaml'))) { Invoke-AscentaPnpm install --frozen-lockfile }
    Invoke-AscentaPnpm build:packages
    if (!$Demo) {
        & (Join-Path $root 'scripts\db-start.ps1')
        $env:DATA_MODE = 'mysql'
        Invoke-AscentaPnpm db:migrate:deploy
        Invoke-AscentaPnpm db:seed
    } else {
        $env:DATA_MODE = 'demo'
        Write-Warning 'Modo demo EXPLICITO: datos de aplicacion solo en memoria.'
    }
    $env:NODE_ENV = 'development'
    $env:API_PORT = '4000'
    $env:WEB_ORIGIN = 'http://localhost:5175'
    $env:DOTENV_CONFIG_PATH = Join-Path $root '.env'
    Invoke-AscentaPnpm --filter '@ascenta/api' build
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $apiEntry = Join-Path $root 'apps\api\dist\server.js'
    $webEntry = Join-Path $root 'apps\web\node_modules\vite\bin\vite.js'
    foreach ($item in @(
        @{ name='api'; entry=$apiEntry; cwd=$root; arguments=('"' + $apiEntry + '"') },
        @{ name='web'; entry=$webEntry; cwd=(Join-Path $root 'apps\web'); arguments=('"' + $webEntry + '" --host localhost --port 5175 --strictPort') }
    )) {
        $stdout = Join-Path $stateDir "logs\$stamp-$($item.name).stdout.log"
        $stderr = Join-Path $stateDir "logs\$stamp-$($item.name).stderr.log"
        $proc = Start-Process -FilePath $AscentaNode -ArgumentList $item.arguments -WorkingDirectory $item.cwd -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
        $started += [pscustomobject]@{ name=$item.name; pid=$proc.Id; startTimeUtc=$proc.StartTime.ToUniversalTime().ToString('o'); executable=$AscentaNode; entry=$item.entry; stdout=$stdout; stderr=$stderr }
        [ordered]@{ projectRoot=$root; mode=$env:DATA_MODE; processes=$started } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $stateFile -Encoding UTF8
    }
    $deadline = (Get-Date).AddSeconds(60)
    do {
        foreach ($item in $started) {
            if (!(Test-AscentaProcess $item $root)) { throw "Proceso $($item.name) termino. Revisa $($item.stderr)" }
        }
        if ((Test-AscentaUrl 'http://localhost:4000/api/v1/health') -and (Test-AscentaUrl 'http://localhost:5175/')) { break }
        Start-Sleep -Milliseconds 400
    } while ((Get-Date) -lt $deadline)
    if (!(Test-AscentaUrl 'http://localhost:4000/api/v1/health') -or !(Test-AscentaUrl 'http://localhost:5175/')) { throw "ASCENTA no respondio en 60 segundos. Logs: $stateDir\logs" }
    Write-Output "ASCENTA listo. Web: http://localhost:5175 | API: http://localhost:4000/api/v1 | Datos: $env:DATA_MODE"
    if (!$NoAbrir) { Start-Process 'http://localhost:5175/' }
} catch {
    foreach ($item in $started) { if (Test-AscentaProcess $item $root) { Stop-AscentaProcess $item $root } }
    throw
} finally { Pop-Location }
} finally {
    foreach ($name in $environmentBefore.Keys) {
        [Environment]::SetEnvironmentVariable($name, $environmentBefore[$name], 'Process')
    }
}
