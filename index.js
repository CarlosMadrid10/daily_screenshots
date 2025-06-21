import puppeteer from 'puppeteer';
import { DateTime } from 'luxon';
import fs from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

const datas = await fs.readFile('./specs.json', 'utf8');
const specs = JSON.parse(datas);

const url = JSON.stringify(specs.url).length > 0 ? specs.url : "https://example.com";

const sizes = {
  width: specs.width ? specs.width : 0,
  height: specs.height ? specs.height : 0
};

const svgAsDataUri = async (filename) => {
  const svg = await fs.readFile(path.join(process.cwd(), 'icons', filename), 'utf8');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const icons = {
  apps: await svgAsDataUri('apps.svg'),
  wifi: await svgAsDataUri('wifi.svg'),
  brand: await svgAsDataUri('brand.svg'),
  power: await svgAsDataUri('power.svg'),
};

(async () => {
  const agora = DateTime.now().setZone('America/Sao_Paulo');
  const dataHora = `${agora.day} de ${agora.setLocale('pt-BR').toFormat('LLLL')} de ${agora.year}   ${agora.toFormat('HH:mm')}`;
  const fileName = `${agora.toFormat('yyyy-LL-dd')} ${Date.now()}.png`;
  const yearDir = path.join(process.cwd(), 'screenshots', agora.toFormat('yyyy'));
  const monthDir = path.join(yearDir, agora.toFormat('LL'));
  const outputPath = path.join(monthDir, fileName);
  await mkdir(monthDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: specs.headless,
    defaultViewport: { width: sizes.width, height: sizes.height },
    args: [`--window-size=${sizes.width},${sizes.height}`]
  });

  const hideSelectorsSpecs = specs.hideSelectors || [];

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.evaluate((dt, icons, selectorsToHide) => {
    const style = document.createElement('style');
    style.textContent = `
      #ubuntu-bar {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 60px;
        background: #2e2e2e;
        color: white;
        font-family: sans-serif;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        z-index: 1000000;
      }
      .ubuntu-left, .ubuntu-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ubuntu-center {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 26px;
      }
      .ubuntu-icon img {
        width: 26px;
        height: 26px;
      }
      .window-controls svg {
        width: 12px;
        height: 12px;
        cursor: pointer;
      }
      #chrome-ui {
        position: fixed;
        top: 60px;
        left: 0;
        width: 100%;
        z-index: 999999;
        font-family: Arial, sans-serif;
        background: #f1f3f4;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      .window-controls {
        height: 26px;
        background: #d6d6d6;
        display: flex;
        align-items: center;
        padding: 0 8px;
        gap: 8px;
      }
      .tab-bar {
        height: 36px;
        display: flex;
        align-items: center;
        background: #e8eaed;
        padding: 0 8px;
      }
      .tab {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 8px 8px 0 0;
        padding: 4px 12px;
        margin-right: 8px;
        font-size: 18px;
        color: black;
        box-shadow: 0 2px 2px rgba(0,0,0,0.1);
      }
      .tab img {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }
      .new-tab {
        font-size: 18px;
        cursor: pointer;
        color: #666;
      }
      .toolbar {
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        gap: 8px;
        background: #f1f3f4;
      }
      .toolbar .icon {
        width: 18px;
        height: 18px;
        background: #ccc;
        border-radius: 50%;
      }
      .address-bar {
        flex: 1;
        height: 36px;
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 0 12px;
        font-size: 19px;
        color: #333;
      }
      .address-bar .lock {
        width: 12px;
        height: 12px;
        background: gray;
        border-radius: 50%;
        margin-right: 8px;
      }
      .right-icons {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }
    `;
    document.head.appendChild(style);

    if (Array.isArray(selectorsToHide)) {
      selectorsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
      });
    }

    const bar = document.createElement('div');
    bar.id = 'ubuntu-bar';
    bar.innerHTML = `
      <div class="ubuntu-left">
        <div class="ubuntu-icon"><img src="${icons.apps}" /></div>
      </div>
      <div class="ubuntu-center">${dt}</div>
      <div class="ubuntu-right">
        <div class="ubuntu-icon"><img src="${icons.wifi}" /></div>
        <div class="ubuntu-icon"><img src="${icons.brand}" /></div>
        <div class="ubuntu-icon"><img src="${icons.power}" /></div>
      </div>
    `;

    const chrome = document.createElement('div');
    chrome.id = 'chrome-ui';
    chrome.innerHTML = `<div class="window-controls"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#e06c75" /></svg><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#e5c07b" /></svg><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#98c379" /></svg></div><div class="tab-bar"><div class="tab"><img src="https://www.google.com/favicon.ico" />${document.title}</div><div class="new-tab">+</div></div><div class="toolbar"><div class="icon"></div><div class="icon"></div><div class="icon"></div><div class="address-bar"><div class="lock"></div>${document.URL}</div><div class="right-icons"><div class="icon"></div><div class="icon"></div><div class="icon"></div></div></div>`;

    document.body.style.marginTop = '175px';
    document.body.prepend(chrome);
    document.body.prepend(bar);
  }, dataHora, icons, hideSelectorsSpecs);

  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.setViewport({ width: sizes.width, height: sizes.height });
  await page.screenshot({ path: outputPath, fullPage: specs.fullPage });
  await browser.close();
})();
