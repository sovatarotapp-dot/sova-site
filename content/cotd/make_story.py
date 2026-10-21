"""Карта дня Sova: собирает два слайда сторис 1080×1920.

    python3 content/cotd/make_story.py                  # на сегодня (Europe/Warsaw)
    python3 content/cotd/make_story.py --date 2026-10-22 --out /tmp/out
    python3 content/cotd/make_story.py --msg "…" --q "…" # свой текст вместо стандартного

Карта выбирается без повторов: колода из 22 карт тасуется заново каждые 22 дня
(сид = номер цикла), и каждый день берётся следующая карта. Стандартные тексты
лежат в cards.json; их можно переписать через --msg / --q.
Нужны: python3, Pillow не нужен, playwright с chromium.
"""
import argparse, datetime as dt, html, json, os, random
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа",
          "сентября", "октября", "ноября", "декабря"]
DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
EPOCH = dt.date(2026, 10, 22)  # первый день автоматической карты дня


def lower_first(s):
    return s[:1].lower() + s[1:]


def card_for(day, deck):
    keys = sorted(deck)
    n = (day - EPOCH).days
    cycle, pos = divmod(n, len(keys))
    order = keys[:]
    random.Random(1000 + cycle).shuffle(order)
    return order[pos]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date"); ap.add_argument("--out", default=os.path.join(HERE, "out"))
    ap.add_argument("--msg"); ap.add_argument("--q"); ap.add_argument("--card")
    a = ap.parse_args()
    day = dt.date.fromisoformat(a.date) if a.date else dt.datetime.now(ZoneInfo("Europe/Warsaw")).date()
    deck = json.load(open(os.path.join(HERE, "cards.json"), encoding="utf-8"))
    key = a.card or card_for(day, deck)
    c = deck[key]
    name = c["name"].upper()
    vals = {
        "DATE_LONG": f"{day.day} {MONTHS[day.month - 1]} · {DAYS[day.weekday()]}",
        "DATE_SHORT": f"{day.day} {MONTHS[day.month - 1]}",
        "KEY": key, "NAME": html.escape(name),
        "NAME_PX": "92" if len(name) <= 10 else ("74" if len(name) <= 14 else "64"),
        "MSG": html.escape(a.msg or c["msg"]), "Q": html.escape(lower_first(a.q or c["q"])),
    }
    page = open(os.path.join(HERE, "story.html"), encoding="utf-8").read()
    for k, v in vals.items():
        page = page.replace("{{" + k + "}}", v)
    tmp = os.path.join(HERE, "_story.html")
    open(tmp, "w", encoding="utf-8").write(page)
    os.makedirs(a.out, exist_ok=True)
    files = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto("file://" + tmp); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
        for i in (1, 2):
            f = os.path.join(a.out, f"sova-karta-dnya-{day.isoformat()}-{i}.png")
            pg.locator(f"#s{i}").screenshot(path=f); files.append(f)
        b.close()
    os.remove(tmp)
    print(json.dumps({"date": day.isoformat(), "card": key, "name": c["name"],
                      "msg": a.msg or c["msg"], "q": a.q or c["q"], "files": files}, ensure_ascii=False))


if __name__ == "__main__":
    main()
