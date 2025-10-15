FROM ghcr.io/puppeteer/puppeteer:21.11.0

# Переключаемся на root для установки зависимостей
USER root

# Устанавливаем Node.js зависимости
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем остальные файлы
COPY . .

# ENV переменные
ENV GOOGLE_EMAIL=postmstrwin@gmail.com
ENV GOOGLE_PASSWORD="j,7UJ=V96;#zi6,mg~5AX&s!"
ENV PORT=8080

# Puppeteer уже настроен в базовом образе, поэтому эти ENV не нужны
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 8080

# Возвращаемся к пользователю pptruser (безопаснее)
USER pptruser

CMD ["node", "index.js"]
