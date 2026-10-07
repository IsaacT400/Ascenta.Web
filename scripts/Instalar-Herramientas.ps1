# Instala herramientas locales sin cambiar Node ni PATH del sistema.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $root '.tools'
New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
$nodePath = Join-Path $toolsDir 'node\node.exe'
if (!(Test-Path -LiteralPath $nodePath)) {
    $version = '24.21.0'
    $archive = Join-Path $toolsDir "node-v$version-win-x64.zip"
    $checksumFile = Join-Path $toolsDir 'SHASUMS256.txt'
    Invoke-WebRequest "https://nodejs.org/dist/v$version/node-v$version-win-x64.zip" -OutFile $archive -UseBasicParsing
    Invoke-WebRequest "https://nodejs.org/dist/v$version/SHASUMS256.txt" -OutFile $checksumFile -UseBasicParsing
    $expected = ((Get-Content -LiteralPath $checksumFile | Where-Object { $_ -match " node-v$version-win-x64.zip$" }) -split '\s+')[0]
    if (!$expected -or (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $expected) { throw 'Checksum de Node incorrecto.' }
    Expand-Archive -LiteralPath $archive -DestinationPath $toolsDir -Force
    $expanded = [IO.Path]::GetFullPath((Join-Path $toolsDir "node-v$version-win-x64"))
    if (!(Split-Path -Parent $expanded).Equals([IO.Path]::GetFullPath($toolsDir), [StringComparison]::OrdinalIgnoreCase)) { throw 'Ruta de herramienta incorrecta.' }
    Move-Item -LiteralPath $expanded -Destination (Join-Path $toolsDir 'node')
    Remove-Item -LiteralPath $archive,$checksumFile
}
$pnpmPath = Join-Path $toolsDir 'pnpm\node_modules\pnpm\bin\pnpm.mjs'
if (!(Test-Path -LiteralPath $pnpmPath)) {
    $archive = Join-Path $toolsDir 'pnpm-11.19.0.tgz'
    $metadata = Invoke-RestMethod 'https://registry.npmjs.org/pnpm/11.19.0'
    Invoke-WebRequest $metadata.dist.tarball -OutFile $archive -UseBasicParsing
    $algorithm, $expected = $metadata.dist.integrity -split '-', 2
    if ($algorithm -ne 'sha512') { throw 'Algoritmo de integridad pnpm no soportado.' }
    $sha = [Security.Cryptography.SHA512]::Create()
    try { $actual = [Convert]::ToBase64String($sha.ComputeHash([IO.File]::ReadAllBytes($archive))) } finally { $sha.Dispose() }
    if ($actual -ne $expected) { throw 'Checksum de pnpm incorrecto.' }
    $extract = Join-Path $toolsDir 'pnpm\node_modules'
    New-Item -ItemType Directory -Path $extract -Force | Out-Null
    & tar.exe -xzf $archive -C $extract
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo extraer pnpm.' }
    $expanded = [IO.Path]::GetFullPath((Join-Path $extract 'package'))
    if (!(Split-Path -Parent $expanded).Equals([IO.Path]::GetFullPath($extract), [StringComparison]::OrdinalIgnoreCase)) { throw 'Ruta de herramienta incorrecta.' }
    Move-Item -LiteralPath $expanded -Destination (Join-Path $extract 'pnpm')
    Remove-Item -LiteralPath $archive
}
$bin = Join-Path $toolsDir 'pnpm\node_modules\.bin'
New-Item -ItemType Directory -Path $bin -Force | Out-Null
'@echo off', '"%~dp0..\..\..\node\node.exe" "%~dp0..\pnpm\bin\pnpm.mjs" %*' | Set-Content -LiteralPath (Join-Path $bin 'pnpm.cmd') -Encoding ASCII
. (Join-Path $PSScriptRoot 'toolchain.ps1')
& $AscentaNode --version
Invoke-AscentaPnpm --version
