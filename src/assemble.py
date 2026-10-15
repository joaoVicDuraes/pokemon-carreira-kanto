# -*- coding: utf-8 -*-
"""Monta a v2 do jogo: lógica extraída do template atual + correções + UI/CSS novos + fontes + sprites."""
import io, re, json, base64, os, importlib.util

BASE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(BASE, "sprites", "firered-leafgreen")
OUT = os.path.join(os.path.dirname(BASE), "index.html")

def rd(p): return io.open(p, "r", encoding="utf-8").read()
def sub1(s, old, new, label):
    n = s.count(old)
    assert n == 1, "%s: esperado 1, achou %d" % (label, n)
    return s.replace(old, new)

tpl = rd(os.path.join(BASE, "game_template.html"))
def cut(a, b):
    i, j = tpl.index(a), tpl.index(b)
    assert i < j, (a, b)
    return tpl[i:j]

A  = cut("const DEX = {", "const $scene")
B1 = cut("/* ============ EVENTOS POR GIN", "/* desenha a roleta")
B2 = cut("function tryEvolve(m,r){", "function eventResult(")

# ---------- A: estado novo + imunidade ----------
A = re.sub(r"function newGame\(\)\{.*?\n",
    'function newGame(){return{phase:"title",team:[],gymIndex:0,eliteIndex:0,step:0,day:1,starter:null,vrDone:false,'
    'recorded:false,newRecord:false,pendingRocketGameOver:false,battle:null,lastResult:null,lastWin:null,log:[],'
    'stats:{caught:0,evolved:0,wins:0,eventsGood:0,eventsBad:0,stolen:0,fled:0,shinies:0}};}\n', A, count=1, flags=re.S)
assert 'phase:"title"' in A
A = sub1(A, "return best||1;", "return G.team.length?Math.max(0.5,best):1; /* imunidade vira 0.5: ainda há golpes de cobertura */", "bestMatchup")
# curva de dificuldade calibrada por simulação (sim_full/tune)
GYM_POW = [22, 50, 78, 102, 128, 152, 176, 200]
ELITE_POW = [225, 245, 265, 285, 310]
gi = A.index("const GYMS="); ge = A.index("const ELITE=")
gblock = A[gi:ge]; it = iter(GYM_POW)
gblock2 = re.sub(r"power:\d+", lambda m: "power:%d" % next(it), gblock)
assert gblock2.count("power:") == 8
ei = ge; ee = A.index("const STEPS_PER_GYM")
eblock = A[ei:ee]; it2 = iter(ELITE_POW)
eblock2 = re.sub(r"power:\d+", lambda m: "power:%d" % next(it2), eblock)
assert eblock2.count("power:") == 5
A = A[:gi] + gblock2 + eblock2 + A[ee:]

# ---------- Pokédex completa (151) ----------
import sys; sys.path.insert(0, BASE)
from dex151 import TABLE, SPECIAL, BRANCH, STONE
old_blk = A[:A.index("const STARTERS")]
OLD = {m.group(1): (int(m.group(3)), m.group(2)) for m in re.finditer(r'^\s*([A-Za-z]+):\{t:"\w+",e:"([^"]*)",base:(\d+)', old_blk, re.M)}
OLD["Nidoran♂"] = OLD.pop("Nidoran")   # o antigo "Nidoran" evoluía para Nidorino: é a linha ♂
targets = {r[4] for r in TABLE if r[4]} | {x for v in BRANCH.values() for x in v}
dex_rows = []
for num, name, t, base, evo, lv in TABLE:
    b, e = OLD.get(name, (base, "⚪"))
    ev = ',evo:%s,evoLv:%d' % (json.dumps(evo, ensure_ascii=False), lv) if evo else ',evo:null'
    dex_rows.append('  %s:{t:"%s",e:%s,base:%d%s}' % (json.dumps(name, ensure_ascii=False), t, json.dumps(e, ensure_ascii=False), b, ev))
new_dex = ("const DEX = {\n" + ",\n".join(dex_rows) + "\n};\n"
           "const BRANCH = " + json.dumps(BRANCH, ensure_ascii=False) + ";\n"
           "const STONE = " + json.dumps(STONE, ensure_ascii=False) + ";\n")
A = new_dex + A[A.index("const STARTERS"):]
pool = [r[1] for r in TABLE if r[1] not in targets and r[1] not in SPECIAL]
A, n = re.subn(r"const WILD_POOL=\[.*?\];", "const WILD_POOL=" + json.dumps(pool, ensure_ascii=False) + ";", A, count=1, flags=re.S)
assert n == 1
print("DEX", len(TABLE), "| na grama", len(pool))

# ---------- B1: helpers honestos + bugs ----------
B1 = re.sub(r"function addMon\(species,lv\)\{.*?G\.team\.push\(m\);G\.stats\.caught\+\+;return m;\}",
    "function addMon(species,lv,raw){const m=mon(species,lv);m.shiny=Math.random()<SHINY_RATE;"
    "if(!raw&&G.team.length){const s=G.team.slice().sort((a,b)=>b.lv-a.lv)[0];const fl=Math.round(s.lv*0.85);if(m.lv<fl)m.lv=fl;}"
    "if(G.team.length>=6){G.pendingSwap=m;return m;}"
    "G.team.push(m);G.stats.caught++;return m;}", B1, count=1, flags=re.S)
assert "function addMon(species,lv,raw)" in B1
# time cheio não descarta mais a captura: vira escolha de troca (G.pendingSwap)
n_guard = B1.count("if(!freeSlot())return bonusFull();")
B1 = B1.replace("if(!freeSlot())return bonusFull();", "")
print("capturas que agora oferecem troca:", n_guard)
B1 = re.sub(r"function lvlAll\(n\)\{.*?\}\);\}", "function lvlAll(n){G.team.forEach(m=>{m.lv+=n;tryEvolveSilent(m);});}", B1, count=1)
B1 = re.sub(r"function lvlOne\(m,n\)\{.*?return m;\}", "function lvlOne(m,n){m.lv+=n;tryEvolveSilent(m);return m;}", B1, count=1)
B1 = re.sub(r"function dropLvOne\(m,n\)\{.*?return m;\}", "function dropLvOne(m,n){m.lv=Math.max(5,m.lv-n);return m;}", B1, count=1)
B1 = re.sub(r"function dropLvAll\(n\)\{.*?\}\);\}", "function dropLvAll(n){G.team.forEach(m=>{m.lv=Math.max(5,m.lv-n);});}", B1, count=1)
for f in ["function lvlAll(n){G.team.forEach(m=>{m.lv+=n;", "function lvlOne(m,n){m.lv+=n;", "function dropLvOne(m,n){m.lv=Math.max(5,m.lv-n);", "function dropLvAll(n){G.team.forEach(m=>{m.lv=Math.max(5,m.lv-n);"]:
    assert f in B1, f
# BUG: fuga com só o inicial encerrava a carreira mesmo dizendo "ninguém fugiu"
B1 = sub1(B1, "if(!w){G.pendingRocketGameOver=true;return null;}", "if(!w)return null;", "loseWeakest")
B1 = sub1(B1, 'addMon("Magikarp",5)', 'addMon("Magikarp",5,true)', "magikarp golpe")
B1 = sub1(B1, "a 1 nível de virar Gyarados", "prestes a virar Gyarados", "magikarp texto")

# ---------- textos = efeito real (os helpers eram amplificados, os textos não) ----------
gain_all = lambda n: n + 3
gain_one = lambda n: 2 * n + 2
loss = lambda n: max(1, round(n * 0.7))
start = B1.index("const GYM_EVENTS=[")
head, body = B1[:start], B1[start:]
chunks = re.split(r"(?=\{ic:)", body)
fixed, warn = [], []
for ch in chunks:
    gains, losses = set(), set()
    def r_all(m):  v = gain_all(int(m.group(1))); gains.add(v); return "lvlAll(%d)" % v
    def r_one(m):  v = gain_one(int(m.group(2))); gains.add(v); return "lvlOne(%s,%d)" % (m.group(1), v)
    def r_d1(m):   v = loss(int(m.group(2)));     losses.add(v); return "dropLvOne(%s,%d)" % (m.group(1), v)
    def r_da(m):   v = loss(int(m.group(1)));     losses.add(v); return "dropLvAll(%d)" % v
    ch = re.sub(r"lvlAll\((\d+)\)", r_all, ch)
    ch = re.sub(r"lvlOne\(([^,()]+),(\d+)\)", r_one, ch)
    ch = re.sub(r"dropLvOne\(([^,()]+),(\d+)\)", r_d1, ch)
    ch = re.sub(r"dropLvAll\((\d+)\)", r_da, ch)
    if len(gains) > 1 or len(losses) > 1:
        warn.append(ch[:60])
    def r_txt(m):
        sign = m.group(1)
        vals = gains if sign == "+" else losses
        if not vals: return m.group(0)
        v = next(iter(vals))
        return "%s%d %s" % (sign, v, "nível" if v == 1 else "níveis")
    ch = re.sub(r"([+-])(\d+) (níveis|nível)", r_txt, ch)
    fixed.append(ch)
B1 = head + "".join(fixed)
assert not warn, warn

B1 = sub1(B1, '"Nidoran"', '"Nidoran♂"', "nidoran ginasio 1")

# ---------- B2: evolução em cadeia (Lv alto evolui 2 estágios) ----------
B2 = re.sub(r"function tryEvolveSilent\(m\)\{.*?\}\}",
    "function tryEvolveSilent(m){let g=0;while(g++<3){const d=DEX[m.species];if(d.evo&&d.evoLv<99&&m.lv>=d.evoLv){doEvolve(m);G.stats.evolved++;}else break;}}",
    B2, count=1, flags=re.S)
assert "while(g++<3)" in B2
B2, n = re.subn(r"function doEvolve\(m\)\{.*?\}\n?", "", B2, count=1, flags=re.S)
assert n == 1, "doEvolve antigo não encontrado"
EXTRA = rd(os.path.join(BASE, "extra_logic.js"))

# ---------- sprites: frente, costas, shiny ----------
DEX_NUM = {r[1]: r[0] for r in TABLE}
dex_names = [r[1] for r in TABLE]
def uri(path):
    return "data:image/png;base64," + base64.b64encode(open(path, "rb").read()).decode("ascii") if os.path.exists(path) else None
sets = {"SPRITES": SPR, "SHINY": os.path.join(SPR, "shiny"), "BACKS": os.path.join(SPR, "back"), "SHINY_BACKS": os.path.join(SPR, "back", "shiny")}
sprite_js = ""
for var, folder in sets.items():
    d = {}
    for n in dex_names:
        u = uri(os.path.join(folder, "%04d.png" % DEX_NUM[n]))
        if u: d[n] = u
    print(var, len(d), "/", len(dex_names))
    sprite_js += "const %s = %s;\n" % (var, json.dumps(d, separators=(",", ":")))

# ---------- líderes/treinadores (FRLG) e insígnias de Kanto ----------
def folder_uris(folder):
    p = os.path.join(BASE, "sprites", folder)
    return {os.path.splitext(f)[0]: uri(os.path.join(p, f)) for f in sorted(os.listdir(p)) if f.endswith(".png")}
TR, BD = folder_uris("trainers"), folder_uris("badges")
assert len(BD) == 8, "faltam insígnias"
for k in ["brock","misty","ltsurge","erika","koga","sabrina","blaine","giovanni","lorelei","bruno","agatha","lance","blue"]:
    assert k in TR, "falta sprite do treinador " + k
print("TRAINERS", len(TR), "BADGES", len(BD))
sprite_js += "const TRAINERS = %s;\nconst BADGES = %s;\n" % (json.dumps(TR, separators=(",", ":")), json.dumps([BD[str(i)] for i in range(1, 9)], separators=(",", ":")))

# ---------- fontes + CSS + UI ----------
fonts = json.loads(rd(os.path.join(BASE, "fonts.json")))
css = rd(os.path.join(BASE, "style_v2.css")).replace("__FONT_PS2P__", fonts["Press Start 2P"]).replace("__FONT_VT323__", fonts["VT323"])
ui = rd(os.path.join(BASE, "ui_v2.js"))

polish = rd(os.path.join(BASE, "polish.js"))
region = rd(os.path.join(BASE, "region.js"))
sprite_js += "const DEX_LIST = %s;\n" % json.dumps([[DEX_NUM[n], n] for n in dex_names], ensure_ascii=False, separators=(",", ":"))
# prévia do lobby para regiões cujo pacote ainda não foi carregado (só os iniciais)
sprite_js += "const LOBBY_PREVIEW = %s;\n" % json.dumps({"johto": [uri(os.path.join(SPR, "%04d.png" % n)) for n in (152, 155, 158)]}, separators=(",", ":"))

# dados que mudam por região viram `let` (região ativa = useRegion troca os valores)
REGION_VARS = ["BADGES", "DEX_LIST", "DEX", "BRANCH", "STONE", "STARTERS", "WILD_POOL", "TYPE_CHART", "GYMS", "ELITE",
               "GYM_EVENTS", "CITY", "BADGE_NAMES", "LEADER_LINES", "WHEEL_ICON", "REC_KEY", "SAVE_KEY", "DEX_KEY"]
def letify(src, names):
    for nm in names:
        src, n = re.subn(r"\bconst %s(\s*=)" % nm, r"let %s\1" % nm, src, count=1)
    return src

SITE = "https://pokemon-carreira-kanto.vercel.app/"
DESC = ("Uma carreira de treinador Pokémon em Kanto: 8 ginásios, Elite Four, roleta de eventos, "
        "151 Pokémon e permadeath. Perdeu, acabou. Até onde você chega?")
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
           "%3Ccircle cx='16' cy='16' r='14' fill='%23fff' stroke='%23111' stroke-width='3'/%3E"
           "%3Cpath d='M2 16a14 14 0 0 1 28 0z' fill='%23e3350d' stroke='%23111' stroke-width='3'/%3E"
           "%3Ccircle cx='16' cy='16' r='4.5' fill='%23fff' stroke='%23111' stroke-width='3'/%3E%3C/svg%3E")
head = ('<meta name="description" content="%(d)s">\n'
        '<meta name="theme-color" content="#E3350D">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
        '<meta name="apple-mobile-web-app-title" content="Carreira Kanto">\n'
        '<link rel="icon" href="%(fav)s">\n<link rel="apple-touch-icon" href="%(s)sapple-touch-icon.png">\n'
        '<meta property="og:type" content="website">\n<meta property="og:url" content="%(s)s">\n'
        '<meta property="og:title" content="Pokémon Carreira de Treinador — Kanto">\n'
        '<meta property="og:description" content="%(d)s">\n'
        '<meta property="og:image" content="%(s)sog.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta property="og:locale" content="pt_BR">\n'
        '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="%(s)sog.png">\n'
        ) % {"d": DESC, "s": SITE, "fav": FAVICON}

html = ('<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n'
        '<title>Pokémon Carreira de Treinador — Kanto</title>\n' + head + '<style>\n' + css + '\n</style>\n</head>\n<body>\n'
        '<div id="app"><div id="dex"><div class="lens"><i></i></div><div class="leds"><b class="r"></b><b class="y"></b><b class="g"></b></div>'
        '<button id="mute" data-act="mute" aria-label="Desligar som">🔊</button>'
        '<div class="dex-title">CARREIRA<br>KANTO</div></div><div id="hud"></div><main id="scene" class="scene"></main><div id="dexfoot"><b class="b"></b><b class="r"></b><b class="y"></b><b class="g"></b></div></div>\n'
        '<script>\n"use strict";\n' + letify(sprite_js + A + "\n" + B1 + "\n" + B2 + "\n" + EXTRA + "\n" + ui + "\n" + polish, REGION_VARS) + "\n" + region + "\n</script>\n</body>\n</html>\n")
for nm in REGION_VARS:
    assert re.search(r"\blet %s\s*=" % nm, html), "região: %s não virou let" % nm
io.open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html), "chars")
