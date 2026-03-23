import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:5174");
await page.waitForSelector(".markmapSvg");
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const svg = document.querySelector(".markmapSvg");
  const nodes = svg.querySelectorAll(".markmap-node");
  const first = nodes[0];
  if (!first) return { error: "no nodes" };
  
  const fo = first.querySelector("foreignObject");
  const foChildren = fo ? [...fo.children].map(c => ({
    tag: c.tagName,
    className: c.className,
    innerHTML: c.innerHTML?.slice(0, 200),
    computedColor: getComputedStyle(c).color,
    computedBg: getComputedStyle(c).backgroundColor,
  })) : [];
  
  const text = first.querySelector("text");
  
  return {
    nodeChildTags: [...first.children].map(c => c.tagName),
    hasForeignObject: !!fo,
    foChildren,
    hasText: !!text,
    textContent: text?.textContent,
    textFill: text ? getComputedStyle(text).fill : null,
  };
});
console.log("Node structure:", JSON.stringify(info, null, 2));

// Switch to dark mode
await page.click('button:has-text("Dark")');
await page.waitForTimeout(500);

const darkInfo = await page.evaluate(() => {
  const svg = document.querySelector(".markmapSvg");
  const nodes = svg.querySelectorAll(".markmap-node");
  const results = [];
  for (const n of [...nodes].slice(0, 3)) {
    const fo = n.querySelector("foreignObject");
    const div = fo?.querySelector("div");
    const text = n.querySelector("text");
    results.push({
      label: div?.textContent?.trim() || text?.textContent?.trim(),
      divColor: div ? getComputedStyle(div).color : null,
      textFill: text ? getComputedStyle(text).fill : null,
      divBg: div ? getComputedStyle(div).backgroundColor : null,
    });
  }
  return results;
});
console.log("Dark mode nodes:", JSON.stringify(darkInfo, null, 2));

await browser.close();
