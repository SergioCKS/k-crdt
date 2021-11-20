
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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* @returns {string}
*/
export function generate_id() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.generate_id(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @returns {string}
*/
export function get_message() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_message(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Uint8Array} update_msg
* @returns {string}
*/
export function parse_update_message(update_msg) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArray8ToWasm0(update_msg, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.parse_update_message(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
/**
* @returns {BigInt}
*/
export function test_clock() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.test_clock(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = uint64CvtShim[0];
        return n0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
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
    * @param {UID | undefined} node_id
    */
    constructor(node_id) {
        let ptr0 = 0;
        if (!isLikeNone(node_id)) {
            _assertClass(node_id, UID);
            ptr0 = node_id.ptr;
            node_id.ptr = 0;
        }
        var ret = wasm.engine_new(ptr0);
        return Engine.__wrap(ret);
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
    * @param {UID} node_id
    */
    set_node_id(node_id) {
        _assertClass(node_id, UID);
        var ptr0 = node_id.ptr;
        node_id.ptr = 0;
        wasm.engine_set_node_id(this.ptr, ptr0);
    }
    /**
    * ### Set time offset
    *
    * Sets the time offset of the node.
    * @param {number} offset_millis
    */
    set_time_offset(offset_millis) {
        wasm.engine_set_time_offset(this.ptr, offset_millis);
    }
    /**
    * ### Get node ID
    *
    * Returns the node ID associated with the engine.
    * @returns {UID}
    */
    get_node_id() {
        var ret = wasm.engine_get_node_id(this.ptr);
        return UID.__wrap(ret);
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
    * Serialize register
    *
    * Serialize the register as JSON.
    * ### Merge from message
    *
    * Merge the state of the counter with the state of another
    *
    * * `msg` - Serialized state of another counter (update message from sync manage).
    * ### Merge register from message
    *
    * Merge an incoming message with a serialized register.
    *
    * * `msg` - Serialized state of another register.
    * * `other_id` - ID of the other node.
    * ### Generate timestamp
    *
    * Generates an HLC timestamp.
    * @returns {Timestamp}
    */
    generate_timestamp() {
        var ret = wasm.engine_generate_timestamp(this.ptr);
        return Timestamp.__wrap(ret);
    }
    /**
    * ### Create bool register
    *
    * Creates a new last-write-wins register wrapping a boolean value, serializes it and passes
    * the result to the client.
    * @param {boolean} initial
    * @returns {PackedBoolRegister}
    */
    create_bool_register(initial) {
        var ret = wasm.engine_create_bool_register(this.ptr, initial);
        return PackedBoolRegister.__wrap(ret);
    }
}
/**
*/
export class PackedBoolRegister {

    static __wrap(ptr) {
        const obj = Object.create(PackedBoolRegister.prototype);
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
        wasm.__wbg_packedboolregister_free(ptr);
    }
    /**
    * @param {UID} id
    * @param {boolean} value
    * @param {Uint8Array} encoded
    * @returns {PackedBoolRegister}
    */
    static new(id, value, encoded) {
        _assertClass(id, UID);
        var ptr0 = id.ptr;
        id.ptr = 0;
        var ptr1 = passArray8ToWasm0(encoded, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.packedboolregister_new(ptr0, value, ptr1, len1);
        return PackedBoolRegister.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.packedboolregister_get_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    get_value() {
        var ret = wasm.packedboolregister_get_value(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {Uint8Array}
    */
    get_encoded() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.packedboolregister_get_encoded(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {UID} nid
    * @param {Timestamp} ts
    * @returns {Uint8Array}
    */
    get_update_message(nid, ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(nid, UID);
            var ptr0 = nid.ptr;
            nid.ptr = 0;
            _assertClass(ts, Timestamp);
            var ptr1 = ts.ptr;
            ts.ptr = 0;
            wasm.packedboolregister_get_update_message(retptr, this.ptr, ptr0, ptr1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ServerHLC {

    static __wrap(ptr) {
        const obj = Object.create(ServerHLC.prototype);
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
        wasm.__wbg_serverhlc_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.serverhlc_new();
        return ServerHLC.__wrap(ret);
    }
    /**
    * @returns {Timestamp}
    */
    get_timestamp() {
        var ret = wasm.serverhlc_get_timestamp(this.ptr);
        return Timestamp.__wrap(ret);
    }
    /**
    * @param {Timestamp} ts
    * @returns {Timestamp}
    */
    update(ts) {
        _assertClass(ts, Timestamp);
        var ptr0 = ts.ptr;
        ts.ptr = 0;
        var ret = wasm.serverhlc_update(this.ptr, ptr0);
        return Timestamp.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    serialize() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.serverhlc_serialize(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} encoded
    * @returns {ServerHLC}
    */
    static deserialize(encoded) {
        var ptr0 = passArray8ToWasm0(encoded, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.serverhlc_deserialize(ptr0, len0);
        return ServerHLC.__wrap(ret);
    }
}
/**
* ## HLC Timestamp
*
* 64-bit HLC timestamp implemented as a tuple struct over [`u64`].
*/
export class Timestamp {

    static __wrap(ptr) {
        const obj = Object.create(Timestamp.prototype);
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
        wasm.__wbg_timestamp_free(ptr);
    }
    /**
    * ### As `u64`
    *
    * Returns the timestamp as a 64-bit unsigned integer.
    * @returns {BigInt}
    */
    as_u64() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timestamp_as_u64(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * ### Get time part
    *
    * Returns the counter part of the timestamp.
    * @returns {BigInt}
    */
    get_time() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timestamp_get_time(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * ### Get seconds
    *
    * Returns the seconds part of the timestamp (leading 32 bits).
    * @returns {number}
    */
    get_seconds() {
        var ret = wasm.timestamp_get_seconds(this.ptr);
        return ret >>> 0;
    }
    /**
    * ### Get second fractions
    *
    * Returns the second fractions part of the timestamp.
    * @returns {number}
    */
    get_fractions() {
        var ret = wasm.timestamp_get_fractions(this.ptr);
        return ret >>> 0;
    }
    /**
    * ### Get counter part
    *
    * Returns the counter part of the timestamp.
    * @returns {number}
    */
    get_count() {
        var ret = wasm.timestamp_get_count(this.ptr);
        return ret;
    }
    /**
    * ### Get nanoseconds
    *
    * Returns the second fractions part as nanoseconds.
    * @returns {number}
    */
    get_nanoseconds() {
        var ret = wasm.timestamp_get_nanoseconds(this.ptr);
        return ret >>> 0;
    }
    /**
    * ### Increase counter
    *
    * Increases the counter part of the timestamp by 1.
    */
    increase_counter() {
        wasm.timestamp_increase_counter(this.ptr);
    }
}
/**
* ## UID
*
* Unique ID represented compactly as [`u128`].
*/
export class UID {

    static __wrap(ptr) {
        const obj = Object.create(UID.prototype);
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
        wasm.__wbg_uid_free(ptr);
    }
    /**
    * ### Generate new ID
    *
    * Generates a new random unique ID.
    *
    * An ID can be represented as a string consisting of 21 random characters over the
    * alphabet `A-Za-z0-9_-` followed by a random character over the alphabet `ABCD`
    * (22 characters total).
    *
    * To generate random data, a `ThreadRNG` is used.
    */
    constructor() {
        var ret = wasm.uid_new();
        return UID.__wrap(ret);
    }
    /**
    * @param {string} nid_str
    * @returns {UID}
    */
    static from_string(nid_str) {
        var ptr0 = passStringToWasm0(nid_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.uid_from_string(ptr0, len0);
        return UID.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    as_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uid_as_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    as_byte_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uid_as_byte_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
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
    imports.wbg.__wbg_timeOrigin_3dd709c1f8d57f0b = function(arg0) {
        var ret = getObject(arg0).timeOrigin;
        return ret;
    };
    imports.wbg.__wbg_now_559193109055ebad = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_98117e9a7e993920 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_64cc7d048f228ca8 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_process_2f24d6544ea7b200 = function(arg0) {
        var ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        var ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_versions_6164651e75405d4a = function(arg0) {
        var ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_4b517d861cbcb3bc = function(arg0) {
        var ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_modulerequire_3440a4bcf44437db = function() { return handleError(function (arg0, arg1) {
        var ret = module.require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_98fc271021c7d2ad = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_a2cdb043d2bfe57f = function(arg0) {
        var ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_be86524d73f67598 = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_4d0f21c2f823742e = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_888d259a5fefc347 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_now_af172eabe2e041ad = function() {
        var ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_self_c6fbdfc2918d5e58 = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_baec038b5ab35c54 = function() { return handleError(function () {
        var ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_3f735a5746d41fbd = function() { return handleError(function () {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_1bc0b39582740e95 = function() { return handleError(function () {
        var ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_buffer_397eaa4d72ee94dd = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_a7ce447f15ff496f = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_969ad0a60e51d320 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_1eb8fc608a0d4cdb = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_929232475839a482 = function(arg0) {
        var ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_8b658422a224f479 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
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

