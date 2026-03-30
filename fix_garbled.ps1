# fix_garbled.ps1 - Fix all garbled Chinese text in gameEngine.js
# Strategy: use line-number based replacement to handle invisible PUA characters

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$enc = [System.Text.Encoding]::UTF8
$path = 'gameEngine.js'
$lines = [System.IO.File]::ReadAllLines($path, $enc)
$fixed = 0

# Helper function: replace content in a specific line by substituting the garbled portion
# $idx = 0-based line index, $old = garbled text as stored in file, $new = correct text
function Fix-Line($idx, $old, $new) {
    if ($lines[$idx].Contains($old)) {
        $lines[$idx] = $lines[$idx].Replace($old, $new)
        $script:fixed++
        Write-Host "Fixed L$($idx+1)"
    } else {
        Write-Host "SKIP L$($idx+1) - pattern not found: [$old]"
    }
}

# === Line 194 (idx 193) ===
Fix-Line 193 $lines[193].Substring($lines[193].IndexOf('} ')+2, $lines[193].IndexOf('`', $lines[193].IndexOf('} ')+2) - ($lines[193].IndexOf('} ')+2)) '防禦被控制打斷！'

# Wait - better approach: extract the exact garbled string from each line, then replace it
# Reset and redo with a smarter approach: identify the part between known delimiters

# Reload original
$lines = [System.IO.File]::ReadAllLines($path, $enc)
$fixed = 0

# For each line, we identify the garbled substring by surrounding context that we know
# Format: Fix-Line $lineIdx "left_anchor" "right_anchor" "replacement"
# We'll replace from left_anchor_end to right_anchor_start

function Fix-Between($idx, $leftAnchor, $rightAnchor, $replacement) {
    $l = $lines[$idx]
    $leftPos = $l.IndexOf($leftAnchor)
    if ($leftPos -lt 0) { Write-Host "SKIP L$($idx+1) - left anchor not found: [$leftAnchor]"; return }
    $searchFrom = $leftPos + $leftAnchor.Length
    $rightPos = $l.IndexOf($rightAnchor, $searchFrom)
    if ($rightPos -lt 0) { Write-Host "SKIP L$($idx+1) - right anchor not found: [$rightAnchor]"; return }
    $garbled = $l.Substring($searchFrom, $rightPos - $searchFrom)
    $lines[$idx] = $l.Substring(0, $searchFrom) + $replacement + $l.Substring($rightPos)
    $script:fixed++
    Write-Host "Fixed L$($idx+1): [$garbled] -> [$replacement]"
}

# === COMBAT LOG STRINGS ===

# L194: `${p.name} [garbled]`, pid, 'status') -> 防禦被控制打斷！
Fix-Between 193 '} ' '`' '防禦被控制打斷！'

# L5726: this.addCombatLog(`[garbled]`, attackerId -> 僕人被擊殺！
Fix-Between 5725 '(`' '`' '僕人被擊殺！'

# L5901: this.addCombatLog(`[garbled]`, -> 最終判決降低移速！
Fix-Between 5900 '(`' '`' '最終判決降低移速！'

# L8686: this.addCombatLog(`[garbled]`, -> 巨獸變身！定身敵人50%！
Fix-Between 8685 '(`' '`' '巨獸變身！定身敵人50%！'

# L8707: player.skills.normal.name = '[garbled]'  -> '投擲巨石'
Fix-Between 8706 "= '" "'" '投擲巨石'

# L8708: player.skills.normal.type = '[garbled]' -> '投擲/範圍'
Fix-Between 8707 "= '" "'" '投擲/範圍'

# L8712: player.skills.ultimate.name = '[garbled]' -> '恢復人型'
Fix-Between 8711 "= '" "'" '恢復人型'

# L8713: player.skills.ultimate.type = '[garbled]' -> '恢復/變身'
Fix-Between 8712 "= '" "'" '恢復/變身'

# L8717: this.addCombatLog(`[garbled]`, -> 巨獸變身完成！
Fix-Between 8716 '(`' '`' '巨獸變身完成！'

# L8737: player.skills.normal.name = '[garbled]' -> '深淵觸手'
Fix-Between 8736 "= '" "'" '深淵觸手'

# L8738: player.skills.normal.type = '[garbled]' -> '控制/抓取'
Fix-Between 8737 "= '" "'" '控制/抓取'

# L8742: player.skills.ultimate.name = '[garbled]' -> '巨獸解放'
Fix-Between 8741 "= '" "'" '巨獸解放'

# L8743: player.skills.ultimate.type = '[garbled]' -> '變身/定身'
Fix-Between 8742 "= '" "'" '變身/定身'

# L8749: this.addCombatLog(`[garbled]`, -> 恢復人型！冷卻6秒！
Fix-Between 8748 '(`' '`' '恢復人型！冷卻6秒！'

# L9327: this.addCombatLog(`[garbled]`, -> 自然律動！移速+20%
Fix-Between 9326 '(`' '`' '自然律動！移速+20%'

# L9439: `${player.name} [garbled]` -> 電壓釋放命中！
Fix-Between 9438 '} ' '`' '電壓釋放命中！'

# L9461: this.addCombatLog(`[garbled]` -> 傀儡攻擊！
Fix-Between 9460 '(`' '`' '傀儡攻擊！'

# L9571: this.addCombatLog(`[garbled]` -> 最終判決擊飛！
Fix-Between 9570 '(`' '`' '最終判決擊飛！'

# L9587: `${player.name} [garbled]` -> 普攻命中！
Fix-Between 9586 '} ' '`' '普攻命中！'

# L9617: this.addCombatLog(`[garbled]` -> 毒蠍連鞭！擊退+減速+毒棘荊地！
Fix-Between 9616 '(`' '`' '毒蠍連鞭！擊退+減速+毒棘荊地！'

# L9825: `${player.name} [garbled]` -> 影子回傳！
Fix-Between 9824 '} ' '`' '影子回傳！'

# L9860: `[garbled]${needStacks}[garbled]` -> check actual line first
$l9860 = $lines[9859]
Write-Host "L9860: $l9860"

# L9920: `${player.name} [garbled]` -> 霸體激活！
Fix-Between 9919 '} ' '`' '霸體激活！'

# L9925: `${player.name} 雿輻 [garbled]` -> 使用 深淵觸手！
# 雿輻 is valid Chinese, space after it
Fix-Between 9924 '雿輻 ' '`' '使用 深淵觸手！'

# L9975: this.addCombatLog(`[garbled]` -> 疊層不足！無法使用巨獸技能！
Fix-Between 9974 '(`' '`' '疊層不足！無法使用巨獸技能！'

# L9981: `${player.name} 雿輻 [garbled]` -> 使用 投擲巨石！
Fix-Between 9980 '雿輻 ' '`' '使用 投擲巨石！'

# L10027: `[garbled]${damage}[garbled]` -> check line
$l10027 = $lines[10026]
Write-Host "L10027: $l10027"

# L10072: this.addCombatLog(`[garbled]` -> 巨獸解放！定身敵人2秒！
Fix-Between 10071 '(`' '`' '巨獸解放！定身敵人2秒！'

# L10156: `${player.name} 雿輻 [garbled]` -> 使用 爆炎衝刺！
Fix-Between 10155 '雿輻 ' '`' '使用 爆炎衝刺！'

# L10328: `${player.name} 雿輻 [garbled]` -> 使用 岩壁護體！
Fix-Between 10327 '雿輻 ' '`' '使用 岩壁護體！'

# L10404: `${player.name} 雿輻 [garbled]` -> 使用 黑刃突襲！
Fix-Between 10403 '雿輻 ' '`' '使用 黑刃突襲！'

# L10525: `${player.name} 雿輻 [garbled]` -> 使用 毒鏢！
Fix-Between 10524 '雿輻 ' '`' '使用 毒鏢！'

# L10531: `${player.name} 雿蔭 [garbled]` -> 佈置 荊棘陷阱！
Fix-Between 10530 '雿蔭 ' '`' '佈置 荊棘陷阱！'

# L10612: `${player.name} 雿輻 [garbled]` -> 使用 異議駁回！
Fix-Between 10611 '雿輻 ' '`' '使用 異議駁回！'

# L10623: `${player.name} 雿輻 [garbled]` -> 使用 絕風裂空突！
Fix-Between 10622 '雿輻 ' '`' '使用 絕風裂空突！'

# L10628: `${player.name} 雿輻 [garbled]` -> 使用 狂風百裂！
Fix-Between 10627 '雿輻 ' '`' '使用 狂風百裂！'

# L10638: `${player.name} 雿輻 [garbled]` -> 使用 幻影交錯！
Fix-Between 10637 '雿輻 ' '`' '使用 幻影交錯！'

# L10678: `${player.name} [garbled]` -> 進入招架狀態！
Fix-Between 10677 '} ' '`' '進入招架狀態！'

# L10750: this.addCombatLog(`[garbled]` -> 最終判決命中！
Fix-Between 10749 '(`' '`' '最終判決命中！'

# L10832: this.addCombatLog(`[garbled]` -> 已在執行狀態！技能無法再次使用！
Fix-Between 10831 '(`' '`' '已在執行狀態！技能無法再次使用！'

# L11277: this.addCombatLog(`[garbled]` -> 雷電守護激活！
Fix-Between 11276 '(`' '`' '雷電守護激活！'

# L11289: this.addCombatLog(`[garbled]` -> 雪球附魔激活！下次攻擊發射雪球！
Fix-Between 11288 '(`' '`' '雪球附魔激活！下次攻擊發射雪球！'

# L11401: this.addCombatLog(`[garbled]` -> 敵人已被拋出！無法再次投擲！
Fix-Between 11400 '(`' '`' '敵人已被拋出！無法再次投擲！'

# L11477: this.addCombatLog(`[garbled]` -> 距離太遠！名門連環殺未命中
Fix-Between 11476 '(`' '`' '距離太遠！名門連環殺未命中'

# L11617: this.addCombatLog(`[garbled]` -> 荊棘陷阱觸發！移速提升3秒！
Fix-Between 11616 '(`' '`' '荊棘陷阱觸發！移速提升3秒！'

# L11940: this.addCombatLog(`[garbled]` -> 強化箭矢命中！緩速30%
Fix-Between 11939 '(`' '`' '強化箭矢命中！緩速30%'

# L12269: `${target.name} [garbled]` -> 完美格擋！
Fix-Between 12268 '} ' '`' '完美格擋！'

# L12796: this.addCombatLog(`[garbled]` -> 距離太遠！
Fix-Between 12795 '(`' '`' '距離太遠！'

# L12894: this.addCombatLog(`[garbled]` -> 居合一閃！造成 ${skill.damage} 點瞬殺傷害！
# This one has ${skill.damage} in the middle - check the line
$l12894 = $lines[12893]
Write-Host "L12894: $l12894"

# L12967: complex template literal - check line
$l12967 = $lines[12966]
Write-Host "L12967: $l12967"

# L12980: check line
$l12980 = $lines[12979]
Write-Host "L12980: $l12980"

# L13265: check line
$l13265 = $lines[13264]
Write-Host "L13265: $l13265"

# L14241: `${player.name} [garbled]` -> 幻影互換結束！
Fix-Between 14240 '} ' '`' '幻影互換結束！'

# === VICTORY SCREEN STRINGS ===

# L5147: ctx.fillText('[garbled]', ...) -> '精靈獵人勝！'
Fix-Between 5146 "Text('" "'" '精靈獵人勝！'

# L5153: `${winner.name} [garbled]` -> 勝！
Fix-Between 5152 '} ' '`' '勝！'

# L5439: ctx.fillText('[garbled]', -> '浪人居合斬！'
Fix-Between 5438 "Text('" "'" '浪人居合斬！'

# L5543: ctx.fillText('[garbled]', -> '吼！'
Fix-Between 5542 "Text('" "'" '吼！'

# L5557: ctx.fillText('[garbled]', -> '巨獸壓制完成！'
Fix-Between 5556 "Text('" "'" '巨獸壓制完成！'

# L5630: ctx.fillText('[garbled]', -> '名門連環殺完成！'
Fix-Between 5629 "Text('" "'" '名門連環殺完成！'

# L5704: ctx.fillText('[garbled]', -> '裂空斬完成！'
Fix-Between 5703 "Text('" "'" '裂空斬完成！'

# L6385: ctx.fillText('[garbled]', -> '血契收割完成！'
Fix-Between 6384 "Text('" "'" '血契收割完成！'

# L6447: ctx.fillText('[garbled]', -> '血契忍者勝利！'
Fix-Between 6446 "Text('" "'" '血契忍者勝利！'

# L6513: ctx.fillText('[garbled]', -> '浪人劍客勝利！'
Fix-Between 6512 "Text('" "'" '浪人劍客勝利！'

# L6607: ctx.fillText('[garbled]', -> '再次對戰'
Fix-Between 6606 "Text('" "'" '再次對戰'

# L6624: ctx.fillText('[garbled]', -> '返回選角'
Fix-Between 6623 "Text('" "'" '返回選角'

# L6704-6713: Wind execution big characters
# Need to check these lines first
@(6703,6706,6709,6712) | ForEach-Object { Write-Host "L$($_+1): $($lines[$_])" }

# L6727: ctx.fillText('[garbled]', -> '風影忍者，風之化身！'
Fix-Between 6726 "Text('" "'" '風影忍者，風之化身！'

# L6849: ctx.fillText('[garbled]', -> '火焰忍者，烈焰永燃！'
Fix-Between 6848 "Text('" "'" '火焰忍者，烈焰永燃！'

# L6956: ctx.fillText('[garbled]', -> '水龍騰越！'
Fix-Between 6955 "Text('" "'" '水龍騰越！'

# L6969: ctx.fillText('[garbled]', -> '水影忍者，流水無形！'
Fix-Between 6968 "Text('" "'" '水影忍者，流水無形！'

# L7079-7080: strokeText + fillText -> '雷霆萬鈞！'
Fix-Between 7078 "Text('" "'" '雷霆萬鈞！'
Fix-Between 7079 "Text('" "'" '雷霆萬鈞！'

# L7094: ctx.fillText('[garbled]', -> '雷擊忍者，迅雷不及掩耳！'
Fix-Between 7093 "Text('" "'" '雷擊忍者，迅雷不及掩耳！'

# L7227-7228: strokeText + fillText -> '山嶽崩裂！'
Fix-Between 7226 "Text('" "'" '山嶽崩裂！'
Fix-Between 7227 "Text('" "'" '山嶽崩裂！'

# L7242: ctx.fillText('[garbled]', -> '岩甲忍者，屹立不搖！'
Fix-Between 7241 "Text('" "'" '岩甲忍者，屹立不搖！'

# L7373: ctx.fillText('[garbled]', -> '暗影忍者，無影無蹤！'
Fix-Between 7372 "Text('" "'" '暗影忍者，無影無蹤！'

# L7507-7508: strokeText + fillText -> '靈光普照！'
Fix-Between 7506 "Text('" "'" '靈光普照！'
Fix-Between 7507 "Text('" "'" '靈光普照！'

# L7524-7525: strokeText + fillText -> '靈忍者，天地皆消！'  
Fix-Between 7523 "Text('" "'" '靈忍者，天地皆消！'
Fix-Between 7524 "Text('" "'" '靈忍者，天地皆消！'

# L7699: ctx.fillText('[garbled]', -> '按R鍵觀看勝利動畫'
Fix-Between 7698 "Text('" "'" '按R鍵觀看勝利動畫'

# L7715: ctx.fillText('[garbled]', -> '🥷'
Fix-Between 7714 "Text('" "'" '🥷'

# L7717: ctx.fillText('[garbled]', -> '🥷'
Fix-Between 7716 "Text('" "'" '🥷'

# L7734: `${winner.name} [garbled]` -> 勝！
Fix-Between 7733 '} ' '`' '勝！'

# === VICTORY QUOTES ===
# These are object properties: fujin: '[garbled]'
# Check the lines
@(7740,7742,7743,7744,7745,7746,7747,7748) | ForEach-Object { Write-Host "L$($_+1): $($lines[$_])" }

# === EXECUTION SCREEN TEXTS ===

# L2709: ctx.fillText('[garbled]' -> '疾風無痕...消逝'
Fix-Between 2708 "Text('" "'" '疾風無痕...消逝'

# L2951: ctx.fillText('[garbled]' -> '烈焰焚身！'
Fix-Between 2950 "Text('" "'" '烈焰焚身！'

# L3225: ctx.fillText('[garbled]' -> '水火相煎..亡'
Fix-Between 3224 "Text('" "'" '水火相煎..亡'

# L3573: ctx.fillText('[garbled]' -> '天雷制裁！'
Fix-Between 3572 "Text('" "'" '天雷制裁！'

# L3845: ctx.fillText('[garbled]' -> '大地震怒！萬物歸土！'
Fix-Between 3844 "Text('" "'" '大地震怒！萬物歸土！'

# L4117: ctx.fillText('[garbled]' -> '黑暗吞噬一切..消逝'
Fix-Between 4116 "Text('" "'" '黑暗吞噬一切..消逝'

# L4242: ctx.fillText('[garbled]' -> '神光裁決！'
Fix-Between 4241 "Text('" "'" '神光裁決！'

# L4435: ctx.fillText('[garbled]' -> '毒霧彌漫！無路可逃！'
Fix-Between 4434 "Text('" "'" '毒霧彌漫！無路可逃！'

# L4706: ctx.fillText('[garbled]' -> '猛獸怒吼！力破寰宇！'
Fix-Between 4705 "Text('" "'" '猛獸怒吼！力破寰宇！'

# L4851: ctx.fillText('[garbled]' -> '精靈守護・自然感謝'
Fix-Between 4850 "Text('" "'" '精靈守護・自然感謝'

# L5005: ctx.fillText('[garbled]' -> '燒！'
Fix-Between 5004 "Text('" "'" '燒！'

# L4193: Warlock rune array ['??','??',...] -> ['咒','術','血','契','魔','法','覺','醒']
$l4193 = $lines[4192]
Write-Host "L4193: $l4193"

# L12234: effect text: '[garbled]' -> '招架！'
$l12234 = $lines[12233]
Write-Host "L12234: $l12234"

# L13626-7: effect.text || '[garbled]' -> '招架！'
@(13625,13626) | ForEach-Object { Write-Host "L$($_+1): $($lines[$_])" }

Write-Host ""
Write-Host "=== Fixed $fixed lines so far ==="

# Now write the file back
[System.IO.File]::WriteAllLines($path, $lines, $enc)
Write-Host "File written successfully"
