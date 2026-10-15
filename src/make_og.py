"""Gera og.png (prévia do link, 1200x630) e apple-touch-icon.png (180x180) na raiz do repo.
Uso: python src/make_og.py   (precisa do Google Chrome instalado)"""
import base64, io, json, os, subprocess, tempfile

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
SPR = os.path.join(BASE, "sprites", "firered-leafgreen")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
fonts = json.load(io.open(os.path.join(BASE, "fonts.json"), encoding="utf-8"))
b64 = lambda p: "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()
mon = lambda n: b64(os.path.join(SPR, "%04d.png" % n))
badges = "".join('<img src="%s">' % b64(os.path.join(BASE, "sprites", "badges", "%d.png" % i)) for i in range(1, 9))

CSS = """@font-face{font-family:P;src:url(%s)}@font-face{font-family:V;src:url(%s)}
*{margin:0;box-sizing:border-box}body{width:%dpx;height:%dpx;overflow:hidden;font-family:P}
img{image-rendering:pixelated}""" % (fonts["Press Start 2P"], fonts["VT323"], 0, 0)

OG = """<html><head><style>%s
body{width:1200px;height:630px;background:#E3350D;padding:26px}
.s{position:relative;height:100%%;border:8px solid #1a1a1a;border-radius:26px;background:linear-gradient(#7ec8ff 0,#bfe6ff 60%%,#6fcf5a 60%%,#4fae3c);overflow:hidden}
.t{position:absolute;top:44px;left:0;right:0;text-align:center}
.l{font-size:92px;color:#FFCB05;-webkit-text-stroke:6px #2A4F9C;paint-order:stroke;text-shadow:7px 7px 0 #1B2A5C;letter-spacing:4px}
.u{margin-top:26px;font-size:30px;color:#fff;text-shadow:4px 4px 0 #1B2A5C}
.k{margin-top:14px;font-family:V;font-size:38px;color:#1B2A5C}
.m{position:absolute;bottom:22px;left:0;right:0;display:flex;justify-content:center;align-items:flex-end;gap:10px}
.m img{width:172px;height:172px}.m .p{width:136px;height:136px}
.b{position:absolute;top:292px;left:0;right:0;display:flex;justify-content:center;gap:12px}
.b img{width:46px;height:46px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}
.tag{position:absolute;right:22px;bottom:18px;font-size:14px;color:#fff;background:#1B2A5C;padding:8px 12px;border-radius:8px}
</style></head><body><div class="s"><div class="t"><div class="l">POKéMON</div><div class="u">CARREIRA DE TREINADOR</div>
<div class="k">8 ginásios · Elite Four · 151 Pokémon · perdeu, acabou</div></div><div class="b">%s</div>
<div class="m"><img src="%s"><img class="p" src="%s"><img src="%s"><img src="%s"></div><div class="tag">EDIÇÃO KANTO · GEN 1</div></div></body></html>""" % (
    CSS, badges, mon(3), mon(25), mon(6), mon(9))

ICON = """<html><head><style>%s
body{width:180px;height:180px;background:radial-gradient(circle at 50%% 40%%,#ff6a3d,#E3350D 70%%);display:grid;place-items:center}
.b{position:absolute;width:150px;height:150px;border-radius:50%%;background:linear-gradient(rgba(255,255,255,.18) 0 46%%,rgba(0,0,0,.25) 46%% 54%%,rgba(255,255,255,.12) 54%%)}
img{position:relative;width:150px;height:150px}</style></head><body><div class="b"></div><img src="%s"></body></html>""" % (CSS, mon(25))

def shot(html, w, h, out):
    d = tempfile.mkdtemp()
    p = os.path.join(d, "x.html"); io.open(p, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=%d,%d" % (w, h),
                    "--virtual-time-budget=1500", "--screenshot=" + out, "file:///" + p.replace("\\", "/")],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    os.remove(p); os.rmdir(d)
    print(out, os.path.getsize(out))

shot(OG, 1200, 630, os.path.join(ROOT, "og.png"))
shot(ICON, 180, 180, os.path.join(ROOT, "apple-touch-icon.png"))
