"""Baixa os recursos de Hoenn (Gen 3):
- sprites 252-386 (frente, costas, shiny) no estilo GBA (PokeAPI, pasta FireRed/LeafGreen), mesmo formato do zip (0252.png...)
- treinadores no estilo Ruby/Sapphire/Emerald (Pokémon Showdown, variante -gen3) em src/sprites/trainers_hoenn
- as 8 insígnias de Hoenn (PokeAPI, badges 17-24) em src/sprites/badges_hoenn/1..8.png
Uso: python src/fetch_gen3_assets.py"""
import os, urllib.request, concurrent.futures as cf
BASE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(BASE, "sprites", "firered-leafgreen")
URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/"
SD = "https://play.pokemonshowdown.com/sprites/trainers/"
TRAINERS = {  # nome no jogo -> arquivo no Showdown
    "roxanne": "roxanne-gen3", "brawly": "brawly-gen3", "wattson": "wattson-gen3", "flannery": "flannery-gen3",
    "norman": "norman-gen3", "winona": "winona-gen3", "tateliza": "tateandliza-gen3", "juan": "juan-gen3",
    "sidney": "sidney-gen3", "phoebe": "phoebe-gen3", "glacia": "glacia-gen3", "drake": "drake-gen3",
    "wallace": "wallace-gen3", "steven": "steven-gen3", "may": "may-gen3", "birch": "birch-gen3",
    "aquagrunt": "aquagrunt", "magmagrunt": "magmagrunt", "archie": "archie-gen3", "maxie": "maxie-gen3",
    "wally": "wally-gen3", "hiker": "hiker-gen3", "acetrainer": "acetrainer-gen3", "sailor": "sailor-gen3",
    "fisherman": "fisherman-gen3", "ninjaboy": "ninjaboy-gen3", "expert": "expert-gen3", "beauty": "beauty-gen3",
    "collector": "collector-gen3", "ruinmaniac": "ruinmaniac-gen3", "swimmer": "swimmer",
}
jobs = []
for n in range(252, 387):
    for sub in ["", "shiny/", "back/", "back/shiny/"]:
        out = os.path.join(SPR, sub.replace("/", os.sep), "%04d.png" % n)
        if not os.path.exists(out): jobs.append((URL + sub + "%d.png" % n, out))
for k, v in TRAINERS.items():
    out = os.path.join(BASE, "sprites", "trainers_hoenn", k + ".png")
    if not os.path.exists(out): jobs.append((SD + v + ".png", out))
for i in range(8):
    out = os.path.join(BASE, "sprites", "badges_hoenn", "%d.png" % (i + 1))
    if not os.path.exists(out): jobs.append(("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/%d.png" % (17 + i), out))
def get(j):
    url, out = j
    os.makedirs(os.path.dirname(out), exist_ok=True)
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read(); open(out, "wb").write(data); return None
    except Exception as e:
        return "%s %s" % (url, e)
with cf.ThreadPoolExecutor(8) as ex:
    errs = [e for e in ex.map(get, jobs) if e]
print("baixados", len(jobs) - len(errs), "de", len(jobs)); print("\n".join(errs[:10]))
