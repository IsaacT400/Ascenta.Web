param([switch]$Servidor)
$ErrorActionPreference = 'Stop'
$projectRoot = 'C:\Users\isaac\OneDrive\Desktop\Ascenta.Web'
$runtimeDir = Join-Path $PSScriptRoot 'runtime'
$stateFile = Join-Path $runtimeDir 'server.json'
$nodeDir = Join-Path $projectRoot 'work\tooling\node-v24.21.0-win-x64'
$pnpmDir = Join-Path $projectRoot 'work\tooling\pnpm\node_modules\.bin'
$pnpmCommand = Join-Path $pnpmDir 'pnpm.cmd'

if ($Servidor) {
    $env:PATH = "$nodeDir;$pnpmDir;$env:PATH"
    $env:NODE_ENV = 'development'
    $env:DATA_MODE = 'demo'
    $env:API_PORT = '4000'
    $env:WEB_ORIGIN = 'http://localhost:5175'
    $env:NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000/api/v1'
    $env:DOTENV_CONFIG_PATH = Join-Path $projectRoot '.env'
    Set-Location -LiteralPath $projectRoot
    # El script raiz genera Prisma y compila los paquetes antes de servir.
    # Vinext usa el ultimo --port; la API recibe API_PORT por el entorno.
    & $pnpmCommand dev --port 5175
    exit $LASTEXITCODE
}

if (!(Test-Path -LiteralPath (Join-Path $nodeDir 'node.exe')) -or !(Test-Path -LiteralPath $pnpmCommand)) {
    throw 'No se encontro el Node 24 o pnpm local del proyecto.'
}
if (Test-Path -LiteralPath $stateFile) {
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    $running = Get-Process -Id $state.pid -ErrorAction SilentlyContinue
    if ($running -and $running.StartTime.ToUniversalTime().ToString('o') -eq $state.startTimeUtc) {
        Write-Output 'ASCENTA ya esta iniciado: http://localhost:5175'
        return
    }
}
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(4000,5175) })
if ($listeners.Count -gt 0) {
    throw 'El puerto 4000 o 5175 esta ocupado. No se ha detenido ningun proceso.'
}
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$stdout = Join-Path $runtimeDir "$stamp.stdout.log"
$stderr = Join-Path $runtimeDir "$stamp.stderr.log"
$arguments = @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"' + $PSCommandPath + '"'),'-Servidor')
$worker = Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
[ordered]@{
    pid = $worker.Id
    startTimeUtc = $worker.StartTime.ToUniversalTime().ToString('o')
    projectRoot = $projectRoot
    web = 'http://localhost:5175'
    api = 'http://localhost:4000/api/v1'
    stdout = $stdout
    stderr = $stderr
} | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8
Write-Output "ASCENTA iniciandose en segundo plano (PID $($worker.Id))."
Write-Output "Web: http://localhost:5175 | Logs: $runtimeDir"
