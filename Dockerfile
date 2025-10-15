FROM node:20-slim

# Установка зависимостей для Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    libxss1 \
    libdrm2 \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем package.json СНАЧАЛА для кеширования слоя с зависимостями
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем остальные файлы ПОСЛЕ установки зависимостей
COPY . .

# ENV переменные
ENV GOOGLE_EMAIL=postmstrwin@gmail.com
ENV GOOGLE_PASSWORD="j,7UJ=V96;#zi6,mg~5AX&s!"
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
