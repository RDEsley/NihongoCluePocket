(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  const showEl = $("#show");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-'’.?!,。、？！]/g, "").replace(/\s+/g, " ").trim();

  const ICON = {
    star: '<svg class="s" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 17l-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  };

  // ---------- Registro de frases ----------
  const ALL = [];
  const reg = (it, sec, g) => {
    it.i = ALL.length;
    it.sec = sec.id;
    it.secTitle = sec.title;
    it.word = g.type === "vocab";
    it.key = it.jp + "|" + it.ro;
    it.q = norm([it.jp, it.ro, it.pt, it.note || "", it.tip || ""].join(" "));
    ALL.push(it);
    return it;
  };
  SECTIONS.forEach((sec) => sec.groups.forEach((g) => (g.items || []).forEach((it) => {
    if (!it || !it.k) return;
    reg(it, sec, g);
    if (it.reply) it.reply = reg({ k: "say", jp: it.reply[0], ro: it.reply[1], pt: it.reply[2], note: "", ess: false, isReply: true }, sec, g);
  })));

  // ---------- Armazenamento local ----------
  const store = {
    get(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } },
    set(k, set) { try { localStorage.setItem(k, JSON.stringify([...set])); } catch { /* sem armazenamento: segue sem salvar */ } },
  };
  const favs = store.get("np.fav");
  const known = store.get("np.known");
  const toggleFav = (it) => {
    favs.has(it.key) ? favs.delete(it.key) : favs.add(it.key);
    store.set("np.fav", favs);
    document.querySelectorAll(`[data-fav="${it.i}"]`).forEach((b) => {
      b.classList.toggle("on", favs.has(it.key));
      b.setAttribute("aria-pressed", favs.has(it.key));
    });
  };

  // ---------- Áudio ----------
  const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const speak = (jp) => {
    if (!canSpeak) return;
    const text = jp.replace(/^\d+\s·\s/, "").replace(/○+/g, "、").replace(/[／·]/g, "。").replace(/…/g, "");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  // ---------- Blocos de HTML ----------
  const starBtn = (it) => `<button class="star${favs.has(it.key) ? " on" : ""}" data-fav="${it.i}" aria-label="Salvar frase" aria-pressed="${favs.has(it.key)}">${ICON.star}</button>`;
  const lines = (it) => `<p class="jp" lang="ja">${esc(it.jp)}</p><p class="ro">${esc(it.ro)}</p>${it.pt ? `<p class="pt">${esc(it.pt)}</p>` : ""}`;
  const whereLine = (it, where) => (where ? `<p class="where">${esc(it.secTitle)}</p>` : "");

  const sayHTML = (it, where) => `<div class="ph say${it.ess ? " has-tag" : ""}" data-i="${it.i}" role="button" tabindex="0">${whereLine(it, where)}${it.ess ? '<span class="tag">ESSENCIAL</span>' : ""}${lines(it)}${it.note ? `<p class="note">${esc(it.note)}</p>` : ""}${starBtn(it)}</div>`;
  const hearHTML = (it, where) => `<div class="pair"><div class="ph hear" data-i="${it.i}" role="button" tabindex="0">${whereLine(it, where)}${lines(it)}</div>${it.reply ? sayHTML(it.reply) : it.tip ? `<p class="tip">${esc(it.tip)}</p>` : ""}</div>`;
  const signHTML = (it, where) => `<div class="ph sign${it.word ? " word" : ""}" data-i="${it.i}" role="button" tabindex="0">${whereLine(it, where)}${lines(it)}</div>`;
  const itemHTML = (it, where) => (it.k === "say" ? sayHTML(it, where) : it.k === "hear" ? hearHTML(it, where) : signHTML(it, where));

  const LABEL = { say: "Você diz", hear: "Eles dizem", signs: "Placas", vocab: "Palavras" };
  const groupHTML = (g, n) => {
    const head = g.title ? `<h2>${LABEL[g.type] ? LABEL[g.type] + " · " : ""}${esc(g.title)}</h2>` : "";
    let body = "";
    if (g.type === "say" || g.type === "hear") body = `<div class="stack">${g.items.map((it) => itemHTML(it)).join("")}</div>`;
    else if (g.type === "signs" || g.type === "vocab") body = `<div class="${g.cols ? "grid" + g.cols : "grid2"}">${g.items.map((it) => (it ? signHTML(it) : "<span></span>")).join("")}</div>`;
    else if (g.type === "tip") return `<aside class="note-box"><h3>${esc(g.title)}</h3><p>${g.text}</p></aside>`;
    else if (g.type === "steps") return `<ol class="steps">${g.items.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
    else if (g.type === "table") body = `<div class="tablewrap"><table><thead><tr>${g.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${g.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    else if (g.type === "dialog") body = `<div class="dialog"><button class="listen" data-roleplay aria-pressed="false">Praticar: esconder minhas falas</button>${g.lines.map(([who, jp, ro, pt]) => `<div class="bubble ${who}" data-say="${esc(jp)}"><small>${who === "e" ? "ELES" : "VOCÊ"}</small><p class="jp" lang="ja">${esc(jp)}</p><p class="ro">${esc(ro)}</p><p class="pt">${esc(pt)}</p></div>`).join("")}</div>`;
    else if (g.type === "tool") body = `<div class="calc"><label for="yen">Digite o valor da etiqueta</label><div class="field"><input id="yen" inputmode="numeric" autocomplete="off" placeholder="1280" maxlength="9"><span class="yen">円</span></div><output id="yen-out" for="yen"></output></div>`;
    return `<section class="group ${g.type}" id="g${n}">${head}${body}</section>`;
  };

  // ---------- Números ----------
  const D = ["", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyū"];
  const below10k = (n, inMan) => {
    const out = [];
    const th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10;
    if (th) out.push(th === 1 ? (inMan ? "issen" : "sen") : th === 3 ? "sanzen" : th === 8 ? "hassen" : D[th] + "-sen");
    if (h) out.push(h === 1 ? "hyaku" : h === 3 ? "sanbyaku" : h === 6 ? "roppyaku" : h === 8 ? "happyaku" : D[h] + "-hyaku");
    if (t) out.push(t === 1 ? "jū" : D[t] + "-jū");
    if (o) out.push(D[o]);
    return out.join(" ");
  };
  const readNumber = (n) => {
    if (n === 0) return "zero";
    const man = Math.floor(n / 10000), rest = n % 10000;
    return [man ? below10k(man, true).replace(/ /g, "-") + "-man" : "", below10k(rest, false)].filter(Boolean).join(" ");
  };
  window.readNumber = readNumber;

  // ---------- Telas ----------
  const view = { query: "" };
  const setTab = (tab) => document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));

  const tilesHTML = () => {
    const main = SECTIONS.filter((s) => !s.learn);
    const learn = SECTIONS.filter((s) => s.learn);
    const first = main[0];
    const ess = new Set(ALL.filter((it) => it.k === "say" && it.ess).map((it) => it.key));
    const done = [...ess].filter((key) => known.has(key)).length;
    return `
      <a class="tile wide" href="#/s/${first.id}"><span><b>${esc(first.title)}</b><small>As 16 frases que resolvem quase tudo</small></span><span class="jp" lang="ja">${first.jp}</span></a>
      <a class="progress" href="#/treinar"><span>Frases essenciais que você já sabe</span><b>${done} de ${ess.size}</b><div class="bar"><i style="width:${(done / ess.size) * 100}%"></i></div></a>
      <p class="eyebrow">Onde você está?</p>
      <div class="tiles">${main.slice(1).map((s) => `<a class="tile" href="#/s/${s.id}"><span class="jp" lang="ja">${s.jp}</span><b>${esc(s.title)}</b></a>`).join("")}</div>
      <p class="eyebrow">Para estudar</p>
      <div class="tiles">${learn.map((s) => `<a class="tile plain" href="#/s/${s.id}"><span class="jp" lang="ja">${s.jp}</span><b>${esc(s.title)}</b></a>`).join("")}</div>
      <p class="legend"><span><i style="background:var(--red)"></i>Vermelho: você diz</span><span><i style="background:var(--blue)"></i>Azul: você ouve</span><span>Toque numa frase para mostrá-la em tela cheia</span></p>
      <div class="install" id="install" hidden><span>Use como app, sem internet.</span><button class="btn small" id="install-btn">Instalar</button></div>
      <p class="foot">Nihongo Clue Pocket · funciona offline depois da primeira visita<br><a href="#/apoiar">Apoiar</a> · <a href="#/termos">Termos</a> · <a href="#/privacidade">Privacidade</a></p>`;
  };

  const search = (query) => {
    const words = norm(query).split(" ").filter(Boolean);
    if (!words.length) return [];
    const seen = new Set();
    const rank = (it) => (it.ess ? 0 : it.k === "say" ? 1 : it.k === "hear" ? 2 : 3);
    // as letras soltas das tabelas de kana ficam fora: casariam com quase toda busca
    return ALL.filter((it) => (it.pt || it.sec !== "kana") && words.every((w) => it.q.includes(w)))
      .sort((a, b) => rank(a) - rank(b))
      .filter((it) => !seen.has(it.key) && seen.add(it.key));
  };

  const renderResults = (searchMode) => {
    const box = $("#results");
    const q = view.query.trim();
    if (!q) {
      box.innerHTML = searchMode
        ? `<p class="empty"><b>Busque em português, rōmaji ou japonês</b>Exemplos: banheiro · conta · sumimasen · 出口</p>`
        : tilesHTML();
      if (!searchMode) syncInstall();
      return;
    }
    const found = search(q);
    box.innerHTML = found.length
      ? `<p class="count">${found.length} resultado${found.length > 1 ? "s" : ""}</p><div class="stack">${found.slice(0, 80).map((it) => itemHTML(it, true)).join("")}</div>`
      : `<p class="empty"><b>Nada encontrado para “${esc(q)}”</b>Tente uma palavra só, em português ou em rōmaji.</p>`;
  };

  const renderHome = (searchMode) => {
    setTab(searchMode ? "buscar" : "home");
    app.innerHTML = `
      ${searchMode ? "" : `<header class="brand"><h1>Nihongo Clue Pocket</h1><span class="jp" lang="ja">旅の<b>日本語</b></span></header>`}
      <div class="searchbar"><div class="searchbox">${ICON.search}
        <input id="q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Buscar frase, palavra ou placa" aria-label="Buscar" value="${esc(view.query)}">
        <button class="clear" id="q-clear" aria-label="Limpar busca"${view.query ? "" : " hidden"}>×</button>
      </div></div>
      <div id="results"></div>`;
    renderResults(searchMode);
    const input = $("#q");
    input.addEventListener("input", () => {
      view.query = input.value;
      $("#q-clear").hidden = !input.value;
      renderResults(searchMode);
    });
    $("#q-clear").addEventListener("click", () => {
      view.query = input.value = "";
      $("#q-clear").hidden = true;
      renderResults(searchMode);
      input.focus();
    });
    if (searchMode) input.focus();
  };

  const pageHead = (title, jp, chips) => `
    <header class="pagehead"><div class="row"><a class="back" href="#/" aria-label="Voltar">${ICON.back}</a><h1>${esc(title)}</h1>${jp ? `<span class="jp" lang="ja">${jp}</span>` : ""}</div>${chips || ""}</header>`;

  const renderSection = (id) => {
    const sec = SECTIONS.find((s) => s.id === id);
    if (!sec) return renderHome(false);
    setTab("home");
    const chipGroups = sec.groups.map((g, n) => ({ g, n })).filter(({ g }) => g.title && !["tip", "steps"].includes(g.type));
    const chips = chipGroups.length > 2 ? `<div class="chips">${chipGroups.map(({ g, n }) => `<button class="chip ${g.type}" data-go="g${n}">${esc(g.title.split(":")[0].split(" (")[0])}</button>`).join("")}</div>` : "";
    app.innerHTML = pageHead(sec.title, sec.jp, chips) + `<p class="intro">${esc(sec.intro)}</p>` + sec.groups.map(groupHTML).join("");
    const yen = $("#yen");
    if (yen) yen.addEventListener("input", () => {
      const digits = yen.value.replace(/\D/g, "").slice(0, 8);
      yen.value = digits;
      $("#yen-out").textContent = digits ? readNumber(Number(digits)) + " en" : "";
    });
  };

  const renderFavs = () => {
    setTab("salvos");
    const seen = new Set();
    const list = ALL.filter((it) => favs.has(it.key) && !seen.has(it.key) && seen.add(it.key));
    app.innerHTML = pageHead("Salvos", "") + (list.length
      ? `<p class="count" style="margin-top:14px">${list.length} frase${list.length > 1 ? "s" : ""} · dá para treinar só estas em Treinar</p><div class="stack">${list.map((it) => itemHTML(it, true)).join("")}</div>`
      : `<p class="empty"><b>Nenhuma frase salva ainda</b>Toque na estrela de uma frase para deixá-la aqui, à mão.</p>`);
  };

  // ---------- Treinar ----------
  // `any` = o grupo não depende da situação escolhida; `make` = cartões sorteados na hora
  const TYPES = [
    { id: "ess", name: "Essenciais", desc: "O que você mais vai falar", test: (it) => it.k === "say" && it.ess },
    { id: "say", name: "Falar", desc: "Todas as suas falas", test: (it) => it.k === "say" },
    { id: "hear", name: "Entender", desc: "O que você vai ouvir", test: (it) => it.k === "hear" },
    { id: "sign", name: "Placas e palavras", desc: "Kanji e vocabulário", test: (it) => it.k === "sign" && it.pt },
    { id: "price", name: "Preços", desc: "Ler etiquetas em voz alta", any: true, make: true },
    { id: "kana", name: "Kana", desc: "Hiragana e katakana", any: true, test: (it) => it.sec === "kana" && !it.pt },
  ];
  const train = { type: "ess", scope: "all", skip: true, session: null };
  const ROUND = 15;
  const typeNow = () => TYPES.find((t) => t.id === train.type);

  const deckFor = () => {
    const type = typeNow();
    if (type.make) return [];
    const seen = new Set();
    return ALL.filter((it) => type.test(it)
      && (type.any || train.scope === "all" || (train.scope === "fav" ? favs.has(it.key) : it.sec === train.scope))
      && !seen.has(it.key) && seen.add(it.key));
  };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Preços com cara de etiqueta: de moeda de konbini a compra grande
  const randomPrices = (count) => {
    const pick = (min, max, step) => min + step * Math.floor(Math.random() * ((max - min) / step + 1));
    const makers = [() => pick(100, 990, 10), () => pick(1000, 9900, 100), () => pick(1000, 9990, 10), () => pick(10000, 30000, 500)];
    const seen = new Set();
    while (seen.size < count) seen.add(makers[seen.size % makers.length]());
    return shuffle([...seen]).map((n) => ({ k: "price", key: "price|" + n, jp: n.toLocaleString("pt-BR") + "円", ro: readNumber(n) + " en", say: n + "円", secTitle: "Números e dinheiro" }));
  };

  const renderTrainSetup = () => {
    const type = typeNow();
    const deck = deckFor();
    const done = deck.filter((it) => known.has(it.key)).length;
    const pool = type.make ? ROUND : train.skip ? deck.length - done : deck.length;
    app.innerHTML = pageHead("Treinar", "") + `
      <div class="form">
        <div><p class="lbl">O que treinar</p><div class="seg">${TYPES.map((t) => `<button data-type="${t.id}" class="${t.id === train.type ? "on" : ""}" aria-pressed="${t.id === train.type}"><b>${t.name}</b><small>${t.desc}</small></button>`).join("")}</div></div>
        <div${type.any ? " hidden" : ""}><p class="lbl"><label for="scope">De onde</label></p><select id="scope">
          <option value="all">Todas as situações</option><option value="fav">Só as salvas</option>
          ${SECTIONS.filter((s) => !s.learn).map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join("")}</select></div>
        <label class="check"${type.make ? " hidden" : ""}><input type="checkbox" id="skip"${train.skip ? " checked" : ""}> Pular as que eu já sei</label>
        <p class="count" style="margin:0">${type.make ? "Preços sorteados a cada rodada. Leia em voz alta antes de conferir." : `${deck.length} cartões neste grupo · ${done} já sabidos`}</p>
        <button class="btn" id="start"${pool ? "" : " disabled"}>${pool ? `Começar rodada de ${Math.min(ROUND, pool)}` : deck.length ? "Você já sabe todas" : "Nenhum cartão aqui"}</button>
        ${known.size ? '<button class="linkbtn" id="reset">Zerar o que marquei como sabido</button>' : ""}
      </div>`;
    $("#scope").value = train.scope;
    $("#scope").addEventListener("change", (e) => { train.scope = e.target.value; renderTrainSetup(); });
    $("#skip").addEventListener("change", (e) => { train.skip = e.target.checked; renderTrainSetup(); });
    app.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => { train.type = b.dataset.type; renderTrainSetup(); }));
    $("#start").addEventListener("click", () => {
      const cards = type.make ? randomPrices(ROUND) : shuffle(deckFor().filter((it) => !train.skip || !known.has(it.key))).slice(0, ROUND);
      train.session = { queue: cards, total: cards.length, right: 0, open: false, missed: new Set() };
      renderTrain();
    });
    const reset = $("#reset");
    if (reset) reset.addEventListener("click", () => { known.clear(); store.set("np.known", known); renderTrainSetup(); });
  };

  const listenBtn = (it) => (canSpeak ? `<button class="listen" data-say="${esc(it.say || it.jp)}">${ICON.sound} Ouvir</button>` : "");
  const cardHTML = (it, open) => {
    if (it.k === "say") return `<p class="q">Como se diz?</p><p class="big">${esc(it.pt)}</p>${it.note ? `<p class="note">${esc(it.note)}</p>` : ""}${open ? `<hr><div class="ans"><p class="jp big" lang="ja">${esc(it.jp)}</p><p class="ro">${esc(it.ro)}</p>${listenBtn(it)}</div>` : ""}`;
    if (it.k === "hear") return `<p class="q">Você ouve isto. O que é?</p><p class="jp big" lang="ja">${esc(it.jp)}</p><p class="ro blue">${esc(it.ro)}</p>${listenBtn(it)}${open ? `<hr><div class="ans"><p class="big">${esc(it.pt)}</p>${it.reply ? `<p class="q" style="margin-top:8px">Você responde</p><p class="jp" lang="ja" style="font-size:20px">${esc(it.reply.jp)}</p><p class="ro">${esc(it.reply.ro)}</p><p class="note">${esc(it.reply.pt)}</p>` : `<p class="note">${esc(it.tip)}</p>`}</div>` : ""}`;
    if (it.k === "price") return `<p class="q">Como se fala este preço?</p><p class="jp big" lang="ja" style="font-size:44px">${esc(it.jp)}</p>${open ? `<hr><div class="ans"><p class="ro">${esc(it.ro)}</p>${listenBtn(it)}</div>` : ""}`;
    return `<p class="q">${it.pt ? "O que significa?" : "Como se lê?"}</p><p class="jp big" lang="ja" style="font-size:${it.pt ? 44 : 72}px">${esc(it.jp)}</p>${open ? `<hr><div class="ans"><p class="ro" style="color:var(--gold)">${esc(it.ro)}</p>${it.pt ? `<p class="big">${esc(it.pt)}</p>` : ""}${listenBtn(it)}</div>` : ""}`;
  };

  const renderTrain = () => {
    setTab("treinar");
    const s = train.session;
    if (!s) return renderTrainSetup();
    if (!s.queue.length) {
      app.innerHTML = pageHead("Treinar", "") + `<div class="fc"><p class="q">Rodada concluída</p><p class="big">${s.right} de ${s.total} você já sabia de primeira</p><p class="note">As que errou voltaram até acertar. Repita em voz alta.</p></div><div class="actions"><button class="btn" id="again">Outra rodada</button></div>`;
      $("#again").addEventListener("click", () => { train.session = null; renderTrainSetup(); });
      return;
    }
    const it = s.queue[0];
    const doneCount = s.total - s.queue.length;
    app.innerHTML = pageHead("Treinar", "") + `
      <div class="bar"><i style="width:${(doneCount / s.total) * 100}%"></i></div>
      <p class="count" style="margin-top:8px">${doneCount} de ${s.total} · ${esc(it.secTitle)}</p>
      <div class="fc">${cardHTML(it, s.open)}</div>
      <div class="actions">${s.open
        ? '<button class="btn ghost" id="miss">Ainda não</button><button class="btn" id="hit">Sabia</button>'
        : '<button class="btn" id="reveal">Mostrar resposta</button>'}</div>
      <button class="linkbtn" id="quit" style="display:block;margin:10px auto 0">Encerrar rodada</button>`;
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener("click", fn); };
    const remember = it.k !== "price";
    on("#reveal", () => { s.open = true; renderTrain(); });
    on("#hit", () => {
      s.queue.shift();
      if (!s.missed.has(it.key)) s.right++;
      if (remember) { known.add(it.key); store.set("np.known", known); }
      s.open = false; renderTrain();
    });
    on("#miss", () => {
      s.missed.add(it.key);
      s.queue.push(s.queue.shift());
      if (remember) { known.delete(it.key); store.set("np.known", known); }
      s.open = false; renderTrain();
    });
    on("#quit", () => { train.session = null; renderTrainSetup(); });
  };

  // ---------- Apoiar, termos e privacidade ----------
  const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  let qrLoading = null;
  const loadQr = () => qrLoading || (qrLoading = new Promise((resolve) => {
    if (window.qrcode) return resolve(true);
    const script = document.createElement("script");
    script.src = "vendor/qrcode-generator.js";
    script.onload = () => resolve(true);
    script.onerror = () => { qrLoading = null; resolve(false); };
    document.head.appendChild(script);
  }));

  // QR Code em SVG, sempre preto no branco e com margem de 4 módulos, para o leitor do banco reconhecer
  const QUIET_ZONE = 4;
  const qrSvg = (value) => {
    const qr = window.qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const total = count + QUIET_ZONE * 2;
    let path = "";
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        if (qr.isDark(row, column)) path += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return `<svg class="pix-qr" width="232" height="232" viewBox="0 0 ${total} ${total}" role="img" aria-label="QR Code do Pix" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#ffffff"/><path d="${path}" fill="#000000"/></svg>`;
  };

  const renderDonate = () => {
    setTab("");
    const { DONATION, parseAmount, donationCode } = window.Pix;
    const state = { preset: null, text: "" };
    app.innerHTML = pageHead("Apoiar", "") + `
      <div class="prose">
        <p>Fiz o Nihongo Clue Pocket sozinho, para a minha própria viagem ao Japão, e deixei aberto para quem mais precisar. Ele é gratuito, não tem anúncios e não pede cadastro.</p>
        <p>Se ele foi útil e você quiser apoiar o meu trabalho, pode doar qualquer valor por Pix. Doar é opcional e não libera nada: o app é o mesmo para todo mundo.</p>
      </div>
      <section class="donate" aria-label="Doar por Pix">
        <p class="receiver">Recebedor: <b>${esc(DONATION.receiverFullName)}</b></p>
        <div class="amounts" role="group" aria-label="Valor">
          ${DONATION.suggestedAmounts.map((value) => `<button data-amt="${value}">${money(value)}</button>`).join("")}
          <button data-amt="custom">Outro valor</button>
          <button data-amt="none">Decidir no banco</button>
        </div>
        <label class="custom" id="don-custom-box" hidden>Valor em reais
          <input id="don-custom" inputmode="decimal" autocomplete="off" placeholder="Ex.: 15,00">
          <small id="don-err" hidden>Use só números, como 15 ou 15,50 (máximo de ${money(DONATION.maxAmount)}).</small>
        </label>
        <div class="pixcode">
          <div id="don-qr"></div>
          <p id="don-line"></p>
          <code id="don-code"></code>
          <button class="btn" id="don-copy">Copiar código Pix</button>
        </div>
        <p class="note-box" id="don-thanks" role="status" hidden><b>Muito obrigado!</b> Agora é só colar o código no Pix do seu banco. O app não fica sabendo se o pagamento foi feito, então o agradecimento já fica aqui.</p>
        <ol class="donsteps">
          <li>No app do seu banco, abra o Pix e escolha <b>Ler QR Code</b> ou <b>Pix Copia e Cola</b>.</li>
          <li>Confira o nome do recebedor: <b>${esc(DONATION.receiverFullName)}</b>. Se aparecer outro nome, não confirme.</li>
          <li>Confirme o valor e conclua. Muito obrigado.</li>
        </ol>
      </section>
      <p class="foot"><a href="#/termos">Termos de uso</a> · <a href="#/privacidade">Privacidade</a></p>`;

    const update = () => {
      const amount = state.preset === "custom" ? parseAmount(state.text) : state.preset;
      const code = donationCode(amount);
      app.querySelectorAll("[data-amt]").forEach((b) => {
        const mine = b.dataset.amt === "none" ? null : b.dataset.amt === "custom" ? "custom" : Number(b.dataset.amt);
        b.classList.toggle("on", mine === state.preset);
        b.setAttribute("aria-pressed", mine === state.preset);
      });
      $("#don-custom-box").hidden = state.preset !== "custom";
      $("#don-err").hidden = !(state.preset === "custom" && state.text && amount === null);
      $("#don-line").innerHTML = amount ? `Valor: <b>${money(amount)}</b>` : "Você escolhe o valor no app do banco.";
      $("#don-code").textContent = code;
      loadQr().then((ok) => {
        const box = $("#don-qr");
        if (box && ok && $("#don-code").textContent === code) box.innerHTML = qrSvg(code);
      });
    };
    app.querySelectorAll("[data-amt]").forEach((b) => b.addEventListener("click", () => {
      state.preset = b.dataset.amt === "none" ? null : b.dataset.amt === "custom" ? "custom" : Number(b.dataset.amt);
      update();
      if (state.preset === "custom") $("#don-custom").focus();
    }));
    $("#don-custom").addEventListener("input", (e) => { state.text = e.target.value; update(); });
    $("#don-copy").addEventListener("click", async () => {
      const button = $("#don-copy");
      try {
        await navigator.clipboard.writeText($("#don-code").textContent);
        button.textContent = "Código copiado";
        $("#don-thanks").hidden = false;
        setTimeout(() => { if (button.isConnected) button.textContent = "Copiar código Pix"; }, 2500);
      } catch {
        // sem permissão de área de transferência: seleciona o código para copiar à mão
        const range = document.createRange();
        range.selectNodeContents($("#don-code"));
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = "Selecionado: copie o código acima";
      }
    });
    update();
  };

  const renderLegal = (id) => {
    setTab("");
    const page = LEGAL[id];
    app.innerHTML = pageHead(page.title, "") + `<article class="prose"><p class="count">Atualizado em ${SITE.legalUpdated}</p>${page.html}</article>
      <p class="foot"><a href="#/apoiar">Apoiar</a> · <a href="#/termos">Termos de uso</a> · <a href="#/privacidade">Privacidade</a></p>`;
  };

  // ---------- Tela cheia ----------
  const KIND = { say: "Você diz", hear: "Eles dizem", sign: "Placa / palavra" };
  let shown = null;
  const renderShow = () => {
    const it = shown;
    const fav = favs.has(it.key);
    showEl.innerHTML = `
      <div class="top"><span class="kind ${it.k}">${KIND[it.k]} · ${esc(it.secTitle)}</span><button class="x" data-close aria-label="Fechar">×</button></div>
      <div class="body">
        <p class="jp" lang="ja">${esc(it.jp)}</p><p class="ro ${it.k}">${esc(it.ro)}</p>${it.pt ? `<p class="pt">${esc(it.pt)}</p>` : ""}
        ${it.note ? `<p class="note">${esc(it.note)}</p>` : ""}${it.k === "hear" && it.tip ? `<p class="note">→ ${esc(it.tip)}</p>` : ""}
        ${it.reply ? `<div class="then"><small>Você responde</small>${sayHTML(it.reply)}</div>` : ""}
      </div>
      <div class="acts">${canSpeak ? `<button class="btn" data-say="${esc(it.jp)}">${ICON.sound} Ouvir</button>` : ""}<button class="btn ghost${fav ? " on" : ""}" data-fav="${it.i}" aria-pressed="${fav}">${ICON.star} ${fav ? "Salva" : "Salvar"}</button></div>`;
  };
  const openShow = (it) => {
    const wasOpen = !!shown;
    shown = it;
    renderShow();
    showEl.hidden = false;
    document.body.style.overflow = "hidden";
    if (!wasOpen) history.pushState({ show: true }, "");
    showEl.scrollTop = 0;
  };
  const closeShow = () => {
    if (!shown) return;
    shown = null;
    showEl.hidden = true;
    document.body.style.overflow = "";
    if (canSpeak) speechSynthesis.cancel();
  };

  // ---------- Eventos globais ----------
  document.addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) {
      e.stopPropagation();
      toggleFav(ALL[+favBtn.dataset.fav]);
      if (shown && showEl.contains(favBtn)) renderShow();
      return;
    }
    if (e.target.closest("[data-close]")) return history.back();
    const go = e.target.closest("[data-go]");
    if (go) return document.getElementById(go.dataset.go).scrollIntoView({ block: "start" });
    const ph = e.target.closest(".ph[data-i]");
    if (ph) return openShow(ALL[+ph.dataset.i]);
    const role = e.target.closest("[data-roleplay]");
    if (role) {
      const hiding = role.parentElement.classList.toggle("hide-v");
      role.setAttribute("aria-pressed", hiding);
      role.textContent = hiding ? "Mostrar minhas falas" : "Praticar: esconder minhas falas";
      role.parentElement.querySelectorAll(".seen").forEach((b) => b.classList.remove("seen"));
      return;
    }
    const veiled = e.target.closest(".hide-v .bubble.v:not(.seen)");
    if (veiled) return veiled.classList.add("seen");
    const say = e.target.closest("[data-say]");
    if (say) return speak(say.dataset.say);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && shown) return history.back();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".ph[data-i]")) { e.preventDefault(); openShow(ALL[+e.target.dataset.i]); }
  });

  let deferredInstall = null;
  const syncInstall = () => {
    const box = $("#install");
    if (!box) return;
    box.hidden = !deferredInstall;
    $("#install-btn").onclick = async () => {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      syncInstall();
    };
  };
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; syncInstall(); });
  window.addEventListener("appinstalled", () => { deferredInstall = null; syncInstall(); });

  // ---------- Rotas ----------
  const route = (restoreTo) => {
    const [name, arg] = location.hash.replace(/^#\/?/, "").split("/");
    if (name === "s") renderSection(arg);
    else if (name === "buscar") renderHome(true);
    else if (name === "treinar") renderTrain();
    else if (name === "salvos") renderFavs();
    else if (name === "apoiar") renderDonate();
    else if (name === "termos" || name === "privacidade") renderLegal(name);
    else renderHome(false);
    window.scrollTo({ top: restoreTo || 0, behavior: "instant" });
  };

  // Ao voltar para a tela anterior, retoma a rolagem de onde a pessoa estava
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const trail = [location.hash];
  const scrollOf = {};
  window.addEventListener("popstate", () => { if (shown) closeShow(); });
  window.addEventListener("hashchange", () => {
    closeShow();
    scrollOf[trail[trail.length - 1]] = window.scrollY;
    const back = trail.length > 1 && trail[trail.length - 2] === location.hash;
    if (back) trail.pop(); else trail.push(location.hash);
    route(back ? scrollOf[location.hash] : 0);
  });
  route();

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
