// Prints the /cv page to a PDF with headless Chrome. The build uses it to write
// dist/resume.pdf, and the dev server uses it to answer /resume.pdf on request, so the
// "Download CV" link works in both and always matches the site's content.
//
// Uses the Chrome already installed (puppeteer-core downloads no browser); set CHROME_PATH
// if it isn't found.
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

/** The installed Chrome, or undefined. */
export function findChrome() {
  return [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((path) => path && existsSync(path));
}

/** Renders `${base}cv` as an A4 PDF and returns its bytes. */
export async function renderResume(chrome, base) {
  // GitHub's Ubuntu runners don't allow Chrome's sandbox.
  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: process.env.CI ? ["--no-sandbox"] : [],
  });
  try {
    const page = await browser.newPage();
    // ?pdf=1 makes the page link to the public site rather than to the server printing it.
    await page.goto(new URL("cv?pdf=1", base).href, { waitUntil: "networkidle0" });
    await page.waitForSelector("[data-cv]");
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      preferCSSPageSize: true,
      printBackground: false,
      tagged: true,
      outline: true,
    });
  } finally {
    await browser.close();
  }
}
