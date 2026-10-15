# -*- coding: utf-8 -*-
import io, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dex151 import TABLE
t = io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "game_template.html"), encoding="utf-8").read()
blk = t[t.index("const DEX = {"):t.index("const STARTERS")]
cur = re.findall(r'^\s*([A-Za-z]+):\{t:', blk, re.M)
full = [r[1] for r in TABLE]
print("no jogo hoje:", len(cur))
print("faltando:", len([n for n in full if n not in cur]), [n for n in full if n not in cur])
print("nomes fora da tabela:", [n for n in cur if n not in full])
