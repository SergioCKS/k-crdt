
let wasm;

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* @returns {number}
*/
export function test_clock() {
    var ret = wasm.test_clock();
    return ret >>> 0;
}

/**
* ## CRDT Engine
*
* Representation of a CRDT engine.
*/
export class Engine {

    static __wrap(ptr) {
        const obj = Object.create(Engine.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_engine_free(ptr);
    }
    /**
    * ### New CRDT engine
    *
    * Creates an engine instance.
    *
    * * `node_id` - The ID of the node in the system.
    *     Can be omitted and set after engine creation.
    * @param {string} node_id
    * @returns {Engine}
    */
    static new(node_id) {
        var ptr0 = passStringToWasm0(node_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.engine_new(ptr0, len0);
        return Engine.__wrap(ret);
    }
    /**
    * ### Restore state
    *
    * Restores the state of the counter from a serialized string.
    *
    * * `serialized` - JSON-serialized counter state.
    * @param {string | undefined} serialized
    */
    restore_state(serialized) {
        var ptr0 = isLikeNone(serialized) ? 0 : passStringToWasm0(serialized, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.engine_restore_state(this.ptr, ptr0, len0);
    }
    /**
    * ### Restore register
    *
    * Restores the state of the register from a serialized string.
    *
    * * `serialized` - JSON-serialized counter state.
    * @param {string | undefined} serialized
    */
    restore_register(serialized) {
        var ptr0 = isLikeNone(serialized) ? 0 : passStringToWasm0(serialized, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.engine_restore_register(this.ptr, ptr0, len0);
    }
    /**
    * ### Set node ID
    *
    * Sets the ID of the node in the system.
    * @param {string} node_id
    */
    set_node_id(node_id) {
        var ptr0 = passStringToWasm0(node_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.engine_set_node_id(this.ptr, ptr0, len0);
    }
    /**
    * ### Set time offset
    *
    * Sets the time offset of the node.
    * @param {number} time_offset
    */
    set_time_offset(time_offset) {
        wasm.engine_set_time_offset(this.ptr, time_offset);
    }
    /**
    * ### Get node ID
    *
    * Returns the node ID associated with the engine.
    * @returns {string}
    */
    get_node_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_get_node_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * ### Get time offset
    *
    * Returns the time offset of the node.
    * @returns {number}
    */
    get_time_offset() {
        var ret = wasm.engine_get_time_offset(this.ptr);
        return ret;
    }
    /**
    * ### Get counter value
    *
    * Returns the current value of the counter.
    * @returns {number}
    */
    get_counter_value() {
        var ret = wasm.engine_get_counter_value(this.ptr);
        return ret >>> 0;
    }
    /**
    * ### Get register value
    *
    * Returns the current value of the register.
    * @returns {boolean}
    */
    get_register_value() {
        var ret = wasm.engine_get_register_value(this.ptr);
        return ret !== 0;
    }
    /**
    * ### Increment counter
    *
    * Increments the counter by 1 as the node associated with the engine.
    */
    increment_counter() {
        wasm.engine_increment_counter(this.ptr);
    }
    /**
    * ### Decrement counter
    *
    * Decrements the counter by 1 as the node associated with the engine.
    */
    decrement_counter() {
        wasm.engine_decrement_counter(this.ptr);
    }
    /**
    * ### Toggle register value
    *
    * Flips the value of the register.
    */
    toggle_register() {
        wasm.engine_toggle_register(this.ptr);
    }
    /**
    * ### Serialize counter
    *
    * Serialize the counter as JSON.
    * @returns {string}
    */
    serialize_counter() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_serialize_counter(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Serialize register
    *
    * Serialize the register as JSON.
    * @returns {string}
    */
    get_register_update_message() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_get_register_update_message(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    serialize_register() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_serialize_register(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * ### Merge from message
    *
    * Merge the state of the counter with the state of another
    *
    * * `msg` - Serialized state of another counter (update message from sync manage).
    * @param {string | undefined} msg
    */
    merge_from_message(msg) {
        var ptr0 = isLikeNone(msg) ? 0 : passStringToWasm0(msg, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.engine_merge_from_message(this.ptr, ptr0, len0);
    }
    /**
    * ### Merge register from message
    *
    * Merge an incoming message with a serialized register.
    *
    * * `msg` - Serialized state of another register.
    * * `other_id` - ID of the other node.
    * @param {string | undefined} msg
    * @param {string} other_nid
    */
    merge_register_from_message(msg, other_nid) {
        var ptr0 = isLikeNone(msg) ? 0 : passStringToWasm0(msg, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(other_nid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.engine_merge_register_from_message(this.ptr, ptr0, len0, ptr1, len1);
    }
}
/**
*/
export class UID {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_uid_free(ptr);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('crdts_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_getTime_10d33f4f2959e5dd = function(arg0) {
        var ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_new0_fd3a3a290b25cdac = function() {
        var ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

