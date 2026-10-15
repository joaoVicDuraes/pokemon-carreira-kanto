"""Baixa os sprites 152-251 (frente, costas, shiny) no estilo GBA (PokeAPI, pasta FireRed/LeafGreen)
para src/sprites/firered-leafgreen, no mesmo formato do zip original (0152.png...)."""
import os, urllib.request, concurrent.futures as cf
BASE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(BASE, "sprites", "firered-leafgreen")
URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/"
jobs = []
for n in range(152, 252):
    for sub in ["", "shiny/", "back/", "back/shiny/"]:
        out = os.path.join(SPR, sub.replace("/", os.sep), "%04d.png" % n)
        if not os.path.exists(out): jobs.append((URL + sub + "%d.png" % n, out))
def get(j):
    url, out = j
    os.makedirs(os.path.dirname(out), exist_ok=True)
    try:
        data = urllib.request.urlopen(url, timeout=30).read(); open(out, "wb").write(data); return None
    except Exception as e:
        return "%s %s" % (url, e)
with cf.ThreadPoolExecutor(8) as ex:
    errs = [e for e in ex.map(get, jobs) if e]
print("baixados", len(jobs) - len(errs), "de", len(jobs)); print("\n".join(errs[:10]))
