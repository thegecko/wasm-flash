# WebAssembly Device Flasher

[![Circle CI](https://img.shields.io/circleci/project/thegecko/wasm-flash.svg)](https://circleci.com/gh/thegecko/wasm-flash)

Flash firmware to DAPLink enabled devices from the web using WebAssembly

https://thegecko.github.io/wasm-flash/

## Development

### Prerequisites

[Node.js > v10.0.0](https://nodejs.org), which includes `npm`

[Emscripten](https://emscripten.org/) installed in `~/emsdk`

### Installation

After cloning this repository, install the development dependencies:

```bash
$ npm install
```

### Building

```bash
$ npm run build
```

You can also watch changes to the typescript files with:

```bash
$ npm run watch
```
