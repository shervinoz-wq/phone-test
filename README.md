# iPhone Phone Replica (PWA)

ریپلیکای اپ **Phone** آیفون با React + TypeScript + Vite؛ نصب‌شدنی روی Home Screen و کاملاً آفلاین.
صفحات: Keypad، Contacts (+ جزئیات و افزودن/ویرایش مخاطب)، Favourites، Recents، Settings.
تماس واقعی برقرار نمی‌شود و به مخاطبین/تاریخچه سیستم دسترسی ندارد؛ همه داده‌ها نمونه و محلی (localStorage) هستند.

## ۱) اجرا در ویندوز

1. Node.js نسخه LTS (۲۰ یا بالاتر) را از https://nodejs.org نصب کنید.
2. پوشه پروژه را در Command Prompt یا PowerShell باز کنید و اجرا کنید:

```
npm install
npm run dev
```

آدرس نمایش‌داده‌شده (مثلاً `http://localhost:5173`) را باز کنید. برای دیدن شکل موبایل، در Chrome کلید F12 و سپس Toggle Device Toolbar (Ctrl+Shift+M) را بزنید.

بیلد نهایی و پیش‌نمایش (سرویس‌ورکر فقط در بیلد نهایی فعال است):

```
npm run build
npm run preview
```

خروجی در پوشه `dist` ساخته می‌شود. برای بررسی تایپ‌ها: `npm run typecheck`.

## ۲) انتشار روی Cloudflare Pages

روش اول (Git):
1. پروژه را در یک ریپوی GitHub/GitLab آپلود کنید.
2. در داشبورد Cloudflare: Workers & Pages ← Create ← Pages ← Connect to Git.
3. تنظیمات:
   - Framework preset: `Vite` (یا None)
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Save and Deploy. آدرس نهایی به شکل `https://<name>.pages.dev` است.

روش دوم (آپلود مستقیم): بعد از `npm run build`، در Pages گزینه Upload assets را بزنید و پوشه `dist` را آپلود کنید.

نکته: فایل `public/_headers` باعث می‌شود `sw.js` و `index.html` کش مرورگر نشوند تا نسخه‌های جدید سریع اعمال شوند.

## ۳) نصب روی آیفون (Safari)

1. لینک Cloudflare Pages را **در Safari** باز کنید و صفحه کامل لود شود (برای کش‌شدن اولیه).
2. دکمه Share را بزنید ← **Add to Home Screen** ← Add.
3. اپ را از آیکون روی Home Screen اجرا کنید (یک بار با اینترنت).
4. از این به بعد حتی با حالت پرواز اپ بدون اینترنت اجرا می‌شود.

نکته: اگر آپدیت منتشر کردید، اپ را یک بار با اینترنت باز و کامل ببندید و دوباره باز کنید تا نسخه جدید فعال شود. استایل نوار وضعیت iOS (`default`) برای خوانایی متن ساعت/باتری انتخاب شده است.

## ساختار پروژه

```
public/           manifest.webmanifest، آیکون‌ها، _headers
scripts/          sw.template.js (قالب سرویس‌ورکر)، generate-icons.mjs
src/components/   TabBar، Icons، Avatar، Sheet، LargeTitleScreen، ...
src/screens/      Keypad، Contacts، ContactDetail، ContactEditor، Recents، Favourites، Settings، CallScreen
src/store/        state و ذخیره‌سازی محلی
src/lib/          توابع کمکی (مخاطبین، فرمت، صدای DTMF)
src/data/         داده نمونه
src/pwa/          ثبت سرویس‌ورکر
vite.config.ts    پلاگین ساخت sw.js با لیست کامل فایل‌ها (Precache)
```

## جزئیات آفلاین

در `npm run build` پلاگین داخل `vite.config.ts` فایل `dist/sw.js` را می‌سازد و تمام فایل‌های خروجی (HTML/CSS/JS/آیکون‌ها) را Precache می‌کند. استراتژی Cache First است. فونت سیستمی iOS استفاده شده و هیچ CDN یا درخواست خارجی‌ای وجود ندارد؛ صدای کلیدها هم با WebAudio ساخته می‌شود.
