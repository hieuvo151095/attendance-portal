import { chromium } from 'playwright-core';
import fs from 'fs';

const ROOT = '/Users/hieuvo/Desktop/Finviet/Attendance Portal/docs/user-guide-deck/assets';
const SHOTS = `${ROOT}/shots`;
const CROPS = `${ROOT}/crops`;
for (const d of [SHOTS, CROPS]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }

const W = 1360, H = 765;
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true
});
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, locale: 'vi-VN' });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);

const calm = async () => { await page.mouse.move(W / 2, 2); await page.waitForTimeout(900); };
const clip = async (name, box) => { await calm(); await page.screenshot({ path: `${CROPS}/${name}.png`, clip: box }); console.log('crop', name, JSON.stringify(box)); };
const content = async (name, scroll = 0) => {
  await page.evaluate((y) => document.querySelector('main').scrollTo(0, y), scroll);
  await clip(name, { x: 240, y: 62, width: W - 240, height: H - 62 });
};
const nav = async (label) => {
  await page.locator('aside.ecomd-sidebar').getByText(label, { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('main').scrollTo(0, 0));
  await page.waitForTimeout(400);
};
const sheetBox = async () => await page.locator('[data-testid="sidesheet-overlay"] > *').last().boundingBox();

// ---------- Đăng nhập ----------
await page.goto('http://localhost:3000/?demo=0');
await page.evaluate(() => localStorage.clear());
await page.goto('http://localhost:3000/?demo=0');
await page.waitForSelector('#login-username');
const card = await page.locator('.login-page-container > div').first().boundingBox();
await clip('login-card', { x: card.x - 6, y: card.y - 6, width: card.width + 12, height: card.height + 12 });

await page.fill('#login-username', 'ubnd-tan-son-nhat');
await page.fill('#login-password', 'Finviet@2026');
await page.getByRole('button', { name: /Đăng nhập vào hệ thống/ }).click();
await page.waitForTimeout(1500);

// ---------- Tổng quan ----------
await content('dash-main', 0);
const side = await page.locator('aside.ecomd-sidebar').boundingBox();
await clip('sidebar-menu', { x: 0, y: 0, width: side.width, height: 345 });
await page.getByTestId('attendance-action-center-card').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const ac = await page.getByTestId('attendance-action-center-card').boundingBox();
const acY = Math.max(ac.y, 70);
await clip('action-center', { x: ac.x, y: acY, width: ac.width, height: Math.min(ac.height, H - acY) });

// ---------- Check-out bù ----------
await page.getByRole('button', { name: 'Check-out bù' }).first().click();
await page.waitForTimeout(2000);
let sb = await sheetBox();
await clip('checkout-sheet', { x: sb.x, y: 0, width: sb.width, height: 520 });
await page.getByRole('button', { name: 'Đóng', exact: true }).last().click();
await page.waitForTimeout(700);

// ---------- Chấm công (ngày 05/11 + thanh cảnh báo vàng) ----------
await nav('Chấm Công');
await content('att-main', 0);

// ---------- Cuộc họp ----------
await nav('Cuộc Họp');
await content('m-meetings', 140);
await page.getByText('Báo Cáo & Lưu Trữ Biên Bản', { exact: true }).click();
await page.waitForTimeout(1200);
await content('m-reports', 120);

// ---------- Nhân sự ----------
await nav('Nhân Sự');
await content('m-employees', 88);

// Lịch sử đồng bộ (viewport cao hơn để đủ 3 bản ghi)
await page.setViewportSize({ width: W, height: 880 });
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector('main').scrollTo(0, 330));
await page.waitForTimeout(500);
await page.locator('tbody tr').first().getByRole('button', { name: /Thao tác/ }).click();
await page.waitForTimeout(500);
await page.getByRole('menuitem', { name: /Lịch sử đồng bộ lên camera/ }).click({ force: true });
await page.waitForTimeout(1400);
sb = await sheetBox();
const tbl = await page.locator('[data-testid="sidesheet-overlay"] table').last().boundingBox();
await clip('history-sheet', { x: sb.x, y: 0, width: sb.width, height: Math.min(860, Math.round(tbl.y + tbl.height + 28)) });
await page.getByRole('button', { name: 'Đóng', exact: true }).last().click();
await page.waitForTimeout(700);
await page.setViewportSize({ width: W, height: H });
await page.waitForTimeout(500);

// Đồng bộ dữ liệu 3 bước
await page.evaluate(() => document.querySelector('main').scrollTo(0, 0));
await page.getByText(/Đồng bộ dữ liệu đến Camera/).first().click();
await page.waitForTimeout(1200);
sb = await sheetBox();
await clip('sync-sheet', { x: sb.x, y: 0, width: sb.width, height: H });
await page.getByRole('button', { name: /Hủy bỏ/ }).first().click();
await page.waitForTimeout(700);

// ---------- Phòng ban ----------
await nav('Phòng Ban');
await content('m-departments', 0);

// ---------- Thiết lập ----------
await nav('Thiết Lập');
await content('m-settings', 0);
await page.getByTestId('settings-tab-devices').click();
await page.waitForTimeout(800);
await content('m-devices', 150);

await browser.close();
console.log('ALL DONE 4');
