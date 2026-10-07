function Test-AscentaUrl([string]$Url) {
    try { return (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200 } catch { return $false }
}
function Test-AscentaProcess($Item, [string]$Root) {
    if (!$Item -or !$Item.pid -or !$Item.entry) { return $false }
    $entry = [IO.Path]::GetFullPath($Item.entry)
    $prefix = [IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
    if (!$entry.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { return $false }
    $proc = Get-Process -Id $Item.pid -ErrorAction SilentlyContinue
    if (!$proc -or $proc.StartTime.ToUniversalTime().ToString('o') -ne $Item.startTimeUtc) { return $false }
    $details = Get-CimInstance Win32_Process -Filter "ProcessId = $($Item.pid)" -ErrorAction Stop
    return $details.ExecutablePath -eq $Item.executable -and $details.CommandLine.Contains($entry)
}
function Stop-AscentaProcess($Item, [string]$Root) {
    if (!(Test-AscentaProcess $Item $Root)) { return }
    & taskkill.exe /PID $Item.pid /T /F | Out-Null
    if ($LASTEXITCODE -ne 0 -and (Get-Process -Id $Item.pid -ErrorAction SilentlyContinue)) { throw "No se pudo detener $($Item.name) (PID $($Item.pid))." }
}
