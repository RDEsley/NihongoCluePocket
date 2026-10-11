# Nihongo Pocket

Cola de bolso de japonês para viagem, em português. PWA estático para celular, feito para funcionar offline (uso no voo e no Japão sem rede)

As regras gerais (identidade Git, gatilho "Manda pro GitHub", doações) estão no `AGENTS.md` da pasta pai e valem aqui

## Stack

* HTML, CSS e JavaScript puros, sem build, sem dependências e sem framework
* Hospedagem estática na Vercel; repositório `https://github.com/RDEsley/NihongoPocket`
* Fontes do sistema, nenhuma requisição externa (precisa abrir sem internet)

## Estrutura

* `data.js`: todo o conteúdo (`SECTIONS`), transcrito dos PDFs "Japonês para Viagem" (Guia e Cola de Bolso)
* `app.js`: rotas por hash (`#/`, `#/s/<id>`, `#/buscar`, `#/treinar`, `#/salvos`), busca, treino, tela cheia, áudio
* `sw.js`: cache offline; `manifest.webmanifest` e `icons/`: instalação como app

## Cuidados

* Ao alterar qualquer arquivo publicado, suba a versão de `CACHE` em `sw.js`; sem isso quem já instalou continua vendo a versão antiga
* Arquivo novo que o app precise offline entra na lista `ASSETS` de `sw.js`
* Em `data.js`: `S` = você diz (vermelho), `H` = você ouve (azul, com dica ou resposta), `P` = placa ou palavra. Use kanji normais, nunca os radicais Kangxi que saem ao copiar texto do PDF (ex.: `日`, não `⽇`)
* Tabelas e dicas aceitam HTML em `data.js`; frases são escapadas
* Favoritos e progresso do treino ficam só no `localStorage` do aparelho (`np.fav`, `np.known`); não há servidor, login nem analytics
* Os PDFs de origem ficam fora do repositório (`.gitignore`)

## Testar

```text
npx serve .          abrir no navegador em largura de celular
node --check app.js  sintaxe
```

O service worker só registra em HTTPS; para testar offline use o deploy da Vercel
