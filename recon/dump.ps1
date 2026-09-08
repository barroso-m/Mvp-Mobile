# Uso:  .\recon\dump.ps1 feed-menu-post
# Deja el XML en recon\<nombre>.xml para que Claude lo lea.
param([Parameter(Mandatory=$true)][string]$Nombre)

$dest = Join-Path $PSScriptRoot "$Nombre.xml"
adb shell uiautomator dump /sdcard/window_dump.xml | Out-Null
adb pull /sdcard/window_dump.xml $dest | Out-Null

if (Test-Path $dest) {
    Write-Host "OK -> recon\$Nombre.xml" -ForegroundColor Green
} else {
    Write-Host "FALLO. Verifica 'adb devices'." -ForegroundColor Red
}
