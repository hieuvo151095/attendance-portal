import { chromium } from 'playwright-core';
import fs from 'fs';

const ROOT = '/Users/hieuvo/Desktop/Finviet/Attendance Portal/docs/user-guide-deck';
const PREV = '/tmp/finviet-deck-preview';
fs.mkdirSync(PREV, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('file://' + ROOT + '/index.html');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const slides = await page.locator('section.slide').all();
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: `${PREV}/slide-${String(i + 1).padStart(2, '0')}.png` });
}
console.log('slides:', slides.length);

await page.pdf({
  path: ROOT + '/Finviet_Attendance_Portal_User_Guide_Deck.pdf',
  width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true
});
console.log('pdf done');
await browser.close();
