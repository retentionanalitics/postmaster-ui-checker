const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

// Получаем креды из ENV
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

// Список доменов для проверки
const DOMAINS_LIST = [
  "mgn.1win.mx", "mg1.1win.mx", "mgn.1win.ng", "mg2.1win.mx", "mg3.1win.mx",
  "mg2.1win.ng", "mg3.1win.ng", "mg.1win-mail-30.com", "mg.1wpartners-serv.com",
  "mg.1w-usmailing.com", "mg.1w-mailsender.com", "mg.1win-smtpconnect.com",
  "mg.1win-smtpsndr.com", "mg1.1win.ng", "mg2.1win-mailing.com", "mg3.1win-mailing.com",
  "mg.1win-mail-24.com", "mg.1win-mail-25.com", "mg.1win-mail-26.com", "mg.1win-mail-27.com",
  "mg.1win-mail-28.com", "mg.1win-mail-29.com", "topx.one", "sending.topx.one",
  "mg.1win-mail-21.com", "mg.1win-mail-22.com", "mg.1win.xyz", "1win-nws.com",
  "1w-auth.com", "1w-codesender.com", "1w-codesndr.com", "1w-otpsender.com",
  "1w-otpsndr.com", "1win-codesender.com", "1win-codesndr.com", "1win-dgst.com",
  "1win-dgsteml.com", "1win-emlcdp.com", "1win-emlsender.com", "1win-emlsndr.com",
  "1win-emsender.com", "1win-emsndr.com", "1win-nwseml.com", "1win-nwslttr.com",
  "1win-otpsender.com", "1win-otpsndr.com", "1win-smtp.com", "1win-smtpeml.com",
  "1win-trig.com", "1win-trigeml.com", "1winmx-eml.com", "1winmx-eml1.com",
  "1winmx-eml2.com", "1winng-eml.com", "1winng-eml1.com", "1winng-eml2.com",
  "1win.cash", "1win-sender.com", "cdp.1w-sender.com", "mg.1win-sender.com",
  "mg.1winin-inbox.com", "mg.1win-trigeml.com", "mg.1winng-eml.com", "mg.1winng-eml1.com",
  "1win-mailing.com", "uo1.1w-mailer.com", "1win-smtpsender.com", "1w-mailer.com",
  "uo1.1win-smtpsender.com", "1w-partners.com", "partners1w.com", "partners-1w.com",
  "mg.1w-partners.com", "mg.partners1w.com", "mg.partners-1w.com", "1win-verification.com",
  "1win-verify.com", "mg.1win-verification.com", "mg.1win-verify.com", "providers-terms.com",
  "mg.1win-emlsender.com", "mg.1win-smtpeml.com", "1wgamer.com", "cdp.1wgamer.com",
  "mg.1wgamer.com", "mg2.1w-codesender.com", "mg.1w-codesender.com", "mg.1w-codesndr.com",
  "mg2.1win-nwseml.com", "1w-sender.com", "mg.1win-smtp.com", "1w-letters.com",
  "mg.1win-emlcdp.com", "mg.1w-letters.com", "sg.1win-smtpsender.com", "sg.1w-mailer.com",
  "mg.1win-emsender.com", "1wpartners-email.com", "mg.1wpartners-mail.com",
  "mg.1wpartners-email.com", "1wpartners-mail.com", "1wpartner.com", "mg.1wpartner.com",
  "1wpartners-serv.com", "us.1wpartners-serv.com", "1win-mailer.com", "1win-mailsndr.com",
  "mg.1win-mailer.com", "mg.1win-mailsndr.com", "1w-usmailing.com", "1wmailer-us.com",
  "1w-usemail.com", "1w-mailus.com", "1winmail-us.com", "1w-usmail.com",
  "1w-eml.com", "1w-send.com", "1w-post.com", "1winforce.com", "1w-mailing.com",
  "mg.1w-otpsndr.com", "mg.1win-dgst.com", "mg.1win-dgsteml.com", "mg.1w-eml.com",
  "mg.1w-send.com", "mg.1w-post.com", "mg.1winforce.com", "mg.1w-mailing.com",
  "vip-1win.com", "vip-1win.io", "1win-vipclub.com", "1win-vipclub.io",
  "vipclub-1win.com", "vipclub-1win.io", "1winteam.io", "mg.1win-trig.com",
  "1win-mailbox.com", "mg.1win-mailbox.com", "sg.1w-sender.com", "mg.1win-emsndr.com",
  "1win-sendmail.com", "1win-smtpsndr.com"
];

if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
  console.error("❌ Не указаны GOOGLE_EMAIL или GOOGLE_PASSWORD в ENV");
  process.exit(1);
}

function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const emoji = {
    INFO: "ℹ️",
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    START: "🚀",
    PROCESS: "⚙️"
  }[level] || "📝";
  console.log(`[${timestamp}] ${emoji} ${message}`);
}

async function loginToGoogle(page) {
  const startTime = Date.now();
  log("Начинаем логин в Google...", "START");
  
  try {
    await page.goto("https://accounts.google.com/", { waitUntil: "networkidle2", timeout: 20000 });
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.type('input[type="email"]', GOOGLE_EMAIL, { delay: 100 });
    await page.click("#identifierNext");
    await page.waitForSelector('input[type="password"]', { visible: true, timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.type('input[type="password"]', GOOGLE_PASSWORD, { delay: 100 });
    await page.click("#passwordNext");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Логин успешен (${elapsed}s)`, "SUCCESS");
  } catch (error) {
    log(`Ошибка при логине: ${error.message}`, "ERROR");
    throw error;
  }
}

async function getDomainReputation(page, domain, index, total) {
  const startTime = Date.now();
  
  try {
    log(`[${index + 1}/${total}] Проверяем домен: ${domain}`, "PROCESS");
    
    const url = `https://postmaster.google.com/dashboards#do=${domain}&st=domainReputation&dr=7`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    
    let reputation = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts && !reputation) {
      await page.waitForTimeout(3000);
      attempts++;
      
      reputation = await page.evaluate(() => {
        const noDataDiv = document.querySelector('.W-X-m');
        if (noDataDiv && noDataDiv.innerText.includes('No data to display')) {
          return null;
        }
        
        const table = document.querySelector('table.google-visualization-table-table');
        if (!table) return null;
        
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return null;
        
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        
        if (cells.length < 2) return null;
        
        const reputationCell = cells[cells.length - 1];
        const text = reputationCell.innerText.trim();
        
        if (text && text.length > 0 && isNaN(text)) {
          return text;
        }
        
        return null;
      });
      
      if (reputation) break;
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!reputation) {
      log(`[${index + 1}/${total}] ${domain}: Нет данных (${elapsed}s)`, "WARNING");
      return { domain, reputation: "No Data" };
    }
    
    log(`[${index + 1}/${total}] ${domain}: ${reputation} (${elapsed}s)`, "SUCCESS");
    return { domain, reputation };
    
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`[${index + 1}/${total}] ${domain}: Ошибка - ${error.message} (${elapsed}s)`, "ERROR");
    return { domain, reputation: "Error", error: error.message };
  }
}

app.get("/check-all-domains", async (req, res) => {
  const requestStartTime = Date.now();
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 30;
  
  log("════════════════════════════════════════════════", "START");
  log(`Получен запрос (start=${start}, limit=${limit})`, "START");
  log("════════════════════════════════════════════════", "START");
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    
    await loginToGoogle(page);
    
    const allDomains = DOMAINS_LIST;
    const domains = allDomains.slice(start, start + limit);
    
    log(`Проверяем батч: ${start}-${start + domains.length - 1}`, "INFO");
    
    if (domains.length === 0) {
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        batch: { start, limit, total: allDomains.length, processed: 0 },
        domains: []
      });
    }
    
    const results = [];
    for (let i = 0; i < domains.length; i++) {
      const result = await getDomainReputation(page, domains[i], i, domains.length);
      results.push(result);
    }
    
    const stats = results.reduce((acc, r) => {
      if (r.reputation === "Error") acc.errors++;
      else if (r.reputation === "No Data") acc.noData++;
      else acc.success++;
      return acc;
    }, { success: 0, errors: 0, noData: 0 });
    
    const totalElapsed = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    log(`Запрос завершен за ${totalElapsed}s`, "SUCCESS");
    
    const nextStart = start + limit;
    const hasMore = nextStart < allDomains.length;
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      batch: {
        start,
        limit,
        total: allDomains.length,
        processed: domains.length,
        nextStart: hasMore ? nextStart : null,
        hasMore
      },
      domains: results,
      stats: {
        total: domains.length,
        success: stats.success,
        errors: stats.errors,
        noData: stats.noData,
        totalTime: `${totalElapsed}s`,
        avgTimePerDomain: `${(totalElapsed / domains.length).toFixed(2)}s`
      }
    });
    
  } catch (error) {
    log(`Критическая ошибка: ${error.message}`, "ERROR");
    res.status(500).json({ error: "Internal error", details: error.message });
  } finally {
    if (browser) {
      await browser.close();
      log("Браузер закрыт", "SUCCESS");
    }
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get("/domains", (req, res) => {
  res.status(200).json({ domains: DOMAINS_LIST, total: DOMAINS_LIST.length });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  log(`Сервер запущен на порту ${PORT}`, "START");
  log(`Доменов в списке: ${DOMAINS_LIST.length}`, "INFO");
});
