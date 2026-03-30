# fix_garbled_final.ps1 - Fix all garbled Chinese text using full-text replace
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$enc = [System.Text.Encoding]::UTF8
$path = 'gameEngine.js'
$lines = [System.IO.File]::ReadAllLines($path, $enc)
$fixed = 0

# Replace a substring between two ASCII anchors on a specific line (0-indexed)
function R([int]$idx, [string]$left, [string]$right, [string]$repl) {
    $l = $lines[$idx]
    $lp = $l.IndexOf($left)
    if ($lp -lt 0) { Write-Host "SKIP L$($idx+1) left=[$left]"; return }
    $sf = $lp + $left.Length
    $rp = $l.IndexOf($right, $sf)
    if ($rp -lt 0) { Write-Host "SKIP L$($idx+1) right=[$right]"; return }
    $lines[$idx] = $l.Substring(0, $sf) + $repl + $l.Substring($rp)
    $script:fixed++
    Write-Host "OK L$($idx+1)"
}

# L194: addCombatLog(`${p.name} GARBLED`, -> 防禦被控制打斷！
R 193 '} ' '`,' '防禦被控制打斷！'
# L5726: addCombatLog(`GARBLED`, -> 僕人被擊殺！
R 5725 '(`' '`,' '僕人被擊殺！'
# L5901: addCombatLog('GARBLED', -> 最終判決降低移速！
R 5900 "('" "'," '最終判決降低移速！'
# L8686: addCombatLog('GARBLED', -> 巨獸變身！定身敵人50%！
R 8685 "('" "'," '巨獸變身！定身敵人50%！'
# L8707: .name = 'GARBLED'; -> 投擲巨石
R 8706 "name = '" "';" '投擲巨石'
# L8708: .type = 'GARBLED'; -> 投擲/範圍
R 8707 "type = '" "';" '投擲/範圍'
# L8712: .name = 'GARBLED'; -> 恢復人型
R 8711 "name = '" "';" '恢復人型'
# L8713: .type = 'GARBLED'; -> 恢復/變身
R 8712 "type = '" "';" '恢復/變身'
# L8717: addCombatLog('GARBLED', -> 巨獸變身完成！
R 8716 "('" "'," '巨獸變身完成！'
# L8737: .name = 'GARBLED'; -> 深淵觸手
R 8736 "name = '" "';" '深淵觸手'
# L8738: .type = 'GARBLED'; -> 控制/抓取
R 8737 "type = '" "';" '控制/抓取'
# L8742: .name = 'GARBLED'; -> 巨獸解放
R 8741 "name = '" "';" '巨獸解放'
# L8743: .type = 'GARBLED'; -> 變身/定身
R 8742 "type = '" "';" '變身/定身'
# L8749: addCombatLog('GARBLED', -> 恢復人型！冷卻6秒！
R 8748 "('" "'," '恢復人型！冷卻6秒！'
# L9327: addCombatLog(`GARBLED`, -> 自然律動！移速+20%
R 9326 '(`' '`,' '自然律動！移速+20%'
# L9439: addCombatLog(`${player.name} GARBLED`, -> 電壓釋放命中！
R 9438 '} ' '`,' '電壓釋放命中！'
# L9461: addCombatLog('GARBLED', -> 傀儡攻擊！
R 9460 "('" "'," '傀儡攻擊！'
# L9571: - check if it's line 9571 or 9572 was empty
# From output: L9572 was '}' - so L9571 should have it
R 9570 "('" "'," '最終判決擊飛！'
# L9587: addCombatLog(`${player.name} GARBLED`, -> 普攻命中！
R 9586 '} ' '`,' '普攻命中！'
# L9617: addCombatLog(`GARBLED`, -> 毒蠍連鞭！擊退+減速+毒棘荊地！
R 9616 '(`' '`,' '毒蠍連鞭！擊退+減速+毒棘荊地！'
# L9825: addCombatLog(`${player.name} GARBLED`, -> 影子回傳！
R 9824 '} ' '`,' '影子回傳！'
# L9860: addCombatLog(`GARBLED${needStacks}GARBLED`, -> 巨獸解放：疊層不足！需要${needStacks}層！
# Handle with full line replacement - find the template portions
$l9860 = $lines[9859]
$lp = $l9860.IndexOf('(`')
$rp = $l9860.IndexOf('`,' , $lp + 2)
if ($lp -ge 0 -and $rp -ge 0) {
    $lines[9859] = $l9860.Substring(0, $lp + 2) + '巨獸解放：疊層不足！需要${needStacks}層！' + $l9860.Substring($rp)
    $fixed++
    Write-Host "OK L9860"
}
# L9920: addCombatLog(`${player.name} GARBLED`, -> 霸體激活！
R 9919 '} ' '`,' '霸體激活！'
# L9925: addCombatLog(`${player.name} GARBLED GARBLED`, -> 使用 深淵觸手！
R 9924 '} ' '`,' '使用 深淵觸手！'
# L9975: addCombatLog('GARBLED', -> 疊層不足！無法使用巨獸技能！
R 9974 "('" "'," '疊層不足！無法使用巨獸技能！'
# L9981: addCombatLog(`${player.name} GARBLED GARBLED`, -> 使用 投擲巨石！
R 9980 '} ' '`,' '使用 投擲巨石！'
# L10027: addCombatLog(`GARBLED${damage}GARBLED`, -> 巨石命中！造成${damage}點傷害
$l10027 = $lines[10026]
$lp = $l10027.IndexOf('(`')
$rp = $l10027.IndexOf('`,' , $lp + 2)
if ($lp -ge 0 -and $rp -ge 0) {
    $lines[10026] = $l10027.Substring(0, $lp + 2) + '巨石命中！造成${damage}點傷害' + $l10027.Substring($rp)
    $fixed++
    Write-Host "OK L10027"
}
# L10072: addCombatLog('GARBLED', -> 巨獸解放！定身敵人2秒！
R 10071 "('" "'," '巨獸解放！定身敵人2秒！'
# L10156: addCombatLog(`${player.name} GARBLED GARBLED`, -> 使用 爆炎衝刺！
R 10155 '} ' '`,' '使用 爆炎衝刺！'
# L10328: addCombatLog(`${player.name} GARBLED GARBLED`, -> 使用 岩壁護體！
R 10327 '} ' '`,' '使用 岩壁護體！'
# L10404: -> 使用 黑刃突襲！
R 10403 '} ' '`,' '使用 黑刃突襲！'
# L10525: -> 使用 毒鏢！
R 10524 '} ' '`,' '使用 毒鏢！'
# L10531: addCombatLog(`${player.name} GARBLED GARBLED`, -> 佈置 荊棘陷阱！
R 10530 '} ' '`,' '佈置 荊棘陷阱！'
# L10612: -> 使用 異議駁回！
R 10611 '} ' '`,' '使用 異議駁回！'
# L10623: -> 使用 絕風裂空突！
R 10622 '} ' '`,' '使用 絕風裂空突！'
# L10628: -> 使用 狂風百裂！
R 10627 '} ' '`,' '使用 狂風百裂！'
# L10638: 幻影交錯 - in session summary this line has valid Chinese 蝘尼蝢押撟餃蔣鈭日嚗
# Check: from L10638 output: `${player.name} 雿輻 蝘尼蝢押撟餃蔣鈭日嚗`
# 雿輻=使用, 蝘尼蝢押撟餃蔣鈭日=幻影交錯, 嚗=！-- all garbled. Replace all from '} '
R 10637 '} ' '`,' '使用 幻影交錯！'
# L10678: -> 進入招架狀態！
R 10677 '} ' '`,' '進入招架狀態！'
# L10750: addCombatLog('GARBLED', -> 最終判決命中！
R 10749 "('" "'," '最終判決命中！'
# L10832: addCombatLog('GARBLED', -> 已在執行狀態！技能無法再次使用！
R 10831 "('" "'," '已在執行狀態！技能無法再次使用！'
# L11277: -> 雷電守護激活！
R 11276 '(`' '`,' '雷電守護激活！'
# L11289: -> 雪球附魔激活！下次攻擊發射雪球！
R 11288 '(`' '`,' '雪球附魔激活！下次攻擊發射雪球！'
# L11401: -> 敵人已被拋出！無法再次投擲！
R 11400 '(`' '`,' '敵人已被拋出！無法再次投擲！'
# L11477: -> 距離太遠！名門連環殺未命中
R 11476 '(`' '`,' '距離太遠！名門連環殺未命中'
# L11617: -> 荊棘陷阱觸發！移速提升3秒！
R 11616 '(`' '`,' '荊棘陷阱觸發！移速提升3秒！'
# L11940: -> 強化箭矢命中！緩速30%
R 11939 '(`' '`,' '強化箭矢命中！緩速30%'
# L12234: text: 'GARBLED', -> 招架！
R 12233 "text: '" "'," '招架！'
# L12269: -> 完美格擋！
R 12268 '} ' '`,' '完美格擋！'
# L12796: -> 距離太遠！
R 12795 '(`' '`,' '距離太遠！'
# L12894: addCombatLog(`GARBLED ${skill.damage} GARBLED`, -> 居合一閃！造成 ${skill.damage} 點瞬殺傷害！
$l12894 = $lines[12893]
$lp = $l12894.IndexOf('(`')
$rp = $l12894.IndexOf('`,' , $lp + 2)
if ($lp -ge 0 -and $rp -ge 0) {
    $lines[12893] = $l12894.Substring(0, $lp + 2) + '居合一閃！造成 ${skill.damage} 點瞬殺傷害！' + $l12894.Substring($rp)
    $fixed++
    Write-Host "OK L12894"
}
# L12967: complex template literal on its own line
$l12967 = $lines[12966]
$lp = $l12967.IndexOf('`')
$rp = $l12967.LastIndexOf('`')
if ($lp -ge 0 -and $rp -gt $lp) {
    $lines[12966] = $l12967.Substring(0, $lp + 1) + '靈天審判！蓄力${(chargeTime / 1000).toFixed(1)}s，造成 ${judgmentDamage} 點傷害！' + $l12967.Substring($rp)
    $fixed++
    Write-Host "OK L12967"
}
# L12980: -> 靈天審判：距離太遠未命中
R 12979 '(`' '`,' '靈天審判：距離太遠未命中'
# L13265: addCombatLog('GARBLED', -> 傀儡纜線斷裂！自動收回！
R 13264 "('" "'," '傀儡纜線斷裂！自動收回！'
# L13626: strokeText(effect.text || 'GARBLED', -> 招架！
R 13625 "|| '" "'," '招架！'
# L13627: fillText(effect.text || 'GARBLED', -> 招架！
R 13626 "|| '" "'," '招架！'
# L14241: addCombatLog(`${player.name} GARBLED`, -> 幻影互換結束！
R 14240 '} ' '`,' '幻影互換結束！'

# === EXECUTION SCREEN TEXTS ===
# L2709: '疾風無痕...消逝'
R 2708 "Text('" "'," '疾風無痕...消逝'
# L2951: '烈焰焚身！'
R 2950 "Text('" "'," '烈焰焚身！'
# L3225: '水火相煎..亡'
R 3224 "Text('" "'," '水火相煎..亡'
# L3573: '天雷制裁！'
R 3572 "Text('" "'," '天雷制裁！'
# L3845: '大地震怒！萬物歸土！'
R 3844 "Text('" "'," '大地震怒！萬物歸土！'
# L4117: '黑暗吞噬一切..消逝'
R 4116 "Text('" "'," '黑暗吞噬一切..消逝'
# L4193: Warlock rune array ['??','??',...]
$l4193 = $lines[4192]
$lp = $l4193.IndexOf('[')
$rp = $l4193.IndexOf(']', $lp)
if ($lp -ge 0 -and $rp -ge 0) {
    $lines[4192] = $l4193.Substring(0, $lp) + "['咒', '術', '血', '契', '魔', '法', '覺', '醒']" + $l4193.Substring($rp + 1)
    $fixed++
    Write-Host "OK L4193"
}
# L4242: '神光裁決！'
R 4241 "Text('" "'," '神光裁決！'
# L4435: '毒霧彌漫！無路可逃！'
R 4434 "Text('" "'," '毒霧彌漫！無路可逃！'
# L4706: '猛獸怒吼！力破寰宇！'
R 4705 "Text('" "'," '猛獸怒吼！力破寰宇！'
# L4851: '精靈守護・自然感謝'
R 4850 "Text('" "'," '精靈守護・自然感謝'
# L5005: '燒！'
R 5004 "Text('" "'," '燒！'

# === VICTORY SCREEN ctx.fillText ===
# L5147: '精靈獵人勝！'
R 5146 "Text('" "'," '精靈獵人勝！'
# L5153: `${winner.name} GARBLED`, -> 勝！
R 5152 '} ' '`,' '勝！'
# L5439: '浪人居合斬！'
R 5438 "Text('" "'," '浪人居合斬！'
# L5543: '吼！'
R 5542 "Text('" "'," '吼！'
# L5557: '巨獸壓制完成！'
R 5556 "Text('" "'," '巨獸壓制完成！'
# L5630: '名門連環殺完成！'
R 5629 "Text('" "'," '名門連環殺完成！'
# L5704: '裂空斬完成！'
R 5703 "Text('" "'," '裂空斬完成！'
# L6385: '血契收割完成！'
R 6384 "Text('" "'," '血契收割完成！'
# L6447: '血契忍者勝利！'
R 6446 "Text('" "'," '血契忍者勝利！'
# L6513: '浪人劍客勝利！'
R 6512 "Text('" "'," '浪人劍客勝利！'
# L6607: '再次對戰'
R 6606 "Text('" "'," '再次對戰'
# L6624: '返回選角'
R 6623 "Text('" "'," '返回選角'
# L6704: Wind big char '憸?' -> '疾'
R 6703 "Text('" "'," '疾'
# L6707: '蟡?' -> '風'
R 6706 "Text('" "'," '風'
# L6710: '??' -> '閃'
R 6709 "Text('" "'," '閃'
# L6713: '??' -> '躍'
R 6712 "Text('" "'," '躍'
# L6727: '風影忍者，風之化身！'
R 6726 "Text('" "'," '風影忍者，風之化身！'
# L6849: '火焰忍者，烈焰永燃！'
R 6848 "Text('" "'," '火焰忍者，烈焰永燃！'
# L6956: '水龍騰越！'
R 6955 "Text('" "'," '水龍騰越！'
# L6969: '水影忍者，流水無形！'
R 6968 "Text('" "'," '水影忍者，流水無形！'
# L7079: strokeText('雷霆萬鈞！') and L7080: fillText('雷霆萬鈞！')
R 7078 "Text('" "'," '雷霆萬鈞！'
R 7079 "Text('" "'," '雷霆萬鈞！'
# L7094: '雷擊忍者，迅雷不及掩耳！'
R 7093 "Text('" "'," '雷擊忍者，迅雷不及掩耳！'
# L7227-7228: '山嶽崩裂！'
R 7226 "Text('" "'," '山嶽崩裂！'
R 7227 "Text('" "'," '山嶽崩裂！'
# L7242: '岩甲忍者，屹立不搖！'
R 7241 "Text('" "'," '岩甲忍者，屹立不搖！'
# L7373: '暗影忍者，無影無蹤！'
R 7372 "Text('" "'," '暗影忍者，無影無蹤！'
# L7507-7508: '靈光普照！'
R 7506 "Text('" "'," '靈光普照！'
R 7507 "Text('" "'," '靈光普照！'
# L7524-7525: '靈忍者，天地皆消！'
R 7523 "Text('" "'," '靈忍者，天地皆消！'
R 7524 "Text('" "'," '靈忍者，天地皆消！'
# L7699: '按R鍵觀看勝利動畫'
R 7698 "Text('" "'," '按R鍵觀看勝利動畫'
# L7715: '🥷'
R 7714 "Text('" "'," '🥷'
# L7717: '🥷'
R 7716 "Text('" "'," '🥷'
# L7734: `${winner.name} GARBLED`
R 7733 '} ' '`,' '勝！'

# === VICTORY QUOTES ===
# L7741: fujin quote
R 7740 ": '" "'," '風無邊際，誰能束縛！'
# L7742: katon quote - check if garbled
$l7742 = $lines[7741]
Write-Host "Checking L7742 katon: $l7742"
# katon line:  '?????堆??銝?蝷???'  - should be '烈焰燃盡，灰飛煙滅！'
R 7741 ": '" "'," '烈焰燃盡，灰飛煙滅！'
# L7743: suijin
R 7742 ": '" "'," '水之力量，柔能克剛！'
# L7744: raijin
R 7743 ": '" "'," '雷光閃電，快如光速！'
# L7745: doton (same text as earth title)
R 7744 ": '" "'," '大地不動，萬物歸一！'
# L7746: kage
R 7745 ": '" "'," '暗影無形，無處可逃！'
# L7747: rei
R 7746 ": '" "'," '靈光點點，業已裁決！'
# L7750: default quote
R 7749 "|| '" "';" '一決勝負，天下無敵！'

Write-Host ""
Write-Host "=== Total fixed: $fixed lines ==="
Write-Host "Writing file..."
[System.IO.File]::WriteAllLines($path, $lines, $enc)
Write-Host "Done."
