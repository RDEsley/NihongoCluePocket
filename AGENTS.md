# Nihongo Pocket

Cola de bolso de japonês para viagem, em português. PWA estático para celular, feito para funcionar offline (uso no voo e no Japão sem rede). Também serve de portfólio: mantenha README, capturas e histórico apresentáveis

As regras gerais (identidade Git, gatilho "Manda pro GitHub", doações) estão no `AGENTS.md` e no `DOACOES.md` da pasta pai e valem aqui

## Stack

* HTML, CSS e JavaScript puros, sem build, sem framework e sem dependências em produção
* Hospedagem estática na Vercel, ligada ao GitHub: push em `main` publica em `https://nihongo-pocket-ivory.vercel.app`
* Repositório `https://github.com/RDEsley/NihongoCluePocket`
* Fontes do sistema, nenhuma requisição externa (precisa abrir sem internet)

## Estrutura

* `js/data.js`: todo o conteúdo (`SECTIONS`), transcrito dos PDFs "Japonês para Viagem" (Guia e Cola de Bolso), mais a seção de kana
* `js/app.js`: rotas por hash (`#/`, `#/s/<id>`, `#/buscar`, `#/treinar`, `#/salvos`, `#/apoiar`, `#/termos`, `#/privacidade`), busca, treino, tela cheia, áudio
* `js/pix.js`: BR Code do Pix e configuração da doação (txid `NIHONGOPOCKET`); `js/legal.js`: termos e privacidade
* `vendor/qrcode-generator.js`: biblioteca MIT, carregada sob demanda na tela de apoio
* `sw.js`: cache offline; `manifest.webmanifest` e `icons/`: instalação como app
* `tests/`: `node --test`; `docs/screenshots/`: imagens do README

## Comandos

```text
npm start       servidor local em http://localhost:4173
npm test        testes (Pix, conteúdo, leitor de preços, lista de cache)
npm run check   sintaxe dos scripts
```

O CI (`.github/workflows/ci.yml`) roda `check` e `test` a cada push

## Cuidados

* Ao alterar qualquer arquivo publicado, suba a versão de `CACHE` em `sw.js`; sem isso quem já instalou continua vendo a versão antiga
* Arquivo novo carregado pela página entra na lista `ASSETS` de `sw.js` (há teste que cobra isso)
* Em `data.js`: `S` = você diz (vermelho), `H` = você ouve (azul, com dica ou resposta), `P` = placa ou palavra. Use kanji normais, nunca os radicais Kangxi que saem ao copiar texto do PDF (ex.: `日`, não `⽇`)
* Tabelas e dicas aceitam HTML em `data.js`; frases são escapadas
* Favoritos e progresso do treino ficam só no `localStorage` do aparelho (`np.fav`, `np.known`); não há servidor, login nem analytics. Se isso mudar, revise `js/legal.js` e a data `legalUpdated`
* Doações: não troque chave, nome ou cidade em `js/pix.js`. Depois de mexer no Pix ou no QR, além de `npm test`, decodifique o QR Code renderizado na tela e compare com o código exibido (teste 3 do `DOACOES.md`)
* O service worker só registra em HTTPS; o modo offline é testado no deploy
* Os PDFs de origem ficam fora do repositório (`.gitignore`); `.vercelignore` tira testes e documentação da hospedagem
* Capturas do README: Chrome headless com `--window-size=500,1000 --force-device-scale-factor=2`, salvando fora de pastas com espaço no caminho e copiando depois
