# Pokémon Carreira de Treinador — Kanto, Johto e Hoenn

Jogo de carreira por escolhas (estilo *The Fenomenum* / *Copero*). Você escolhe a região e o inicial, tem 3 decisões na estrada antes de cada líder (roleta de eventos, treinar ou procurar Pokémon), enfrenta os 8 ginásios, a Victory Road e a Elite Four. Perdeu para um líder? Fim da carreira.

- **Kanto (Gen 1):** 151 Pokémon, FireRed/LeafGreen.
- **Johto (Gen 2):** 251 Pokémon, ovos, amizade, dia e noite, cães lendários, Gyarados Vermelho e o Red no Mt. Silver.
- **Hoenn (Gen 3):** 386 Pokémon, roteiro de Emerald, Equipes Aqua e Magma, Latias e Latios errantes, Nincada/Shedinja, Feebas/Milotic e o Steven no Meteor Falls.

## Jogar

Abra `index.html` no navegador. Kanto vem embutido; Johto e Hoenn baixam quando você escolhe a região no lobby. Depois da primeira visita pelo site, funciona offline.

## Estrutura

```
index.html            jogo pronto com Kanto (é o que o Vercel publica)
kanto_extra.js        sprites de costas e shiny de Kanto (gerado; baixa logo depois da abertura)
johto.js / hoenn.js   pacotes das regiões (gerados; o de Hoenn depende do de Johto)
sw.js, manifest.webmanifest, icon-*.png   app instalável e cache offline (gerados)
og.png                prévia do link (WhatsApp, Discord, X)
api/ranking.js        ranking global (função serverless do Vercel + Upstash Redis)
src/
  assemble.py         gera tudo acima (python src/assemble.py)
  game_template.html  lógica base: Pokédex de Kanto, tipos, ginásios, eventos por ginásio
  extra_logic.js      pedra evolutiva, lendários, Victory Road, roleta, troca, times dos líderes de Kanto
  gen2_engine.js      poder = soma do time, ovos, amizade, dia/noite, desafio pós-Liga
  ui_v2.js            interface e telas
  polish.js           salvar/continuar, Pokédex, sons 8-bit, card de compartilhar
  meta.js             conquistas, coleção de shinies e tela do ranking global
  region.js           motor de regiões e lobby (◀ KANTO ▶ JOHTO ▶ HOENN)
  style_v2.css        visual estilo GBA, modo escuro
  johto_data.js / johto_events.js   dados e roletas de Johto
  hoenn_data.js / hoenn_events.js   dados e roletas de Hoenn
  fetch_gen2_sprites.py / fetch_gen3_assets.py   baixam os sprites das regiões novas
  make_og.py          regenera og.png e os ícones (precisa do Chrome)
  test_game.js / test_johto.js / test_hoenn.js   testes: node src/test_<região>.js
  sprites/            Pokémon (frente, costas, shiny), treinadores, insígnias e itens
```

## Rebuild depois de editar

```
python src/assemble.py
node src/test_game.js && node src/test_johto.js && node src/test_hoenn.js && node src/test_meta.js
```

## Publicar no Vercel

1. Em vercel.com: **Add New → Project** e importe este repositório.
2. Framework Preset: **Other**. Deixe Build Command e Output Directory vazios.
3. Deploy. O `index.html` da raiz vira a página principal.

## Ranking global: ativar o banco (uma vez)

1. No projeto do Vercel: **Storage → Create Database → Upstash for Redis** (plano grátis) e conecte ao projeto.
2. O Vercel cria as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` sozinho. Faça um **Redeploy**.
3. Sem o banco, o jogo funciona normal e a tela do ranking avisa que ele ainda não foi ativado.

O jogo roda no navegador, então não dá pra provar que uma carreira foi jogada de verdade. O servidor recalcula a pontuação, recusa combinações impossíveis (Liga sem 8 insígnias, poucos dias), limita envios por IP e limpa os nomes.

## Ideias para o futuro

- **Novas gerações** (Sinnoh em diante): seguir o roteiro no topo de `src/region.js`.

## Aviso

Projeto de fã, sem fins lucrativos. Pokémon e os sprites pertencem à Nintendo, Game Freak e The Pokémon Company.
