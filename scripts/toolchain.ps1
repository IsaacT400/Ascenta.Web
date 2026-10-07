$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$portableNode = Join-Path $projectRoot '.tools\node\node.exe'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$script:AscentaNode = if (Test-Path -LiteralPath $portableNode) { $portableNode } elseif ($nodeCommand) { $nodeCommand.Source } else { $null }
if (!$script:AscentaNode -or (& $script:AscentaNode --version) -notmatch '^v24\.') {
    throw 'ASCENTA requiere Node 24. Ejecuta scripts\Instalar-Herramientas.ps1 o instala Node 24 y pnpm 11.19.0.'
}
$portablePnpm = Join-Path $projectRoot '.tools\pnpm\node_modules\pnpm\bin\pnpm.mjs'
$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
$script:AscentaPnpm = if (Test-Path -LiteralPath $portablePnpm) { $portablePnpm } elseif ($pnpmCommand) { $pnpmCommand.Source } else { $null }
if (!$script:AscentaPnpm) { throw 'Falta pnpm 11.19.0. Ejecuta scripts\Instalar-Herramientas.ps1.' }
$env:PATH = "$(Split-Path $script:AscentaNode);$(Join-Path $projectRoot '.tools\pnpm\node_modules\.bin');$env:PATH"
function Invoke-AscentaPnpm {
    if ($script:AscentaPnpm.EndsWith('.mjs')) { & $script:AscentaNode $script:AscentaPnpm @args }
    else { & $script:AscentaPnpm @args }
    if ($LASTEXITCODE -ne 0) { throw "pnpm $args fallo (codigo $LASTEXITCODE)." }
}
$pnpmVersion = if ($script:AscentaPnpm.EndsWith('.mjs')) { & $script:AscentaNode $script:AscentaPnpm --version } else { & $script:AscentaPnpm --version }
if ($LASTEXITCODE -ne 0 -or "$pnpmVersion".Trim() -ne '11.19.0') { throw 'ASCENTA requiere pnpm 11.19.0. Ejecuta scripts\Instalar-Herramientas.ps1.' }
