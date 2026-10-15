# -*- coding: utf-8 -*-
import os, base64, json

SPRITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sprites", "firered-leafgreen")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "carreira-pokemon.html")

# species -> national dex number (Gen 1 only)
DEX_NUM = {
    "Bulbasaur":1,"Ivysaur":2,"Venusaur":3,"Charmander":4,"Charmeleon":5,"Charizard":6,
    "Squirtle":7,"Wartortle":8,"Blastoise":9,"Caterpie":10,"Metapod":11,"Butterfree":12,
    "Pidgey":16,"Pidgeotto":17,"Pidgeot":18,"Rattata":19,"Raticate":20,
    "Pikachu":25,"Raichu":26,"Machop":66,"Machoke":67,"Machamp":68,
    "Geodude":74,"Graveler":75,"Golem":76,"Abra":63,"Kadabra":64,"Alakazam":65,
    "Gastly":92,"Haunter":93,"Gengar":94,"Magikarp":129,"Gyarados":130,
    "Eevee":133,"Growlithe":58,"Arcanine":59,"Dratini":147,"Dragonair":148,"Dragonite":149,
    "Snorlax":143,"Lapras":131,
    "Sandshrew":27,"Sandslash":28,"Nidoran":29,"Nidorino":33,"Vulpix":37,"Ninetales":38,
    "Jigglypuff":39,"Oddish":43,"Gloom":44,"Zubat":41,"Golbat":42,"Meowth":52,"Persian":53,
    "Psyduck":54,"Golduck":55,"Mankey":56,"Primeape":57,"Poliwag":60,"Poliwhirl":61,
    "Bellsprout":69,"Weepinbell":70,"Ponyta":77,"Rapidash":78,"Magnemite":81,"Magneton":82,
    "Doduo":84,"Dodrio":85,"Krabby":98,"Kingler":99,"Voltorb":100,"Cubone":104,"Marowak":105,
    "Rhyhorn":111,"Rhydon":112,"Horsea":116,"Seadra":117,"Staryu":120,"Starmie":121,
    "Scyther":123,"Pinsir":127,"Tauros":128,"Diglett":50,"Dugtrio":51,
    "Weedle":13,"Kakuna":14,"Beedrill":15,"Clefairy":35,"Clefable":36,
    "Spearow":21,"Fearow":22,"Drowzee":96,"Hypno":97,"Hitmonlee":106,"Hitmonchan":107,
    "Kangaskhan":115,"Chansey":113,"Tangela":114,"Lickitung":108,"Porygon":137,
    "Electabuzz":125,"Jolteon":135,"Vaporeon":134,"Flareon":136,"Seel":86,"Dewgong":87,
    "Grimer":88,"Muk":89,"Onix":95,"Jynx":124,
    "Omanyte":138,"Omastar":139,"Kabuto":140,"Kabutops":141,"Aerodactyl":142,
    "Articuno":144,"Zapdos":145,"Moltres":146,"Mewtwo":150,
}

def datauri(num):
    path = os.path.join(SPRITE_DIR, "%04d.png" % num)
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        b = base64.b64encode(f.read()).decode("ascii")
    return "data:image/png;base64," + b

sprites = {}
missing = []
for sp, num in DEX_NUM.items():
    uri = datauri(num)
    if uri:
        sprites[sp] = uri
    else:
        missing.append((sp, num))

print("embedded", len(sprites), "sprites; missing", len(missing), missing)
with open(os.path.join(os.path.dirname(OUT), "sprites.json"), "w", encoding="utf-8") as f:
    json.dump(sprites, f)
print("wrote sprites.json")
