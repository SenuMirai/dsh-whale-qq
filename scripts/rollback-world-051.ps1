# Roll back the main profile's dsh-world to 0.5.1.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File rollback-world-051.ps1
$ErrorActionPreference = 'Stop'

$prof = 'C:/Users/demo\.dsh\profiles\desktop'
$target = Join-Path $prof 'node_modules\dsh-world'
$backup = 'C:\DSHwork\backups\dsh-world-0.5.1-dir-backup-20261027'

if (-not (Test-Path $backup)) { throw "rollback source missing: $backup" }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (Test-Path $target) {
  $aside = Join-Path $prof "node_modules\dsh-world-current-bak-$stamp"
  Move-Item $target $aside
  Write-Output "current build moved to: $aside"
}

Copy-Item $backup $target -Recurse -Force
Write-Output "restored 0.5.1 to: $target"

$pkg = Join-Path $target 'package.json'
$ver = (Get-Content $pkg -Raw | ConvertFrom-Json).version
Write-Output "version now: $ver"
Write-Output 'Restart DSH.'
