# -*- coding: utf-8 -*-
import io, re, os, sys, json
BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)
from dex151 import TABLE, BRANCH
h = io.open(os.path.join(os.path.dirname(BASE), "index.html"), encoding="utf-8").read()
js = h.split("<script>", 1)[1].rsplit("</script>", 1)[0]
io.open(os.path.join(BASE, "_check.js"), "w", encoding="utf-8").write(js)
print("stoneEvent:", js.count("function stoneEvent"), "| doEvolve defs:", js.count("function doEvolve("),
      "| releaseMon:", js.count("function releaseMon"), "| Nidoran♂ no ginásio 1:", '"Nidoran♂"' in js)

pool = json.loads(re.search(r"const WILD_POOL=(\[.*?\]);", js, re.S).group(1))
events = set(re.findall(r'addMon\("([^"]+)"', js))
for arr in re.findall(r'\[((?:"[^"]+",?\s*)+)\]\[Math\.floor', js):
    events |= set(re.findall(r'"([^"]+)"', arr))
for a, b in re.findall(r'Math\.random\(\)<[\d.]+\?"([^"]+)":"([^"]+)"', js):
    events |= {a, b}
events |= {"Articuno", "Gyarados", "Starmie", "Zapdos", "Electabuzz", "Magneton", "Moltres", "Mewtwo", "Mew", "Omanyte", "Kabuto"}
reach = set(pool) | events | {"Bulbasaur", "Charmander", "Squirtle"}
evo = {r[1]: r[4] for r in TABLE}
changed = True
while changed:
    changed = False
    for s in list(reach):
        for n in ([evo.get(s)] if evo.get(s) else []) + BRANCH.get(s, []):
            if n not in reach: reach.add(n); changed = True
names = [r[1] for r in TABLE]
print("obteníveis:", len([n for n in names if n in reach]), "/ 151 | faltam:", [n for n in names if n not in reach])
print("nomes desconhecidos em eventos:", sorted(x for x in events if x not in names))
