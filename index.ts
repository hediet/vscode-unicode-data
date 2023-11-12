import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as scriptData from "ucd-full/Scripts.json";
import * as blockData from "ucd-full/Blocks.json";
import { exec, execSync } from "child_process";
import { cached } from "./cache";
import { resolve, join as joinPath } from "path";

function hexToNum(hex: string): number {
    return parseInt(hex, 16);
}

function getScriptData() {
	const out: Record<string, [number[], number[]]> = {};

	const scripts = new Set(scriptData.Scripts.map((s) => s.script));

	for (const script of scripts) {
		const starts = new Array<number>();
		const lengths = new Array<number>();

		for (const s of scriptData.Scripts) {
			if (s.script === script) {
				const start = hexToNum(s.range[0]);
				starts.push(start);
				const end = hexToNum(s.range[1] ?? s.range[0]);
				const length = end - start + 1;
				lengths.push(length);
			}
		}

		out[script] = [starts, lengths];
	}
    return out;
}

function getBlocks() {
    const out: Record<string, [number, number]> = {};

    for (const block of blockData.Blocks) {
        const start = hexToNum(block.range[0]);
        const end = hexToNum(block.range[1] ?? block.range[0]);
        const length = end - start + 1;
        out[block.block] = [start, length];
    }
    return out;
}


function getConfusablesData(): Map<number, number> {
    const content = readFileSync("./data/confusables.txt", {
		encoding: "utf8",
	});

	const lines = content.split("\n");
	const regex = /^([0-9A-F]+)(\s+);(\s+)([0-9A-F]+)(\s+);/;

	const confusables = new Map<number, number>();

	for (let line of lines) {
		line = line.trim();
		if (line.length === 0) {
			continue;
		}
		if (line.startsWith("#")) {
			continue;
		}

		const match = line.match(regex);
		if (match === null) {
            continue;
			//throw new Error("Invalid line: " + line);
		}

		const from = hexToNum(match[1]);
		const to = hexToNum(match[4]);

        confusables.set(from, to);
	}

    function expectDefined<T>(value: T | undefined): T {
        if (value === undefined) {
            throw new Error('Undefined value');
        }
        return value;
    }

    const overrides = JSON.parse(readFileSync("./data/confusable-overrides.json", { encoding: "utf8" })) as Record<string, string | null>;
    for (const [confusable, representant] of Object.entries(overrides)) {
        const key = expectDefined(confusable.codePointAt(0));
        if (representant === null) {
            confusables.delete(key);
        } else {
            confusables.set(key, expectDefined(representant.codePointAt(0)));
        }
    }

	return confusables;
}

const confusableData = getConfusablesData();

function getConfusableRepresentant(c: number): number {
    let chars = new Array<string>();
    let i = 0;
    while (i < 10) {
        i++;
        chars.push(String.fromCodePoint(c) + ' ' + c);
        let x = confusableData.get(c) ?? c;
        if (x === c) {
            return c;
        }
        c = x;
    }

    throw new Error('Error: ' + chars.join(' -> '));
}

function getAllConfusables() {
    return new Set([...confusableData.keys(), ...confusableData.values()]);
}

function getExceptionsFromVsCodeLocCached() {
    const data = cached('getExceptionsFromVsCodeLoc', getExceptionsFromVsCodeLoc)();
    const result: Record<string, Set<number>> = {};
    for (const [language, exceptions] of Object.entries(data)) {
        result[language] = new Set(exceptions);
    }
    return result;
}

function getExceptionsFromVsCodeLoc(): Record< /* language code */ string, number[]> {
    const result: Record<string, number[]> = {};

    const folder = joinPath("..", "vscode-loc", "i18n");
    const subFolders = readdirSync(folder);
    for (const subFolder of subFolders) {
        
        const match = subFolder.match(/vscode-language-pack-(.*)?/);
        if (match === null) {
            continue;
        }
        const language = match[1];


        const script = resolve(__dirname, "./rust-unicode-histogram/target/debug/rust-unicode-histogram");
        const output = execSync(`${script} **/*.json`, {
            cwd: joinPath(folder, subFolder),
            encoding: "utf8",
            shell: process.platform === "win32" ? process.env.ComSpec : "zsh",
        });
        const histogram = JSON.parse(output) as { code_point_counts: Record<string, number> };

        const exceptions = Object.keys(histogram.code_point_counts).map((e) => e.codePointAt(0)!);
        result[language] = exceptions;
    }

    return result;
}

function getBasicASCIICharacters() {
    const result = new Set<number>();
    for (let i = 0x20; i <= 0x7E; i++) {
        result.add(i);
    }
    return result;
}

const basicASCIICharacters = getBasicASCIICharacters();

// All non-basic ascii characters (key) that are confusable with a basic ascii character (value)
function ambiguousCharacters(): Map<number, number> {
	const result = new Map<number, number>();

	const basicASCIIConfusableRepresentants = new Map<number, number>(
		[...basicASCIICharacters].map((c) => [getConfusableRepresentant(c), c])
	);

	for (const confusable of getAllConfusables()) {
        const representant = getConfusableRepresentant(confusable);
		if (
			basicASCIIConfusableRepresentants.has(representant) &&
			!basicASCIICharacters.has(confusable)
		) {
			result.set(
				confusable,
				basicASCIIConfusableRepresentants.get(representant)!
			);
		}
	}

	return result;
}

function intersectSet(a: Set<number>, b: Set<number> | undefined): Set<number> {
    if (b === undefined) {
        return a;
    }
    const result = new Set<number>();
    for (const e of a) {
        if (b.has(e)) {
            result.add(e);
        }
    }
    return result;
}

function intersectMap(a: Map<number, number>, b: Map<number, number> | undefined): Map<number, number> {
    if (b === undefined) {
        return a;
    }
    const result = new Map<number, number>();
    for (const e of a.keys()) {
        if (b.has(e)) {
            result.set(e, b.get(e)!);
        }
    }
    return result;
}

function setMinus(a: Set<number>, b: Set<number>): Set<number> {
    const result = new Set<number>();
    for (const e of a) {
        if (!b.has(e)) {
            result.add(e);
        }
    }
    return result;
}

function mapMinus(a: Map<number, number>, b: Map<number, number>): Map<number, number> {
    const result = new Map<number, number>();
    for (const e of a.keys()) {
        if (!b.has(e)) {
            result.set(e, a.get(e)!);
        }
    }
    return result;
}

function getAmbiguousData() {
    const ambiguousChars = ambiguousCharacters();
    console.log(`Total number of ambiguous characters: ${ambiguousChars.size}`);

    let commonAmbiguousChars: Map<number, number> | undefined = undefined;

    let ambiguousCharsPerLanguage: Record<string, Map<number, number>> = {};

    const exceptionsPerLang = getExceptionsFromVsCodeLocCached();
    for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
        const cleanedAmbiguousChars = new Map(ambiguousChars);
        for (const exception of exceptions) {
            cleanedAmbiguousChars.delete(exception);
        }
        ambiguousCharsPerLanguage[language] = cleanedAmbiguousChars;
        console.log(`Total number of ambiguous characters in ${language}: ${cleanedAmbiguousChars.size}`);

        commonAmbiguousChars = intersectMap(cleanedAmbiguousChars, commonAmbiguousChars);
    }

    commonAmbiguousChars = commonAmbiguousChars!;
    console.log(`Total number of common ambiguous characters: ${commonAmbiguousChars.size}`);

    const formatted: Record<string, Record<string, string>> = {};
    {
        formatted["_common"] = Object.fromEntries([...commonAmbiguousChars].map(([c, c2]) => [String.fromCodePoint(c), String.fromCodePoint(c2)]));
        formatted["_default"] = Object.fromEntries([...mapMinus(ambiguousChars, commonAmbiguousChars)].map(([c, c2]) => [String.fromCodePoint(c), String.fromCodePoint(c2)]));
        for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
            const cleanedAmbiguousChars = mapMinus(ambiguousCharsPerLanguage[language], commonAmbiguousChars);
            formatted[language] = Object.fromEntries([...cleanedAmbiguousChars].map(([c, c2]) => [String.fromCodePoint(c), String.fromCodePoint(c2)]));
        }
    }

    const raw: Record<string, number[]> = {};
    {
        function toNumberArray(m: Map<number, number>): number[] {
            const result = new Array<number>();
            for (const [k, v] of m) {
                result.push(k);
                result.push(v);
            }
            return result;
        }

        raw["_common"] = toNumberArray(commonAmbiguousChars);
        raw["_default"] = toNumberArray(mapMinus(ambiguousChars, commonAmbiguousChars));
        for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
            const cleanedAmbiguousChars = mapMinus(ambiguousCharsPerLanguage[language], commonAmbiguousChars);
            raw[language] = toNumberArray(cleanedAmbiguousChars);
        }
    }

    return {
        formatted,
        raw
    };
}

function getInvisibleCharactersData() {
    const data = JSON.parse(readFileSync("./out/invisible-characters.json", { encoding: "utf8" })) as { codePoint: number, width: number }[];
    const invisibleChars = data.map((e) => e.codePoint);


    let commonInvisibleChars: Set<number> | undefined = undefined;

    let invisibleCharsPerLanguage: Record<string, Set<number>> = {};

    const exceptionsPerLang = getExceptionsFromVsCodeLocCached();
    for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
        const cleanedAmbiguousChars = new Set(invisibleChars);
        for (const exception of exceptions) {
            cleanedAmbiguousChars.delete(exception);
        }
        invisibleCharsPerLanguage[language] = cleanedAmbiguousChars;
        console.log(`Total number of ambiguous characters in ${language}: ${cleanedAmbiguousChars.size}`);

        commonInvisibleChars = intersectSet(cleanedAmbiguousChars, commonInvisibleChars);
    }

    commonInvisibleChars = commonInvisibleChars!;

    console.log(`Total number of common ambiguous characters: ${commonInvisibleChars.size}`);
    const outFormatted: Record<string, string[]> = {};
    {
        outFormatted["_common"] = [...commonInvisibleChars].map(c => String.fromCodePoint(c));
        for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
            const cleanedAmbiguousChars = setMinus(invisibleCharsPerLanguage[language], commonInvisibleChars);
            outFormatted[language] = [...cleanedAmbiguousChars].map(c => String.fromCodePoint(c));
        }
    }

    const out: Record<string, number[]> = {};
    {
        out["_common"] = [...commonInvisibleChars].map(c => c);
        for (const [language, exceptions] of Object.entries(exceptionsPerLang)) {
            const cleanedAmbiguousChars = setMinus(invisibleCharsPerLanguage[language], commonInvisibleChars);
            out[language] = [...cleanedAmbiguousChars].map(c => c);
        }
    }

    return {
        formatted: outFormatted,
        raw: out,
    };
}

function writeJsonData(path: string, data: unknown, formatted: boolean) {
    writeFileSync(
		path,
		formatted
			? JSON.stringify(data, undefined, 4)
			: JSON.stringify(data),
		{ encoding: "utf8" }
	);
}

{
    const data = getScriptData();
    writeJsonData("./out/scripts.json", JSON.stringify(data), false);
}

{
    const blocks = getBlocks();
    writeJsonData("./out/blocks.json", JSON.stringify(blocks), false);
}

{
    const data = getAmbiguousData();
    writeJsonData("./out/ambiguous-formatted.json", data.formatted, true);
    writeJsonData("./out/ambiguous.json", JSON.stringify(data.raw), false);
}

{
    const data = getInvisibleCharactersData();
    writeJsonData("./out/invisibleCharacters-formatted.json", data.formatted, true);
    writeJsonData("./out/invisibleCharacters.json", JSON.stringify(data.raw), false);
}
