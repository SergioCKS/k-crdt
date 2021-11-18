
import * as engine_bg from "./engine_bg.mjs";
import _wasm from "./engine_bg.wasm";
const _wasm_memory = new WebAssembly.Memory({initial: 512});
let importsObject = {
    env: { memory: _wasm_memory },
    "./engine_bg.js": engine_bg
};
export default new WebAssembly.Instance(_wasm, importsObject).exports;
