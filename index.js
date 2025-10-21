// index.js
// Run: node index.js
// ENV required: GOOGLE_EMAIL, GOOGLE_PASSWORD, PORT (optional)

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// ENV
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────────────────────────────────────
// Домены для проверки (можно править под себя)
// Если у вас уже есть длинный список — просто вставьте его сюда.
const DOMAINS_LIST = [
  "mgn.1win.mx",
  "mg1.1win.mx",
  "mgn.1win.ng",
  "mg2.1win.mx",
  "mg3.1win.mx",
  "mg2.1win.ng",
  "mg3.1win.ng",
  "mg.1win-mail-30.com",
  "mg.1wpartners-serv.com",
  "mg.1w-usmailing.com",
  "mg.1w-mailsender.com",
  "mg.1win-smtpconnect.com",
  "mg.1win-smtpsndr.com",
  "mg1.1win.ng",
  "mg2.1win-mailing.com",
  "mg3.1win-mailing.com",
  "mg.1win-mail-24.com",
  "mg.1win-mail-25.com",
  "mg.1win-mail-26.com",
  "mg.1win-mail-27.com",
  "mg.1win-mail-28.com",
  "mg.1win-mail-29.com",
  "topx.one",
  "sending.topx.one",
  "mg.1win-mail-21.com",
  "mg.1win-mail-22.com",
  "mg.1win.xyz",
  "1win-nws.com",
  "1w-auth.com",
  "1w-codesender.com",
  "1w-codesndr.com",
  "1w-otpsender.com",
  "1w-otpsndr.com",
  "1win-codesender.com",
  "1win-codesndr.com",
  "1win-dgst.com",
  "1win-dgsteml.com",
  "1win-emlcdp.com",
  "1win-emlsender.com",
  "1win-emlsndr.com",
  "1win-emsender.com",
  "1win-emsndr.com",
  "1win-nwseml.com",
  "1win-nwslttr.com",
  "1win-otpsender.com",
  "1win-otpsndr.com",
  "1win-smtp.com",
  "1win-smtpeml.com",
  "1win-trig.com",
  "1win-trigeml.com",
  "1winmx-eml.com",
  "1winmx-eml1.com",
  "1winmx-eml2.com",
  "1winng-eml.com",
  "1winng-eml1.com",
  "1winng-eml2.com",
  "1win.cash",
  "1win-sender.com",
  "cdp.1w-sender.com",
  "mg.1win-sender.com",
  "mg.1winin-inbox.com",
  "mg.1win-trigeml.com",
  "mg.1winng-eml.com",
  "mg.1winng-eml1.com",
  "1win-mailing.com",
  "uo1.1w-mailer.com",
  "1win-smtpsender.com",
  "1w-mailer.com",
  "uo1.1win-smtpsender.com",
  "1w-partners.com",
  "partners1w.com",
  "partners-1w.com",
  "mg.1w-partners.com",
  "mg.partners1w.com",
  "mg.partners-1w.com",
  "1win-verification.com",
  "1win-verify.com",
  "mg.1win-verification.com",
  "mg.1win-verify.com",
  "providers-terms.com",
  "mg.1win-emlsender.com",
  "mg.1win-smtpeml.com",
  "1wgamer.com",
  "cdp.1wgamer.com",
  "mg.1wgamer.com",
  "mg2.1w-codesender.com",
  "mg.1w-codesender.com",
  "mg.1w-codesndr.com",
  "mg2.1win-nwseml.com",
  "1w-sender.com",
  "mg.1win-smtp.com",
  "1w-letters.com",
  "mg.1win-emlcdp.com",
  "mg.1w-letters.com",
  "sg.1win-smtpsender.com",
  "sg.1w-mailer.com",
  "mg.1win-emsender.com",
  "1wpartners-email.com",
  "mg.1wpartners-mail.com",
  "mg.1wpartners-email.com",
  "1wpartners-mail.com",
  "1wpartner.com",
  "mg.1wpartner.com",
  "1wpartners-serv.com",
  "us.1wpartners-serv.com",
  "1win-mailer.com",
  "1win-mailsndr.com",
  "mg.1win-mailer.com",
  "mg.1win-mailsndr.com",
  "1w-usmailing.com",
  "1wmailer-us.com",
  "1w-usemail.com",
  "1w-mailus.com",
  "1winmail-us.com",
  "1w-usmail.com",
  "1w-eml.com",
  "1w-send.com",
  "1w-post.com",
  "1winforce.com",
  "1w-mailing.com",
  "mg.1w-otpsndr.com",
  "mg.1win-dgst.com",
  "mg.1win-dgsteml.com",
  "mg.1w-eml.com",
  "mg.1w-send.com",
  "mg.1w-post.com",
  "mg.1winforce.com",
  "mg.1w-mailing.com",
  "vip-1win.com",
  "vip-1win.io",
  "1win-vipclub.com",
  "1win-vipclub.io",
  "vipclub-1win.com",
  "vipclub-1win.io",
  "1winteam.io",
  "mg.1win-trig.com",
  "1win-mailbox.com",
  "mg.1win-mailbox.com",
  "sg.1w-sender.com",
  "mg.1win-emsndr.com",
  "1win-sendmail.com",
  "1win-smtpsndr.com"
];
// ─────────────────────────────────────────────────────────────────────────────
// Утилиты логирования
function ts() {
  return new Date().toISOString();
}
function log(msg, level = "INFO") {
  console.log(`[${ts()}] [${level}] ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Запускаем браузер
async function launchBrowser() {
  log("Launching headless Chrome…", "START");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--disable-features=site-per-process",
      "--ignore-certificate-errors"
      // не используем --single-process — на Cloud Run иногда нестабилен
    ]
  });
  log("Headless Chrome is up", "SUCCESS");
  return browser;
}

// Навигация с ретраями и «мягкими» ожиданиями
async function safeGoto(page, url, label = "nav", attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
      // даём сети шанс догрузиться, но не ждём вечно
      await Promise.race([
        (page.waitForLoadState && page.waitForLoadState("networkidle")) ||
          page.waitForTimeout(2000),
        page.waitForTimeout(4000)
      ]);
      return;
    } catch (e) {
      log(`${label}: attempt ${i} failed: ${e.message}`, "WARNING");
      if (i === attempts) throw new Error(`${label}: ${e.message}`);
      await page.waitForTimeout(1500 * i);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Логин в Google с «приклейкой» к Postmaster
async function loginToGoogle(page) {
  const t0 = Date.now();
  log("Начинаем логин в Google…", "START");

  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    throw new Error("GOOGLE_EMAIL/GOOGLE_PASSWORD are not set");
  }

  try {
    await safeGoto(page, "https://accounts.google.com/", "open accounts");

    // Иногда мы уже авторизованы и попадаем на myaccount.*
    const already = await page.evaluate(() => location.hostname.includes("myaccount."));
    if (!already) {
      // email
      await page.waitForSelector('input[type="email"]', { timeout: 60000 });
      await page.click('input[type="email"]', { clickCount: 3 });
      await page.type('input[type="email"]', GOOGLE_EMAIL, { delay: 20 });
      await page.click("#identifierNext");

      // ждём поле пароля или шаги выбора аккаунта
      await Promise.race([
        page.waitForSelector('input[type="password"]', { timeout: 90000 }),
        page.waitForFunction(() => /signin\/v2\/challenge/.test(location.href), { timeout: 90000 })
      ]);

      // пароль, если спросили
      const hasPwd = await page.$('input[type="password"]');
      if (hasPwd) {
        await page.type('input[type="password"]', GOOGLE_PASSWORD, { delay: 20 });
        await page.click("#passwordNext");
      }

      // ждём появления авторизационных кук
      await page.waitForFunction(
        () =>
          document.cookie.includes("SID=") ||
          document.cookie.includes("SAPISID=") ||
          location.hostname.includes("myaccount."),
        { timeout: 120000 }
      );
    } else {
      log("Уже авторизованы в Google", "INFO");
    }

    // переносим сессию на postmaster.google.com
    await safeGoto(page, "https://postmaster.google.com/", "open postmaster");

    const needsSignIn = await page.evaluate(() =>
      (document.body.innerText || "").toLowerCase().includes("sign in")
    );
    if (needsSignIn) {
      log("Postmaster просит вход — повторная авторизация на этом домене…", "WARNING");

      await safeGoto(page, "https://accounts.google.com/", "reopen accounts");
      await page.waitForSelector('input[type="email"]', { timeout: 60000 });
      await page.click('input[type="email"]', { clickCount: 3 });
      await page.type('input[type="email"]', GOOGLE_EMAIL, { delay: 20 });
      await page.click("#identifierNext");
      await page.waitForSelector('input[type="password"]', { timeout: 90000 });
      await page.type('input[type="password"]', GOOGLE_PASSWORD, { delay: 20 });
      await page.click("#passwordNext");
      await page.waitForFunction(
        () => document.cookie.includes("SID=") || document.cookie.includes("SAPISID="),
        { timeout: 120000 }
      );

      await safeGoto(page, "https://postmaster.google.com/", "open postmaster (after relogin)");
    }

    await page.waitForTimeout(3000);
    log(`Логин успешен (${((Date.now() - t0) / 1000).toFixed(2)}s)`, "SUCCESS");
  } catch (err) {
    log(`Ошибка при логине: ${err.message}`, "ERROR");
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Поиск репутации домена на странице (shadow-DOM обход)
async function getDomainReputation(page, domain, index, total) {
  const startTime = Date.now();

  try {
    log(`[${index + 1}/${total}] Проверяем домен: ${domain}`, "PROCESS");

    const url = `https://postmaster.google.com/dashboards#do=${domain}&st=domainReputation&dr=7`;
    await safeGoto(page, url, `open reputation for ${domain}`);

    // если выбросило на логин — перелогиниваемся
    const onLoginPage = await page.evaluate(() =>
      (document.body.innerText || "").toLowerCase().includes("sign in")
    );
    if (onLoginPage) {
      log(`[${index + 1}/${total}] Обнаружена страница логина — повторная авторизация…`, "WARNING");
      await loginToGoogle(page);
      await safeGoto(page, url, `reopen reputation for ${domain}`);
    }

    // ждём рендер SPA (после networkidle данные ещё дорисовываются)
    await Promise.race([
      page.waitForFunction(
        () =>
          /Domain reputation|Репутация домена|High|Medium|Low|Bad|No data|Нет данных/i.test(
            document.body.innerText || ""
          ),
        { timeout: 20000 }
      ),
      page.waitForTimeout(6000)
    ]);

    const result = await page.evaluate(() => {
      const REPS = ["High", "Medium", "Low", "Bad", "Высокая", "Средняя", "Низкая", "Плохая"];

      function* deepWalk(root) {
        if (!root) return;
        yield root;
        const kids = root.children ? Array.from(root.children) : [];
        for (const el of kids) {
          yield* deepWalk(el);
          if (el.shadowRoot) yield* deepWalk(el.shadowRoot);
        }
        if (root.shadowRoot && root.shadowRoot.children) {
          for (const el of Array.from(root.shadowRoot.children)) yield* deepWalk(el);
        }
      }

      const t0 = (document.body.innerText || "").toLowerCase();
      if (t0.includes("no data")) return { hasData: false, reputation: null, debug: "No data label" };

      for (const node of deepWalk(document)) {
        const txt = (node && node.innerText ? node.innerText : "").trim();
        if (!txt) continue;
        const words = txt.split(/\s+/);
        for (const r of REPS) {
          if (txt === r || words.includes(r)) return { hasData: true, reputation: r, debug: "ok" };
        }
      }
      return { hasData: false, reputation: null, debug: "not found" };
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    if (!result.hasData || !result.reputation) {
      log(`[${index + 1}/${total}] ${domain}: Нет данных (${elapsed}s) — ${result.debug}`, "WARNING");
      return { domain, reputation: "No Data" };
    }

    log(`[${index + 1}/${total}] ${domain}: ${result.reputation} (${elapsed}s)`, "SUCCESS");
    return { domain, reputation: result.reputation };
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`[${index + 1}/${total}] ${domain}: Ошибка — ${error.message} (${elapsed}s)`, "ERROR");
    return { domain, reputation: "Error", error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP-эндпоинты

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: ts() });
});

app.get("/domains", (_req, res) => {
  res.json({ count: DOMAINS_LIST.length, domains: DOMAINS_LIST });
});

// Тест одного домена: /test-domain/:domain
app.get("/test-domain/:domain", async (req, res) => {
  const started = Date.now();
  const domain = req.params.domain;

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(120000);

    const rep = await (async () => {
      await loginToGoogle(page);
      return await getDomainReputation(page, domain, 0, 1);
    })();

    res.json({
      timestamp: ts(),
      domain: { domain, reputation: rep.reputation },
      totalTime: `${((Date.now() - started) / 1000).toFixed(2)}s`
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  } finally {
    try {
      if (browser) await browser.close();
    } catch {}
  }
});

// Батч-проверка доменов: /check-all-domains?start=0&limit=30
app.get("/check-all-domains", async (req, res) => {
  const started = Date.now();
  const start = Math.max(parseInt(req.query.start || "0", 10), 0);
  const limit = Math.max(parseInt(req.query.limit || "30", 10), 1);
  const slice = DOMAINS_LIST.slice(start, start + limit);

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(120000);

    await loginToGoogle(page);

    const results = [];
    for (let i = 0; i < slice.length; i++) {
      const d = slice[i];
      const rep = await getDomainReputation(page, d, i, slice.length);
      results.push(rep);
    }

    res.json({
      timestamp: ts(),
      batch: { start, limit, processed: slice.length },
      results,
      totalTime: `${((Date.now() - started) / 1000).toFixed(2)}s`
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  } finally {
    try {
      if (browser) await browser.close();
    } catch {}
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Старт сервера
app.listen(PORT, () => {
  log("═════════════════════════════════════════════════", "START");
  log(`Server started on :${PORT}`, "START");
  log(`Domains in list: ${DOMAINS_LIST.length}`, "INFO");
  log("Endpoints:", "INFO");
  log("  GET /health", "INFO");
  log("  GET /domains", "INFO");
  log("  GET /test-domain/:domain", "INFO");
  log("  GET /check-all-domains?start=0&limit=30", "INFO");
  log("═════════════════════════════════════════════════", "START");
});
