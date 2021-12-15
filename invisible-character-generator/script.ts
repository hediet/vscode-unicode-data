import puppeteer = require("puppeteer");
import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";

(async () => {
	const e = await getData();
	mkdirSync('./out/', { recursive: true });
	writeFileSync(
		"./out/invisible-characters.json",
		JSON.stringify(e, null, 2),
		{ encoding: "utf8" }
	);
})();


interface InvisibleCharacter {
	codePoint: number;
	width: number;
}

async function getData(): Promise<InvisibleCharacter[]> {
	const browser = await puppeteer.launch({ devtools: true, headless: false });
	const page = await browser.newPage();

	let resolvePromise: (value: InvisibleCharacter[]) => void;
	const finishedPromise = new Promise<InvisibleCharacter[]>(resolve => {
		resolvePromise = resolve;
	});

	await page.exposeFunction("handleData", (e: InvisibleCharacter[]) => {
		resolvePromise(e);
	});

	await page.goto(fileUrl(resolve(__dirname, "./browser-index.html")), {
		waitUntil: "load"
	});
	console.log('loaded');

	const result = await finishedPromise;
	await browser.close();
	return result;
}

function fileUrl(filePath: string) {
	if (typeof filePath !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof filePath}`);
	}

	let pathName = filePath;
	pathName = pathName.replace(/\\/g, '/');

	// Windows drive letter must be prefixed with a slash.
	if (pathName[0] !== '/') {
		pathName = `/${pathName}`;
	}

	// Escape required characters for path components.
	// See: https://tools.ietf.org/html/rfc3986#section-3.3
	return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}
