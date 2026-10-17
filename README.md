# Sova — sovacards.com

Таро для размышлений. Сейчас здесь страница «скоро» с листом ожидания.

## Что внутри

- `index.html`, `assets/` — страница: звёздное небо, три карты, которые можно перевернуть, форма email.
- `privacy.html` — политика конфиденциальности (`/privacy`).
- `uk/` — украинская версия (`/uk`, `/uk/privacy`). Тексты карт и сообщений формы для обоих языков — в `assets/app.js`. Посетителей с украинским языком браузера страница один раз переводит на `/uk`; выбор языка в шапке запоминается. В записи листа ожидания язык попадает в поле `source` (`lang=uk`).
- `api/waitlist.js` — серверная функция Vercel: проверяет email и сохраняет его в Supabase.
- `supabase/waitlist.sql` — создание таблицы `waitlist`.
- `vercel.json` — настройки: без фреймворка, адреса без `.html`, заголовки безопасности.

Без зависимостей и без сборки: Vercel публикует файлы как есть.

## Настройка

1. Supabase: создать проект (регион EU, например Frankfurt), выполнить `supabase/waitlist.sql` в SQL Editor.
2. Vercel → Settings → Environment Variables:
   - `SUPABASE_URL` — Project URL из Supabase (Project Settings → API / Data API);
   - `SUPABASE_SERVICE_ROLE_KEY` — секретный ключ (service_role или sb_secret_…). Только на сервере, никогда в коде страницы.
3. Redeploy.

Посмотреть записавшихся: Supabase → Table Editor → `waitlist`.

## Бренд

Цвета, шрифты и голос — из дизайн-системы Sova. Шрифты: Forum, Cormorant Garamond, Golos Text (Google Fonts).
