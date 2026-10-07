param([switch]$IncluirBaseDeDatos)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'scripts\server-processes.ps1')
$stateFile = Join-Path $PSScriptRoot '.local\servers.json'
if (Test-Path -LiteralPath $stateFile) {
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    if ($state.projectRoot -ne $PSScriptRoot) { throw 'El registro pertenece a otra carpeta. No se ha detenido nada.' }
    foreach ($item in $state.processes) { Stop-AscentaProcess $item $PSScriptRoot }
    Remove-Item -LiteralPath $stateFile
    Write-Output 'Web y API ASCENTA detenidas. Los datos MySQL se conservan.'
} else { Write-Output 'No hay procesos web/API registrados por este lanzador.' }
if ($IncluirBaseDeDatos) { & (Join-Path $PSScriptRoot 'scripts\db-stop.ps1') }
