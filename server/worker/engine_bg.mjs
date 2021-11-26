import wasm from './export_wasm.mjs';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

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

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

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

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
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

/**
* @param {Uint8Array} update_msg
* @returns {string}
*/
export function parseUpdateMessage(update_msg) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArray8ToWasm0(update_msg, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.parseUpdateMessage(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
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
*/
export const RegisterValueType = Object.freeze({ Bool:0,"0":"Bool", });
/**
* ## Packed register
*
* Encoded version of a register with some added metadata.
*/
export class PackedRegister {

    static __wrap(ptr) {
        const obj = Object.create(PackedRegister.prototype);
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
        wasm.__wbg_packedregister_free(ptr);
    }
    /**
    * ### Uinque ID
    *
    * Unique identifier of the register.
    */
    get id() {
        var ret = wasm.__wbg_get_packedregister_id(this.ptr);
        return UID.__wrap(ret);
    }
    /**
    * ### Uinque ID
    *
    * Unique identifier of the register.
    * @param {UID} arg0
    */
    set id(arg0) {
        _assertClass(arg0, UID);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_packedregister_id(this.ptr, ptr0);
    }
    /**
    * ### Value type
    *
    * Type of the value wrapped by the register.
    */
    get valueType() {
        var ret = wasm.__wbg_get_packedregister_valueType(this.ptr);
        return ret >>> 0;
    }
    /**
    * ### Value type
    *
    * Type of the value wrapped by the register.
    * @param {number} arg0
    */
    set valueType(arg0) {
        wasm.__wbg_set_packedregister_valueType(this.ptr, arg0);
    }
    /**
    * ### New packed register
    *
    * Constructs a new packed register.
    *
    * * `id` - If not provided, a random UID is generated and used instead.
    * * `value_type` - Type of the value wrapped by the register.
    * * `encoded` - Encoded version of the register.
    * @param {UID | undefined} id
    * @param {number} value_type
    * @param {Uint8Array} encoded
    */
    constructor(id, value_type, encoded) {
        let ptr0 = 0;
        if (!isLikeNone(id)) {
            _assertClass(id, UID);
            ptr0 = id.ptr;
            id.ptr = 0;
        }
        var ptr1 = passArray8ToWasm0(encoded, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.packedregister_new(ptr0, value_type, ptr1, len1);
        return PackedRegister.__wrap(ret);
    }
    /**
    * ### Get encoded
    *
    * Returns the encoded version of the register.
    * @returns {Uint8Array}
    */
    getEncoded() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.packedregister_getEncoded(retptr, this.ptr);
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
    * @param {Timestamp} ts
    * @returns {Uint8Array}
    */
    getMessage(ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(ts, Timestamp);
            var ptr0 = ts.ptr;
            ts.ptr = 0;
            wasm.packedregister_getMessage(retptr, this.ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
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
    * @returns {UID}
    */
    getCopy() {
        var ret = wasm.uid_getCopy(this.ptr);
        return UID.__wrap(ret);
    }
    /**
    * @param {string} nid_str
    * @returns {UID}
    */
    static fromString(nid_str) {
        var ptr0 = passStringToWasm0(nid_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.uid_fromString(ptr0, len0);
        return UID.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uid_toString(retptr, this.ptr);
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

export function __wbindgen_string_new(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_getRandomValues_98117e9a7e993920() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_randomFillSync_64cc7d048f228ca8() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_process_2f24d6544ea7b200(arg0) {
    var ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_versions_6164651e75405d4a(arg0) {
    var ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_4b517d861cbcb3bc(arg0) {
    var ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_modulerequire_3440a4bcf44437db() { return handleError(function (arg0, arg1) {
    var ret = module.require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_98fc271021c7d2ad(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_msCrypto_a2cdb043d2bfe57f(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_newnoargs_be86524d73f67598(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_888d259a5fefc347() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_now_af172eabe2e041ad() {
    var ret = Date.now();
    return ret;
};

export function __wbg_self_c6fbdfc2918d5e58() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_baec038b5ab35c54() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_3f735a5746d41fbd() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_1bc0b39582740e95() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_buffer_397eaa4d72ee94dd(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_a7ce447f15ff496f(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_969ad0a60e51d320(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_1eb8fc608a0d4cdb(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_929232475839a482(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_8b658422a224f479(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_rethrow(arg0) {
    throw takeObject(arg0);
};

export function __wbindgen_memory() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

