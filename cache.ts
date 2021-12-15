import * as fs from "fs";

export function cached<TArgs extends any[], TResult>(identifier: string, func: (...args: TArgs) => TResult): (...args: TArgs) => TResult {
    const cachePath = `${process.cwd()}/.cache/${identifier}.json`;
    const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

    return (...args: TArgs): TResult => {
        const key = JSON.stringify([args, func.toString()]);
        if (cache[key]) {
            return cache[key];
        }

        const result = func(...args);
        cache[key] = result;
        fs.mkdirSync(`${process.cwd()}/.cache`, { recursive: true });
        fs.writeFileSync(cachePath, JSON.stringify(cache));
        return result;
    }
}