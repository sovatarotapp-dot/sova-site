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
  var LANG = document.documentElement.lang === "uk" ? "uk" : "ru";

  var TEXT = {
    ru: {
      hint: "Подумай о своём вопросе и выбери карту",
      yourCard: "Твоя карта — ",
      yourCardAria: "Твоя карта: ",
      badEmail: "Проверь email: похоже, в адресе ошибка.",
      noConsent: "Отметь согласие, чтобы мы могли написать тебе о запуске.",
      sending: "Отправляю…",
      tooMany: "Слишком много попыток. Попробуй через минуту.",
      failed: "Не получилось сохранить. Попробуй ещё раз чуть позже.",
      offline: "Нет связи с сервером. Проверь интернет и попробуй ещё раз."
    },
    uk: {
      hint: "Подумай про своє запитання й обери карту",
      yourCard: "Твоя карта — ",
      yourCardAria: "Твоя карта: ",
      badEmail: "Перевір email: схоже, в адресі помилка.",
      noConsent: "Познач згоду, щоб ми могли написати тобі про запуск.",
      sending: "Надсилаю…",
      tooMany: "Забагато спроб. Спробуй за хвилину.",
      failed: "Не вдалося зберегти. Спробуй ще раз трохи згодом.",
      offline: "Немає зв'язку з сервером. Перевір інтернет і спробуй ще раз."
    }
  };
  var T = TEXT[LANG];

  var DECK_UK = [
    { n: "0", name: "Блазень", s: "fool", m: "Блазень — про початок і легкість. Іноді крок важливіший за ідеальний план.", q: "Який крок ти відкладаєш через страх помилитися?" },
    { n: "I", name: "Маг", s: "magician", m: "Маг нагадує: у тебе вже є майже все, що потрібно.", q: "Які свої ресурси ти поки не використовуєш?" },
    { n: "II", name: "Верховна Жриця", s: "priestess", m: "Жриця просить прислухатися до себе, а не до шуму довкола.", q: "Що підказує тобі інтуїція, коли стає тихо?" },
    { n: "III", name: "Імператриця", s: "empress", m: "Імператриця — про турботу, достаток і те, що росте, коли про нього дбають.", q: "Що у твоєму житті просить більше турботи?" },
    { n: "IV", name: "Імператор", s: "emperor", m: "Імператор — про структуру, межі й відповідальність за свої рішення.", q: "Де тобі зараз бракує чітких правил чи меж?" },
    { n: "V", name: "Ієрофант", s: "hierophant", m: "Ієрофант — про традиції, вчителів і досвід тих, хто пройшов цей шлях раніше.", q: "Чия порада могла б зараз тобі допомогти?" },
    { n: "VI", name: "Закохані", s: "lovers", m: "Закохані — про вибір, у якому відображаються твої цінності.", q: "Який вибір зараз справді про тебе?" },
    { n: "VII", name: "Колісниця", s: "chariot", m: "Колісниця — про рух уперед і волю, яка тримає курс.", q: "Куди ти рухаєшся і що тримає тебе на курсі?" },
    { n: "VIII", name: "Сила", s: "strength", m: "Сила — це м'якість і терпіння, а не тиск.", q: "Де тобі варто діяти лагідніше, щоб досягти свого?" },
    { n: "IX", name: "Відлюдник", s: "hermit", m: "Відлюдник радить побути наодинці з собою й пошукати відповідь усередині.", q: "Яке питання тобі варто обдумати в тиші?" },
    { n: "X", name: "Колесо Фортуни", s: "wheel", m: "Колесо говорить про зміни: цикл повертається.", q: "Що у твоєму житті вже почало змінюватися?" },
    { n: "XI", name: "Справедливість", s: "justice", m: "Справедливість — про чесність і наслідки: усе приходить до рівноваги.", q: "Де тобі варто бути чеснішим із собою?" },
    { n: "XII", name: "Повішений", s: "hanged", m: "Повішений пропонує подивитися на ситуацію під іншим кутом і не поспішати.", q: "Що зміниться, якщо поглянути на це інакше?" },
    { n: "XIII", name: "Смерть", s: "death", m: "Смерть у таро — не про кінець життя, а про завершення етапу й місце для нового.", q: "Що вже віджило своє і готове піти?" },
    { n: "XIV", name: "Поміркованість", s: "temperance", m: "Поміркованість — про баланс і спокійний темп.", q: "Де тобі зараз потрібна золота середина, а не крайнощі?" },
    { n: "XV", name: "Диявол", s: "devil", m: "Диявол — про звички й прив'язаності, які тримають міцніше, ніж здається.", q: "Що тримає тебе, хоча ти вже хочеш це відпустити?" },
    { n: "XVI", name: "Вежа", s: "tower", m: "Вежа не про катастрофу. Вона про те, що стара опора більше не тримає.", q: "Що ти давно хочеш перебудувати?" },
    { n: "XVII", name: "Зірка", s: "star", m: "Зірка — про надію та відновлення сил.", q: "Що дає тобі надію, коли все неясно?" },
    { n: "XVIII", name: "Місяць", s: "moon", m: "Місяць просить не поспішати з висновками: не все зараз видно до кінця.", q: "Про що ти, можливо, судиш занадто рано?" },
    { n: "XIX", name: "Сонце", s: "sun", m: "Сонце — про ясність, радість і тепло.", q: "Що сьогодні може додати тобі трохи щастя?" },
    { n: "XX", name: "Суд", s: "judgement", m: "Суд — про пробудження: час підбити підсумки й почути свій справжній поклик.", q: "До чого тебе по-справжньому кличе зараз?" },
    { n: "XXI", name: "Світ", s: "world", m: "Світ говорить про завершення: етап можна закрити з вдячністю.", q: "Що час завершити, щоб звільнити місце новому?" }
  ];

  var DECK_RU = [
    { n: "0", name: "Шут", s: "fool", m: "Шут — про начало и лёгкость. Иногда шаг важнее, чем идеальный план.", q: "Какой шаг ты откладываешь из страха ошибиться?" },
    { n: "I", name: "Маг", s: "magician", m: "Маг напоминает: у тебя уже есть почти всё, что нужно.", q: "Какие свои ресурсы ты пока не используешь?" },
    { n: "II", name: "Верховная Жрица", s: "priestess", m: "Жрица просит прислушаться к себе, а не к шуму вокруг.", q: "Что подсказывает тебе интуиция, когда становится тихо?" },
    { n: "III", name: "Императрица", s: "empress", m: "Императрица — про заботу, изобилие и то, что растёт, когда о нём заботятся.", q: "Что в твоей жизни просит больше заботы?" },
    { n: "IV", name: "Император", s: "emperor", m: "Император — про структуру, границы и ответственность за свои решения.", q: "Где тебе сейчас не хватает чётких правил или границ?" },
    { n: "V", name: "Иерофант", s: "hierophant", m: "Иерофант — про традиции, учителей и опыт тех, кто прошёл этот путь раньше.", q: "Чей совет мог бы сейчас тебе помочь?" },
    { n: "VI", name: "Влюблённые", s: "lovers", m: "Влюблённые — про выбор, в котором отражаются твои ценности.", q: "Какой выбор сейчас действительно про тебя?" },
    { n: "VII", name: "Колесница", s: "chariot", m: "Колесница — про движение вперёд и волю, которая держит курс.", q: "Куда ты движешься и что держит тебя на курсе?" },
    { n: "VIII", name: "Сила", s: "strength", m: "Сила — это мягкость и терпение, а не давление.", q: "Где тебе стоит действовать мягче, чтобы добиться своего?" },
    { n: "IX", name: "Отшельник", s: "hermit", m: "Отшельник советует побыть наедине с собой и поискать ответ внутри.", q: "Какой вопрос тебе стоит обдумать в тишине?" },
    { n: "X", name: "Колесо Фортуны", s: "wheel", m: "Колесо говорит о переменах: цикл поворачивается.", q: "Что в твоей жизни уже начало меняться?" },
    { n: "XI", name: "Справедливость", s: "justice", m: "Справедливость — про честность и последствия: всё приходит к равновесию.", q: "Где тебе стоит быть честнее с собой?" },
    { n: "XII", name: "Повешенный", s: "hanged", m: "Повешенный предлагает взглянуть на ситуацию под другим углом и не спешить.", q: "Что изменится, если посмотреть на это иначе?" },
    { n: "XIII", name: "Смерть", s: "death", m: "Смерть в таро — не про конец жизни, а про завершение этапа и место для нового.", q: "Что уже отжило своё и готово уйти?" },
    { n: "XIV", name: "Умеренность", s: "temperance", m: "Умеренность — про баланс и спокойный темп.", q: "Где тебе сейчас нужна золотая середина, а не крайности?" },
    { n: "XV", name: "Дьявол", s: "devil", m: "Дьявол — про привычки и привязанности, которые держат крепче, чем кажется.", q: "Что держит тебя, хотя ты уже хочешь это отпустить?" },
    { n: "XVI", name: "Башня", s: "tower", m: "Башня не про катастрофу. Она про то, что старая опора больше не держит.", q: "Что ты давно хочешь перестроить?" },
    { n: "XVII", name: "Звезда", s: "star", m: "Звезда — про надежду и восстановление сил.", q: "Что даёт тебе надежду, когда всё неясно?" },
    { n: "XVIII", name: "Луна", s: "moon", m: "Луна просит не спешить с выводами: не всё сейчас видно до конца.", q: "О чём ты, возможно, судишь слишком рано?" },
    { n: "XIX", name: "Солнце", s: "sun", m: "Солнце — про ясность, радость и тепло.", q: "Что сегодня может сделать тебя чуть счастливее?" },
    { n: "XX", name: "Суд", s: "judgement", m: "Суд — про пробуждение: время подвести итоги и услышать своё настоящее призвание.", q: "К чему тебя по-настоящему зовёт сейчас?" },
    { n: "XXI", name: "Мир", s: "world", m: "Мир говорит о завершении: этап можно закрыть с благодарностью.", q: "Что пора завершить, чтобы освободить место новому?" }
  ];

  var DECK = LANG === "uk" ? DECK_UK : DECK_RU;

  document.querySelectorAll("[data-setlang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("sova_lang", a.getAttribute("data-setlang")); } catch (e) { /* ignore */ }
    });
  });

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
        '<img class="f-img" src="/assets/cards/' + c.s + '.webp" width="320" height="480" alt="" decoding="async">' +
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
    card.setAttribute("aria-label", T.yourCardAria + c.name);
    var others = cardsEl.querySelectorAll(".card:not(.picked)");
    for (var i = 0; i < others.length; i++) others[i].setAttribute("tabindex", "-1");
    setTimeout(function () { sparks(card); }, reduceMotion ? 0 : 420);
    hint.textContent = T.yourCard + c.name;
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
    hint.textContent = T.hint;
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
    var parts = ["lang=" + LANG];
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) {
      var v = p.get(k);
      if (v) parts.push(k.replace("utm_", "") + "=" + v.slice(0, 60));
    });
    if (parts.length === 1 && document.referrer) {
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
    var done = document.getElementById("done");
    var doneEmail = document.getElementById("done-email");
    var STORE = "sova_waitlist_email";
    var sub = document.querySelector(".signup .sub");
    var title = document.getElementById("signup-title");

    function showDone(addr, focus) {
      doneEmail.textContent = addr;
      form.hidden = true;
      if (sub) sub.hidden = true;
      title.classList.add("sr-only");
      done.hidden = false;
      if (focus) {
        done.focus({ preventScroll: true });
        done.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    }

    function showForm() {
      done.hidden = true;
      form.hidden = false;
      if (sub) sub.hidden = false;
      title.classList.remove("sr-only");
      say("");
      email.focus();
    }

    try {
      var savedEmail = localStorage.getItem(STORE);
      if (savedEmail) showDone(savedEmail, false);
    } catch (e) { /* storage unavailable */ }

    document.getElementById("another").addEventListener("click", function () {
      try { localStorage.removeItem(STORE); } catch (e) { /* ignore */ }
      showForm();
    });

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
        say(T.badEmail, "err");
        return;
      }
      if (!consent.checked) {
        say(T.noConsent, "err");
        consent.focus();
        return;
      }
      btn.disabled = true;
      say(T.sending);
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
            var addr = value.toLowerCase();
            form.reset();
            say("");
            try { localStorage.setItem(STORE, addr); } catch (e) { /* ignore */ }
            showDone(addr, true);
            track("waitlist_signup", {});
          } else if (res.status === 429) {
            say(T.tooMany, "err");
          } else if (res.d && res.d.error === "invalid_email") {
            email.setAttribute("aria-invalid", "true");
            say(T.badEmail, "err");
          } else {
            say(T.failed, "err");
          }
        })
        .catch(function () { say(T.offline, "err"); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
