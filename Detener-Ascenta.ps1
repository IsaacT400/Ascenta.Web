$ErrorActionPreference = 'Stop'
$stateFile = Join-Path $PSScriptRoot 'runtime\server.json'
if (!(Test-Path -LiteralPath $stateFile)) {
    Write-Output 'No hay una instancia registrada por este lanzador.'
    return
}
$state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
$running = Get-Process -Id $state.pid -ErrorAction SilentlyContinue
if (!$running -or $running.StartTime.ToUniversalTime().ToString('o') -ne $state.startTimeUtc) {
    Write-Output 'La instancia registrada ya esta detenida.'
    return
}
$details = Get-CimInstance Win32_Process -Filter "ProcessId = $($state.pid)"
if ($details.CommandLine -notlike '*Iniciar-Ascenta.ps1*' -or $details.CommandLine -notlike '*-Servidor*') {
    throw 'El proceso no coincide con el lanzador ASCENTA. No se ha detenido.'
}
# Solo el lanzador registrado y sus hijos; no otros procesos Node o navegadores.
& taskkill.exe /PID $state.pid /T /F
if ($LASTEXITCODE -ne 0) { throw 'No se pudo detener el arbol de procesos de ASCENTA.' }
Write-Output 'ASCENTA detenido. Las solicitudes demo en memoria ya no se conservan.'
