# Pokémon Carreira de Treinador — Kanto

Jogo de carreira por escolhas (estilo *The Fenomenum* / *Copero*) ambientado na Gen 1. Você escolhe seu inicial, tem 3 decisões na estrada antes de cada líder (roleta de eventos, treinar ou procurar Pokémon), enfrenta os 8 ginásios, a Victory Road e a Elite Four. Perdeu para um líder? Fim da carreira.

## Jogar

Abra `index.html` no navegador. É um arquivo único e funciona offline: fontes e sprites estão embutidos.

## Estrutura

```
index.html            jogo pronto (é o que o Vercel publica)
og.png                prévia do link (WhatsApp, Discord, X)
apple-touch-icon.png  ícone ao "Adicionar à Tela de Início" no iPhone
src/
  assemble.py         gera ../index.html
  build_game.py       mapa espécie -> número da Pokédex
  game_template.html  lógica: Pokédex, tipos, ginásios, eventos por ginásio
  extra_logic.js      pedra evolutiva, lendários, Victory Road, roleta sem repetição, troca
  ui_v2.js            interface e telas
  polish.js           salvar/continuar, Pokédex entre carreiras, sons 8-bit
  style_v2.css        visual estilo GBA
  fonts.json          Press Start 2P + VT323 (OFL) em base64
  sprites/            sprites FireRed/LeafGreen (frente, costas, shiny), treinadores e insígnias
  make_og.py          regenera og.png e apple-touch-icon.png (precisa do Chrome)
  test_game.js        testes: node src/test_game.js
```

## Rebuild depois de editar

```
python src/assemble.py
```

## Publicar no Vercel

1. Em vercel.com: **Add New → Project** e importe este repositório.
2. Framework Preset: **Other**. Deixe Build Command e Output Directory vazios.
3. Deploy. O `index.html` da raiz vira a página principal.

## Aviso

Projeto de fã, sem fins lucrativos. Pokémon e os sprites pertencem à Nintendo, Game Freak e The Pokémon Company.
