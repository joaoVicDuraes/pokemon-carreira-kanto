# -*- coding: utf-8 -*-
"""Pokédex completa da Gen 1 (151).
(numero, nome, tipo usado no jogo, poder base, evolui_para, nivel)
nivel 99 = evolui por Pedra Evolutiva / troca. Espécies que já existiam mantêm
o poder base calibrado do template (o assembler sobrescreve com os valores antigos)."""

TABLE = [
 (1,"Bulbasaur","grass",9,"Ivysaur",16),(2,"Ivysaur","grass",14,"Venusaur",32),(3,"Venusaur","grass",21,None,0),
 (4,"Charmander","fire",9,"Charmeleon",16),(5,"Charmeleon","fire",14,"Charizard",36),(6,"Charizard","fire",23,None,0),
 (7,"Squirtle","water",9,"Wartortle",16),(8,"Wartortle","water",14,"Blastoise",36),(9,"Blastoise","water",22,None,0),
 (10,"Caterpie","bug",4,"Metapod",7),(11,"Metapod","bug",6,"Butterfree",10),(12,"Butterfree","bug",14,None,0),
 (13,"Weedle","bug",4,"Kakuna",7),(14,"Kakuna","bug",6,"Beedrill",10),(15,"Beedrill","bug",14,None,0),
 (16,"Pidgey","flying",6,"Pidgeotto",18),(17,"Pidgeotto","flying",11,"Pidgeot",36),(18,"Pidgeot","flying",19,None,0),
 (19,"Rattata","normal",5,"Raticate",20),(20,"Raticate","normal",12,None,0),
 (21,"Spearow","flying",6,"Fearow",20),(22,"Fearow","flying",15,None,0),
 (23,"Ekans","poison",7,"Arbok",22),(24,"Arbok","poison",17,None,0),
 (25,"Pikachu","electric",10,"Raichu",99),(26,"Raichu","electric",18,None,0),
 (27,"Sandshrew","ground",7,"Sandslash",22),(28,"Sandslash","ground",16,None,0),
 (29,"Nidoran♀","poison",6,"Nidorina",16),(30,"Nidorina","poison",12,"Nidoqueen",99),(31,"Nidoqueen","poison",22,None,0),
 (32,"Nidoran♂","poison",7,"Nidorino",16),(33,"Nidorino","poison",14,"Nidoking",99),(34,"Nidoking","poison",22,None,0),
 (35,"Clefairy","normal",9,"Clefable",99),(36,"Clefable","normal",19,None,0),
 (37,"Vulpix","fire",9,"Ninetales",99),(38,"Ninetales","fire",20,None,0),
 (39,"Jigglypuff","normal",7,"Wigglytuff",99),(40,"Wigglytuff","normal",17,None,0),
 (41,"Zubat","poison",6,"Golbat",22),(42,"Golbat","poison",15,None,0),
 (43,"Oddish","grass",7,"Gloom",21),(44,"Gloom","grass",14,"Vileplume",99),(45,"Vileplume","grass",21,None,0),
 (46,"Paras","bug",7,"Parasect",24),(47,"Parasect","bug",15,None,0),
 (48,"Venonat","bug",8,"Venomoth",31),(49,"Venomoth","bug",18,None,0),
 (50,"Diglett","ground",6,"Dugtrio",26),(51,"Dugtrio","ground",15,None,0),
 (52,"Meowth","normal",7,"Persian",28),(53,"Persian","normal",15,None,0),
 (54,"Psyduck","water",8,"Golduck",33),(55,"Golduck","water",18,None,0),
 (56,"Mankey","fighting",8,"Primeape",28),(57,"Primeape","fighting",16,None,0),
 (58,"Growlithe","fire",11,"Arcanine",99),(59,"Arcanine","fire",23,None,0),
 (60,"Poliwag","water",6,"Poliwhirl",25),(61,"Poliwhirl","water",14,"Poliwrath",99),(62,"Poliwrath","water",22,None,0),
 (63,"Abra","psychic",7,"Kadabra",16),(64,"Kadabra","psychic",14,"Alakazam",99),(65,"Alakazam","psychic",23,None,0),
 (66,"Machop","fighting",9,"Machoke",28),(67,"Machoke","fighting",15,"Machamp",99),(68,"Machamp","fighting",22,None,0),
 (69,"Bellsprout","grass",7,"Weepinbell",21),(70,"Weepinbell","grass",14,"Victreebel",99),(71,"Victreebel","grass",21,None,0),
 (72,"Tentacool","water",10,"Tentacruel",30),(73,"Tentacruel","water",22,None,0),
 (74,"Geodude","rock",8,"Graveler",25),(75,"Graveler","rock",14,"Golem",99),(76,"Golem","rock",21,None,0),
 (77,"Ponyta","fire",11,"Rapidash",40),(78,"Rapidash","fire",20,None,0),
 (79,"Slowpoke","water",9,"Slowbro",37),(80,"Slowbro","water",21,None,0),
 (81,"Magnemite","electric",9,"Magneton",30),(82,"Magneton","electric",17,None,0),
 (83,"Farfetch'd","flying",11,None,0),
 (84,"Doduo","flying",8,"Dodrio",31),(85,"Dodrio","flying",16,None,0),
 (86,"Seel","water",8,"Dewgong",34),(87,"Dewgong","ice",18,None,0),
 (88,"Grimer","poison",9,"Muk",38),(89,"Muk","poison",19,None,0),
 (90,"Shellder","water",8,"Cloyster",99),(91,"Cloyster","ice",23,None,0),
 (92,"Gastly","ghost",7,"Haunter",25),(93,"Haunter","ghost",14,"Gengar",99),(94,"Gengar","ghost",22,None,0),
 (95,"Onix","rock",14,None,0),
 (96,"Drowzee","psychic",8,"Hypno",26),(97,"Hypno","psychic",18,None,0),
 (98,"Krabby","water",8,"Kingler",28),(99,"Kingler","water",18,None,0),
 (100,"Voltorb","electric",8,"Electrode",30),(101,"Electrode","electric",20,None,0),
 (102,"Exeggcute","grass",10,"Exeggutor",99),(103,"Exeggutor","grass",23,None,0),
 (104,"Cubone","ground",8,"Marowak",28),(105,"Marowak","ground",16,None,0),
 (106,"Hitmonlee","fighting",19,None,0),(107,"Hitmonchan","fighting",19,None,0),
 (108,"Lickitung","normal",16,None,0),
 (109,"Koffing","poison",11,"Weezing",35),(110,"Weezing","poison",21,None,0),
 (111,"Rhyhorn","ground",10,"Rhydon",42),(112,"Rhydon","ground",21,None,0),
 (113,"Chansey","normal",16,None,0),(114,"Tangela","grass",16,None,0),(115,"Kangaskhan","normal",21,None,0),
 (116,"Horsea","water",7,"Seadra",32),(117,"Seadra","water",15,None,0),
 (118,"Goldeen","water",9,"Seaking",33),(119,"Seaking","water",18,None,0),
 (120,"Staryu","water",8,"Starmie",99),(121,"Starmie","psychic",20,None,0),
 (122,"Mr. Mime","psychic",19,None,0),(123,"Scyther","bug",18,None,0),(124,"Jynx","ice",19,None,0),
 (125,"Electabuzz","electric",21,None,0),(126,"Magmar","fire",21,None,0),(127,"Pinsir","bug",18,None,0),
 (128,"Tauros","normal",18,None,0),
 (129,"Magikarp","water",1,"Gyarados",20),(130,"Gyarados","water",24,None,0),
 (131,"Lapras","water",21,None,0),(132,"Ditto","normal",7,None,0),
 (133,"Eevee","normal",9,"Vaporeon",99),(134,"Vaporeon","water",22,None,0),(135,"Jolteon","electric",22,None,0),(136,"Flareon","fire",22,None,0),
 (137,"Porygon","normal",18,None,0),
 (138,"Omanyte","rock",10,"Omastar",40),(139,"Omastar","rock",22,None,0),
 (140,"Kabuto","rock",10,"Kabutops",40),(141,"Kabutops","rock",22,None,0),
 (142,"Aerodactyl","flying",24,None,0),(143,"Snorlax","normal",20,None,0),
 (144,"Articuno","ice",30,None,0),(145,"Zapdos","electric",30,None,0),(146,"Moltres","fire",30,None,0),
 (147,"Dratini","dragon",9,"Dragonair",30),(148,"Dragonair","dragon",15,"Dragonite",55),(149,"Dragonite","dragon",27,None,0),
 (150,"Mewtwo","psychic",38,None,0),(151,"Mew","psychic",30,None,0),
]

# só aparecem por eventos, nunca na grama
SPECIAL = {"Articuno","Zapdos","Moltres","Mewtwo","Mew","Omanyte","Kabuto","Aerodactyl",
           "Lapras","Snorlax","Hitmonlee","Hitmonchan","Porygon"}

# Eevee escolhe a evolução conforme o próximo oponente
BRANCH = {"Eevee": ["Vaporeon","Jolteon","Flareon"]}

STONE = {
 "Pikachu":"Pedra do Trovão","Nidorina":"Pedra da Lua","Nidorino":"Pedra da Lua","Clefairy":"Pedra da Lua",
 "Jigglypuff":"Pedra da Lua","Vulpix":"Pedra do Fogo","Growlithe":"Pedra do Fogo","Gloom":"Pedra da Folha",
 "Weepinbell":"Pedra da Folha","Exeggcute":"Pedra da Folha","Poliwhirl":"Pedra da Água","Shellder":"Pedra da Água",
 "Staryu":"Pedra da Água","Eevee":"Pedra (Água, Trovão ou Fogo)",
 "Kadabra":"troca","Machoke":"troca","Graveler":"troca","Haunter":"troca",
}

assert len(TABLE) == 151 and [r[0] for r in TABLE] == list(range(1, 152))
