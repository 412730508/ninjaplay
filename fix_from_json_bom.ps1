# fix_from_json.ps1 - Apply all replacements from JSON lookup file
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$enc = [System.Text.Encoding]::UTF8
$path = 'gameEngine.js'
$lines = [System.IO.File]::ReadAllLines($path, $enc)
$fixed = 0

$replacements = Get-Content 'replacements.json' -Encoding UTF8 | ConvertFrom-Json

foreach ($r in $replacements) {
    $idx = $r.line  # 0-indexed line number
    $l = $lines[$idx]
    $left = $r.left
    $right = $r.right
    $repl = $r.repl
    
    $lp = $l.IndexOf($left)
    if ($lp -lt 0) { Write-Host "SKIP L$($idx+1) left=[$left]"; continue }
    $sf = $lp + $left.Length
    $rp = $l.IndexOf($right, $sf)
    if ($rp -lt 0) { Write-Host "SKIP L$($idx+1) right=[$right] after pos $sf"; continue }
    
    $lines[$idx] = $l.Substring(0, $sf) + $repl + $l.Substring($rp)
    $fixed++
    Write-Host "OK L$($idx+1)"
}

# Special cases that need different handling:

# L9860: template literal with variable ${needStacks} in middle
$idx = 9859
$l = $lines[$idx]
$bt = [char]96
$lp = $l.IndexOf("($bt")
if ($lp -ge 0) {
    $sf = $lp + 2
    $rp = $l.IndexOf("$bt,", $sf)
    if ($rp -ge 0) {
        $lines[$idx] = $l.Substring(0, $sf) + '巨獸解放：疊層不足！需要${needStacks}層！' + $l.Substring($rp)
        $fixed++
        Write-Host "OK L9860"
    }
}

# L10027: template literal with variable ${damage} in middle
$idx = 10026
$l = $lines[$idx]
$lp = $l.IndexOf("($bt")
if ($lp -ge 0) {
    $sf = $lp + 2
    $rp = $l.IndexOf("$bt,", $sf)
    if ($rp -ge 0) {
        $lines[$idx] = $l.Substring(0, $sf) + '巨石命中！造成${damage}點傷害' + $l.Substring($rp)
        $fixed++
        Write-Host "OK L10027"
    }
}

# L12894: template literal with variable ${skill.damage} in middle
$idx = 12893
$l = $lines[$idx]
$lp = $l.IndexOf("($bt")
if ($lp -ge 0) {
    $sf = $lp + 2
    $rp = $l.IndexOf("$bt,", $sf)
    if ($rp -ge 0) {
        $lines[$idx] = $l.Substring(0, $sf) + '居合一閃！造成 ${skill.damage} 點瞬殺傷害！' + $l.Substring($rp)
        $fixed++
        Write-Host "OK L12894"
    }
}

# L12967: template literal ${chargeTime} and ${judgmentDamage} - standalone line
$idx = 12966
$l = $lines[$idx]
$lp = $l.IndexOf($bt)
$rp = $l.LastIndexOf($bt)
if ($lp -ge 0 -and $rp -gt $lp) {
    $lines[$idx] = $l.Substring(0, $lp + 1) + '靈天審判！蓄力${(chargeTime / 1000).toFixed(1)}s，造成 ${judgmentDamage} 點傷害！' + $l.Substring($rp)
    $fixed++
    Write-Host "OK L12967"
}

# L4193: Warlock rune array ['??','??',...]→['咒','術','血','契','魔','法','覺','醒']
$idx = 4192
$l = $lines[$idx]
$lp = $l.IndexOf('[')
$rp = $l.IndexOf(']', $lp)
if ($lp -ge 0 -and $rp -ge 0) {
    $lines[$idx] = $l.Substring(0, $lp) + "['咒', '術', '血', '契', '魔', '法', '覺', '醒']" + $l.Substring($rp + 1)
    $fixed++
    Write-Host "OK L4193"
}

Write-Host ""
Write-Host "=== Total fixed: $fixed lines ==="
Write-Host "Writing file..."
[System.IO.File]::WriteAllLines($path, $lines, $enc)
Write-Host "Done. File saved."
