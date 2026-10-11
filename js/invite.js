// Convite de doação e animações de apoio, no padrão do DOACOES.md.
// Tudo fica só neste aparelho: quem limpa os dados do navegador volta a ver o convite.
// O app continua sem saber se alguém doou.
const Invite = (() => {
  "use strict";

  const VISITS_KEY = "np.visits";
  const VISIT_COUNTED_KEY = "np.visit-counted";
  const INVITE_SEEN_KEY = "np.invite-seen";
  const CARD_HIDDEN_KEY = "np.card-hidden";

  // A janela aparece sozinha a partir desta visita, uma única vez.
  const INVITE_AFTER_VISITS = 5;
  // Tempo em que os botões da janela ficam travados, para a pessoa ler antes de tocar.
  const INVITE_LOCK_MS = 2000;

  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* sem armazenamento */ } };

  // Conta uma visita por abertura do app (não por tela) e devolve o total.
  const countVisit = () => {
    const visits = Number(read(VISITS_KEY)) || 0;
    try {
      if (sessionStorage.getItem(VISIT_COUNTED_KEY)) return visits;
      sessionStorage.setItem(VISIT_COUNTED_KEY, "1");
    } catch { return visits; }
    write(VISITS_KEY, String(visits + 1));
    return visits + 1;
  };

  const inviteSeen = () => read(INVITE_SEEN_KEY) === "1";
  const markInviteSeen = () => write(INVITE_SEEN_KEY, "1");
  const cardHidden = () => read(CARD_HIDDEN_KEY) === "1";
  const hideCard = () => write(CARD_HIDDEN_KEY, "1");

  // ---------- Animações ----------
  const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Personagem acenando: WebP animado, com um quadro parado para quem prefere menos movimento.
  const waveArt = (className) => `<picture class="${className}"><source media="(prefers-reduced-motion: reduce)" srcset="animations/donation-wave-still.webp"><img src="animations/donation-wave.webp" alt="" width="336" height="293"></picture>`;

  let playerLoading = null;
  const loadPlayer = () => playerLoading || (playerLoading = new Promise((resolve, reject) => {
    if (window.lottie) return resolve();
    const script = document.createElement("script");
    script.src = "vendor/lottie_light.min.js";
    script.onload = () => resolve();
    script.onerror = () => { playerLoading = null; reject(new Error("player")); };
    document.head.appendChild(script);
  }));

  // Animação Lottie decorativa. O player e o arquivo só são baixados quando ela aparece na tela;
  // se falhar, o espaço fica vazio e nada mais é afetado. Com `from` e `to` (quadros da
  // composição) o trecho toca uma única vez e para no fim; sem eles a animação fica em laço.
  const lottieArt = (container, src, from, to) => {
    if (!container) return;
    Promise.all([
      loadPlayer(),
      fetch(src).then((response) => (response.ok ? response.json() : Promise.reject(new Error("animation")))),
    ]).then(([, animationData]) => {
      if (!container.isConnected) return;
      const once = from !== undefined && to !== undefined;
      const item = window.lottie.loadAnimation({ container, renderer: "svg", loop: !once, autoplay: !once && !still(), animationData });
      if (once) {
        // Quem prefere menos movimento vê direto o quadro final do trecho.
        if (still()) item.goToAndStop(to - from, true);
        else item.playSegments([from, to], true);
      }
    }).catch(() => { /* decorativa: sem ela a tela continua completa */ });
  };

  // Potinho de doações, na tela de apoio.
  const jarArt = (container) => lottieArt(container, "animations/donation-jar.json");
  // Coração de agradecimento, para quem recusa o convite. A chama vira coração e ele fica na
  // tela: o arquivo termina fazendo o coração sumir, então o trecho para antes disso.
  const heartArt = (container) => lottieArt(container, "animations/donation-heart.json", 40, 330);

  // ---------- Janela em duas etapas ----------
  let modal = null;
  let lockTimer = 0;

  const closeModal = () => {
    clearTimeout(lockTimer);
    if (modal) modal.remove();
    modal = null;
    document.body.classList.remove("modal-open");
  };

  const showStep = (step) => {
    clearTimeout(lockTimer);
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "invite-backdrop";
      document.body.appendChild(modal);
      document.body.classList.add("modal-open");
    }
    modal.innerHTML = step === "ask" ? `
      <section class="invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        ${waveArt("invite-art")}
        <h2 id="invite-title">Que bom ter você por aqui!</h2>
        <p>Você já abriu o Nihongo Clue Pocket algumas vezes, então ele deve estar sendo útil. Fico feliz de verdade.</p>
        <p>Ele é gratuito e vai continuar assim. Sou só eu cuidando dele, no meu tempo livre, e mantê-lo no ar dá trabalho e tem seus custos. Se quiser ajudar, qualquer valor conta: <b>R$ 1 já ajuda</b>.</p>
        <div class="invite-actions">
          <button class="btn" data-invite="help" data-locked disabled>Quero ajudar</button>
          <button class="btn ghost" data-invite="decline" data-locked disabled>Agora não</button>
        </div>
        <span class="invite-lock" aria-hidden="true"></span>
      </section>` : `
      <section class="invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <div class="invite-art" id="invite-heart" aria-hidden="true"></div>
        <h2 id="invite-title">Tudo bem, obrigado mesmo assim!</h2>
        <p>Fique à vontade para usar o app de graça, sempre que precisar. Saber que ele ajuda na sua viagem já faz valer a pena.</p>
        <p>Se um dia quiser apoiar, o link <b>Apoiar</b> fica no fim da tela inicial.</p>
        <div class="invite-actions">
          <button class="btn" data-invite="close" data-locked disabled>Tudo bem</button>
          <button class="btn ghost" data-invite="back">‹ Voltar</button>
        </div>
        <span class="invite-lock" aria-hidden="true"></span>
      </section>`;
    if (step === "thanks") heartArt(modal.querySelector("#invite-heart"));
    lockTimer = setTimeout(() => {
      if (!modal) return;
      modal.querySelectorAll("[data-locked]").forEach((button) => { button.disabled = false; });
      modal.querySelector("[data-locked]").focus();
    }, INVITE_LOCK_MS);
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-invite]");
    if (!button) return;
    const action = button.dataset.invite;
    if (action === "decline") showStep("thanks");
    else if (action === "back") showStep("ask");
    else if (action === "close") closeModal();
    else if (action === "help") { closeModal(); location.hash = "#/apoiar"; }
    else if (action === "dismiss-card") {
      // Dispensar o cartão abre a janela mais uma vez e o esconde.
      hideCard();
      markInviteSeen();
      button.closest(".support-card").remove();
      showStep("ask");
    }
  });

  // Cartão discreto no fim da tela inicial.
  const cardHTML = () => (cardHidden() ? "" : `
    <aside class="support-card" aria-label="Apoiar o desenvolvedor">
      <p><b>Este app te ajudou?</b><small>Apoie quem o criou, com qualquer valor.</small></p>
      <a href="#/apoiar">Apoiar</a>
      <button data-invite="dismiss-card" aria-label="Dispensar">×</button>
    </aside>`);

  // Chamado uma vez na abertura do app.
  const start = () => {
    const visits = countVisit();
    setTimeout(() => {
      if (visits < INVITE_AFTER_VISITS || inviteSeen() || location.hash.startsWith("#/apoiar")) return;
      markInviteSeen();
      showStep("ask");
    }, 1500);
  };

  // Quem já copiou o código Pix não precisa mais ser convidado.
  const settle = () => { markInviteSeen(); hideCard(); };

  return { start, settle, cardHTML, waveArt, jarArt };
})();
