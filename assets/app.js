(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- starry sky ---------- */
  var sky = document.getElementById("sky");
  if (sky && sky.getContext) {
    var ctx = sky.getContext("2d");
    var stars = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var running = !reduceMotion;

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      sky.width = Math.round(w * dpr);
      sky.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 9000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() < 0.12 ? 1.4 : 0.8,
          a: 0.25 + Math.random() * 0.6,
          s: 0.4 + Math.random() * 1.2,
          p: Math.random() * Math.PI * 2,
          gold: Math.random() < 0.18
        });
      }
      draw(0);
    }

    function draw(t) {
      var w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var a = running ? st.a * (0.55 + 0.45 * Math.sin(t / 1000 * st.s + st.p)) : st.a;
        ctx.globalAlpha = a;
        ctx.fillStyle = st.gold ? "#E6D3A3" : "#A7ADC2";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      if (running && !document.hidden) draw(t);
      if (running) requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    resize();
    if (running) requestAnimationFrame(loop);
  }

  /* ---------- cards ---------- */
  var SYMBOLS = {
    fool: '<circle cx="15" cy="6" r="2.5"/><path d="M3 21h9l3-5 6 5"/><path d="M8 16l2-6 3 2"/>',
    magician: '<path d="M4 12c0-2.2 1.6-4 3.6-4 3.6 0 5.2 8 8.8 8 2 0 3.6-1.8 3.6-4s-1.6-4-3.6-4c-3.6 0-5.2 8-8.8 8-2 0-3.6-1.8-3.6-4z"/>',
    priestess: '<path d="M5 21V5M19 21V5M3 5h4M17 5h4M3 21h4M17 21h4"/><path d="M14.5 10a3 3 0 1 1-2.5-4 2.4 2.4 0 0 0 2.5 4z"/>',
    lovers: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    wheel: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7"/>',
    temperance: '<path d="M5 9l3 7 3-7zM13 9l3 7 3-7z"/><path d="M8 9c2-4 6-4 8 0"/>',
    tower: '<path d="M8 21V8h8v13M7 8l1-3h8l1 3M11 21v-4h2v4"/><path d="M19 3l-3 4 2 1-2 3"/>',
    star: '<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/><circle cx="5" cy="5" r=".6"/><circle cx="19" cy="18" r=".6"/>',
    moon: '<path d="M16 4.5a8 8 0 1 0 3.5 13 6.5 6.5 0 1 1-3.5-13z"/><circle cx="6" cy="6" r=".6"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    world: '<ellipse cx="12" cy="12" rx="6" ry="9"/><path d="M12 6v12M9 12h6"/>'
  };

  var DECK = [
    { n: "0", name: "Шут", s: "fool", m: "Шут — про начало и лёгкость. Иногда шаг важнее, чем идеальный план.", q: "Какой шаг ты откладываешь из страха ошибиться?" },
    { n: "I", name: "Маг", s: "magician", m: "Маг напоминает: у тебя уже есть почти всё, что нужно.", q: "Какие свои ресурсы ты пока не используешь?" },
    { n: "II", name: "Верховная Жрица", s: "priestess", m: "Жрица просит прислушаться к себе, а не к шуму вокруг.", q: "Что подсказывает тебе интуиция, когда становится тихо?" },
    { n: "VI", name: "Влюблённые", s: "lovers", m: "Влюблённые — про выбор, в котором отражаются твои ценности.", q: "Какой выбор сейчас действительно про тебя?" },
    { n: "X", name: "Колесо Фортуны", s: "wheel", m: "Колесо говорит о переменах: цикл поворачивается.", q: "Что в твоей жизни уже начало меняться?" },
    { n: "XIV", name: "Умеренность", s: "temperance", m: "Умеренность — про баланс и спокойный темп.", q: "Где тебе сейчас нужна золотая середина, а не крайности?" },
    { n: "XVI", name: "Башня", s: "tower", m: "Башня не про катастрофу. Она про то, что старая опора больше не держит.", q: "Что ты давно хочешь перестроить?" },
    { n: "XVII", name: "Звезда", s: "star", m: "Звезда — про надежду и восстановление сил.", q: "Что даёт тебе надежду, когда всё неясно?" },
    { n: "XVIII", name: "Луна", s: "moon", m: "Луна просит не спешить с выводами: не всё сейчас видно до конца.", q: "О чём ты, возможно, судишь слишком рано?" },
    { n: "XIX", name: "Солнце", s: "sun", m: "Солнце — про ясность, радость и тепло.", q: "Что сегодня может сделать тебя чуть счастливее?" },
    { n: "XXI", name: "Мир", s: "world", m: "Мир говорит о завершении: этап можно закрыть с благодарностью.", q: "Что пора завершить, чтобы освободить место новому?" }
  ];

  var cardsEl = document.getElementById("cards");
  var hint = document.getElementById("hint");
  var reading = document.getElementById("reading");
  var rMeaning = document.getElementById("r-meaning");
  var rQuestion = document.getElementById("r-question");
  var again = document.getElementById("again");
  var hand = [];

  function shuffleDeck() {
    var pool = DECK.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    hand = pool.slice(0, 3);
    var cards = cardsEl.querySelectorAll(".card");
    for (var k = 0; k < cards.length; k++) {
      var c = hand[k];
      cards[k].querySelector(".face").innerHTML =
        '<span class="f-num">' + c.n + '</span>' +
        '<svg class="f-sym" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SYMBOLS[c.s] + '</svg>' +
        '<span class="f-name">' + c.name + '</span>';
    }
  }

  function sparks(card) {
    if (reduceMotion) return;
    var box = card.getBoundingClientRect();
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.className = "spark";
      var ang = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 60;
      s.style.left = (box.left + box.width / 2 + window.scrollX) + "px";
      s.style.top = (box.top + box.height / 2 + window.scrollY) + "px";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(s);
      setTimeout(function (el) { el.remove(); }, 950, s);
    }
  }

  function pick(card) {
    if (cardsEl.classList.contains("done")) return;
    var c = hand[Number(card.getAttribute("data-i"))];
    cardsEl.classList.add("done");
    card.classList.add("picked");
    card.setAttribute("aria-label", "Твоя карта: " + c.name);
    var others = cardsEl.querySelectorAll(".card:not(.picked)");
    for (var i = 0; i < others.length; i++) others[i].setAttribute("tabindex", "-1");
    setTimeout(function () { sparks(card); }, reduceMotion ? 0 : 420);
    hint.textContent = "Твоя карта — " + c.name;
    rMeaning.textContent = c.m;
    rQuestion.textContent = c.q;
    setTimeout(function () { reading.hidden = false; }, reduceMotion ? 0 : 700);
    track("card_pick", { card: c.name });
  }

  function reset() {
    var cards = cardsEl.querySelectorAll(".card");
    reading.hidden = true;
    cardsEl.classList.remove("done");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("picked");
      cards[i].removeAttribute("tabindex");
      cards[i].setAttribute("aria-label", "Карта " + (i + 1));
    }
    hint.textContent = "Подумай о своём вопросе и выбери карту";
    setTimeout(function () {
      shuffleDeck();
      if (!reduceMotion) {
        cardsEl.classList.remove("shuffle");
        void cardsEl.offsetWidth;
        cardsEl.classList.add("shuffle");
      }
    }, reduceMotion ? 0 : 450);
  }

  if (cardsEl) {
    shuffleDeck();
    cardsEl.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (card) pick(card);
    });
    cardsEl.addEventListener("animationend", function () { cardsEl.classList.remove("shuffle"); });
    again.addEventListener("click", reset);
  }

  /* ---------- source (UTM) ---------- */
  function source() {
    var p = new URLSearchParams(window.location.search);
    var parts = [];
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) {
      var v = p.get(k);
      if (v) parts.push(k.replace("utm_", "") + "=" + v.slice(0, 60));
    });
    if (!parts.length && document.referrer) {
      try { parts.push("ref=" + new URL(document.referrer).hostname); } catch (e) { /* ignore */ }
    }
    return parts.join("&");
  }

  function track(name, props) {
    try { if (window.va) window.va("event", { name: name, data: props }); } catch (e) { /* analytics optional */ }
  }

  /* ---------- waitlist form ---------- */
  var form = document.getElementById("form");
  if (form) {
    var email = document.getElementById("email");
    var consent = document.getElementById("consent");
    var msg = document.getElementById("msg");
    var btn = document.getElementById("submit");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function say(text, kind) {
      msg.textContent = text;
      msg.className = "msg" + (kind ? " " + kind : "");
    }

    email.addEventListener("input", function () { email.removeAttribute("aria-invalid"); if (msg.classList.contains("err")) say(""); });
    consent.addEventListener("change", function () { if (msg.classList.contains("err")) say(""); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!EMAIL_RE.test(value) || value.length > 254) {
        email.setAttribute("aria-invalid", "true");
        email.focus();
        say("Проверь email: похоже, в адресе ошибка.", "err");
        return;
      }
      if (!consent.checked) {
        say("Отметь согласие, чтобы мы могли написать тебе о запуске.", "err");
        consent.focus();
        return;
      }
      btn.disabled = true;
      say("Отправляю…");
      fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          consent: true,
          source: source(),
          website: document.getElementById("website").value
        })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say("Готово! Сова напишет тебе в день запуска.", "ok");
            track("waitlist_signup", {});
          } else if (res.status === 429) {
            say("Слишком много попыток. Попробуй через минуту.", "err");
          } else if (res.d && res.d.error === "invalid_email") {
            email.setAttribute("aria-invalid", "true");
            say("Проверь email: похоже, в адресе ошибка.", "err");
          } else {
            say("Не получилось сохранить. Попробуй ещё раз чуть позже.", "err");
          }
        })
        .catch(function () { say("Нет связи с сервером. Проверь интернет и попробуй ещё раз.", "err"); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
