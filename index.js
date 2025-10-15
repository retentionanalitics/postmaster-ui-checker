const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

// Получаем креды из ENV
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
  console.error("❌ Не указаны GOOGLE_EMAIL или GOOGLE_PASSWORD в ENV");
  process.exit(1);
}

// Функция для логирования с timestamp
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

// Функция для логирования с timestamp
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

// Функция логина в Google
async function loginToGoogle(page) {
  const startTime = Date.now();
  log("Начинаем логин в Google...", "START");
  
  try {
    log("Переход на страницу авторизации Google");
    await page.goto("https://accounts.google.com/", { waitUntil: "networkidle2", timeout: 60000 });
    
    // Вводим email
    log("Ожидание поля email...");
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    log(`Ввод email: ${GOOGLE_EMAIL}`);
    await page.type('input[type="email"]', GOOGLE_EMAIL, { delay: 100 });
    await page.click("#identifierNext");
    
    // Ждем поле пароля
    log("Ожидание поля пароля...");
    await page.waitForSelector('input[type="password"]', { visible: true, timeout: 15000 });
    await page.waitForTimeout(1000); // Дополнительная пауза
    log("Ввод пароля...");
    await page.type('input[type="password"]', GOOGLE_PASSWORD, { delay: 100 });
    await page.click("#passwordNext");
    
    // Ждем завершения логина
    log("Ожидание завершения авторизации...");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    
    // Дополнительное ожидание после логина
    await page.waitForTimeout(3000);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Логин успешен (${elapsed}s)`, "SUCCESS");
  } catch (error) {
    log(`Ошибка при логине: ${error.message}`, "ERROR");
    throw error;
  }
}

// Функция получения списка доменов
async function getDomainsList(page) {
  const startTime = Date.now();
  log("Получение списка доменов...", "START");
  
  try {
    log("Переход на страницу /managedomains");
    await page.goto("https://postmaster.google.com/managedomains", { 
      waitUntil: "networkidle2",
      timeout: 60000 
    });
    
    // Дополнительное ожидание для загрузки Google Apps
    await page.waitForTimeout(5000);
    
    // Ждем таблицу с доменами (увеличенный таймаут)
    log("Ожидание загрузки таблицы с доменами...");
    await page.waitForSelector("table", { timeout: 30000 });
    
    const domains = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      const domainList = [];
      
      rows.forEach(row => {
        const domainCell = row.querySelector("td:first-child");
        if (domainCell) {
          const domain = domainCell.innerText.trim();
          if (domain) {
            domainList.push(domain);
          }
        }
      });
      
      return domainList;
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Найдено доменов: ${domains.length} (${elapsed}s)`, "SUCCESS");
    
    if (domains.length > 0) {
      log(`Список доменов: ${domains.slice(0, 5).join(", ")}${domains.length > 5 ? "..." : ""}`);
    }
    
    return domains;
  } catch (error) {
    log(`Ошибка при получении списка доменов: ${error.message}`, "ERROR");
    throw error;
  }
}

// Функция получения репутации для одного домена
async function getDomainReputation(page, domain, index, total) {
  const startTime = Date.now();
  
  try {
    log(`[${index + 1}/${total}] Проверяем домен: ${domain}`, "PROCESS");
    
    const url = `https://postmaster.google.com/dashboards#do=${domain}&st=domainReputation&dr=7`;
    log(`[${index + 1}/${total}] Переход на страницу репутации...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    
    // Дополнительное ожидание для загрузки динамического контента
    await page.waitForTimeout(5000);
    
    // Ждем таблицу с репутацией (увеличенный таймаут)
    log(`[${index + 1}/${total}] Ожидание загрузки данных...`);
    await page.waitForSelector("table", { timeout: 30000 });
    
    const reputation = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return null;
      
      const rows = table.querySelectorAll("tbody tr");
      if (rows.length === 0) return null;
      
      // Берем последнюю ячейку первой строки (самая свежая репутация)
      const firstCell = rows[0].querySelector("td:last-child");
      return firstCell ? firstCell.innerText.trim() : null;
    });
    
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

// Главный endpoint
app.get("/check-all-domains", async (req, res) => {
  const requestStartTime = Date.now();
  log("════════════════════════════════════════════════", "START");
  log("Получен запрос на проверку всех доменов", "START");
  log("════════════════════════════════════════════════", "START");
  
  let browser;
  try {
    log("Запуск браузера Puppeteer...", "PROCESS");
    const browserStartTime = Date.now();
    
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });
    
    const browserElapsed = ((Date.now() - browserStartTime) / 1000).toFixed(2);
    log(`Браузер запущен (${browserElapsed}s)`, "SUCCESS");
    
    const page = await browser.newPage();
    
    // Устанавливаем размер viewport (как настоящий браузер)
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Устанавливаем User-Agent
    log("Настройка браузера (User-Agent, viewport)...");
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    
    // Логинимся
    await loginToGoogle(page);
    
    // Получаем список доменов
    const domains = await getDomainsList(page);
    
    if (domains.length === 0) {
      log("Не найдено ни одного домена", "WARNING");
      log(`Общее время выполнения: ${((Date.now() - requestStartTime) / 1000).toFixed(2)}s`, "INFO");
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        domains: []
      });
    }
    
    log("────────────────────────────────────────────────", "INFO");
    log(`Начинаем проверку ${domains.length} доменов...`, "START");
    log("────────────────────────────────────────────────", "INFO");
    
    // Проверяем каждый домен
    const results = [];
    const domainsStartTime = Date.now();
    
    for (let i = 0; i < domains.length; i++) {
      const result = await getDomainReputation(page, domains[i], i, domains.length);
      results.push(result);
    }
    
    const domainsElapsed = ((Date.now() - domainsStartTime) / 1000).toFixed(2);
    const avgTimePerDomain = (domainsElapsed / domains.length).toFixed(2);
    
    log("────────────────────────────────────────────────", "INFO");
    log(`Все домены проверены за ${domainsElapsed}s (среднее: ${avgTimePerDomain}s/домен)`, "SUCCESS");
    
    // Статистика по результатам
    const stats = results.reduce((acc, r) => {
      if (r.reputation === "Error") acc.errors++;
      else if (r.reputation === "No Data") acc.noData++;
      else acc.success++;
      return acc;
    }, { success: 0, errors: 0, noData: 0 });
    
    log(`Статистика: успешно=${stats.success}, без данных=${stats.noData}, ошибок=${stats.errors}`, "INFO");
    
    const totalElapsed = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    log("════════════════════════════════════════════════", "SUCCESS");
    log(`Запрос завершен за ${totalElapsed}s`, "SUCCESS");
    log("════════════════════════════════════════════════", "SUCCESS");
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      domains: results,
      stats: {
        total: domains.length,
        success: stats.success,
        errors: stats.errors,
        noData: stats.noData,
        totalTime: `${totalElapsed}s`,
        avgTimePerDomain: `${avgTimePerDomain}s`
      }
    });
    
  } catch (error) {
    const totalElapsed = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    log("════════════════════════════════════════════════", "ERROR");
    log(`Критическая ошибка: ${error.message}`, "ERROR");
    log(`Stack trace: ${error.stack}`, "ERROR");
    log(`Время до ошибки: ${totalElapsed}s`, "ERROR");
    log("════════════════════════════════════════════════", "ERROR");
    
    res.status(500).json({ 
      error: "Internal error", 
      details: error.message 
    });
  } finally {
    if (browser) {
      log("Закрытие браузера...", "PROCESS");
      await browser.close();
      log("Браузер закрыт", "SUCCESS");
    }
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  log("Health check запрос", "INFO");
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint - показывает что на странице
app.get("/debug", async (req, res) => {
  log("════════════════════════════════════════════════", "START");
  log("DEBUG: Проверяем что происходит на странице", "START");
  log("════════════════════════════════════════════════", "START");
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    
    // Логинимся
    await loginToGoogle(page);
    
    // Переходим на страницу доменов
    log("Переход на /managedomains");
    await page.goto("https://postmaster.google.com/managedomains", { 
      waitUntil: "networkidle2",
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    // Получаем HTML страницы
    const html = await page.content();
    
    // Проверяем наличие разных элементов
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasTables: document.querySelectorAll('table').length,
        hasRows: document.querySelectorAll('tr').length,
        bodyText: document.body.innerText.substring(0, 500),
        allSelectors: {
          tables: document.querySelectorAll('table').length,
          divs: document.querySelectorAll('div').length,
          spans: document.querySelectorAll('span').length
        }
      };
    });
    
    log(`Найдено таблиц: ${pageInfo.hasTables}`, "INFO");
    log(`Найдено строк: ${pageInfo.hasRows}`, "INFO");
    
    res.status(200).json({
      pageInfo,
      htmlPreview: html.substring(0, 2000) // Первые 2000 символов HTML
    });
    
  } catch (error) {
    log(`Ошибка в debug: ${error.message}`, "ERROR");
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  log("════════════════════════════════════════════════", "START");
  log(`Сервер запущен на порту ${PORT}`, "START");
  log(`Email аккаунта: ${GOOGLE_EMAIL}`, "INFO");
  log(`Node.js версия: ${process.version}`, "INFO");
  log("Endpoints:", "INFO");
  log("  GET /check-all-domains - проверка всех доменов", "INFO");
  log("  GET /health - health check", "INFO");
  log("════════════════════════════════════════════════", "START");
});
