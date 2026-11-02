(() => {
  "use strict";
  const menu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("global-nav");
  const closeMenu = () => {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "メニューを開く");
    nav.classList.remove("is-open");
  };
  menu.addEventListener("click", () => {
    const opening = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(opening));
    menu.setAttribute("aria-label", opening ? "メニューを閉じる" : "メニューを開く");
    nav.classList.toggle("is-open", opening);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });

  const progress = document.querySelector(".scroll-progress");
  let ticking = false;
  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (maxScroll <= 0 ? 0 : window.scrollY / maxScroll * 100) + "%";
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  const dialog = document.getElementById("gallery-dialog");
  const dialogArt = document.getElementById("dialog-art");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogNumber = document.getElementById("dialog-number");
  const gallery = [
    { title: "Starlight Postgirl", image: "assets/portrait.svg", css: "" },
    { title: "A Letter to the Sky", image: null, css: "letter-art" },
    { title: "Moonlit Promise", image: "assets/portrait.svg", css: "moonlight" }
  ];
  document.querySelectorAll("[data-art]").forEach((tile) => {
    tile.addEventListener("click", () => {
      const index = Number(tile.dataset.art);
      const item = gallery[index];
      if (!item || !dialog.showModal) return;
      dialogArt.className = "dialog-art " + item.css;
      dialogArt.replaceChildren();
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = "星綴ルミナ — " + item.title;
        dialogArt.appendChild(img);
      } else {
        const moon = document.createElement("span");
        moon.className = "moon-emoji";
        moon.setAttribute("aria-hidden", "true");
        moon.textContent = "☾";
        const letter = document.createElement("span");
        letter.className = "letter-emoji";
        letter.setAttribute("aria-hidden", "true");
        letter.textContent = "✉";
        dialogArt.append(moon, letter);
      }
      dialogNumber.textContent = String(index + 1).padStart(2, "0") + " / 03";
      dialogTitle.textContent = item.title;
      dialog.showModal();
    });
  });
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const textarea = document.getElementById("letter-message");
  const count = document.getElementById("char-count");
  const form = document.getElementById("letter-form");
  const reply = document.getElementById("letter-reply");
  const replyText = document.getElementById("reply-text");
  const replies = [
    "お手紙、ちゃんと受け取ったよ！ あなたの言葉が、今夜の空に小さな星をひとつ灯したみたい。ありがとう。 ✧",
    "星の向こうまで届いたよ。どんな日でも、あなたの物語は大切なもの。明日の空が、少しでもやさしくありますように。 ✦",
    "ふふ、素敵なお手紙だね。言葉にしてくれた気持ちを、きらきらの封筒にしまっておくね。またお話ししよう！ ✧",
    "とっておきの星明かりを、お返事に入れておくね。今夜、窓の外を見たら見つかるかもしれないよ。 ✦"
  ];
  textarea.addEventListener("input", () => { count.value = String(Array.from(textarea.value).length); });
  let sent = 0;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (!message) { textarea.focus(); return; }
    // Demo only: the message stays in browser memory and is not transmitted.
    replyText.textContent = replies[sent % replies.length];
    sent++;
    reply.hidden = false;
    form.setAttribute("aria-hidden", "true");
  });
  document.getElementById("another-letter").addEventListener("click", () => {
    textarea.value = "";
    count.value = "0";
    reply.hidden = true;
    form.removeAttribute("aria-hidden");
    textarea.focus();
  });

  let stars = 0;
  const starCount = document.getElementById("star-count");
  const starButton = document.getElementById("collect-star");
  starButton.addEventListener("click", () => {
    stars++;
    starCount.textContent = String(stars).padStart(3, "0");
    const symbols = ["✦", "✧", "✳"];
    starButton.textContent = symbols[stars % symbols.length] + " 星をひろう";
    starButton.setAttribute("aria-label", "星をひとつ集める。現在" + stars + "個");
  });
})();
