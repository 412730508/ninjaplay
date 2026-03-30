# fix_garbled2.ps1 - Fix all garbled Chinese text in gameEngine.js
# Strategy: line-number based, replace entire line with correct version

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$enc = [System.Text.Encoding]::UTF8
$path = 'gameEngine.js'
$lines = [System.IO.File]::ReadAllLines($path, $enc)
$fixed = 0

# Replace a substring within a line identified by known ASCII-safe left and right anchors
# leftAnchor and rightAnchor must be pure ASCII
function Fix-Between {
    param($idx, $leftAnchor, $rightAnchor, $replacement)
    $l = $lines[$idx]
    $leftPos = $l.IndexOf($leftAnchor)
    if ($leftPos -lt 0) { Write-Host "SKIP L$($idx+1) - left anchor not found: [$leftAnchor]"; return }
    $searchFrom = $leftPos + $leftAnchor.Length
    $rightPos = $l.IndexOf($rightAnchor, $searchFrom)
    if ($rightPos -lt 0) { Write-Host "SKIP L$($idx+1) - right anchor not found after pos $searchFrom: [$rightAnchor]"; return }
    $garbled = $l.Substring($searchFrom, $rightPos - $searchFrom)
    $lines[$idx] = $l.Substring(0, $searchFrom) + $replacement + $l.Substring($rightPos)
    $script:fixed++
    Write-Host "Fixed L$($idx+1)"
}

# Replace entire portion from leftAnchor end to rightAnchor start
# Use second occurrence of rightAnchor (for lines with backtick in template literal start)
function Fix-BetweenN {
    param($idx, $leftAnchor, $rightAnchor, $nthRight, $replacement)
    $l = $lines[$idx]
    $leftPos = $l.IndexOf($leftAnchor)
    if ($leftPos -lt 0) { Write-Host "SKIP L$($idx+1) - left anchor not found: [$leftAnchor]"; return }
    $searchFrom = $leftPos + $leftAnchor.Length
    $rightPos = -1
    $found = 0
    for ($i = $searchFrom; $i -lt $l.Length; $i++) {
        if ($l.Substring($i, [Math]::Min($rightAnchor.Length, $l.Length - $i)) -eq $rightAnchor) {
            $found++
            if ($found -eq $nthRight) { $rightPos = $i; break }
        }
    }
    if ($rightPos -lt 0) { Write-Host "SKIP L$($idx+1) - right anchor not found (nth=$nthRight): [$rightAnchor]"; return }
    $lines[$idx] = $l.Substring(0, $searchFrom) + $replacement + $l.Substring($rightPos)
    $script:fixed++
    Write-Host "Fixed L$($idx+1)"
}

# === COMBAT LOG STRINGS ===

# L194: `${p.name} GARBLED`, pid, 'status')  -> 防禦被控制打斷！
Fix-Between 193 '} ' '`,' '防禦被控制打斷！'

# L5726: (`GARBLED`, attackerId -> 僕人被擊殺！
Fix-Between 5725 '(`' '`,' '僕人被擊殺！'

# L5901: (`GARBLED`, -> 最終判決降低移速！
Fix-Between 5900 '(`' '`,' '最終判決降低移速！'

# L8686: (`GARBLED`, -> 巨獸變身！定身敵人50%！
Fix-Between 8685 '(`' '`,' '巨獸變身！定身敵人50%！'

# L8707: .name = 'GARBLED'; -> 投擲巨石
Fix-Between 8706 "name = '" "';" '投擲巨石'

# L8708: .type = 'GARBLED'; -> 投擲/範圍
Fix-Between 8707 "type = '" "';" '投擲/範圍'

# L8712: .name = 'GARBLED'; -> 恢復人型
Fix-Between 8711 "name = '" "';" '恢復人型'

# L8713: .type = 'GARBLED'; -> 恢復/變身
Fix-Between 8712 "type = '" "';" '恢復/變身'

# L8717: (`GARBLED`, -> 巨獸變身完成！
Fix-Between 8716 '(`' '`,' '巨獸變身完成！'

# L8737: .name = 'GARBLED'; -> 深淵觸手
Fix-Between 8736 "name = '" "';" '深淵觸手'

# L8738: .type = 'GARBLED'; -> 控制/抓取
Fix-Between 8737 "type = '" "';" '控制/抓取'

# L8742: .name = 'GARBLED'; -> 巨獸解放
Fix-Between 8741 "name = '" "';" '巨獸解放'

# L8743: .type = 'GARBLED'; -> 變身/定身
Fix-Between 8742 "type = '" "';" '變身/定身'

# L8749: (`GARBLED`, -> 恢復人型！冷卻6秒！
Fix-Between 8748 '(`' '`,' '恢復人型！冷卻6秒！'

# L9327: (`GARBLED`, -> 自然律動！移速+20%
Fix-Between 9326 '(`' '`,' '自然律動！移速+20%'

# L9439: `${player.name} GARBLED`, -> 電壓釋放命中！
# Here the template literal ends with backtick-comma
Fix-Between 9438 '} ' '`,' '電壓釋放命中！'

# L9461: (`GARBLED`, -> 傀儡攻擊！
Fix-Between 9460 '(`' '`,' '傀儡攻擊！'

# L9571: (`GARBLED`, -> 最終判決擊飛！
Fix-Between 9570 '(`' '`,' '最終判決擊飛！'

# L9587: `${player.name} GARBLED`, -> 普攻命中！
Fix-Between 9586 '} ' '`,' '普攻命中！'

# L9617: (`GARBLED`, -> 毒蠍連鞭！擊退+減速+毒棘荊地！
Fix-Between 9616 '(`' '`,' '毒蠍連鞭！擊退+減速+毒棘荊地！'

# L9825: `${player.name} GARBLED`, -> 影子回傳！
Fix-Between 9824 '} ' '`,' '影子回傳！'

# L9860: complex - check and print
Write-Host "L9860: $($lines[9859])"

# L9920: `${player.name} GARBLED`, -> 霸體激活！
Fix-Between 9919 '} ' '`,' '霸體激活！'

# L9925: `${player.name} GARBLED GARBLED`, -> 使用 深淵觸手！
# The line has format: `${player.name} [garbled1] [garbled2]`
# Since both parts are garbled we replace from '} ' to '`,'
Fix-Between 9924 '} ' '`,' '使用 深淵觸手！'

# L9975: (`GARBLED`, -> 疊層不足！無法使用巨獸技能！
Fix-Between 9974 '(`' '`,' '疊層不足！無法使用巨獸技能！'

# L9981: `${player.name} GARBLED GARBLED`, -> 使用 投擲巨石！
Fix-Between 9980 '} ' '`,' '使用 投擲巨石！'

# L10027: check line
Write-Host "L10027: $($lines[10026])"

# L10072: (`GARBLED`, -> 巨獸解放！定身敵人2秒！
Fix-Between 10071 '(`' '`,' '巨獸解放！定身敵人2秒！'

# L10156: `${player.name} GARBLED GARBLED`, -> 使用 爆炎衝刺！
Fix-Between 10155 '} ' '`,' '使用 爆炎衝刺！'

# L10328: `${player.name} GARBLED GARBLED`, -> 使用 岩壁護體！
Fix-Between 10327 '} ' '`,' '使用 岩壁護體！'

# L10404: -> 使用 黑刃突襲！
Fix-Between 10403 '} ' '`,' '使用 黑刃突襲！'

# L10525: -> 使用 毒鏢！
Fix-Between 10524 '} ' '`,' '使用 毒鏢！'

# L10531: -> 佈置 荊棘陷阱！
Fix-Between 10530 '} ' '`,' '佈置 荊棘陷阱！'

# L10612: -> 使用 異議駁回！
Fix-Between 10611 '} ' '`,' '使用 異議駁回！'

# L10623: -> 使用 絕風裂空突！
Fix-Between 10622 '} ' '`,' '使用 絕風裂空突！'

# L10628: -> 使用 狂風百裂！
Fix-Between 10627 '} ' '`,' '使用 狂風百裂！'

# L10638: -> 使用 幻影交錯！
Fix-Between 10637 '} ' '`,' '使用 幻影交錯！'

# L10678: `${player.name} GARBLED`, -> 進入招架狀態！
Fix-Between 10677 '} ' '`,' '進入招架狀態！'

# L10750: (`GARBLED`, -> 最終判決命中！
Fix-Between 10749 '(`' '`,' '最終判決命中！'

# L10832: (`GARBLED`, -> 已在執行狀態！技能無法再次使用！
Fix-Between 10831 '(`' '`,' '已在執行狀態！技能無法再次使用！'

# L11277: (`GARBLED`, -> 雷電守護激活！
Fix-Between 11276 '(`' '`,' '雷電守護激活！'

# L11289: (`GARBLED`, -> 雪球附魔激活！下次攻擊發射雪球！
Fix-Between 11288 '(`' '`,' '雪球附魔激活！下次攻擊發射雪球！'

# L11401: (`GARBLED`, -> 敵人已被拋出！無法再次投擲！
Fix-Between 11400 '(`' '`,' '敵人已被拋出！無法再次投擲！'

# L11477: (`GARBLED`, -> 距離太遠！名門連環殺未命中
Fix-Between 11476 '(`' '`,' '距離太遠！名門連環殺未命中'

# L11617: (`GARBLED`, -> 荊棘陷阱觸發！移速提升3秒！
Fix-Between 11616 '(`' '`,' '荊棘陷阱觸發！移速提升3秒！'

# L11940: (`GARBLED`, -> 強化箭矢命中！緩速30%
Fix-Between 11939 '(`' '`,' '強化箭矢命中！緩速30%'

# L12269: `${target.name} GARBLED`, -> 完美格擋！
Fix-Between 12268 '} ' '`,' '完美格擋！'

# L12796: (`GARBLED`, -> 距離太遠！
Fix-Between 12795 '(`' '`,' '距離太遠！'

# L12894: check
Write-Host "L12894: $($lines[12893])"

# L12967: check
Write-Host "L12967: $($lines[12966])"

# L12980: check
Write-Host "L12980: $($lines[12979])"

# L13265: check
Write-Host "L13265: $($lines[13264])"

# L14241: -> 幻影互換結束！
Fix-Between 14240 '} ' '`,' '幻影互換結束！'

# === EXECUTION SCREEN TEXTS (ctx.fillText calls) ===
# Pattern: fillText('GARBLED', x, y)  -> use anchor "Text('" and "',"

# L2709: '疾風無痕...消逝'
Fix-Between 2708 "Text('" "'," '疾風無痕...消逝'

# L2951: '烈焰焚身！'
Fix-Between 2950 "Text('" "'," '烈焰焚身！'

# L3225: '水火相煎..亡'
Fix-Between 3224 "Text('" "'," '水火相煎..亡'

# L3573: '天雷制裁！'
Fix-Between 3572 "Text('" "'," '天雷制裁！'

# L3845: '大地震怒！萬物歸土！'
Fix-Between 3844 "Text('" "'," '大地震怒！萬物歸土！'

# L4117: '黑暗吞噬一切..消逝'
Fix-Between 4116 "Text('" "'," '黑暗吞噬一切..消逝'

# L4193: Warlock rune array - check first
Write-Host "L4193: $($lines[4192])"

# L4242: '神光裁決！'
Fix-Between 4241 "Text('" "'," '神光裁決！'

# L4435: '毒霧彌漫！無路可逃！'
Fix-Between 4434 "Text('" "'," '毒霧彌漫！無路可逃！'

# L4706: '猛獸怒吼！力破寰宇！'
Fix-Between 4705 "Text('" "'," '猛獸怒吼！力破寰宇！'

# L4851: '精靈守護・自然感謝'
Fix-Between 4850 "Text('" "'," '精靈守護・自然感謝'

# L5005: '燒！'
Fix-Between 5004 "Text('" "'," '燒！'

# === VICTORY SCREEN ctx.fillText ===

# L5147: '精靈獵人勝！'
Fix-Between 5146 "Text('" "'," '精靈獵人勝！'

# L5153: `${winner.name} GARBLED` -> 勝！
Fix-Between 5152 '} ' '`,' '勝！'

# L5439: '浪人居合斬！'
Fix-Between 5438 "Text('" "'," '浪人居合斬！'

# L5543: '吼！'
Fix-Between 5542 "Text('" "'," '吼！'

# L5557: '巨獸壓制完成！'
Fix-Between 5556 "Text('" "'," '巨獸壓制完成！'

# L5630: '名門連環殺完成！'
Fix-Between 5629 "Text('" "'," '名門連環殺完成！'

# L5704: '裂空斬完成！'
Fix-Between 5703 "Text('" "'," '裂空斬完成！'

# L6385: '血契收割完成！'
Fix-Between 6384 "Text('" "'," '血契收割完成！'

# L6447: '血契忍者勝利！'
Fix-Between 6446 "Text('" "'," '血契忍者勝利！'

# L6513: '浪人劍客勝利！'
Fix-Between 6512 "Text('" "'," '浪人劍客勝利！'

# L6607: '再次對戰'
Fix-Between 6606 "Text('" "'," '再次對戰'

# L6624: '返回選角'
Fix-Between 6623 "Text('" "'," '返回選角'

# L6704,6707,6710,6713: Wind big chars - check first
@(6703,6706,6709,6712) | ForEach-Object { Write-Host "L$($_+1): $($lines[$_])" }

# L6727: '風影忍者，風之化身！'
Fix-Between 6726 "Text('" "'," '風影忍者，風之化身！'

# L6849: '火焰忍者，烈焰永燃！'
Fix-Between 6848 "Text('" "'," '火焰忍者，烈焰永燃！'

# L6956: '水龍騰越！'
Fix-Between 6955 "Text('" "'," '水龍騰越！'

# L6969: '水影忍者，流水無形！'
Fix-Between 6968 "Text('" "'," '水影忍者，流水無形！'

# L7079: strokeText('雷霆萬鈞！') - use strokeText anchor
Fix-Between 7078 "Text('" "'," '雷霆萬鈞！'
Fix-Between 7079 "Text('" "'," '雷霆萬鈞！'

# L7094: '雷擊忍者，迅雷不及掩耳！'
Fix-Between 7093 "Text('" "'," '雷擊忍者，迅雷不及掩耳！'

# L7227-7228: '山嶽崩裂！'
Fix-Between 7226 "Text('" "'," '山嶽崩裂！'
Fix-Between 7227 "Text('" "'," '山嶽崩裂！'

# L7242: '岩甲忍者，屹立不搖！'
Fix-Between 7241 "Text('" "'," '岩甲忍者，屹立不搖！'

# L7373: '暗影忍者，無影無蹤！'
Fix-Between 7372 "Text('" "'," '暗影忍者，無影無蹤！'

# L7507-7508: '靈光普照！'
Fix-Between 7506 "Text('" "'," '靈光普照！'
Fix-Between 7507 "Text('" "'," '靈光普照！'

# L7524-7525: '靈忍者，天地皆消！'
Fix-Between 7523 "Text('" "'," '靈忍者，天地皆消！'
Fix-Between 7524 "Text('" "'," '靈忍者，天地皆消！'

# L7699: '按R鍵觀看勝利動畫'
Fix-Between 7698 "Text('" "'," '按R鍵觀看勝利動畫'

# L7715: '🥷'
Fix-Between 7714 "Text('" "'," '🥷'

# L7717: '🥷'
Fix-Between 7716 "Text('" "'," '🥷'

# L7734: `${winner.name} GARBLED` -> 勝！
Fix-Between 7733 '} ' '`,' '勝！'

# === VICTORY QUOTES ===
@(7740,7742,7743,7744,7745,7746,7747,7748) | ForEach-Object { Write-Host "L$($_+1): $($lines[$_])" }

# === ADJUDICATOR PARRY EFFECT ===
Write-Host "L12234: $($lines[12233])"
Write-Host "L13626: $($lines[13625])"
Write-Host "L13627: $($lines[13626])"

Write-Host ""
Write-Host "=== Fixed $fixed lines so far ==="
Write-Host "Writing file..."
[System.IO.File]::WriteAllLines($path, $lines, $enc)
Write-Host "Done."
