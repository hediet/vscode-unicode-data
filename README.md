# Visual Studio Code Unicode Data Generator

This tool collects invisible and ambiguous unicode characters to be highlighted in VSCode.

See `InvisiblieCharacters` and `AmbiguousCharacters` in [strings.ts](https://github.com/microsoft/vscode/blob/main/src/vs/base/common/strings.ts).

## Usage

Currently only Windows is supported


Check out [vscode-loc](https://github.com/microsoft/vscode-loc) into `C:\\dev\\microsoft\\vscode-loc`.

Remove `.cache` if it is older than vscode-loc.

Compile `rust-unicode-histogram`. You need rust and cargo:

```sh
cd rust-unicode-histogram
cargo build
```

Install npm dependencies:

```sh
yarn
```

Run generator scripts:

```sh
yarn generate-invisible-characters
yarn generate-data
```