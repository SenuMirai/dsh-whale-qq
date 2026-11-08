# Post-restart verification: read-only checks, no configuration changes.
$ErrorActionPreference = 'Stop'

# The DSH port changes on every start, so read origin from the live bridge file.
$bridgeFile = 'C:/Users/demo\.dsh\worlds\default\bridge.json'
$base = 'http://127.0.0.1:50362'
if (Test-Path $bridgeFile) {
  $raw = Get-Content $bridgeFile -Raw
  $found = [regex]::Match($raw, '"origin"\s*:\s*"([^"]+)"').Groups[1].Value
  if ($found -ne '') { $base = $found }
}
Write-Output "base=$base"
$fail = 0

function Check($name, $ok, $detail) {
  if ($ok) { Write-Output "[OK]   $name $detail" }
  else { Write-Output "[FAIL] $name $detail"; $script:fail++ }
}

try {
  $v = Invoke-RestMethod "$base/dsh-qq-group/version" -TimeoutSec 10
  Check 'plugin-version' ($v.version -eq $v.diskVersion) "running=$($v.version) disk=$($v.diskVersion) stale=$($v.stale)"
} catch { Check 'plugin-version' $false $_.Exception.Message }

try {
  $m = Invoke-RestMethod "$base/dsh-qq-group/world/model" -TimeoutSec 20
  Check 'world-model-api' ($m.ok -eq $true) "current=$($m.current.provider)/$($m.current.model)"
} catch { Check 'world-model-api' $false $_.Exception.Message }

try {
  $q = Invoke-RestMethod "$base/dsh-qq-group/world/qzone" -TimeoutSec 10
  Check 'qzone-result-api' ($q.ok -eq $true) "pending=$($q.pending)"
} catch { Check 'qzone-result-api' $false $_.Exception.Message }

try {
  $d = Invoke-RestMethod "$base/dsh-qq-group/world/digest" -TimeoutSec 10
  Check 'group-digest-api' ($d.ok -eq $true) "len=$($d.text.Length)"
} catch { Check 'group-digest-api' $false $_.Exception.Message }

try {
  $x = Invoke-RestMethod "$base/dsh-qq-group/world/deliveries" -TimeoutSec 10
  Check 'deliveries-api' ($x.ok -eq $true) "entries=$($x.entries.Count)"
} catch { Check 'deliveries-api' $false $_.Exception.Message }

$cfg = 'C:/Users/demo\.dsh\profiles\desktop\cordis.patch.yml'
$text = Get-Content $cfg -Raw
Check 'archive-scope-home' ($text -match 'archiveScope:\s*home') 'archiveScope=home'

$prompt = 'C:/Users/demo\.dsh\worlds\default\world-prompt.md'
$praw = Get-Content $prompt -Raw
Check 'prompt-no-br-tag' (-not $praw.Contains('<br')) 'world-prompt has no br tag'

$client = 'C:/Users/demo\.dsh\profiles\desktop\node_modules\dsh-world\client\index.js'
& node --check $client
Check 'world-console-syntax' ($LASTEXITCODE -eq 0) $client

if ($fail -gt 0) { Write-Output "$fail checks failed"; exit 1 }
Write-Output 'all checks passed'
