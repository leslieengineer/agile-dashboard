var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/xtend/immutable.js
var require_immutable = __commonJS({
  "node_modules/xtend/immutable.js"(exports, module) {
    module.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend() {
      var target = {};
      for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
  }
});

// node_modules/reusify/reusify.js
var require_reusify = __commonJS({
  "node_modules/reusify/reusify.js"(exports, module) {
    "use strict";
    function reusify(Constructor) {
      var head = new Constructor();
      var tail = head;
      function get() {
        var current = head;
        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }
        current.next = null;
        return current;
      }
      function release(obj) {
        tail.next = obj;
        tail = obj;
      }
      return {
        get,
        release
      };
    }
    module.exports = reusify;
  }
});

// node_modules/fastparallel/parallel.js
var require_parallel = __commonJS({
  "node_modules/fastparallel/parallel.js"(exports, module) {
    "use strict";
    var xtend = require_immutable();
    var reusify = require_reusify();
    var defaults = {
      released: nop,
      results: true
    };
    function fastparallel(options) {
      options = xtend(defaults, options);
      var released = options.released;
      var queue = reusify(options.results ? ResultsHolder : NoResultsHolder);
      var queueSingleCaller = reusify(SingleCaller);
      var goArray = options.results ? goResultsArray : goNoResultsArray;
      var goFunc = options.results ? goResultsFunc : goNoResultsFunc;
      return parallel;
      function parallel(that, toCall, arg, done) {
        var holder = queue.get();
        done = done || nop;
        if (toCall.length === 0) {
          done.call(that);
          released(holder);
        } else {
          holder._callback = done;
          holder._callThat = that;
          holder._release = release;
          if (typeof toCall === "function") {
            goFunc(that, toCall, arg, holder);
          } else {
            goArray(that, toCall, arg, holder);
          }
          if (holder._count === 0) {
            holder.release();
          }
        }
      }
      function release(holder) {
        queue.release(holder);
        released(holder);
      }
      function singleCallerRelease(holder) {
        queueSingleCaller.release(holder);
      }
      function goResultsFunc(that, toCall, arg, holder) {
        var singleCaller = null;
        holder._count = arg.length;
        holder._results = new Array(holder._count);
        for (var i = 0; i < arg.length; i++) {
          singleCaller = queueSingleCaller.get();
          singleCaller._release = singleCallerRelease;
          singleCaller.parent = holder;
          singleCaller.pos = i;
          if (that) {
            toCall.call(that, arg[i], singleCaller.release);
          } else {
            toCall(arg[i], singleCaller.release);
          }
        }
      }
      function goResultsArray(that, funcs, arg, holder) {
        var sc = null;
        var tc = nop;
        holder._count = funcs.length;
        holder._results = new Array(holder._count);
        for (var i = 0; i < funcs.length; i++) {
          sc = queueSingleCaller.get();
          sc._release = singleCallerRelease;
          sc.parent = holder;
          sc.pos = i;
          tc = funcs[i];
          if (that) {
            if (tc.length === 1) tc.call(that, sc.release);
            else tc.call(that, arg, sc.release);
          } else {
            if (tc.length === 1) tc(sc.release);
            else tc(arg, sc.release);
          }
        }
      }
      function goNoResultsFunc(that, toCall, arg, holder) {
        holder._count = arg.length;
        for (var i = 0; i < arg.length; i++) {
          if (that) {
            toCall.call(that, arg[i], holder.release);
          } else {
            toCall(arg[i], holder.release);
          }
        }
      }
      function goNoResultsArray(that, funcs, arg, holder) {
        var toCall = null;
        holder._count = funcs.length;
        for (var i = 0; i < funcs.length; i++) {
          toCall = funcs[i];
          if (that) {
            if (toCall.length === 1) {
              toCall.call(that, holder.release);
            } else {
              toCall.call(that, arg, holder.release);
            }
          } else {
            if (toCall.length === 1) {
              toCall(holder.release);
            } else {
              toCall(arg, holder.release);
            }
          }
        }
      }
    }
    function NoResultsHolder() {
      this._count = -1;
      this._callback = nop;
      this._callThat = null;
      this._release = null;
      this.next = null;
      var that = this;
      var i = 0;
      this.release = function() {
        var cb = that._callback;
        if (++i === that._count || that._count === 0) {
          if (that._callThat) {
            cb.call(that._callThat);
          } else {
            cb();
          }
          that._callback = nop;
          that._callThat = null;
          i = 0;
          that._release(that);
        }
      };
    }
    function SingleCaller() {
      this.pos = -1;
      this._release = nop;
      this.parent = null;
      this.next = null;
      var that = this;
      this.release = function(err, result) {
        that.parent.release(err, that.pos, result);
        that.pos = -1;
        that.parent = null;
        that._release(that);
      };
    }
    function ResultsHolder() {
      this._count = -1;
      this._callback = nop;
      this._results = null;
      this._err = null;
      this._callThat = null;
      this._release = nop;
      this.next = null;
      var that = this;
      var i = 0;
      this.release = function(err, pos, result) {
        that._err = that._err || err;
        if (pos >= 0) {
          that._results[pos] = result;
        }
        var cb = that._callback;
        if (++i === that._count || that._count === 0) {
          if (that._callThat) {
            cb.call(that._callThat, that._err, that._results);
          } else {
            cb(that._err, that._results);
          }
          that._callback = nop;
          that._results = null;
          that._err = null;
          that._callThat = null;
          i = 0;
          that._release(that);
        }
      };
    }
    function nop() {
    }
    module.exports = fastparallel;
  }
});

// node_modules/fastseries/series.js
var require_series = __commonJS({
  "node_modules/fastseries/series.js"(exports, module) {
    "use strict";
    var defaults = {
      results: true
    };
    function fastseries(options) {
      options = Object.assign({}, defaults, options);
      var seriesEach;
      var seriesList;
      if (options.results) {
        seriesEach = resultEach;
        seriesList = resultList;
      } else {
        seriesEach = noResultEach;
        seriesList = noResultList;
      }
      return series;
      function series(that, toCall, arg, done) {
        done = (done || nop).bind(that);
        if (toCall.length === 0) {
          done.call(that);
        } else if (toCall.bind) {
          if (that) {
            toCall = toCall.bind(that);
          }
          seriesEach(toCall, arg, done);
        } else {
          var _list;
          if (that) {
            var length = toCall.length;
            _list = new Array(length);
            for (var i = 0; i < length; i++) {
              _list[i] = toCall[i].bind(that);
            }
          } else {
            _list = toCall;
          }
          seriesList(_list, arg, done);
        }
      }
    }
    function noResultEach(each, list, cb) {
      var i = 0;
      var length = list.length;
      release();
      function release() {
        if (i < length) {
          makeCallTwo(each, list[i++], release);
        } else {
          cb();
        }
      }
    }
    function noResultList(list, arg, cb) {
      var i = 0;
      var length = list.length;
      var makeCall;
      if (list[0].length === 1) {
        makeCall = makeCallOne;
      } else {
        makeCall = makeCallTwo;
      }
      release();
      function release() {
        if (i < length) {
          makeCall(list[i++], arg, release);
        } else {
          cb();
        }
      }
    }
    function resultEach(each, list, cb) {
      var i = 0;
      var length = list.length;
      var results = new Array(length);
      release(null, null);
      function release(err, result) {
        if (err) {
          cb(err);
          return;
        }
        if (i > 0) {
          results[i - 1] = result;
        }
        if (i < length) {
          makeCallTwo(each, list[i++], release);
        } else {
          cb(null, results);
        }
      }
    }
    function resultList(list, arg, cb) {
      var i = 0;
      var length = list.length;
      var makeCall;
      if (list[0].length === 1) {
        makeCall = makeCallOne;
      } else {
        makeCall = makeCallTwo;
      }
      var results = new Array(length);
      release(null, null);
      function release(err, result) {
        if (err) {
          cb(err);
          return;
        }
        if (i > 0) {
          results[i - 1] = result;
        }
        if (i < length) {
          makeCall(list[i++], arg, release);
        } else {
          cb(null, results);
        }
      }
    }
    function makeCallOne(cb, arg, release) {
      cb(release);
    }
    function makeCallTwo(cb, arg, release) {
      cb(arg, release);
    }
    function nop() {
    }
    module.exports = fastseries;
  }
});

// node_modules/uuid/dist/esm-node/max.js
var max_default;
var init_max = __esm({
  "node_modules/uuid/dist/esm-node/max.js"() {
    max_default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  }
});

// node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-node/rng.js
import crypto from "node:crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node;
  let clockseq = options.clockseq;
  if (!options._v6) {
    if (!node) {
      node = _nodeId;
    }
    if (clockseq == null) {
      clockseq = _clockseq;
    }
  }
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = [seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      if (!_nodeId && !options._v6) {
        node[0] |= 1;
        _nodeId = node;
      }
    }
    if (clockseq == null) {
      clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
      if (_clockseq === void 0 && !options._v6) {
        _clockseq = clockseq;
      }
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-node/v1ToV6.js
function v1ToV6(uuid) {
  const v1Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v6Bytes = _v1ToV6(v1Bytes);
  return typeof uuid === "string" ? unsafeStringify(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes, randomize = false) {
  return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}
var init_v1ToV6 = __esm({
  "node_modules/uuid/dist/esm-node/v1ToV6.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version3, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version3;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
var DNS, URL;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/md5.js
import crypto2 from "node:crypto";
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto2.createHash("md5").update(bytes).digest();
}
var md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-node/md5.js"() {
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-node/native.js
import crypto3 from "node:crypto";
var native_default;
var init_native = __esm({
  "node_modules/uuid/dist/esm-node/native.js"() {
    native_default = {
      randomUUID: crypto3.randomUUID
    };
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
import crypto4 from "node:crypto";
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto4.createHash("sha1").update(bytes).digest();
}
var sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/v6.js
function v6(options = {}, buf, offset = 0) {
  let bytes = v1_default({
    ...options,
    _v6: true
  }, new Uint8Array(16));
  bytes = v1ToV6(bytes);
  if (buf) {
    for (let i = 0; i < 16; i++) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}
var init_v6 = __esm({
  "node_modules/uuid/dist/esm-node/v6.js"() {
    init_stringify();
    init_v1();
    init_v1ToV6();
  }
});

// node_modules/uuid/dist/esm-node/v6ToV1.js
function v6ToV1(uuid) {
  const v6Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v1Bytes = _v6ToV1(v6Bytes);
  return typeof uuid === "string" ? unsafeStringify(v1Bytes) : v1Bytes;
}
function _v6ToV1(v6Bytes) {
  return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}
var init_v6ToV1 = __esm({
  "node_modules/uuid/dist/esm-node/v6ToV1.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist/esm-node/v7.js
function v7(options, buf, offset) {
  options = options || {};
  let i = buf && offset || 0;
  const b = buf || new Uint8Array(16);
  const rnds = options.random || (options.rng || rng)();
  const msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let seq = options.seq !== void 0 ? options.seq : null;
  let seqHigh = _seqHigh;
  let seqLow = _seqLow;
  if (msecs > _msecs && options.msecs === void 0) {
    _msecs = msecs;
    if (seq !== null) {
      seqHigh = null;
      seqLow = null;
    }
  }
  if (seq !== null) {
    if (seq > 2147483647) {
      seq = 2147483647;
    }
    seqHigh = seq >>> 19 & 4095;
    seqLow = seq & 524287;
  }
  if (seqHigh === null || seqLow === null) {
    seqHigh = rnds[6] & 127;
    seqHigh = seqHigh << 8 | rnds[7];
    seqLow = rnds[8] & 63;
    seqLow = seqLow << 8 | rnds[9];
    seqLow = seqLow << 5 | rnds[10] >>> 3;
  }
  if (msecs + 1e4 > _msecs && seq === null) {
    if (++seqLow > 524287) {
      seqLow = 0;
      if (++seqHigh > 4095) {
        seqHigh = 0;
        _msecs++;
      }
    }
  } else {
    _msecs = msecs;
  }
  _seqHigh = seqHigh;
  _seqLow = seqLow;
  b[i++] = _msecs / 1099511627776 & 255;
  b[i++] = _msecs / 4294967296 & 255;
  b[i++] = _msecs / 16777216 & 255;
  b[i++] = _msecs / 65536 & 255;
  b[i++] = _msecs / 256 & 255;
  b[i++] = _msecs & 255;
  b[i++] = seqHigh >>> 4 & 15 | 112;
  b[i++] = seqHigh & 255;
  b[i++] = seqLow >>> 13 & 63 | 128;
  b[i++] = seqLow >>> 5 & 255;
  b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
  b[i++] = rnds[11];
  b[i++] = rnds[12];
  b[i++] = rnds[13];
  b[i++] = rnds[14];
  b[i++] = rnds[15];
  return buf || unsafeStringify(b);
}
var _seqLow, _seqHigh, _msecs, v7_default;
var init_v7 = __esm({
  "node_modules/uuid/dist/esm-node/v7.js"() {
    init_rng();
    init_stringify();
    _seqLow = null;
    _seqHigh = null;
    _msecs = 0;
    v7_default = v7;
  }
});

// node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  MAX: () => max_default,
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v1ToV6: () => v1ToV6,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  v6: () => v6,
  v6ToV1: () => v6ToV1,
  v7: () => v7_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_max();
    init_nil();
    init_parse();
    init_stringify();
    init_v1();
    init_v1ToV6();
    init_v3();
    init_v4();
    init_v5();
    init_v6();
    init_v6ToV1();
    init_v7();
    init_validate();
    init_version();
  }
});

// node_modules/aedes-packet/packet.js
var require_packet = __commonJS({
  "node_modules/aedes-packet/packet.js"(exports, module) {
    "use strict";
    function Packet(original, broker2) {
      if (Object.prototype.hasOwnProperty.call(original, "clientId")) this.clientId = original.clientId;
      if (Object.prototype.hasOwnProperty.call(original, "nl")) this.nl = original.nl;
      this.cmd = original.cmd || "publish";
      this.brokerId = original.brokerId || broker2 && broker2.id;
      this.brokerCounter = original.brokerCounter || (broker2 ? ++broker2.counter : 0);
      this.topic = original.topic;
      this.payload = original.payload || Buffer.alloc(0);
      this.qos = original.qos || 0;
      this.retain = original.retain || false;
      this.dup = original.dup || false;
      if (this.qos > 0 || this.cmd !== "publish") {
        this.messageId = void 0;
      }
    }
    module.exports = Packet;
  }
});

// node_modules/qlobber/lib/wrap_native.js
var require_wrap_native = __commonJS({
  "node_modules/qlobber/lib/wrap_native.js"(exports, module) {
    "use strict";
    var util = __require("util");
    module.exports = function(QlobberNative, Qlobber) {
      class WrappedQlobberNative extends QlobberNative {
        constructor(options) {
          super(options);
          this.addP = util.promisify(this.add_async);
          this.removeP = util.promisify(this.remove_async);
          this.matchP = util.promisify(this.match_async);
          this.testP = util.promisify(this.test_async);
          this.clearP = util.promisify(this.clear_async);
          this._get_visitorP = util.promisify(this.get_visitor_async);
          this._visit_nextP = util.promisify(this.visit_next_async);
          this._get_restorerP = util.promisify(this.get_restorer_async);
          this._restore_nextP = util.promisify(this.restore_next_async);
          this._match_iterP = util.promisify(this.match_iter_async);
          this._match_nextP = util.promisify(this.match_next_async);
        }
        *visit() {
          const visitor = this.get_visitor();
          while (true) {
            const v = this.visit_next(visitor);
            if (v === void 0) {
              break;
            }
            yield v;
          }
        }
        async *visitP() {
          const visitor = await this._get_visitorP();
          while (true) {
            const v = await this._visit_nextP(visitor);
            if (v === void 0) {
              break;
            }
            yield v;
          }
        }
        *match_iter(topic, ctx) {
          const iterator = super.match_iter(topic, ctx);
          while (true) {
            const v = this.match_next(iterator);
            if (v === void 0) {
              break;
            }
            yield v.value;
          }
        }
        async *match_iterP(topic, ctx) {
          const iterator = await this._match_iterP(topic, ctx);
          while (true) {
            const v = await this._match_nextP(iterator);
            if (v === void 0) {
              break;
            }
            yield v.value;
          }
        }
        get_trie() {
          const qlobber = new Qlobber(this.options);
          const restorer = qlobber.get_restorer();
          for (let v of this.visit()) {
            restorer(v);
          }
          return qlobber.get_trie();
        }
        get_restorer(options) {
          const restorer = super.get_restorer(options);
          return (obj) => {
            super.restore_next(restorer, obj);
          };
        }
        async get_restorerP(options) {
          const restorer = await this._get_restorerP(options);
          return async (obj) => {
            await this._restore_nextP(restorer, obj);
          };
        }
      }
      WrappedQlobberNative.is_native = true;
      WrappedQlobberNative.nonNative = Qlobber;
      return WrappedQlobberNative;
    };
  }
});

// node_modules/qlobber/lib/qlobber.js
var require_qlobber = __commonJS({
  "node_modules/qlobber/lib/qlobber.js"(exports) {
    "use strict";
    var util = __require("util");
    function Qlobber(options) {
      options = options || {};
      this._separator = options.separator || ".";
      this._wildcard_one = options.wildcard_one || "*";
      this._wildcard_some = options.wildcard_some || "#";
      this._max_words = options.max_words || 100;
      this._max_wildcard_somes = options.max_wildcard_somes || 3;
      this._match_empty_levels = options.match_empty_levels;
      this._trie = /* @__PURE__ */ new Map();
      if (options.cache_adds instanceof Map) {
        this._shortcuts = options.cache_adds;
      } else if (options.cache_adds) {
        this._shortcuts = /* @__PURE__ */ new Map();
      }
      if (options.cache_splits > 0) {
        this._cache_splits = options.cache_splits;
        this._split_cache = /* @__PURE__ */ new Map();
      }
    }
    Qlobber.prototype._initial_value = function(val) {
      return [val];
    };
    Qlobber.prototype._add_value = function(vals, val) {
      vals[vals.length] = val;
    };
    Qlobber.prototype._add_values = function(dest, origin) {
      var i, destLength = dest.length, originLength = origin.length;
      for (i = 0; i < originLength; i += 1) {
        dest[destLength + i] = origin[i];
      }
    };
    Qlobber.prototype._iter_values = function(origin, ctx) {
      return origin[Symbol.iterator](ctx);
    };
    Qlobber.prototype._remove_value = function(vals, val) {
      if (val === void 0) {
        return true;
      }
      var index = vals.lastIndexOf(val);
      if (index >= 0) {
        vals.splice(index, 1);
      }
      return vals.length === 0;
    };
    Qlobber.prototype._add = function(val, i, words, sub_trie) {
      var st, word;
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          this._add_value(st, val);
        } else {
          st = this._initial_value(val);
          sub_trie.set(this._separator, st);
        }
        return st;
      }
      word = words[i];
      st = sub_trie.get(word);
      if (!st) {
        st = /* @__PURE__ */ new Map();
        sub_trie.set(word, st);
      }
      return this._add(val, i + 1, words, st);
    };
    Qlobber.prototype._remove = function(val, i, words, sub_trie) {
      var st, word, r;
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st && this._remove_value(st, val)) {
          sub_trie.delete(this._separator);
          return true;
        }
        return false;
      }
      word = words[i];
      st = sub_trie.get(word);
      if (!st) {
        return false;
      }
      r = this._remove(val, i + 1, words, st);
      if (st.size === 0) {
        sub_trie.delete(word);
      }
      return r;
    };
    Qlobber.prototype._match_some = function(v, i, words, st, ctx) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            v = this._match(v, j, words, st, ctx);
          }
          break;
        }
      }
      return v;
    };
    Qlobber.prototype._match = function(v, i, words, sub_trie, ctx) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        v = this._match_some(v, i, words, st, ctx);
        v = this._match(v, words.length, words, st, ctx);
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          if (v.dest) {
            this._add_values(v.dest, v.source, ctx);
            this._add_values(v.dest, st, ctx);
            v = v.dest;
          } else if (v.source) {
            v.dest = v.source;
            v.source = st;
          } else {
            this._add_values(v, st, ctx);
          }
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st) {
            v = this._match(v, i + 1, words, st, ctx);
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st) {
            v = this._match(v, i + 1, words, st, ctx);
          }
        }
      }
      return v;
    };
    Qlobber.prototype._match2 = function(v, topic, ctx) {
      var vals = this._match(
        {
          source: v
        },
        0,
        this._split(topic, false),
        this._trie,
        ctx
      );
      return vals.source || vals;
    };
    Qlobber.prototype._test_some = function(v, i, words, st) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            if (this._test(v, j, words, st)) {
              return true;
            }
          }
          break;
        }
      }
      return false;
    };
    Qlobber.prototype._test = function(v, i, words, sub_trie) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        if (this._test_some(v, i, words, st) || // and we'll end up matching the rest of the words:
        this._test(v, words.length, words, st)) {
          return true;
        }
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st && this.test_values(st, v)) {
          return true;
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st && this._test(v, i + 1, words, st)) {
            return true;
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st && this._test(v, i + 1, words, st)) {
            return true;
          }
        }
      }
      return false;
    };
    Qlobber.prototype._match_some_iter = function* (i, words, st, ctx) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            yield* this._match_iter(j, words, st, ctx);
          }
          break;
        }
      }
    };
    Qlobber.prototype._match_iter = function* (i, words, sub_trie, ctx) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        yield* this._match_some_iter(i, words, st, ctx);
        yield* this._match_iter(words.length, words, st, ctx);
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          yield* this._iter_values(st, ctx);
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st) {
            yield* this._match_iter(i + 1, words, st, ctx);
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st) {
            yield* this._match_iter(i + 1, words, st, ctx);
          }
        }
      }
    };
    Qlobber.prototype._split_words = function(topic) {
      const r = topic.split(this._separator);
      if (r.length > this._max_words) {
        throw new Error("too many words");
      }
      return r;
    };
    Qlobber.prototype._split = function(topic, adding) {
      let r;
      if (this._split_cache) {
        r = this._split_cache.get(topic);
        if (r === void 0) {
          r = this._split_words(topic);
          this._split_cache.set(topic, r);
          if (this._split_cache.size > this._cache_splits) {
            for (let t of this._split_cache.keys()) {
              this._split_cache.delete(t);
              break;
            }
          }
        }
      } else {
        r = this._split_words(topic);
      }
      if (adding && r.reduce((n, w) => n + (w === this._wildcard_some), 0) > this._max_wildcard_somes) {
        throw new Error("too many wildcard somes");
      }
      return r;
    };
    Qlobber.prototype.add = function(topic, val) {
      var shortcut = this._shortcuts && this._shortcuts.get(topic);
      if (shortcut) {
        this._add_value(shortcut, val);
      } else {
        shortcut = this._add(val, 0, this._split(topic, true), this._trie);
        if (this._shortcuts) {
          this._shortcuts.set(topic, shortcut);
        }
      }
      return this;
    };
    Qlobber.prototype.remove = function(topic, val) {
      if (this._remove(val, 0, this._split(topic, false), this._trie) && this._shortcuts) {
        this._shortcuts.delete(topic);
      }
      return this;
    };
    Qlobber.prototype.match = function(topic, ctx) {
      return this._match2([], topic, ctx);
    };
    Qlobber.prototype.match_iter = function(topic, ctx) {
      return this._match_iter(0, this._split(topic, false), this._trie, ctx);
    };
    Qlobber.prototype.test = function(topic, val) {
      return this._test(val, 0, this._split(topic, false), this._trie);
    };
    Qlobber.prototype.test_values = function(vals, val) {
      return vals.indexOf(val) >= 0;
    };
    Qlobber.prototype.clear = function() {
      this._trie.clear();
      if (this._shortcuts) {
        this._shortcuts.clear();
      }
      if (this._split_cache) {
        this._split_cache.clear();
      }
      return this;
    };
    Qlobber.prototype.get_trie = function() {
      return this._trie;
    };
    Qlobber.prototype.visit = function* () {
      let iterators = [], iterator = this._trie.entries(), i = 0;
      while (true) {
        if (i === 0) {
          yield { type: "start_entries" };
        }
        let next = iterator.next();
        if (next.done) {
          yield { type: "end_entries" };
          let prev = iterators.pop();
          if (prev === void 0) {
            return;
          }
          [iterator, i] = prev;
          continue;
        }
        let [key, value] = next.value;
        yield { type: "entry", key };
        ++i;
        if (key === this._separator) {
          yield { type: "start_values" };
          if (value[Symbol.iterator]) {
            for (let v of value) {
              yield { type: "value", value: v };
            }
          } else {
            yield { type: "value", value };
          }
          yield { type: "end_values" };
          continue;
        }
        iterators.push([iterator, i]);
        iterator = value.entries();
        i = 0;
      }
    };
    Qlobber.prototype.get_restorer = function(options) {
      options = options || {};
      let sts = [], entry = this._trie, path = "";
      return (obj) => {
        switch (obj.type) {
          case "entry":
            entry = entry || /* @__PURE__ */ new Map();
            sts.push([entry, obj.key, path]);
            entry = entry.get(obj.key);
            if (options.cache_adds) {
              if (path) {
                path += this._separator;
              }
              path += obj.key;
            }
            break;
          case "value":
            if (entry) {
              this._add_value(entry, obj.value);
            } else {
              entry = this._initial_value(obj.value);
            }
            break;
          case "end_entries":
            if (entry && entry.size === 0) {
              entry = void 0;
            }
          /* falls through */
          case "end_values":
            let prev = sts.pop();
            if (prev === void 0) {
              entry = void 0;
              path = "";
            } else {
              let [prev_entry, key, prev_path] = prev;
              if (entry) {
                if (options.cache_adds && this._shortcuts && obj.type === "end_values") {
                  this._shortcuts.set(prev_path, entry);
                }
                prev_entry.set(key, entry);
              }
              entry = prev_entry;
              path = prev_path;
            }
            break;
        }
      };
    };
    function QlobberDedup(options) {
      Qlobber.call(this, options);
    }
    util.inherits(QlobberDedup, Qlobber);
    QlobberDedup.prototype._initial_value = function(val) {
      return (/* @__PURE__ */ new Set()).add(val);
    };
    QlobberDedup.prototype._add_value = function(vals, val) {
      vals.add(val);
    };
    QlobberDedup.prototype._add_values = function(dest, origin) {
      origin.forEach(function(val) {
        dest.add(val);
      });
    };
    QlobberDedup.prototype._remove_value = function(vals, val) {
      if (val === void 0) {
        return true;
      }
      vals.delete(val);
      return vals.size === 0;
    };
    QlobberDedup.prototype.test_values = function(vals, val) {
      return vals.has(val);
    };
    QlobberDedup.prototype.match = function(topic, ctx) {
      return this._match2(/* @__PURE__ */ new Set(), topic, ctx);
    };
    function QlobberTrue(options) {
      Qlobber.call(this, options);
    }
    util.inherits(QlobberTrue, Qlobber);
    QlobberTrue.prototype._initial_value = function() {
      return true;
    };
    QlobberTrue.prototype._add_value = function() {
    };
    QlobberTrue.prototype._remove_value = function() {
      return true;
    };
    QlobberTrue.prototype._iter_values = function* () {
      yield true;
    };
    QlobberTrue.prototype.test_values = function() {
      return true;
    };
    QlobberTrue.prototype.match = function(topic, ctx) {
      return this.test(topic, ctx);
    };
    var stream = __require("stream");
    function VisitorStream(qlobber) {
      stream.Readable.call(this, { objectMode: true });
      this._iterator = qlobber.visit();
    }
    util.inherits(VisitorStream, stream.Readable);
    VisitorStream.prototype._read = function() {
      while (true) {
        let { done, value } = this._iterator.next();
        if (done) {
          this.push(null);
          break;
        }
        if (!this.push(value)) {
          break;
        }
      }
    };
    function RestorerStream(qlobber) {
      stream.Writable.call(this, { objectMode: true });
      this._restorer = qlobber.get_restorer();
    }
    util.inherits(RestorerStream, stream.Writable);
    RestorerStream.prototype._write = function(value, _, cb) {
      this._restorer(value);
      cb();
    };
    var native_module = null;
    function set_native(qlobber_native) {
      if (qlobber_native !== native_module) {
        const wrap_native = require_wrap_native();
        Qlobber.nativeString = wrap_native(qlobber_native.QlobberString, Qlobber);
        Qlobber.nativeNumber = wrap_native(qlobber_native.QlobberNumber, Qlobber);
        QlobberDedup.nativeString = wrap_native(qlobber_native.QlobberDedupString, QlobberDedup);
        QlobberDedup.nativeNumber = wrap_native(qlobber_native.QlobberDedupNumber, QlobberDedup);
        QlobberTrue.native = wrap_native(qlobber_native.QlobberTrue, QlobberTrue);
        native_module = qlobber_native;
      }
      return exports;
    }
    exports.Qlobber = Qlobber;
    exports.QlobberDedup = QlobberDedup;
    exports.QlobberTrue = QlobberTrue;
    exports.VisitorStream = VisitorStream;
    exports.RestorerStream = RestorerStream;
    exports.set_native = set_native;
  }
});

// node_modules/qlobber/index.js
var require_qlobber2 = __commonJS({
  "node_modules/qlobber/index.js"(exports, module) {
    "use strict";
    module.exports = require_qlobber();
  }
});

// node_modules/qlobber/aedes/qlobber-sub.js
var require_qlobber_sub = __commonJS({
  "node_modules/qlobber/aedes/qlobber-sub.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var qlobber = require_qlobber2();
    var Qlobber = qlobber.Qlobber;
    function QlobberSub(options) {
      Qlobber.call(this, options);
      this.subscriptionsCount = 0;
    }
    util.inherits(QlobberSub, Qlobber);
    QlobberSub.prototype._initial_value = function(val) {
      this.subscriptionsCount += 1;
      let r = {
        topic: val.topic,
        clientMap: (/* @__PURE__ */ new Map()).set(val.clientId, { qos: val.qos, rh: val.rh, rap: val.rap, nl: val.nl })
      };
      r[Symbol.iterator] = function* (topic) {
        if (topic === void 0) {
          for (let [clientId, sub] of r.clientMap) {
            yield { topic: r.topic, clientId, ...sub };
          }
        } else if (r.topic === topic) {
          for (let [clientId, sub] of r.clientMap) {
            yield { clientId, ...sub };
          }
        }
      };
      return r;
    };
    QlobberSub.prototype._add_value = function(existing, val) {
      var clientMap = existing.clientMap, size = clientMap.size;
      clientMap.set(val.clientId, { qos: val.qos, rh: val.rh, rap: val.rap, nl: val.nl });
      if (clientMap.size > size) {
        this.subscriptionsCount += 1;
      }
    };
    QlobberSub.prototype._add_values = function(dest, existing, topic) {
      if (topic === void 0) {
        for (let [clientId, sub] of existing.clientMap) {
          dest.push({ clientId, topic: existing.topic, ...sub });
        }
      } else if (existing.topic === topic) {
        for (let [clientId, sub] of existing.clientMap) {
          dest.push({ clientId, ...sub });
        }
      }
    };
    QlobberSub.prototype._remove_value = function(existing, val) {
      var clientMap = existing.clientMap, size_before = clientMap.size;
      clientMap.delete(val.clientId);
      var size_after = clientMap.size;
      if (size_after < size_before) {
        this.subscriptionsCount -= 1;
      }
      return size_after === 0;
    };
    QlobberSub.prototype.test_values = function(existing, val) {
      var clientMap = existing.clientMap;
      return existing.topic === val.topic && clientMap.size === 1 && clientMap.has(val.clientId);
    };
    QlobberSub.prototype.match = function(topic, ctx) {
      return this._match([], 0, topic.split(this._separator), this._trie, ctx);
    };
    QlobberSub.prototype.clear = function() {
      this.subscriptionsCount = 0;
      return Qlobber.prototype.clear.call(this);
    };
    QlobberSub.set_native = function(qlobber_native) {
      const wrap_native = require_wrap_native();
      QlobberSub.native = wrap_native(qlobber_native.QlobberSub, QlobberSub);
      return module.exports;
    };
    module.exports = QlobberSub;
  }
});

// node_modules/aedes-persistence/persistence.js
var require_persistence = __commonJS({
  "node_modules/aedes-persistence/persistence.js"(exports, module) {
    var { Readable } = __require("stream");
    var QlobberSub = require_qlobber_sub();
    var { QlobberTrue } = require_qlobber2();
    var Packet = require_packet();
    var QlobberOpts = {
      wildcard_one: "+",
      wildcard_some: "#",
      separator: "/"
    };
    var CREATE_ON_EMPTY = true;
    function* multiIterables(iterables) {
      for (const iter of iterables) {
        yield* iter;
      }
    }
    function* retainedMessagesByPattern(retained, pattern) {
      const qlobber = new QlobberTrue(QlobberOpts);
      qlobber.add(pattern);
      for (const [topic, packet] of retained) {
        if (qlobber.test(topic)) {
          yield packet;
        }
      }
    }
    function* willsByBrokers(wills, brokers) {
      for (const will of wills.values()) {
        if (!brokers[will.brokerId]) {
          yield will;
        }
      }
    }
    function* clientListbyTopic(subscriptions, topic) {
      for (const [clientId, topicMap] of subscriptions) {
        if (topicMap.has(topic)) {
          yield clientId;
        }
      }
    }
    var MemoryPersistence = class {
      // private class members start with #
      #retained;
      #subscriptions;
      #outgoing;
      #incoming;
      #wills;
      #clientsCount;
      #trie;
      constructor() {
        this.#retained = /* @__PURE__ */ new Map();
        this.#subscriptions = /* @__PURE__ */ new Map();
        this.#outgoing = /* @__PURE__ */ new Map();
        this.#incoming = /* @__PURE__ */ new Map();
        this.#wills = /* @__PURE__ */ new Map();
        this.#clientsCount = 0;
        this.#trie = new QlobberSub(QlobberOpts);
      }
      storeRetained(pkt, cb) {
        const packet = Object.assign({}, pkt);
        if (packet.payload.length === 0) {
          this.#retained.delete(packet.topic);
        } else {
          this.#retained.set(packet.topic, packet);
        }
        cb(null);
      }
      createRetainedStreamCombi(patterns) {
        const iterables = patterns.map((p) => {
          return retainedMessagesByPattern(this.#retained, p);
        });
        return Readable.from(multiIterables(iterables));
      }
      createRetainedStream(pattern) {
        return Readable.from(retainedMessagesByPattern(this.#retained, pattern));
      }
      addSubscriptions(client, subs, cb) {
        let stored = this.#subscriptions.get(client.id);
        const trie = this.#trie;
        if (!stored) {
          stored = /* @__PURE__ */ new Map();
          this.#subscriptions.set(client.id, stored);
          this.#clientsCount++;
        }
        for (const sub of subs) {
          const storedSub = stored.get(sub.topic);
          if (sub.qos > 0) {
            trie.add(sub.topic, {
              clientId: client.id,
              topic: sub.topic,
              qos: sub.qos,
              rh: sub.rh,
              rap: sub.rap,
              nl: sub.nl
            });
          } else if (storedSub?.qos > 0) {
            trie.remove(sub.topic, {
              clientId: client.id,
              topic: sub.topic
            });
          }
          stored.set(sub.topic, { qos: sub.qos, rh: sub.rh, rap: sub.rap, nl: sub.nl });
        }
        cb(null, client);
      }
      removeSubscriptions(client, subs, cb) {
        const stored = this.#subscriptions.get(client.id);
        const trie = this.#trie;
        if (stored) {
          for (const topic of subs) {
            const storedSub = stored.get(topic);
            if (storedSub !== void 0) {
              if (storedSub.qos > 0) {
                trie.remove(topic, { clientId: client.id, topic });
              }
              stored.delete(topic);
            }
          }
          if (stored.size === 0) {
            this.#clientsCount--;
            this.#subscriptions.delete(client.id);
          }
        }
        cb(null, client);
      }
      subscriptionsByClient(client, cb) {
        let subs = null;
        const stored = this.#subscriptions.get(client.id);
        if (stored) {
          subs = [];
          for (const [topic, storedSub] of stored) {
            subs.push({ topic, ...storedSub });
          }
        }
        cb(null, subs, client);
      }
      countOffline(cb) {
        return cb(null, this.#trie.subscriptionsCount, this.#clientsCount);
      }
      subscriptionsByTopic(pattern, cb) {
        cb(null, this.#trie.match(pattern));
      }
      cleanSubscriptions(client, cb) {
        const trie = this.#trie;
        const stored = this.#subscriptions.get(client.id);
        if (stored) {
          for (const [topic, storedSub] of stored) {
            if (storedSub.qos > 0) {
              trie.remove(topic, { clientId: client.id, topic });
            }
          }
          this.#clientsCount--;
          this.#subscriptions.delete(client.id);
        }
        cb(null, client);
      }
      #outgoingEnqueuePerSub(sub, packet) {
        const id = sub.clientId;
        const queue = getMapRef(this.#outgoing, id, [], CREATE_ON_EMPTY);
        queue[queue.length] = new Packet(packet);
      }
      outgoingEnqueue(sub, packet, cb) {
        this.#outgoingEnqueuePerSub(sub, packet);
        process.nextTick(cb);
      }
      outgoingEnqueueCombi(subs, packet, cb) {
        for (let i = 0; i < subs.length; i++) {
          this.#outgoingEnqueuePerSub(subs[i], packet);
        }
        process.nextTick(cb);
      }
      outgoingUpdate(client, packet, cb) {
        const outgoing = getMapRef(this.#outgoing, client.id, [], CREATE_ON_EMPTY);
        let temp;
        for (let i = 0; i < outgoing.length; i++) {
          temp = outgoing[i];
          if (temp.brokerId === packet.brokerId) {
            if (temp.brokerCounter === packet.brokerCounter) {
              temp.messageId = packet.messageId;
              return cb(null, client, packet);
            }
          } else if (temp.messageId === packet.messageId) {
            outgoing[i] = packet;
            return cb(null, client, packet);
          }
        }
        cb(new Error("no such packet"), client, packet);
      }
      outgoingClearMessageId(client, packet, cb) {
        const outgoing = getMapRef(this.#outgoing, client.id, [], CREATE_ON_EMPTY);
        let temp;
        for (let i = 0; i < outgoing.length; i++) {
          temp = outgoing[i];
          if (temp.messageId === packet.messageId) {
            outgoing.splice(i, 1);
            return cb(null, temp);
          }
        }
        cb();
      }
      outgoingStream(client) {
        const outgoing = [].concat(getMapRef(this.#outgoing, client.id, []));
        return Readable.from(outgoing);
      }
      incomingStorePacket(client, packet, cb) {
        const id = client.id;
        const store = getMapRef(this.#incoming, id, {}, CREATE_ON_EMPTY);
        store[packet.messageId] = new Packet(packet);
        store[packet.messageId].messageId = packet.messageId;
        cb(null);
      }
      incomingGetPacket(client, packet, cb) {
        const id = client.id;
        const store = getMapRef(this.#incoming, id, {});
        let err = null;
        this.#incoming.set(id, store);
        if (!store[packet.messageId]) {
          err = new Error("no such packet");
        }
        cb(err, store[packet.messageId]);
      }
      incomingDelPacket(client, packet, cb) {
        const id = client.id;
        const store = getMapRef(this.#incoming, id, {});
        const toDelete = store[packet.messageId];
        let err = null;
        if (!toDelete) {
          err = new Error("no such packet");
        } else {
          delete store[packet.messageId];
        }
        cb(err);
      }
      putWill(client, packet, cb) {
        packet.brokerId = this.broker.id;
        packet.clientId = client.id;
        this.#wills.set(client.id, packet);
        cb(null, client);
      }
      getWill(client, cb) {
        cb(null, this.#wills.get(client.id), client);
      }
      delWill(client, cb) {
        const will = this.#wills.get(client.id);
        this.#wills.delete(client.id);
        cb(null, will, client);
      }
      streamWill(brokers = {}) {
        return Readable.from(willsByBrokers(this.#wills, brokers));
      }
      getClientList(topic) {
        return Readable.from(clientListbyTopic(this.#subscriptions, topic));
      }
      destroy(cb) {
        this.#retained = null;
        if (cb) {
          cb(null);
        }
      }
    };
    function getMapRef(map, key, ifEmpty, createOnEmpty = false) {
      const value = map.get(key);
      if (value === void 0 && createOnEmpty) {
        map.set(key, ifEmpty);
      }
      return value || ifEmpty;
    }
    module.exports = () => {
      return new MemoryPersistence();
    };
    module.exports.Packet = Packet;
  }
});

// node_modules/mqemitter/node_modules/qlobber/lib/wrap_native.js
var require_wrap_native2 = __commonJS({
  "node_modules/mqemitter/node_modules/qlobber/lib/wrap_native.js"(exports, module) {
    "use strict";
    var util = __require("util");
    module.exports = function(QlobberNative, Qlobber) {
      class WrappedQlobberNative extends QlobberNative {
        constructor(options) {
          super(options);
          this.addP = util.promisify(this.add_async);
          this.removeP = util.promisify(this.remove_async);
          this.matchP = util.promisify(this.match_async);
          this.testP = util.promisify(this.test_async);
          this.clearP = util.promisify(this.clear_async);
          this._get_visitorP = util.promisify(this.get_visitor_async);
          this._visit_nextP = util.promisify(this.visit_next_async);
          this._get_restorerP = util.promisify(this.get_restorer_async);
          this._restore_nextP = util.promisify(this.restore_next_async);
          this._match_iterP = util.promisify(this.match_iter_async);
          this._match_nextP = util.promisify(this.match_next_async);
        }
        *visit() {
          const visitor = this.get_visitor();
          while (true) {
            const v = this.visit_next(visitor);
            if (v === void 0) {
              break;
            }
            yield v;
          }
        }
        async *visitP() {
          const visitor = await this._get_visitorP();
          while (true) {
            const v = await this._visit_nextP(visitor);
            if (v === void 0) {
              break;
            }
            yield v;
          }
        }
        *match_iter(topic, ctx) {
          const iterator = super.match_iter(topic, ctx);
          while (true) {
            const v = this.match_next(iterator);
            if (v === void 0) {
              break;
            }
            yield v.value;
          }
        }
        async *match_iterP(topic, ctx) {
          const iterator = await this._match_iterP(topic, ctx);
          while (true) {
            const v = await this._match_nextP(iterator);
            if (v === void 0) {
              break;
            }
            yield v.value;
          }
        }
        get_trie() {
          const qlobber = new Qlobber(this.options);
          const restorer = qlobber.get_restorer();
          for (let v of this.visit()) {
            restorer(v);
          }
          return qlobber.get_trie();
        }
        get_restorer(options) {
          const restorer = super.get_restorer(options);
          return (obj) => {
            super.restore_next(restorer, obj);
          };
        }
        async get_restorerP(options) {
          const restorer = await this._get_restorerP(options);
          return async (obj) => {
            await this._restore_nextP(restorer, obj);
          };
        }
      }
      WrappedQlobberNative.is_native = true;
      WrappedQlobberNative.nonNative = Qlobber;
      return WrappedQlobberNative;
    };
  }
});

// node_modules/mqemitter/node_modules/qlobber/lib/qlobber.js
var require_qlobber3 = __commonJS({
  "node_modules/mqemitter/node_modules/qlobber/lib/qlobber.js"(exports) {
    "use strict";
    var util = __require("util");
    function Qlobber(options) {
      options = options || {};
      this._separator = options.separator || ".";
      this._wildcard_one = options.wildcard_one || "*";
      this._wildcard_some = options.wildcard_some || "#";
      this._max_words = options.max_words || 100;
      this._max_wildcard_somes = options.max_wildcard_somes || 3;
      this._match_empty_levels = options.match_empty_levels;
      this._trie = /* @__PURE__ */ new Map();
      if (options.cache_adds instanceof Map) {
        this._shortcuts = options.cache_adds;
      } else if (options.cache_adds) {
        this._shortcuts = /* @__PURE__ */ new Map();
      }
      if (options.cache_splits > 0) {
        this._cache_splits = options.cache_splits;
        this._split_cache = /* @__PURE__ */ new Map();
      }
    }
    Qlobber.prototype._initial_value = function(val) {
      return [val];
    };
    Qlobber.prototype._add_value = function(vals, val) {
      vals[vals.length] = val;
    };
    Qlobber.prototype._add_values = function(dest, origin) {
      var i, destLength = dest.length, originLength = origin.length;
      for (i = 0; i < originLength; i += 1) {
        dest[destLength + i] = origin[i];
      }
    };
    Qlobber.prototype._iter_values = function(origin, ctx) {
      return origin[Symbol.iterator](ctx);
    };
    Qlobber.prototype._remove_value = function(vals, val) {
      if (val === void 0) {
        return true;
      }
      var index = vals.lastIndexOf(val);
      if (index >= 0) {
        vals.splice(index, 1);
      }
      return vals.length === 0;
    };
    Qlobber.prototype._add = function(val, i, words, sub_trie) {
      var st, word;
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          this._add_value(st, val);
        } else {
          st = this._initial_value(val);
          sub_trie.set(this._separator, st);
        }
        return st;
      }
      word = words[i];
      st = sub_trie.get(word);
      if (!st) {
        st = /* @__PURE__ */ new Map();
        sub_trie.set(word, st);
      }
      return this._add(val, i + 1, words, st);
    };
    Qlobber.prototype._remove = function(val, i, words, sub_trie) {
      var st, word, r;
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st && this._remove_value(st, val)) {
          sub_trie.delete(this._separator);
          return true;
        }
        return false;
      }
      word = words[i];
      st = sub_trie.get(word);
      if (!st) {
        return false;
      }
      r = this._remove(val, i + 1, words, st);
      if (st.size === 0) {
        sub_trie.delete(word);
      }
      return r;
    };
    Qlobber.prototype._match_some = function(v, i, words, st, ctx) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            v = this._match(v, j, words, st, ctx);
          }
          break;
        }
      }
      return v;
    };
    Qlobber.prototype._match = function(v, i, words, sub_trie, ctx) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        v = this._match_some(v, i, words, st, ctx);
        v = this._match(v, words.length, words, st, ctx);
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          if (v.dest) {
            this._add_values(v.dest, v.source, ctx);
            this._add_values(v.dest, st, ctx);
            v = v.dest;
          } else if (v.source) {
            v.dest = v.source;
            v.source = st;
          } else {
            this._add_values(v, st, ctx);
          }
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st) {
            v = this._match(v, i + 1, words, st, ctx);
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st) {
            v = this._match(v, i + 1, words, st, ctx);
          }
        }
      }
      return v;
    };
    Qlobber.prototype._match2 = function(v, topic, ctx) {
      var vals = this._match(
        {
          source: v
        },
        0,
        this._split(topic, false),
        this._trie,
        ctx
      );
      return vals.source || vals;
    };
    Qlobber.prototype._test_some = function(v, i, words, st) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            if (this._test(v, j, words, st)) {
              return true;
            }
          }
          break;
        }
      }
      return false;
    };
    Qlobber.prototype._test = function(v, i, words, sub_trie) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        if (this._test_some(v, i, words, st) || // and we'll end up matching the rest of the words:
        this._test(v, words.length, words, st)) {
          return true;
        }
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st && this.test_values(st, v)) {
          return true;
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st && this._test(v, i + 1, words, st)) {
            return true;
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st && this._test(v, i + 1, words, st)) {
            return true;
          }
        }
      }
      return false;
    };
    Qlobber.prototype._match_some_iter = function* (i, words, st, ctx) {
      var j, w;
      for (w of st.keys()) {
        if (w !== this._separator) {
          for (j = i; j < words.length; j += 1) {
            yield* this._match_iter(j, words, st, ctx);
          }
          break;
        }
      }
    };
    Qlobber.prototype._match_iter = function* (i, words, sub_trie, ctx) {
      var word, st;
      st = sub_trie.get(this._wildcard_some);
      if (st) {
        yield* this._match_some_iter(i, words, st, ctx);
        yield* this._match_iter(words.length, words, st, ctx);
      }
      if (i === words.length) {
        st = sub_trie.get(this._separator);
        if (st) {
          yield* this._iter_values(st, ctx);
        }
      } else {
        word = words[i];
        if (word !== this._wildcard_one && word !== this._wildcard_some) {
          st = sub_trie.get(word);
          if (st) {
            yield* this._match_iter(i + 1, words, st, ctx);
          }
        }
        if (word || this._match_empty_levels) {
          st = sub_trie.get(this._wildcard_one);
          if (st) {
            yield* this._match_iter(i + 1, words, st, ctx);
          }
        }
      }
    };
    Qlobber.prototype._split_words = function(topic) {
      const r = topic.split(this._separator);
      if (r.length > this._max_words) {
        throw new Error("too many words");
      }
      return r;
    };
    Qlobber.prototype._split = function(topic, adding) {
      let r;
      if (this._split_cache) {
        r = this._split_cache.get(topic);
        if (r === void 0) {
          r = this._split_words(topic);
          this._split_cache.set(topic, r);
          if (this._split_cache.size > this._cache_splits) {
            for (let t of this._split_cache.keys()) {
              this._split_cache.delete(t);
              break;
            }
          }
        }
      } else {
        r = this._split_words(topic);
      }
      if (adding && r.reduce((n, w) => n + (w === this._wildcard_some), 0) > this._max_wildcard_somes) {
        throw new Error("too many wildcard somes");
      }
      return r;
    };
    Qlobber.prototype.add = function(topic, val) {
      var shortcut = this._shortcuts && this._shortcuts.get(topic);
      if (shortcut) {
        this._add_value(shortcut, val);
      } else {
        shortcut = this._add(val, 0, this._split(topic, true), this._trie);
        if (this._shortcuts) {
          this._shortcuts.set(topic, shortcut);
        }
      }
      return this;
    };
    Qlobber.prototype.remove = function(topic, val) {
      if (this._remove(val, 0, this._split(topic, false), this._trie) && this._shortcuts) {
        this._shortcuts.delete(topic);
      }
      return this;
    };
    Qlobber.prototype.match = function(topic, ctx) {
      return this._match2([], topic, ctx);
    };
    Qlobber.prototype.match_iter = function(topic, ctx) {
      return this._match_iter(0, this._split(topic, false), this._trie, ctx);
    };
    Qlobber.prototype.test = function(topic, val) {
      return this._test(val, 0, this._split(topic, false), this._trie);
    };
    Qlobber.prototype.test_values = function(vals, val) {
      return vals.indexOf(val) >= 0;
    };
    Qlobber.prototype.clear = function() {
      this._trie.clear();
      if (this._shortcuts) {
        this._shortcuts.clear();
      }
      if (this._split_cache) {
        this._split_cache.clear();
      }
      return this;
    };
    Qlobber.prototype.get_trie = function() {
      return this._trie;
    };
    Qlobber.prototype.visit = function* () {
      let iterators = [], iterator = this._trie.entries(), i = 0;
      while (true) {
        if (i === 0) {
          yield { type: "start_entries" };
        }
        let next = iterator.next();
        if (next.done) {
          yield { type: "end_entries" };
          let prev = iterators.pop();
          if (prev === void 0) {
            return;
          }
          [iterator, i] = prev;
          continue;
        }
        let [key, value] = next.value;
        yield { type: "entry", key };
        ++i;
        if (key === this._separator) {
          yield { type: "start_values" };
          if (value[Symbol.iterator]) {
            for (let v of value) {
              yield { type: "value", value: v };
            }
          } else {
            yield { type: "value", value };
          }
          yield { type: "end_values" };
          continue;
        }
        iterators.push([iterator, i]);
        iterator = value.entries();
        i = 0;
      }
    };
    Qlobber.prototype.get_restorer = function(options) {
      options = options || {};
      let sts = [], entry = this._trie, path = "";
      return (obj) => {
        switch (obj.type) {
          case "entry":
            entry = entry || /* @__PURE__ */ new Map();
            sts.push([entry, obj.key, path]);
            entry = entry.get(obj.key);
            if (options.cache_adds) {
              if (path) {
                path += this._separator;
              }
              path += obj.key;
            }
            break;
          case "value":
            if (entry) {
              this._add_value(entry, obj.value);
            } else {
              entry = this._initial_value(obj.value);
            }
            break;
          case "end_entries":
            if (entry && entry.size === 0) {
              entry = void 0;
            }
          /* falls through */
          case "end_values":
            let prev = sts.pop();
            if (prev === void 0) {
              entry = void 0;
              path = "";
            } else {
              let [prev_entry, key, prev_path] = prev;
              if (entry) {
                if (options.cache_adds && this._shortcuts && obj.type === "end_values") {
                  this._shortcuts.set(prev_path, entry);
                }
                prev_entry.set(key, entry);
              }
              entry = prev_entry;
              path = prev_path;
            }
            break;
        }
      };
    };
    function QlobberDedup(options) {
      Qlobber.call(this, options);
    }
    util.inherits(QlobberDedup, Qlobber);
    QlobberDedup.prototype._initial_value = function(val) {
      return (/* @__PURE__ */ new Set()).add(val);
    };
    QlobberDedup.prototype._add_value = function(vals, val) {
      vals.add(val);
    };
    QlobberDedup.prototype._add_values = function(dest, origin) {
      origin.forEach(function(val) {
        dest.add(val);
      });
    };
    QlobberDedup.prototype._remove_value = function(vals, val) {
      if (val === void 0) {
        return true;
      }
      vals.delete(val);
      return vals.size === 0;
    };
    QlobberDedup.prototype.test_values = function(vals, val) {
      return vals.has(val);
    };
    QlobberDedup.prototype.match = function(topic, ctx) {
      return this._match2(/* @__PURE__ */ new Set(), topic, ctx);
    };
    function QlobberTrue(options) {
      Qlobber.call(this, options);
    }
    util.inherits(QlobberTrue, Qlobber);
    QlobberTrue.prototype._initial_value = function() {
      return true;
    };
    QlobberTrue.prototype._add_value = function() {
    };
    QlobberTrue.prototype._remove_value = function() {
      return true;
    };
    QlobberTrue.prototype._iter_values = function* () {
      yield true;
    };
    QlobberTrue.prototype.test_values = function() {
      return true;
    };
    QlobberTrue.prototype.match = function(topic, ctx) {
      return this.test(topic, ctx);
    };
    var stream = __require("stream");
    function VisitorStream(qlobber) {
      stream.Readable.call(this, { objectMode: true });
      this._iterator = qlobber.visit();
    }
    util.inherits(VisitorStream, stream.Readable);
    VisitorStream.prototype._read = function() {
      while (true) {
        let { done, value } = this._iterator.next();
        if (done) {
          this.push(null);
          break;
        }
        if (!this.push(value)) {
          break;
        }
      }
    };
    function RestorerStream(qlobber) {
      stream.Writable.call(this, { objectMode: true });
      this._restorer = qlobber.get_restorer();
    }
    util.inherits(RestorerStream, stream.Writable);
    RestorerStream.prototype._write = function(value, _, cb) {
      this._restorer(value);
      cb();
    };
    var native_module = null;
    function set_native(qlobber_native) {
      if (qlobber_native !== native_module) {
        const wrap_native = require_wrap_native2();
        Qlobber.nativeString = wrap_native(qlobber_native.QlobberString, Qlobber);
        Qlobber.nativeNumber = wrap_native(qlobber_native.QlobberNumber, Qlobber);
        QlobberDedup.nativeString = wrap_native(qlobber_native.QlobberDedupString, QlobberDedup);
        QlobberDedup.nativeNumber = wrap_native(qlobber_native.QlobberDedupNumber, QlobberDedup);
        QlobberTrue.native = wrap_native(qlobber_native.QlobberTrue, QlobberTrue);
        native_module = qlobber_native;
      }
      return exports;
    }
    exports.Qlobber = Qlobber;
    exports.QlobberDedup = QlobberDedup;
    exports.QlobberTrue = QlobberTrue;
    exports.VisitorStream = VisitorStream;
    exports.RestorerStream = RestorerStream;
    exports.set_native = set_native;
  }
});

// node_modules/mqemitter/node_modules/qlobber/index.js
var require_qlobber4 = __commonJS({
  "node_modules/mqemitter/node_modules/qlobber/index.js"(exports, module) {
    "use strict";
    module.exports = require_qlobber3();
  }
});

// node_modules/mqemitter/mqemitter.js
var require_mqemitter = __commonJS({
  "node_modules/mqemitter/mqemitter.js"(exports, module) {
    "use strict";
    var { Qlobber } = require_qlobber4();
    var assert = __require("assert");
    var fastparallel = require_parallel();
    function MQEmitter(opts) {
      if (!(this instanceof MQEmitter)) {
        return new MQEmitter(opts);
      }
      const that = this;
      opts = opts || {};
      opts.matchEmptyLevels = opts.matchEmptyLevels === void 0 ? true : !!opts.matchEmptyLevels;
      opts.separator = opts.separator || "/";
      opts.wildcardOne = opts.wildcardOne || "+";
      opts.wildcardSome = opts.wildcardSome || "#";
      this._messageQueue = [];
      this._messageCallbacks = [];
      this._parallel = fastparallel({
        results: false,
        released
      });
      this.concurrency = opts.concurrency || 0;
      this.current = 0;
      this._doing = false;
      this._matcher = new Qlobber({
        match_empty_levels: opts.matchEmptyLevels,
        separator: opts.separator,
        wildcard_one: opts.wildcardOne,
        wildcard_some: opts.wildcardSome
      });
      this.closed = false;
      this._released = released;
      function released() {
        that.current--;
        const message = that._messageQueue.shift();
        const callback = that._messageCallbacks.shift();
        if (message) {
          that._do(message, callback);
        } else {
          that._doing = false;
        }
      }
    }
    Object.defineProperty(MQEmitter.prototype, "length", {
      get: function() {
        return this._messageQueue.length;
      },
      enumerable: true
    });
    MQEmitter.prototype.on = function on(topic, notify, done) {
      assert(topic);
      assert(notify);
      this._matcher.add(topic, notify);
      if (done) {
        setImmediate(done);
      }
      return this;
    };
    MQEmitter.prototype.removeListener = function removeListener(topic, notify, done) {
      assert(topic);
      assert(notify);
      const that = this;
      setImmediate(function() {
        that._matcher.remove(topic, notify);
        if (done) {
          done();
        }
      });
      return this;
    };
    MQEmitter.prototype.removeAllListeners = function removeListener(topic, done) {
      assert(topic);
      this._matcher.remove(topic);
      if (done) {
        setImmediate(done);
      }
      return this;
    };
    MQEmitter.prototype.emit = function emit(message, cb) {
      assert(message);
      cb = cb || noop;
      if (this.closed) {
        return cb(new Error("mqemitter is closed"));
      }
      if (this.concurrency > 0 && this.current >= this.concurrency) {
        this._messageQueue.push(message);
        this._messageCallbacks.push(cb);
        if (!this._doing) {
          process.emitWarning("MqEmitter leak detected", { detail: "For more info check: https://github.com/mcollina/mqemitter/pull/94" });
          this._released();
        }
      } else {
        this._do(message, cb);
      }
      return this;
    };
    MQEmitter.prototype.close = function close(cb) {
      this.closed = true;
      setImmediate(cb);
      return this;
    };
    MQEmitter.prototype._do = function(message, callback) {
      this._doing = true;
      const matches = this._matcher.match(message.topic);
      this.current++;
      this._parallel(this, matches, message, callback);
      return this;
    };
    function noop() {
    }
    module.exports = MQEmitter;
  }
});

// node_modules/readable-stream/lib/ours/primordials.js
var require_primordials = __commonJS({
  "node_modules/readable-stream/lib/ours/primordials.js"(exports, module) {
    "use strict";
    var AggregateError = class extends Error {
      constructor(errors) {
        if (!Array.isArray(errors)) {
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        }
        let message = "";
        for (let i = 0; i < errors.length; i++) {
          message += `    ${errors[i].stack}
`;
        }
        super(message);
        this.name = "AggregateError";
        this.errors = errors;
      }
    };
    module.exports = {
      AggregateError,
      ArrayIsArray(self) {
        return Array.isArray(self);
      },
      ArrayPrototypeIncludes(self, el) {
        return self.includes(el);
      },
      ArrayPrototypeIndexOf(self, el) {
        return self.indexOf(el);
      },
      ArrayPrototypeJoin(self, sep) {
        return self.join(sep);
      },
      ArrayPrototypeMap(self, fn) {
        return self.map(fn);
      },
      ArrayPrototypePop(self, el) {
        return self.pop(el);
      },
      ArrayPrototypePush(self, el) {
        return self.push(el);
      },
      ArrayPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      Error,
      FunctionPrototypeCall(fn, thisArgs, ...args) {
        return fn.call(thisArgs, ...args);
      },
      FunctionPrototypeSymbolHasInstance(self, instance) {
        return Function.prototype[Symbol.hasInstance].call(self, instance);
      },
      MathFloor: Math.floor,
      Number,
      NumberIsInteger: Number.isInteger,
      NumberIsNaN: Number.isNaN,
      NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      NumberParseInt: Number.parseInt,
      ObjectDefineProperties(self, props) {
        return Object.defineProperties(self, props);
      },
      ObjectDefineProperty(self, name, prop) {
        return Object.defineProperty(self, name, prop);
      },
      ObjectGetOwnPropertyDescriptor(self, name) {
        return Object.getOwnPropertyDescriptor(self, name);
      },
      ObjectKeys(obj) {
        return Object.keys(obj);
      },
      ObjectSetPrototypeOf(target, proto) {
        return Object.setPrototypeOf(target, proto);
      },
      Promise,
      PromisePrototypeCatch(self, fn) {
        return self.catch(fn);
      },
      PromisePrototypeThen(self, thenFn, catchFn) {
        return self.then(thenFn, catchFn);
      },
      PromiseReject(err) {
        return Promise.reject(err);
      },
      PromiseResolve(val) {
        return Promise.resolve(val);
      },
      ReflectApply: Reflect.apply,
      RegExpPrototypeTest(self, value) {
        return self.test(value);
      },
      SafeSet: Set,
      String,
      StringPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      StringPrototypeToLowerCase(self) {
        return self.toLowerCase();
      },
      StringPrototypeToUpperCase(self) {
        return self.toUpperCase();
      },
      StringPrototypeTrim(self) {
        return self.trim();
      },
      Symbol,
      SymbolFor: Symbol.for,
      SymbolAsyncIterator: Symbol.asyncIterator,
      SymbolHasInstance: Symbol.hasInstance,
      SymbolIterator: Symbol.iterator,
      SymbolDispose: Symbol.dispose || Symbol("Symbol.dispose"),
      SymbolAsyncDispose: Symbol.asyncDispose || Symbol("Symbol.asyncDispose"),
      TypedArrayPrototypeSet(self, buf, len) {
        return self.set(buf, len);
      },
      Boolean,
      Uint8Array
    };
  }
});

// node_modules/readable-stream/lib/ours/util/inspect.js
var require_inspect = __commonJS({
  "node_modules/readable-stream/lib/ours/util/inspect.js"(exports, module) {
    "use strict";
    module.exports = {
      format(format, ...args) {
        return format.replace(/%([sdifj])/g, function(...[_unused, type]) {
          const replacement = args.shift();
          if (type === "f") {
            return replacement.toFixed(6);
          } else if (type === "j") {
            return JSON.stringify(replacement);
          } else if (type === "s" && typeof replacement === "object") {
            const ctor = replacement.constructor !== Object ? replacement.constructor.name : "";
            return `${ctor} {}`.trim();
          } else {
            return replacement.toString();
          }
        });
      },
      inspect(value) {
        switch (typeof value) {
          case "string":
            if (value.includes("'")) {
              if (!value.includes('"')) {
                return `"${value}"`;
              } else if (!value.includes("`") && !value.includes("${")) {
                return `\`${value}\``;
              }
            }
            return `'${value}'`;
          case "number":
            if (isNaN(value)) {
              return "NaN";
            } else if (Object.is(value, -0)) {
              return String(value);
            }
            return value;
          case "bigint":
            return `${String(value)}n`;
          case "boolean":
          case "undefined":
            return String(value);
          case "object":
            return "{}";
        }
      }
    };
  }
});

// node_modules/readable-stream/lib/ours/errors.js
var require_errors = __commonJS({
  "node_modules/readable-stream/lib/ours/errors.js"(exports, module) {
    "use strict";
    var { format, inspect } = require_inspect();
    var { AggregateError: CustomAggregateError } = require_primordials();
    var AggregateError = globalThis.AggregateError || CustomAggregateError;
    var kIsNodeError = Symbol("kIsNodeError");
    var kTypes = [
      "string",
      "function",
      "number",
      "object",
      // Accept 'Function' and 'Object' as alternative to the lower cased version.
      "Function",
      "Object",
      "boolean",
      "bigint",
      "symbol"
    ];
    var classRegExp = /^([A-Z][a-z0-9]*)+$/;
    var nodeInternalPrefix = "__node_internal_";
    var codes = {};
    function assert(value, message) {
      if (!value) {
        throw new codes.ERR_INTERNAL_ASSERTION(message);
      }
    }
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function getMessage(key, msg, args) {
      if (typeof msg === "function") {
        assert(
          msg.length <= args.length,
          // Default options do not count.
          `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
        );
        return msg(...args);
      }
      const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
      assert(
        expectedLength === args.length,
        `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
      );
      if (args.length === 0) {
        return msg;
      }
      return format(msg, ...args);
    }
    function E(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      class NodeError extends Base {
        constructor(...args) {
          super(getMessage(code, message, args));
        }
        toString() {
          return `${this.name} [${code}]: ${this.message}`;
        }
      }
      Object.defineProperties(NodeError.prototype, {
        name: {
          value: Base.name,
          writable: true,
          enumerable: false,
          configurable: true
        },
        toString: {
          value() {
            return `${this.name} [${code}]: ${this.message}`;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      NodeError.prototype.code = code;
      NodeError.prototype[kIsNodeError] = true;
      codes[code] = NodeError;
    }
    function hideStackFrames(fn) {
      const hidden = nodeInternalPrefix + fn.name;
      Object.defineProperty(fn, "name", {
        value: hidden
      });
      return fn;
    }
    function aggregateTwoErrors(innerError, outerError) {
      if (innerError && outerError && innerError !== outerError) {
        if (Array.isArray(outerError.errors)) {
          outerError.errors.push(innerError);
          return outerError;
        }
        const err = new AggregateError([outerError, innerError], outerError.message);
        err.code = outerError.code;
        return err;
      }
      return innerError || outerError;
    }
    var AbortError = class extends Error {
      constructor(message = "The operation was aborted", options = void 0) {
        if (options !== void 0 && typeof options !== "object") {
          throw new codes.ERR_INVALID_ARG_TYPE("options", "Object", options);
        }
        super(message, options);
        this.code = "ABORT_ERR";
        this.name = "AbortError";
      }
    };
    E("ERR_ASSERTION", "%s", Error);
    E(
      "ERR_INVALID_ARG_TYPE",
      (name, expected, actual) => {
        assert(typeof name === "string", "'name' must be a string");
        if (!Array.isArray(expected)) {
          expected = [expected];
        }
        let msg = "The ";
        if (name.endsWith(" argument")) {
          msg += `${name} `;
        } else {
          msg += `"${name}" ${name.includes(".") ? "property" : "argument"} `;
        }
        msg += "must be ";
        const types = [];
        const instances = [];
        const other = [];
        for (const value of expected) {
          assert(typeof value === "string", "All expected entries have to be of type string");
          if (kTypes.includes(value)) {
            types.push(value.toLowerCase());
          } else if (classRegExp.test(value)) {
            instances.push(value);
          } else {
            assert(value !== "object", 'The value "object" should be written as "Object"');
            other.push(value);
          }
        }
        if (instances.length > 0) {
          const pos = types.indexOf("object");
          if (pos !== -1) {
            types.splice(types, pos, 1);
            instances.push("Object");
          }
        }
        if (types.length > 0) {
          switch (types.length) {
            case 1:
              msg += `of type ${types[0]}`;
              break;
            case 2:
              msg += `one of type ${types[0]} or ${types[1]}`;
              break;
            default: {
              const last = types.pop();
              msg += `one of type ${types.join(", ")}, or ${last}`;
            }
          }
          if (instances.length > 0 || other.length > 0) {
            msg += " or ";
          }
        }
        if (instances.length > 0) {
          switch (instances.length) {
            case 1:
              msg += `an instance of ${instances[0]}`;
              break;
            case 2:
              msg += `an instance of ${instances[0]} or ${instances[1]}`;
              break;
            default: {
              const last = instances.pop();
              msg += `an instance of ${instances.join(", ")}, or ${last}`;
            }
          }
          if (other.length > 0) {
            msg += " or ";
          }
        }
        switch (other.length) {
          case 0:
            break;
          case 1:
            if (other[0].toLowerCase() !== other[0]) {
              msg += "an ";
            }
            msg += `${other[0]}`;
            break;
          case 2:
            msg += `one of ${other[0]} or ${other[1]}`;
            break;
          default: {
            const last = other.pop();
            msg += `one of ${other.join(", ")}, or ${last}`;
          }
        }
        if (actual == null) {
          msg += `. Received ${actual}`;
        } else if (typeof actual === "function" && actual.name) {
          msg += `. Received function ${actual.name}`;
        } else if (typeof actual === "object") {
          var _actual$constructor;
          if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== void 0 && _actual$constructor.name) {
            msg += `. Received an instance of ${actual.constructor.name}`;
          } else {
            const inspected = inspect(actual, {
              depth: -1
            });
            msg += `. Received ${inspected}`;
          }
        } else {
          let inspected = inspect(actual, {
            colors: false
          });
          if (inspected.length > 25) {
            inspected = `${inspected.slice(0, 25)}...`;
          }
          msg += `. Received type ${typeof actual} (${inspected})`;
        }
        return msg;
      },
      TypeError
    );
    E(
      "ERR_INVALID_ARG_VALUE",
      (name, value, reason = "is invalid") => {
        let inspected = inspect(value);
        if (inspected.length > 128) {
          inspected = inspected.slice(0, 128) + "...";
        }
        const type = name.includes(".") ? "property" : "argument";
        return `The ${type} '${name}' ${reason}. Received ${inspected}`;
      },
      TypeError
    );
    E(
      "ERR_INVALID_RETURN_VALUE",
      (input, name, value) => {
        var _value$constructor;
        const type = value !== null && value !== void 0 && (_value$constructor = value.constructor) !== null && _value$constructor !== void 0 && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
        return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
      },
      TypeError
    );
    E(
      "ERR_MISSING_ARGS",
      (...args) => {
        assert(args.length > 0, "At least one arg needs to be specified");
        let msg;
        const len = args.length;
        args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(" or ");
        switch (len) {
          case 1:
            msg += `The ${args[0]} argument`;
            break;
          case 2:
            msg += `The ${args[0]} and ${args[1]} arguments`;
            break;
          default:
            {
              const last = args.pop();
              msg += `The ${args.join(", ")}, and ${last} arguments`;
            }
            break;
        }
        return `${msg} must be specified`;
      },
      TypeError
    );
    E(
      "ERR_OUT_OF_RANGE",
      (str, range, input) => {
        assert(range, 'Missing "range" argument');
        let received;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          const limit = BigInt(2) ** BigInt(32);
          if (input > limit || input < -limit) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        } else {
          received = inspect(input);
        }
        return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
      },
      RangeError
    );
    E("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
    E("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
    E("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
    E("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
    E("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
    E("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
    E("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
    E("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
    E("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
    E("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
    E("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
    module.exports = {
      AbortError,
      aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
      hideStackFrames,
      codes
    };
  }
});

// node_modules/event-target-shim/dist/event-target-shim.js
var require_event_target_shim = __commonJS({
  "node_modules/event-target-shim/dist/event-target-shim.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var privateData = /* @__PURE__ */ new WeakMap();
    var wrappers = /* @__PURE__ */ new WeakMap();
    function pd(event) {
      const retv = privateData.get(event);
      console.assert(
        retv != null,
        "'this' is expected an Event object, but got",
        event
      );
      return retv;
    }
    function setCancelFlag(data) {
      if (data.passiveListener != null) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
          console.error(
            "Unable to preventDefault inside passive event listener invocation.",
            data.passiveListener
          );
        }
        return;
      }
      if (!data.event.cancelable) {
        return;
      }
      data.canceled = true;
      if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
      }
    }
    function Event(eventTarget, event) {
      privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        immediateStopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now()
      });
      Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
      const keys = Object.keys(event);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
          Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
      }
    }
    Event.prototype = {
      /**
       * The type of this event.
       * @type {string}
       */
      get type() {
        return pd(this).event.type;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get target() {
        return pd(this).eventTarget;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get currentTarget() {
        return pd(this).currentTarget;
      },
      /**
       * @returns {EventTarget[]} The composed path of this event.
       */
      composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
          return [];
        }
        return [currentTarget];
      },
      /**
       * Constant of NONE.
       * @type {number}
       */
      get NONE() {
        return 0;
      },
      /**
       * Constant of CAPTURING_PHASE.
       * @type {number}
       */
      get CAPTURING_PHASE() {
        return 1;
      },
      /**
       * Constant of AT_TARGET.
       * @type {number}
       */
      get AT_TARGET() {
        return 2;
      },
      /**
       * Constant of BUBBLING_PHASE.
       * @type {number}
       */
      get BUBBLING_PHASE() {
        return 3;
      },
      /**
       * The target of this event.
       * @type {number}
       */
      get eventPhase() {
        return pd(this).eventPhase;
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
          data.event.stopPropagation();
        }
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
          data.event.stopImmediatePropagation();
        }
      },
      /**
       * The flag to be bubbling.
       * @type {boolean}
       */
      get bubbles() {
        return Boolean(pd(this).event.bubbles);
      },
      /**
       * The flag to be cancelable.
       * @type {boolean}
       */
      get cancelable() {
        return Boolean(pd(this).event.cancelable);
      },
      /**
       * Cancel this event.
       * @returns {void}
       */
      preventDefault() {
        setCancelFlag(pd(this));
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       */
      get defaultPrevented() {
        return pd(this).canceled;
      },
      /**
       * The flag to be composed.
       * @type {boolean}
       */
      get composed() {
        return Boolean(pd(this).event.composed);
      },
      /**
       * The unix time of this event.
       * @type {number}
       */
      get timeStamp() {
        return pd(this).timeStamp;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       * @deprecated
       */
      get srcElement() {
        return pd(this).eventTarget;
      },
      /**
       * The flag to stop event bubbling.
       * @type {boolean}
       * @deprecated
       */
      get cancelBubble() {
        return pd(this).stopped;
      },
      set cancelBubble(value) {
        if (!value) {
          return;
        }
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
          data.event.cancelBubble = true;
        }
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       * @deprecated
       */
      get returnValue() {
        return !pd(this).canceled;
      },
      set returnValue(value) {
        if (!value) {
          setCancelFlag(pd(this));
        }
      },
      /**
       * Initialize this event object. But do nothing under event dispatching.
       * @param {string} type The event type.
       * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
       * @param {boolean} [cancelable=false] The flag to be possible to cancel.
       * @deprecated
       */
      initEvent() {
      }
    };
    Object.defineProperty(Event.prototype, "constructor", {
      value: Event,
      configurable: true,
      writable: true
    });
    if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
      Object.setPrototypeOf(Event.prototype, window.Event.prototype);
      wrappers.set(window.Event.prototype, Event);
    }
    function defineRedirectDescriptor(key) {
      return {
        get() {
          return pd(this).event[key];
        },
        set(value) {
          pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineCallDescriptor(key) {
      return {
        value() {
          const event = pd(this).event;
          return event[key].apply(event, arguments);
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineWrapper(BaseEvent, proto) {
      const keys = Object.keys(proto);
      if (keys.length === 0) {
        return BaseEvent;
      }
      function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
      }
      CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true }
      });
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, key);
          const isFunc = typeof descriptor.value === "function";
          Object.defineProperty(
            CustomEvent.prototype,
            key,
            isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key)
          );
        }
      }
      return CustomEvent;
    }
    function getWrapper(proto) {
      if (proto == null || proto === Object.prototype) {
        return Event;
      }
      let wrapper = wrappers.get(proto);
      if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
      }
      return wrapper;
    }
    function wrapEvent(eventTarget, event) {
      const Wrapper = getWrapper(Object.getPrototypeOf(event));
      return new Wrapper(eventTarget, event);
    }
    function isStopped(event) {
      return pd(event).immediateStopped;
    }
    function setEventPhase(event, eventPhase) {
      pd(event).eventPhase = eventPhase;
    }
    function setCurrentTarget(event, currentTarget) {
      pd(event).currentTarget = currentTarget;
    }
    function setPassiveListener(event, passiveListener) {
      pd(event).passiveListener = passiveListener;
    }
    var listenersMap = /* @__PURE__ */ new WeakMap();
    var CAPTURE = 1;
    var BUBBLE = 2;
    var ATTRIBUTE = 3;
    function isObject(x) {
      return x !== null && typeof x === "object";
    }
    function getListeners(eventTarget) {
      const listeners = listenersMap.get(eventTarget);
      if (listeners == null) {
        throw new TypeError(
          "'this' is expected an EventTarget object, but got another value."
        );
      }
      return listeners;
    }
    function defineEventAttributeDescriptor(eventName) {
      return {
        get() {
          const listeners = getListeners(this);
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              return node.listener;
            }
            node = node.next;
          }
          return null;
        },
        set(listener) {
          if (typeof listener !== "function" && !isObject(listener)) {
            listener = null;
          }
          const listeners = getListeners(this);
          let prev = null;
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
            } else {
              prev = node;
            }
            node = node.next;
          }
          if (listener !== null) {
            const newNode = {
              listener,
              listenerType: ATTRIBUTE,
              passive: false,
              once: false,
              next: null
            };
            if (prev === null) {
              listeners.set(eventName, newNode);
            } else {
              prev.next = newNode;
            }
          }
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineEventAttribute(eventTargetPrototype, eventName) {
      Object.defineProperty(
        eventTargetPrototype,
        `on${eventName}`,
        defineEventAttributeDescriptor(eventName)
      );
    }
    function defineCustomEventTarget(eventNames) {
      function CustomEventTarget() {
        EventTarget.call(this);
      }
      CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
          value: CustomEventTarget,
          configurable: true,
          writable: true
        }
      });
      for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
      }
      return CustomEventTarget;
    }
    function EventTarget() {
      if (this instanceof EventTarget) {
        listenersMap.set(this, /* @__PURE__ */ new Map());
        return;
      }
      if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0]);
      }
      if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
          types[i] = arguments[i];
        }
        return defineCustomEventTarget(types);
      }
      throw new TypeError("Cannot call a class as a function");
    }
    EventTarget.prototype = {
      /**
       * Add a given listener to this event target.
       * @param {string} eventName The event name to add.
       * @param {Function} listener The listener to add.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      addEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        if (typeof listener !== "function" && !isObject(listener)) {
          throw new TypeError("'listener' should be a function or an object.");
        }
        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
          listener,
          listenerType,
          passive: optionsIsObj && Boolean(options.passive),
          once: optionsIsObj && Boolean(options.once),
          next: null
        };
        let node = listeners.get(eventName);
        if (node === void 0) {
          listeners.set(eventName, newNode);
          return;
        }
        let prev = null;
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            return;
          }
          prev = node;
          node = node.next;
        }
        prev.next = newNode;
      },
      /**
       * Remove a given listener from this event target.
       * @param {string} eventName The event name to remove.
       * @param {Function} listener The listener to remove.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      removeEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
            return;
          }
          prev = node;
          node = node.next;
        }
      },
      /**
       * Dispatch a given event.
       * @param {Event|{type:string}} event The event to dispatch.
       * @returns {boolean} `false` if canceled.
       */
      dispatchEvent(event) {
        if (event == null || typeof event.type !== "string") {
          throw new TypeError('"event.type" should be a string.');
        }
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
          return true;
        }
        const wrappedEvent = wrapEvent(this, event);
        let prev = null;
        while (node != null) {
          if (node.once) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }
          setPassiveListener(
            wrappedEvent,
            node.passive ? node.listener : null
          );
          if (typeof node.listener === "function") {
            try {
              node.listener.call(this, wrappedEvent);
            } catch (err) {
              if (typeof console !== "undefined" && typeof console.error === "function") {
                console.error(err);
              }
            }
          } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
            node.listener.handleEvent(wrappedEvent);
          }
          if (isStopped(wrappedEvent)) {
            break;
          }
          node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);
        return !wrappedEvent.defaultPrevented;
      }
    };
    Object.defineProperty(EventTarget.prototype, "constructor", {
      value: EventTarget,
      configurable: true,
      writable: true
    });
    if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
      Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
    }
    exports.defineEventAttribute = defineEventAttribute;
    exports.EventTarget = EventTarget;
    exports.default = EventTarget;
    module.exports = EventTarget;
    module.exports.EventTarget = module.exports["default"] = EventTarget;
    module.exports.defineEventAttribute = defineEventAttribute;
  }
});

// node_modules/abort-controller/dist/abort-controller.js
var require_abort_controller = __commonJS({
  "node_modules/abort-controller/dist/abort-controller.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var eventTargetShim = require_event_target_shim();
    var AbortSignal = class extends eventTargetShim.EventTarget {
      /**
       * AbortSignal cannot be constructed directly.
       */
      constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
      }
      /**
       * Returns `true` if this `AbortSignal`'s `AbortController` has signaled to abort, and `false` otherwise.
       */
      get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== "boolean") {
          throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        }
        return aborted;
      }
    };
    eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
    function createAbortSignal() {
      const signal = Object.create(AbortSignal.prototype);
      eventTargetShim.EventTarget.call(signal);
      abortedFlags.set(signal, false);
      return signal;
    }
    function abortSignal(signal) {
      if (abortedFlags.get(signal) !== false) {
        return;
      }
      abortedFlags.set(signal, true);
      signal.dispatchEvent({ type: "abort" });
    }
    var abortedFlags = /* @__PURE__ */ new WeakMap();
    Object.defineProperties(AbortSignal.prototype, {
      aborted: { enumerable: true }
    });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortSignal"
      });
    }
    var AbortController = class {
      /**
       * Initialize this controller.
       */
      constructor() {
        signals.set(this, createAbortSignal());
      }
      /**
       * Returns the `AbortSignal` object associated with this object.
       */
      get signal() {
        return getSignal(this);
      }
      /**
       * Abort and signal to any observers that the associated activity is to be aborted.
       */
      abort() {
        abortSignal(getSignal(this));
      }
    };
    var signals = /* @__PURE__ */ new WeakMap();
    function getSignal(controller) {
      const signal = signals.get(controller);
      if (signal == null) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
      }
      return signal;
    }
    Object.defineProperties(AbortController.prototype, {
      signal: { enumerable: true },
      abort: { enumerable: true }
    });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController"
      });
    }
    exports.AbortController = AbortController;
    exports.AbortSignal = AbortSignal;
    exports.default = AbortController;
    module.exports = AbortController;
    module.exports.AbortController = module.exports["default"] = AbortController;
    module.exports.AbortSignal = AbortSignal;
  }
});

// node_modules/readable-stream/lib/ours/util.js
var require_util = __commonJS({
  "node_modules/readable-stream/lib/ours/util.js"(exports, module) {
    "use strict";
    var bufferModule = __require("buffer");
    var { format, inspect } = require_inspect();
    var {
      codes: { ERR_INVALID_ARG_TYPE }
    } = require_errors();
    var { kResistStopPropagation, AggregateError, SymbolDispose } = require_primordials();
    var AbortSignal = globalThis.AbortSignal || require_abort_controller().AbortSignal;
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var AsyncFunction = Object.getPrototypeOf(async function() {
    }).constructor;
    var Blob2 = globalThis.Blob || bufferModule.Blob;
    var isBlob = typeof Blob2 !== "undefined" ? function isBlob2(b) {
      return b instanceof Blob2;
    } : function isBlob2(b) {
      return false;
    };
    var validateAbortSignal = (signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    };
    var validateFunction = (value, name) => {
      if (typeof value !== "function") {
        throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
      }
    };
    module.exports = {
      AggregateError,
      kEmptyObject: Object.freeze({}),
      once(callback) {
        let called = false;
        return function(...args) {
          if (called) {
            return;
          }
          called = true;
          callback.apply(this, args);
        };
      },
      createDeferredPromise: function() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return {
          promise,
          resolve,
          reject
        };
      },
      promisify(fn) {
        return new Promise((resolve, reject) => {
          fn((err, ...args) => {
            if (err) {
              return reject(err);
            }
            return resolve(...args);
          });
        });
      },
      debuglog() {
        return function() {
        };
      },
      format,
      inspect,
      types: {
        isAsyncFunction(fn) {
          return fn instanceof AsyncFunction;
        },
        isArrayBufferView(arr) {
          return ArrayBuffer.isView(arr);
        }
      },
      isBlob,
      deprecate(fn, message) {
        return fn;
      },
      addAbortListener: __require("events").addAbortListener || function addAbortListener(signal, listener) {
        if (signal === void 0) {
          throw new ERR_INVALID_ARG_TYPE("signal", "AbortSignal", signal);
        }
        validateAbortSignal(signal, "signal");
        validateFunction(listener, "listener");
        let removeEventListener;
        if (signal.aborted) {
          queueMicrotask(() => listener());
        } else {
          signal.addEventListener("abort", listener, {
            __proto__: null,
            once: true,
            [kResistStopPropagation]: true
          });
          removeEventListener = () => {
            signal.removeEventListener("abort", listener);
          };
        }
        return {
          __proto__: null,
          [SymbolDispose]() {
            var _removeEventListener;
            (_removeEventListener = removeEventListener) === null || _removeEventListener === void 0 ? void 0 : _removeEventListener();
          }
        };
      },
      AbortSignalAny: AbortSignal.any || function AbortSignalAny(signals) {
        if (signals.length === 1) {
          return signals[0];
        }
        const ac = new AbortController();
        const abort = () => ac.abort();
        signals.forEach((signal) => {
          validateAbortSignal(signal, "signals");
          signal.addEventListener("abort", abort, {
            once: true
          });
        });
        ac.signal.addEventListener(
          "abort",
          () => {
            signals.forEach((signal) => signal.removeEventListener("abort", abort));
          },
          {
            once: true
          }
        );
        return ac.signal;
      }
    };
    module.exports.promisify.custom = Symbol.for("nodejs.util.promisify.custom");
  }
});

// node_modules/readable-stream/lib/internal/validators.js
var require_validators = __commonJS({
  "node_modules/readable-stream/lib/internal/validators.js"(exports, module) {
    "use strict";
    var {
      ArrayIsArray,
      ArrayPrototypeIncludes,
      ArrayPrototypeJoin,
      ArrayPrototypeMap,
      NumberIsInteger,
      NumberIsNaN,
      NumberMAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER,
      NumberParseInt,
      ObjectPrototypeHasOwnProperty,
      RegExpPrototypeExec,
      String: String2,
      StringPrototypeToUpperCase,
      StringPrototypeTrim
    } = require_primordials();
    var {
      hideStackFrames,
      codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL }
    } = require_errors();
    var { normalizeEncoding } = require_util();
    var { isAsyncFunction, isArrayBufferView } = require_util().types;
    var signals = {};
    function isInt32(value) {
      return value === (value | 0);
    }
    function isUint32(value) {
      return value === value >>> 0;
    }
    var octalReg = /^[0-7]+$/;
    var modeDesc = "must be a 32-bit unsigned integer or an octal string";
    function parseFileMode(value, name, def) {
      if (typeof value === "undefined") {
        value = def;
      }
      if (typeof value === "string") {
        if (RegExpPrototypeExec(octalReg, value) === null) {
          throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
        }
        value = NumberParseInt(value, 8);
      }
      validateUint32(value, name);
      return value;
    }
    var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
      if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    });
    var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
      if (typeof value !== "number") {
        throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      }
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    var validateUint32 = hideStackFrames((value, name, positive = false) => {
      if (typeof value !== "number") {
        throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      }
      const min = positive ? 1 : 0;
      const max = 4294967295;
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    function validateString(value, name) {
      if (typeof value !== "string") throw new ERR_INVALID_ARG_TYPE(name, "string", value);
    }
    function validateNumber(value, name, min = void 0, max) {
      if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
        throw new ERR_OUT_OF_RANGE(
          name,
          `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`,
          value
        );
      }
    }
    var validateOneOf = hideStackFrames((value, name, oneOf) => {
      if (!ArrayPrototypeIncludes(oneOf, value)) {
        const allowed = ArrayPrototypeJoin(
          ArrayPrototypeMap(oneOf, (v) => typeof v === "string" ? `'${v}'` : String2(v)),
          ", "
        );
        const reason = "must be one of: " + allowed;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateBoolean(value, name) {
      if (typeof value !== "boolean") throw new ERR_INVALID_ARG_TYPE(name, "boolean", value);
    }
    function getOwnPropertyValueOrDefault(options, key, defaultValue) {
      return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
    }
    var validateObject = hideStackFrames((value, name, options = null) => {
      const allowArray = getOwnPropertyValueOrDefault(options, "allowArray", false);
      const allowFunction = getOwnPropertyValueOrDefault(options, "allowFunction", false);
      const nullable = getOwnPropertyValueOrDefault(options, "nullable", false);
      if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function")) {
        throw new ERR_INVALID_ARG_TYPE(name, "Object", value);
      }
    });
    var validateDictionary = hideStackFrames((value, name) => {
      if (value != null && typeof value !== "object" && typeof value !== "function") {
        throw new ERR_INVALID_ARG_TYPE(name, "a dictionary", value);
      }
    });
    var validateArray = hideStackFrames((value, name, minLength = 0) => {
      if (!ArrayIsArray(value)) {
        throw new ERR_INVALID_ARG_TYPE(name, "Array", value);
      }
      if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateStringArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateString(value[i], `${name}[${i}]`);
      }
    }
    function validateBooleanArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateBoolean(value[i], `${name}[${i}]`);
      }
    }
    function validateAbortSignalArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        const signal = value[i];
        const indexedName = `${name}[${i}]`;
        if (signal == null) {
          throw new ERR_INVALID_ARG_TYPE(indexedName, "AbortSignal", signal);
        }
        validateAbortSignal(signal, indexedName);
      }
    }
    function validateSignalName(signal, name = "signal") {
      validateString(signal, name);
      if (signals[signal] === void 0) {
        if (signals[StringPrototypeToUpperCase(signal)] !== void 0) {
          throw new ERR_UNKNOWN_SIGNAL(signal + " (signals must use all capital letters)");
        }
        throw new ERR_UNKNOWN_SIGNAL(signal);
      }
    }
    var validateBuffer = hideStackFrames((buffer, name = "buffer") => {
      if (!isArrayBufferView(buffer)) {
        throw new ERR_INVALID_ARG_TYPE(name, ["Buffer", "TypedArray", "DataView"], buffer);
      }
    });
    function validateEncoding(data, encoding) {
      const normalizedEncoding = normalizeEncoding(encoding);
      const length = data.length;
      if (normalizedEncoding === "hex" && length % 2 !== 0) {
        throw new ERR_INVALID_ARG_VALUE("encoding", encoding, `is invalid for data of length ${length}`);
      }
    }
    function validatePort(port, name = "Port", allowZero = true) {
      if (typeof port !== "number" && typeof port !== "string" || typeof port === "string" && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 65535 || port === 0 && !allowZero) {
        throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
      }
      return port | 0;
    }
    var validateAbortSignal = hideStackFrames((signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    });
    var validateFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function") throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
    });
    var validatePlainFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function" || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
    });
    var validateUndefined = hideStackFrames((value, name) => {
      if (value !== void 0) throw new ERR_INVALID_ARG_TYPE(name, "undefined", value);
    });
    function validateUnion(value, name, union) {
      if (!ArrayPrototypeIncludes(union, value)) {
        throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, "|")}')`, value);
      }
    }
    var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
    function validateLinkHeaderFormat(value, name) {
      if (typeof value === "undefined" || !RegExpPrototypeExec(linkValueRegExp, value)) {
        throw new ERR_INVALID_ARG_VALUE(
          name,
          value,
          'must be an array or string of format "</styles.css>; rel=preload; as=style"'
        );
      }
    }
    function validateLinkHeaderValue(hints) {
      if (typeof hints === "string") {
        validateLinkHeaderFormat(hints, "hints");
        return hints;
      } else if (ArrayIsArray(hints)) {
        const hintsLength = hints.length;
        let result = "";
        if (hintsLength === 0) {
          return result;
        }
        for (let i = 0; i < hintsLength; i++) {
          const link = hints[i];
          validateLinkHeaderFormat(link, "hints");
          result += link;
          if (i !== hintsLength - 1) {
            result += ", ";
          }
        }
        return result;
      }
      throw new ERR_INVALID_ARG_VALUE(
        "hints",
        hints,
        'must be an array or string of format "</styles.css>; rel=preload; as=style"'
      );
    }
    module.exports = {
      isInt32,
      isUint32,
      parseFileMode,
      validateArray,
      validateStringArray,
      validateBooleanArray,
      validateAbortSignalArray,
      validateBoolean,
      validateBuffer,
      validateDictionary,
      validateEncoding,
      validateFunction,
      validateInt32,
      validateInteger,
      validateNumber,
      validateObject,
      validateOneOf,
      validatePlainFunction,
      validatePort,
      validateSignalName,
      validateString,
      validateUint32,
      validateUndefined,
      validateUnion,
      validateAbortSignal,
      validateLinkHeaderValue
    };
  }
});

// node_modules/process/index.js
var require_process = __commonJS({
  "node_modules/process/index.js"(exports, module) {
    module.exports = global.process;
  }
});

// node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/utils.js"(exports, module) {
    "use strict";
    var { SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials();
    var kIsDestroyed = SymbolFor("nodejs.stream.destroyed");
    var kIsErrored = SymbolFor("nodejs.stream.errored");
    var kIsReadable = SymbolFor("nodejs.stream.readable");
    var kIsWritable = SymbolFor("nodejs.stream.writable");
    var kIsDisturbed = SymbolFor("nodejs.stream.disturbed");
    var kIsClosedPromise = SymbolFor("nodejs.webstream.isClosedPromise");
    var kControllerErrorFunction = SymbolFor("nodejs.webstream.controllerErrorFunction");
    function isReadableNodeStream(obj, strict = false) {
      var _obj$_readableState;
      return !!(obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!strict || typeof obj.pause === "function" && typeof obj.resume === "function") && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === void 0 ? void 0 : _obj$_readableState.readable) !== false) && // Duplex
      (!obj._writableState || obj._readableState));
    }
    function isWritableNodeStream(obj) {
      var _obj$_writableState;
      return !!(obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === void 0 ? void 0 : _obj$_writableState.writable) !== false));
    }
    function isDuplexNodeStream(obj) {
      return !!(obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function");
    }
    function isNodeStream(obj) {
      return obj && (obj._readableState || obj._writableState || typeof obj.write === "function" && typeof obj.on === "function" || typeof obj.pipe === "function" && typeof obj.on === "function");
    }
    function isReadableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.pipeThrough === "function" && typeof obj.getReader === "function" && typeof obj.cancel === "function");
    }
    function isWritableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === "function" && typeof obj.abort === "function");
    }
    function isTransformStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.readable === "object" && typeof obj.writable === "object");
    }
    function isWebStream(obj) {
      return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
    }
    function isIterable(obj, isAsync) {
      if (obj == null) return false;
      if (isAsync === true) return typeof obj[SymbolAsyncIterator] === "function";
      if (isAsync === false) return typeof obj[SymbolIterator] === "function";
      return typeof obj[SymbolAsyncIterator] === "function" || typeof obj[SymbolIterator] === "function";
    }
    function isDestroyed(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !!(stream.destroyed || stream[kIsDestroyed] || state !== null && state !== void 0 && state.destroyed);
    }
    function isWritableEnded(stream) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableEnded === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.ended) !== "boolean") return null;
      return wState.ended;
    }
    function isWritableFinished(stream, strict) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableFinished === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.finished) !== "boolean") return null;
      return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
    }
    function isReadableEnded(stream) {
      if (!isReadableNodeStream(stream)) return null;
      if (stream.readableEnded === true) return true;
      const rState = stream._readableState;
      if (!rState || rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.ended) !== "boolean") return null;
      return rState.ended;
    }
    function isReadableFinished(stream, strict) {
      if (!isReadableNodeStream(stream)) return null;
      const rState = stream._readableState;
      if (rState !== null && rState !== void 0 && rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.endEmitted) !== "boolean") return null;
      return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
    }
    function isReadable(stream) {
      if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !== "boolean") return null;
      if (isDestroyed(stream)) return false;
      return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
    }
    function isWritable(stream) {
      if (stream && stream[kIsWritable] != null) return stream[kIsWritable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.writable) !== "boolean") return null;
      if (isDestroyed(stream)) return false;
      return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
    }
    function isFinished(stream, opts) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (isDestroyed(stream)) {
        return true;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.readable) !== false && isReadable(stream)) {
        return false;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.writable) !== false && isWritable(stream)) {
        return false;
      }
      return true;
    }
    function isWritableErrored(stream) {
      var _stream$_writableStat, _stream$_writableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.writableErrored) {
        return stream.writableErrored;
      }
      return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === void 0 ? void 0 : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== void 0 ? _stream$_writableStat : null;
    }
    function isReadableErrored(stream) {
      var _stream$_readableStat, _stream$_readableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.readableErrored) {
        return stream.readableErrored;
      }
      return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === void 0 ? void 0 : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== void 0 ? _stream$_readableStat : null;
    }
    function isClosed(stream) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (typeof stream.closed === "boolean") {
        return stream.closed;
      }
      const wState = stream._writableState;
      const rState = stream._readableState;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.closed) === "boolean" || typeof (rState === null || rState === void 0 ? void 0 : rState.closed) === "boolean") {
        return (wState === null || wState === void 0 ? void 0 : wState.closed) || (rState === null || rState === void 0 ? void 0 : rState.closed);
      }
      if (typeof stream._closed === "boolean" && isOutgoingMessage(stream)) {
        return stream._closed;
      }
      return null;
    }
    function isOutgoingMessage(stream) {
      return typeof stream._closed === "boolean" && typeof stream._defaultKeepAlive === "boolean" && typeof stream._removedConnection === "boolean" && typeof stream._removedContLen === "boolean";
    }
    function isServerResponse(stream) {
      return typeof stream._sent100 === "boolean" && isOutgoingMessage(stream);
    }
    function isServerRequest(stream) {
      var _stream$req;
      return typeof stream._consuming === "boolean" && typeof stream._dumped === "boolean" && ((_stream$req = stream.req) === null || _stream$req === void 0 ? void 0 : _stream$req.upgradeOrConnect) === void 0;
    }
    function willEmitClose(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
    }
    function isDisturbed(stream) {
      var _stream$kIsDisturbed;
      return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== void 0 ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
    }
    function isErrored(stream) {
      var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
      return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== void 0 ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== void 0 ? _ref5 : stream.writableErrored) !== null && _ref4 !== void 0 ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === void 0 ? void 0 : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== void 0 ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === void 0 ? void 0 : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== void 0 ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === void 0 ? void 0 : _stream$_readableStat4.errored) !== null && _ref !== void 0 ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === void 0 ? void 0 : _stream$_writableStat4.errored));
    }
    module.exports = {
      isDestroyed,
      kIsDestroyed,
      isDisturbed,
      kIsDisturbed,
      isErrored,
      kIsErrored,
      isReadable,
      kIsReadable,
      kIsClosedPromise,
      kControllerErrorFunction,
      kIsWritable,
      isClosed,
      isDuplexNodeStream,
      isFinished,
      isIterable,
      isReadableNodeStream,
      isReadableStream,
      isReadableEnded,
      isReadableFinished,
      isReadableErrored,
      isNodeStream,
      isWebStream,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableEnded,
      isWritableFinished,
      isWritableErrored,
      isServerRequest,
      isServerResponse,
      willEmitClose,
      isTransformStream
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports, module) {
    "use strict";
    var process2 = require_process();
    var { AbortError, codes } = require_errors();
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
    var { kEmptyObject, once } = require_util();
    var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators();
    var { Promise: Promise2, PromisePrototypeThen, SymbolDispose } = require_primordials();
    var {
      isClosed,
      isReadable,
      isReadableNodeStream,
      isReadableStream,
      isReadableFinished,
      isReadableErrored,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableFinished,
      isWritableErrored,
      isNodeStream,
      willEmitClose: _willEmitClose,
      kIsClosedPromise
    } = require_utils();
    var addAbortListener;
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    var nop = () => {
    };
    function eos(stream, options, callback) {
      var _options$readable, _options$writable;
      if (arguments.length === 2) {
        callback = options;
        options = kEmptyObject;
      } else if (options == null) {
        options = kEmptyObject;
      } else {
        validateObject(options, "options");
      }
      validateFunction(callback, "callback");
      validateAbortSignal(options.signal, "options.signal");
      callback = once(callback);
      if (isReadableStream(stream) || isWritableStream(stream)) {
        return eosWeb(stream, options, callback);
      }
      if (!isNodeStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      }
      const readable = (_options$readable = options.readable) !== null && _options$readable !== void 0 ? _options$readable : isReadableNodeStream(stream);
      const writable = (_options$writable = options.writable) !== null && _options$writable !== void 0 ? _options$writable : isWritableNodeStream(stream);
      const wState = stream._writableState;
      const rState = stream._readableState;
      const onlegacyfinish = () => {
        if (!stream.writable) {
          onfinish();
        }
      };
      let willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
      let writableFinished = isWritableFinished(stream, false);
      const onfinish = () => {
        writableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.readable || readable)) {
          return;
        }
        if (!readable || readableFinished) {
          callback.call(stream);
        }
      };
      let readableFinished = isReadableFinished(stream, false);
      const onend = () => {
        readableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.writable || writable)) {
          return;
        }
        if (!writable || writableFinished) {
          callback.call(stream);
        }
      };
      const onerror = (err) => {
        callback.call(stream, err);
      };
      let closed = isClosed(stream);
      const onclose = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean") {
          return callback.call(stream, errored);
        }
        if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
          if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        if (writable && !writableFinished) {
          if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        callback.call(stream);
      };
      const onclosed = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean") {
          return callback.call(stream, errored);
        }
        callback.call(stream);
      };
      const onrequest = () => {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        if (!willEmitClose) {
          stream.on("abort", onclose);
        }
        if (stream.req) {
          onrequest();
        } else {
          stream.on("request", onrequest);
        }
      } else if (writable && !wState) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      if (!willEmitClose && typeof stream.aborted === "boolean") {
        stream.on("aborted", onclose);
      }
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (options.error !== false) {
        stream.on("error", onerror);
      }
      stream.on("close", onclose);
      if (closed) {
        process2.nextTick(onclose);
      } else if (wState !== null && wState !== void 0 && wState.errorEmitted || rState !== null && rState !== void 0 && rState.errorEmitted) {
        if (!willEmitClose) {
          process2.nextTick(onclosed);
        }
      } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
        process2.nextTick(onclosed);
      } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
        process2.nextTick(onclosed);
      } else if (rState && stream.req && stream.aborted) {
        process2.nextTick(onclosed);
      }
      const cleanup = () => {
        callback = nop;
        stream.removeListener("aborted", onclose);
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
      if (options.signal && !closed) {
        const abort = () => {
          const endCallback = callback;
          cleanup();
          endCallback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          addAbortListener = addAbortListener || require_util().addAbortListener;
          const disposable = addAbortListener(options.signal, abort);
          const originalCallback = callback;
          callback = once((...args) => {
            disposable[SymbolDispose]();
            originalCallback.apply(stream, args);
          });
        }
      }
      return cleanup;
    }
    function eosWeb(stream, options, callback) {
      let isAborted = false;
      let abort = nop;
      if (options.signal) {
        abort = () => {
          isAborted = true;
          callback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          addAbortListener = addAbortListener || require_util().addAbortListener;
          const disposable = addAbortListener(options.signal, abort);
          const originalCallback = callback;
          callback = once((...args) => {
            disposable[SymbolDispose]();
            originalCallback.apply(stream, args);
          });
        }
      }
      const resolverFn = (...args) => {
        if (!isAborted) {
          process2.nextTick(() => callback.apply(stream, args));
        }
      };
      PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
      return nop;
    }
    function finished(stream, opts) {
      var _opts;
      let autoCleanup = false;
      if (opts === null) {
        opts = kEmptyObject;
      }
      if ((_opts = opts) !== null && _opts !== void 0 && _opts.cleanup) {
        validateBoolean(opts.cleanup, "cleanup");
        autoCleanup = opts.cleanup;
      }
      return new Promise2((resolve, reject) => {
        const cleanup = eos(stream, opts, (err) => {
          if (autoCleanup) {
            cleanup();
          }
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    module.exports = eos;
    module.exports.finished = finished;
  }
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
    "use strict";
    var process2 = require_process();
    var {
      aggregateTwoErrors,
      codes: { ERR_MULTIPLE_CALLBACK },
      AbortError
    } = require_errors();
    var { Symbol: Symbol2 } = require_primordials();
    var { kIsDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils();
    var kDestroy = Symbol2("kDestroy");
    var kConstruct = Symbol2("kConstruct");
    function checkError(err, w, r) {
      if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
      }
    }
    function destroy(err, cb) {
      const r = this._readableState;
      const w = this._writableState;
      const s = w || r;
      if (w !== null && w !== void 0 && w.destroyed || r !== null && r !== void 0 && r.destroyed) {
        if (typeof cb === "function") {
          cb();
        }
        return this;
      }
      checkError(err, w, r);
      if (w) {
        w.destroyed = true;
      }
      if (r) {
        r.destroyed = true;
      }
      if (!s.constructed) {
        this.once(kDestroy, function(er) {
          _destroy(this, aggregateTwoErrors(er, err), cb);
        });
      } else {
        _destroy(this, err, cb);
      }
      return this;
    }
    function _destroy(self, err, cb) {
      let called = false;
      function onDestroy(err2) {
        if (called) {
          return;
        }
        called = true;
        const r = self._readableState;
        const w = self._writableState;
        checkError(err2, w, r);
        if (w) {
          w.closed = true;
        }
        if (r) {
          r.closed = true;
        }
        if (typeof cb === "function") {
          cb(err2);
        }
        if (err2) {
          process2.nextTick(emitErrorCloseNT, self, err2);
        } else {
          process2.nextTick(emitCloseNT, self);
        }
      }
      try {
        self._destroy(err || null, onDestroy);
      } catch (err2) {
        onDestroy(err2);
      }
    }
    function emitErrorCloseNT(self, err) {
      emitErrorNT(self, err);
      emitCloseNT(self);
    }
    function emitCloseNT(self) {
      const r = self._readableState;
      const w = self._writableState;
      if (w) {
        w.closeEmitted = true;
      }
      if (r) {
        r.closeEmitted = true;
      }
      if (w !== null && w !== void 0 && w.emitClose || r !== null && r !== void 0 && r.emitClose) {
        self.emit("close");
      }
    }
    function emitErrorNT(self, err) {
      const r = self._readableState;
      const w = self._writableState;
      if (w !== null && w !== void 0 && w.errorEmitted || r !== null && r !== void 0 && r.errorEmitted) {
        return;
      }
      if (w) {
        w.errorEmitted = true;
      }
      if (r) {
        r.errorEmitted = true;
      }
      self.emit("error", err);
    }
    function undestroy() {
      const r = this._readableState;
      const w = this._writableState;
      if (r) {
        r.constructed = true;
        r.closed = false;
        r.closeEmitted = false;
        r.destroyed = false;
        r.errored = null;
        r.errorEmitted = false;
        r.reading = false;
        r.ended = r.readable === false;
        r.endEmitted = r.readable === false;
      }
      if (w) {
        w.constructed = true;
        w.destroyed = false;
        w.closed = false;
        w.closeEmitted = false;
        w.errored = null;
        w.errorEmitted = false;
        w.finalCalled = false;
        w.prefinished = false;
        w.ended = w.writable === false;
        w.ending = w.writable === false;
        w.finished = w.writable === false;
      }
    }
    function errorOrDestroy(stream, err, sync) {
      const r = stream._readableState;
      const w = stream._writableState;
      if (w !== null && w !== void 0 && w.destroyed || r !== null && r !== void 0 && r.destroyed) {
        return this;
      }
      if (r !== null && r !== void 0 && r.autoDestroy || w !== null && w !== void 0 && w.autoDestroy)
        stream.destroy(err);
      else if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
        if (sync) {
          process2.nextTick(emitErrorNT, stream, err);
        } else {
          emitErrorNT(stream, err);
        }
      }
    }
    function construct(stream, cb) {
      if (typeof stream._construct !== "function") {
        return;
      }
      const r = stream._readableState;
      const w = stream._writableState;
      if (r) {
        r.constructed = false;
      }
      if (w) {
        w.constructed = false;
      }
      stream.once(kConstruct, cb);
      if (stream.listenerCount(kConstruct) > 1) {
        return;
      }
      process2.nextTick(constructNT, stream);
    }
    function constructNT(stream) {
      let called = false;
      function onConstruct(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : new ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        const r = stream._readableState;
        const w = stream._writableState;
        const s = w || r;
        if (r) {
          r.constructed = true;
        }
        if (w) {
          w.constructed = true;
        }
        if (s.destroyed) {
          stream.emit(kDestroy, err);
        } else if (err) {
          errorOrDestroy(stream, err, true);
        } else {
          process2.nextTick(emitConstructNT, stream);
        }
      }
      try {
        stream._construct((err) => {
          process2.nextTick(onConstruct, err);
        });
      } catch (err) {
        process2.nextTick(onConstruct, err);
      }
    }
    function emitConstructNT(stream) {
      stream.emit(kConstruct);
    }
    function isRequest(stream) {
      return (stream === null || stream === void 0 ? void 0 : stream.setHeader) && typeof stream.abort === "function";
    }
    function emitCloseLegacy(stream) {
      stream.emit("close");
    }
    function emitErrorCloseLegacy(stream, err) {
      stream.emit("error", err);
      process2.nextTick(emitCloseLegacy, stream);
    }
    function destroyer(stream, err) {
      if (!stream || isDestroyed(stream)) {
        return;
      }
      if (!err && !isFinished(stream)) {
        err = new AbortError();
      }
      if (isServerRequest(stream)) {
        stream.socket = null;
        stream.destroy(err);
      } else if (isRequest(stream)) {
        stream.abort();
      } else if (isRequest(stream.req)) {
        stream.req.abort();
      } else if (typeof stream.destroy === "function") {
        stream.destroy(err);
      } else if (typeof stream.close === "function") {
        stream.close();
      } else if (err) {
        process2.nextTick(emitErrorCloseLegacy, stream, err);
      } else {
        process2.nextTick(emitCloseLegacy, stream);
      }
      if (!stream.destroyed) {
        stream[kIsDestroyed] = true;
      }
    }
    module.exports = {
      construct,
      destroyer,
      destroy,
      undestroy,
      errorOrDestroy
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/legacy.js"(exports, module) {
    "use strict";
    var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials();
    var { EventEmitter: EE } = __require("events");
    function Stream(opts) {
      EE.call(this, opts);
    }
    ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
    ObjectSetPrototypeOf(Stream, EE);
    Stream.prototype.pipe = function(dest, options) {
      const source = this;
      function ondata(chunk) {
        if (dest.writable && dest.write(chunk) === false && source.pause) {
          source.pause();
        }
      }
      source.on("data", ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on("drain", ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on("end", onend);
        source.on("close", onclose);
      }
      let didOnEnd = false;
      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === "function") dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (EE.listenerCount(this, "error") === 0) {
          this.emit("error", er);
        }
      }
      prependListener(source, "error", onerror);
      prependListener(dest, "error", onerror);
      function cleanup() {
        source.removeListener("data", ondata);
        dest.removeListener("drain", ondrain);
        source.removeListener("end", onend);
        source.removeListener("close", onclose);
        source.removeListener("error", onerror);
        dest.removeListener("error", onerror);
        source.removeListener("end", cleanup);
        source.removeListener("close", cleanup);
        dest.removeListener("close", cleanup);
      }
      source.on("end", cleanup);
      source.on("close", cleanup);
      dest.on("close", cleanup);
      dest.emit("pipe", source);
      return dest;
    };
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    module.exports = {
      Stream,
      prependListener
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/add-abort-signal.js"(exports, module) {
    "use strict";
    var { SymbolDispose } = require_primordials();
    var { AbortError, codes } = require_errors();
    var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
    var eos = require_end_of_stream();
    var { ERR_INVALID_ARG_TYPE } = codes;
    var addAbortListener;
    var validateAbortSignal = (signal, name) => {
      if (typeof signal !== "object" || !("aborted" in signal)) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    };
    module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      validateAbortSignal(signal, "signal");
      if (!isNodeStream(stream) && !isWebStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      }
      return module.exports.addAbortSignalNoValidate(signal, stream);
    };
    module.exports.addAbortSignalNoValidate = function(signal, stream) {
      if (typeof signal !== "object" || !("aborted" in signal)) {
        return stream;
      }
      const onAbort = isNodeStream(stream) ? () => {
        stream.destroy(
          new AbortError(void 0, {
            cause: signal.reason
          })
        );
      } : () => {
        stream[kControllerErrorFunction](
          new AbortError(void 0, {
            cause: signal.reason
          })
        );
      };
      if (signal.aborted) {
        onAbort();
      } else {
        addAbortListener = addAbortListener || require_util().addAbortListener;
        const disposable = addAbortListener(signal, onAbort);
        eos(stream, disposable[SymbolDispose]);
      }
      return stream;
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports, module) {
    "use strict";
    var { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array: Uint8Array2 } = require_primordials();
    var { Buffer: Buffer2 } = __require("buffer");
    var { inspect } = require_util();
    module.exports = class BufferList {
      constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      push(v) {
        const entry = {
          data: v,
          next: null
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
      unshift(v) {
        const entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
      shift() {
        if (this.length === 0) return;
        const ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
      clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
      join(s) {
        if (this.length === 0) return "";
        let p = this.head;
        let ret = "" + p.data;
        while ((p = p.next) !== null) ret += s + p.data;
        return ret;
      }
      concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        const ret = Buffer2.allocUnsafe(n >>> 0);
        let p = this.head;
        let i = 0;
        while (p) {
          TypedArrayPrototypeSet(ret, p.data, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
      consume(n, hasStrings) {
        const data = this.head.data;
        if (n < data.length) {
          const slice = data.slice(0, n);
          this.head.data = data.slice(n);
          return slice;
        }
        if (n === data.length) {
          return this.shift();
        }
        return hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      first() {
        return this.head.data;
      }
      *[SymbolIterator]() {
        for (let p = this.head; p; p = p.next) {
          yield p.data;
        }
      }
      // Consumes a specified amount of characters from the buffered data.
      _getString(n) {
        let ret = "";
        let p = this.head;
        let c = 0;
        do {
          const str = p.data;
          if (n > str.length) {
            ret += str;
            n -= str.length;
          } else {
            if (n === str.length) {
              ret += str;
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              ret += StringPrototypeSlice(str, 0, n);
              this.head = p;
              p.data = StringPrototypeSlice(str, n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
      _getBuffer(n) {
        const ret = Buffer2.allocUnsafe(n);
        const retLen = n;
        let p = this.head;
        let c = 0;
        do {
          const buf = p.data;
          if (n > buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            n -= buf.length;
          } else {
            if (n === buf.length) {
              TypedArrayPrototypeSet(ret, buf, retLen - n);
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n);
              this.head = p;
              p.data = buf.slice(n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
      [Symbol.for("nodejs.util.inspect.custom")](_, options) {
        return inspect(this, {
          ...options,
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false
        });
      }
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/state.js"(exports, module) {
    "use strict";
    var { MathFloor, NumberIsInteger } = require_primordials();
    var { validateInteger } = require_validators();
    var { ERR_INVALID_ARG_VALUE } = require_errors().codes;
    var defaultHighWaterMarkBytes = 16 * 1024;
    var defaultHighWaterMarkObjectMode = 16;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getDefaultHighWaterMark(objectMode) {
      return objectMode ? defaultHighWaterMarkObjectMode : defaultHighWaterMarkBytes;
    }
    function setDefaultHighWaterMark(objectMode, value) {
      validateInteger(value, "value", 0);
      if (objectMode) {
        defaultHighWaterMarkObjectMode = value;
      } else {
        defaultHighWaterMarkBytes = value;
      }
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!NumberIsInteger(hwm) || hwm < 0) {
          const name = isDuplex ? `options.${duplexKey}` : "options.highWaterMark";
          throw new ERR_INVALID_ARG_VALUE(name, hwm);
        }
        return MathFloor(hwm);
      }
      return getDefaultHighWaterMark(state.objectMode);
    }
    module.exports = {
      getHighWaterMark,
      getDefaultHighWaterMark,
      setDefaultHighWaterMark
    };
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self, buf, i) {
      var j = buf.length - 1;
      if (j < i) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self.lastNeed = 0;
        return "\uFFFD";
      }
      if (self.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self.lastNeed = 1;
          return "\uFFFD";
        }
        if (self.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0) return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed) return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0) return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/from.js"(exports, module) {
    "use strict";
    var process2 = require_process();
    var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials();
    var { Buffer: Buffer2 } = __require("buffer");
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors().codes;
    function from(Readable, iterable, opts) {
      let iterator;
      if (typeof iterable === "string" || iterable instanceof Buffer2) {
        return new Readable({
          objectMode: true,
          ...opts,
          read() {
            this.push(iterable);
            this.push(null);
          }
        });
      }
      let isAsync;
      if (iterable && iterable[SymbolAsyncIterator]) {
        isAsync = true;
        iterator = iterable[SymbolAsyncIterator]();
      } else if (iterable && iterable[SymbolIterator]) {
        isAsync = false;
        iterator = iterable[SymbolIterator]();
      } else {
        throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
      }
      const readable = new Readable({
        objectMode: true,
        highWaterMark: 1,
        // TODO(ronag): What options should be allowed?
        ...opts
      });
      let reading = false;
      readable._read = function() {
        if (!reading) {
          reading = true;
          next();
        }
      };
      readable._destroy = function(error, cb) {
        PromisePrototypeThen(
          close(error),
          () => process2.nextTick(cb, error),
          // nextTick is here in case cb throws
          (e) => process2.nextTick(cb, e || error)
        );
      };
      async function close(error) {
        const hadError = error !== void 0 && error !== null;
        const hasThrow = typeof iterator.throw === "function";
        if (hadError && hasThrow) {
          const { value, done } = await iterator.throw(error);
          await value;
          if (done) {
            return;
          }
        }
        if (typeof iterator.return === "function") {
          const { value } = await iterator.return();
          await value;
        }
      }
      async function next() {
        for (; ; ) {
          try {
            const { value, done } = isAsync ? await iterator.next() : iterator.next();
            if (done) {
              readable.push(null);
            } else {
              const res = value && typeof value.then === "function" ? await value : value;
              if (res === null) {
                reading = false;
                throw new ERR_STREAM_NULL_VALUES();
              } else if (readable.push(res)) {
                continue;
              } else {
                reading = false;
              }
            }
          } catch (err) {
            readable.destroy(err);
          }
          break;
        }
      }
      return readable;
    }
    module.exports = from;
  }
});

// node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/readable.js"(exports, module) {
    "use strict";
    var process2 = require_process();
    var {
      ArrayPrototypeIndexOf,
      NumberIsInteger,
      NumberIsNaN,
      NumberParseInt,
      ObjectDefineProperties,
      ObjectKeys,
      ObjectSetPrototypeOf,
      Promise: Promise2,
      SafeSet,
      SymbolAsyncDispose,
      SymbolAsyncIterator,
      Symbol: Symbol2
    } = require_primordials();
    module.exports = Readable;
    Readable.ReadableState = ReadableState;
    var { EventEmitter: EE } = __require("events");
    var { Stream, prependListener } = require_legacy();
    var { Buffer: Buffer2 } = __require("buffer");
    var { addAbortSignal } = require_add_abort_signal();
    var eos = require_end_of_stream();
    var debug = require_util().debuglog("stream", (fn) => {
      debug = fn;
    });
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_METHOD_NOT_IMPLEMENTED,
        ERR_OUT_OF_RANGE,
        ERR_STREAM_PUSH_AFTER_EOF,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT
      },
      AbortError
    } = require_errors();
    var { validateObject } = require_validators();
    var kPaused = Symbol2("kPaused");
    var { StringDecoder } = require_string_decoder();
    var from = require_from();
    ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Readable, Stream);
    var nop = () => {
    };
    var { errorOrDestroy } = destroyImpl;
    var kObjectMode = 1 << 0;
    var kEnded = 1 << 1;
    var kEndEmitted = 1 << 2;
    var kReading = 1 << 3;
    var kConstructed = 1 << 4;
    var kSync = 1 << 5;
    var kNeedReadable = 1 << 6;
    var kEmittedReadable = 1 << 7;
    var kReadableListening = 1 << 8;
    var kResumeScheduled = 1 << 9;
    var kErrorEmitted = 1 << 10;
    var kEmitClose = 1 << 11;
    var kAutoDestroy = 1 << 12;
    var kDestroyed = 1 << 13;
    var kClosed = 1 << 14;
    var kCloseEmitted = 1 << 15;
    var kMultiAwaitDrain = 1 << 16;
    var kReadingMore = 1 << 17;
    var kDataEmitted = 1 << 18;
    function makeBitMapDescriptor(bit) {
      return {
        enumerable: false,
        get() {
          return (this.state & bit) !== 0;
        },
        set(value) {
          if (value) this.state |= bit;
          else this.state &= ~bit;
        }
      };
    }
    ObjectDefineProperties(ReadableState.prototype, {
      objectMode: makeBitMapDescriptor(kObjectMode),
      ended: makeBitMapDescriptor(kEnded),
      endEmitted: makeBitMapDescriptor(kEndEmitted),
      reading: makeBitMapDescriptor(kReading),
      // Stream is still being constructed and cannot be
      // destroyed until construction finished or failed.
      // Async construction is opt in, therefore we start as
      // constructed.
      constructed: makeBitMapDescriptor(kConstructed),
      // A flag to be able to tell if the event 'readable'/'data' is emitted
      // immediately, or on a later tick.  We set this to true at first, because
      // any actions that shouldn't happen until "later" should generally also
      // not happen before the first read call.
      sync: makeBitMapDescriptor(kSync),
      // Whenever we return null, then we set a flag to say
      // that we're awaiting a 'readable' event emission.
      needReadable: makeBitMapDescriptor(kNeedReadable),
      emittedReadable: makeBitMapDescriptor(kEmittedReadable),
      readableListening: makeBitMapDescriptor(kReadableListening),
      resumeScheduled: makeBitMapDescriptor(kResumeScheduled),
      // True if the error was already emitted and should not be thrown again.
      errorEmitted: makeBitMapDescriptor(kErrorEmitted),
      emitClose: makeBitMapDescriptor(kEmitClose),
      autoDestroy: makeBitMapDescriptor(kAutoDestroy),
      // Has it been destroyed.
      destroyed: makeBitMapDescriptor(kDestroyed),
      // Indicates whether the stream has finished destroying.
      closed: makeBitMapDescriptor(kClosed),
      // True if close has been emitted or would have been emitted
      // depending on emitClose.
      closeEmitted: makeBitMapDescriptor(kCloseEmitted),
      multiAwaitDrain: makeBitMapDescriptor(kMultiAwaitDrain),
      // If true, a maybeReadMore has been scheduled.
      readingMore: makeBitMapDescriptor(kReadingMore),
      dataEmitted: makeBitMapDescriptor(kDataEmitted)
    });
    function ReadableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
      this.state = kEmitClose | kAutoDestroy | kConstructed | kSync;
      if (options && options.objectMode) this.state |= kObjectMode;
      if (isDuplex && options && options.readableObjectMode) this.state |= kObjectMode;
      this.highWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = [];
      this.flowing = null;
      this[kPaused] = null;
      if (options && options.emitClose === false) this.state &= ~kEmitClose;
      if (options && options.autoDestroy === false) this.state &= ~kAutoDestroy;
      this.errored = null;
      this.defaultEncoding = options && options.defaultEncoding || "utf8";
      this.awaitDrainWriters = null;
      this.decoder = null;
      this.encoding = null;
      if (options && options.encoding) {
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      if (!(this instanceof Readable)) return new Readable(options);
      const isDuplex = this instanceof require_duplex();
      this._readableState = new ReadableState(options, this, isDuplex);
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.construct === "function") this._construct = options.construct;
        if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        if (this._readableState.needReadable) {
          maybeReadMore(this, this._readableState);
        }
      });
    }
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Readable.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    Readable.prototype[SymbolAsyncDispose] = function() {
      let error;
      if (!this.destroyed) {
        error = this.readableEnded ? null : new AbortError();
        this.destroy(error);
      }
      return new Promise2((resolve, reject) => eos(this, (err) => err && err !== error ? reject(err) : resolve(null)));
    };
    Readable.prototype.push = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, false);
    };
    Readable.prototype.unshift = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, true);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront) {
      debug("readableAddChunk", chunk);
      const state = stream._readableState;
      let err;
      if ((state.state & kObjectMode) === 0) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (state.encoding !== encoding) {
            if (addToFront && state.encoding) {
              chunk = Buffer2.from(chunk, encoding).toString(state.encoding);
            } else {
              chunk = Buffer2.from(chunk, encoding);
              encoding = "";
            }
          }
        } else if (chunk instanceof Buffer2) {
          encoding = "";
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = "";
        } else if (chunk != null) {
          err = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
      }
      if (err) {
        errorOrDestroy(stream, err);
      } else if (chunk === null) {
        state.state &= ~kReading;
        onEofChunk(stream, state);
      } else if ((state.state & kObjectMode) !== 0 || chunk && chunk.length > 0) {
        if (addToFront) {
          if ((state.state & kEndEmitted) !== 0) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else if (state.destroyed || state.errored) return false;
          else addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state.destroyed || state.errored) {
          return false;
        } else {
          state.state &= ~kReading;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
            else maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.state &= ~kReading;
        maybeReadMore(stream, state);
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount("data") > 0) {
        if ((state.state & kMultiAwaitDrain) !== 0) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
        state.dataEmitted = true;
        stream.emit("data", chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if ((state.state & kNeedReadable) !== 0) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    Readable.prototype.isPaused = function() {
      const state = this._readableState;
      return state[kPaused] === true || state.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      const decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      const buffer = this._readableState.buffer;
      let content = "";
      for (const data of buffer) {
        content += decoder.write(data);
      }
      buffer.clear();
      if (content !== "") buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n > MAX_HWM) {
        throw new ERR_OUT_OF_RANGE("size", "<= 1GiB", n);
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended) return 0;
      if ((state.state & kObjectMode) !== 0) return 1;
      if (NumberIsNaN(n)) {
        if (state.flowing && state.length) return state.buffer.first().length;
        return state.length;
      }
      if (n <= state.length) return n;
      return state.ended ? state.length : 0;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      if (n === void 0) {
        n = NaN;
      } else if (!NumberIsInteger(n)) {
        n = NumberParseInt(n, 10);
      }
      const state = this._readableState;
      const nOrig = n;
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n !== 0) state.state &= ~kEmittedReadable;
      if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      let doRead = (state.state & kNeedReadable) !== 0;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
        doRead = false;
        debug("reading, ended or constructing", doRead);
      } else if (doRead) {
        debug("do read");
        state.state |= kReading | kSync;
        if (state.length === 0) state.state |= kNeedReadable;
        try {
          this._read(state.highWaterMark);
        } catch (err) {
          errorOrDestroy(this, err);
        }
        state.state &= ~kSync;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      let ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n = 0;
      } else {
        state.length -= n;
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
        state.dataEmitted = true;
        this.emit("data", ret);
      }
      return ret;
    };
    function onEofChunk(stream, state) {
      debug("onEofChunk");
      if (state.ended) return;
      if (state.decoder) {
        const chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
    function emitReadable(stream) {
      const state = stream._readableState;
      debug("emitReadable", state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        process2.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      const state = stream._readableState;
      debug("emitReadable_", state.destroyed, state.length, state.ended);
      if (!state.destroyed && !state.errored && (state.length || state.ended)) {
        stream.emit("readable");
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore && state.constructed) {
        state.readingMore = true;
        process2.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
        const len = state.length;
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_read()");
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      const src = this;
      const state = this._readableState;
      if (state.pipes.length === 1) {
        if (!state.multiAwaitDrain) {
          state.multiAwaitDrain = true;
          state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
        }
      }
      state.pipes.push(dest);
      debug("pipe count=%d opts=%j", state.pipes.length, pipeOpts);
      const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
      const endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process2.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      let ondrain;
      let cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        if (ondrain) {
          dest.removeListener("drain", ondrain);
        }
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      function pause() {
        if (!cleanedUp) {
          if (state.pipes.length === 1 && state.pipes[0] === dest) {
            debug("false write response, pause", 0);
            state.awaitDrainWriters = dest;
            state.multiAwaitDrain = false;
          } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
            debug("false write response, pause", state.awaitDrainWriters.size);
            state.awaitDrainWriters.add(dest);
          }
          src.pause();
        }
        if (!ondrain) {
          ondrain = pipeOnDrain(src, dest);
          dest.on("drain", ondrain);
        }
      }
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        const ret = dest.write(chunk);
        debug("dest.write", ret);
        if (ret === false) {
          pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (dest.listenerCount("error") === 0) {
          const s = dest._writableState || dest._readableState;
          if (s && !s.errorEmitted) {
            errorOrDestroy(dest, er);
          } else {
            dest.emit("error", er);
          }
        }
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (dest.writableNeedDrain === true) {
        pause();
      } else if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src, dest) {
      return function pipeOnDrainFunctionResult() {
        const state = src._readableState;
        if (state.awaitDrainWriters === dest) {
          debug("pipeOnDrain", 1);
          state.awaitDrainWriters = null;
        } else if (state.multiAwaitDrain) {
          debug("pipeOnDrain", state.awaitDrainWriters.size);
          state.awaitDrainWriters.delete(dest);
        }
        if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount("data")) {
          src.resume();
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      const state = this._readableState;
      const unpipeInfo = {
        hasUnpiped: false
      };
      if (state.pipes.length === 0) return this;
      if (!dest) {
        const dests = state.pipes;
        state.pipes = [];
        this.pause();
        for (let i = 0; i < dests.length; i++)
          dests[i].emit("unpipe", this, {
            hasUnpiped: false
          });
        return this;
      }
      const index = ArrayPrototypeIndexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      if (state.pipes.length === 0) this.pause();
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      const res = Stream.prototype.on.call(this, ev, fn);
      const state = this._readableState;
      if (ev === "data") {
        state.readableListening = this.listenerCount("readable") > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === "readable") {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug("on readable", state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process2.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function(ev, fn) {
      const res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === "readable") {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable.prototype.off = Readable.prototype.removeListener;
    Readable.prototype.removeAllListeners = function(ev) {
      const res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === "readable" || ev === void 0) {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self) {
      const state = self._readableState;
      state.readableListening = self.listenerCount("readable") > 0;
      if (state.resumeScheduled && state[kPaused] === false) {
        state.flowing = true;
      } else if (self.listenerCount("data") > 0) {
        self.resume();
      } else if (!state.readableListening) {
        state.flowing = null;
      }
    }
    function nReadingNextTick(self) {
      debug("readable nexttick read 0");
      self.read(0);
    }
    Readable.prototype.resume = function() {
      const state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state[kPaused] = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process2.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug("resume", state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      this._readableState[kPaused] = true;
      return this;
    };
    function flow(stream) {
      const state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) ;
    }
    Readable.prototype.wrap = function(stream) {
      let paused = false;
      stream.on("data", (chunk) => {
        if (!this.push(chunk) && stream.pause) {
          paused = true;
          stream.pause();
        }
      });
      stream.on("end", () => {
        this.push(null);
      });
      stream.on("error", (err) => {
        errorOrDestroy(this, err);
      });
      stream.on("close", () => {
        this.destroy();
      });
      stream.on("destroy", () => {
        this.destroy();
      });
      this._read = () => {
        if (paused && stream.resume) {
          paused = false;
          stream.resume();
        }
      };
      const streamKeys = ObjectKeys(stream);
      for (let j = 1; j < streamKeys.length; j++) {
        const i = streamKeys[j];
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = stream[i].bind(stream);
        }
      }
      return this;
    };
    Readable.prototype[SymbolAsyncIterator] = function() {
      return streamToAsyncIterator(this);
    };
    Readable.prototype.iterator = function(options) {
      if (options !== void 0) {
        validateObject(options, "options");
      }
      return streamToAsyncIterator(this, options);
    };
    function streamToAsyncIterator(stream, options) {
      if (typeof stream.read !== "function") {
        stream = Readable.wrap(stream, {
          objectMode: true
        });
      }
      const iter = createAsyncIterator(stream, options);
      iter.stream = stream;
      return iter;
    }
    async function* createAsyncIterator(stream, options) {
      let callback = nop;
      function next(resolve) {
        if (this === stream) {
          callback();
          callback = nop;
        } else {
          callback = resolve;
        }
      }
      stream.on("readable", next);
      let error;
      const cleanup = eos(
        stream,
        {
          writable: false
        },
        (err) => {
          error = err ? aggregateTwoErrors(error, err) : null;
          callback();
          callback = nop;
        }
      );
      try {
        while (true) {
          const chunk = stream.destroyed ? null : stream.read();
          if (chunk !== null) {
            yield chunk;
          } else if (error) {
            throw error;
          } else if (error === null) {
            return;
          } else {
            await new Promise2(next);
          }
        }
      } catch (err) {
        error = aggregateTwoErrors(error, err);
        throw error;
      } finally {
        if ((error || (options === null || options === void 0 ? void 0 : options.destroyOnReturn) !== false) && (error === void 0 || stream._readableState.autoDestroy)) {
          destroyImpl.destroyer(stream, null);
        } else {
          stream.off("readable", next);
          cleanup();
        }
      }
    }
    ObjectDefineProperties(Readable.prototype, {
      readable: {
        __proto__: null,
        get() {
          const r = this._readableState;
          return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
        },
        set(val) {
          if (this._readableState) {
            this._readableState.readable = !!val;
          }
        }
      },
      readableDidRead: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.dataEmitted;
        }
      },
      readableAborted: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
        }
      },
      readableHighWaterMark: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.highWaterMark;
        }
      },
      readableBuffer: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState && this._readableState.buffer;
        }
      },
      readableFlowing: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.flowing;
        },
        set: function(state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        }
      },
      readableLength: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState.length;
        }
      },
      readableObjectMode: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.objectMode : false;
        }
      },
      readableEncoding: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.encoding : null;
        }
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.errored : null;
        }
      },
      closed: {
        __proto__: null,
        get() {
          return this._readableState ? this._readableState.closed : false;
        }
      },
      destroyed: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.destroyed : false;
        },
        set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        }
      },
      readableEnded: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.endEmitted : false;
        }
      }
    });
    ObjectDefineProperties(ReadableState.prototype, {
      // Legacy getter for `pipesCount`.
      pipesCount: {
        __proto__: null,
        get() {
          return this.pipes.length;
        }
      },
      // Legacy property for `paused`.
      paused: {
        __proto__: null,
        get() {
          return this[kPaused] !== false;
        },
        set(value) {
          this[kPaused] = !!value;
        }
      }
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0) return null;
      let ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      const state = stream._readableState;
      debug("endReadable", state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process2.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug("endReadableNT", state.endEmitted, state.length);
      if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.emit("end");
        if (stream.writable && stream.allowHalfOpen === false) {
          process2.nextTick(endWritableNT, stream);
        } else if (state.autoDestroy) {
          const wState = stream._writableState;
          const autoDestroy = !wState || wState.autoDestroy && // We don't expect the writable to ever 'finish'
          // if writable is explicitly set to false.
          (wState.finished || wState.writable === false);
          if (autoDestroy) {
            stream.destroy();
          }
        }
      }
    }
    function endWritableNT(stream) {
      const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
      if (writable) {
        stream.end();
      }
    }
    Readable.from = function(iterable, opts) {
      return from(Readable, iterable, opts);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Readable.fromWeb = function(readableStream, options) {
      return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
    };
    Readable.toWeb = function(streamReadable, options) {
      return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
    };
    Readable.wrap = function(src, options) {
      var _ref, _src$readableObjectMo;
      return new Readable({
        objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== void 0 ? _src$readableObjectMo : src.objectMode) !== null && _ref !== void 0 ? _ref : true,
        ...options,
        destroy(err, callback) {
          destroyImpl.destroyer(src, err);
          callback(err);
        }
      }).wrap(src);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/writable.js"(exports, module) {
    "use strict";
    var process2 = require_process();
    var {
      ArrayPrototypeSlice,
      Error: Error2,
      FunctionPrototypeSymbolHasInstance,
      ObjectDefineProperty,
      ObjectDefineProperties,
      ObjectSetPrototypeOf,
      StringPrototypeToLowerCase,
      Symbol: Symbol2,
      SymbolHasInstance
    } = require_primordials();
    module.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = __require("events");
    var Stream = require_legacy().Stream;
    var { Buffer: Buffer2 } = __require("buffer");
    var destroyImpl = require_destroy();
    var { addAbortSignal } = require_add_abort_signal();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_MULTIPLE_CALLBACK,
      ERR_STREAM_CANNOT_PIPE,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_ALREADY_FINISHED,
      ERR_STREAM_NULL_VALUES,
      ERR_STREAM_WRITE_AFTER_END,
      ERR_UNKNOWN_ENCODING
    } = require_errors().codes;
    var { errorOrDestroy } = destroyImpl;
    ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Writable, Stream);
    function nop() {
    }
    var kOnFinished = Symbol2("kOnFinished");
    function WritableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
      this.highWaterMark = options ? getHighWaterMark(this, options, "writableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      const noDecode = !!(options && options.decodeStrings === false);
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options && options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = onwrite.bind(void 0, stream);
      this.writecb = null;
      this.writelen = 0;
      this.afterWriteTickInfo = null;
      resetBuffer(this);
      this.pendingcb = 0;
      this.constructed = true;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this[kOnFinished] = [];
    }
    function resetBuffer(state) {
      state.buffered = [];
      state.bufferedIndex = 0;
      state.allBuffers = true;
      state.allNoop = true;
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
    };
    ObjectDefineProperty(WritableState.prototype, "bufferedRequestCount", {
      __proto__: null,
      get() {
        return this.buffered.length - this.bufferedIndex;
      }
    });
    function Writable(options) {
      const isDuplex = this instanceof require_duplex();
      if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
        if (typeof options.construct === "function") this._construct = options.construct;
        if (options.signal) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        const state = this._writableState;
        if (!state.writing) {
          clearBuffer(this, state);
        }
        finishMaybe(this, state);
      });
    }
    ObjectDefineProperty(Writable, SymbolHasInstance, {
      __proto__: null,
      value: function(object) {
        if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      }
    });
    Writable.prototype.pipe = function() {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function _write(stream, chunk, encoding, cb) {
      const state = stream._writableState;
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = state.defaultEncoding;
      } else {
        if (!encoding) encoding = state.defaultEncoding;
        else if (encoding !== "buffer" && !Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
        if (typeof cb !== "function") cb = nop;
      }
      if (chunk === null) {
        throw new ERR_STREAM_NULL_VALUES();
      } else if (!state.objectMode) {
        if (typeof chunk === "string") {
          if (state.decodeStrings !== false) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "buffer";
          }
        } else if (chunk instanceof Buffer2) {
          encoding = "buffer";
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = "buffer";
        } else {
          throw new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
      }
      let err;
      if (state.ending) {
        err = new ERR_STREAM_WRITE_AFTER_END();
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED("write");
      }
      if (err) {
        process2.nextTick(cb, err);
        errorOrDestroy(stream, err, true);
        return err;
      }
      state.pendingcb++;
      return writeOrBuffer(stream, state, chunk, encoding, cb);
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      return _write(this, chunk, encoding, cb) === true;
    };
    Writable.prototype.cork = function() {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function() {
      const state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = StringPrototypeToLowerCase(encoding);
      if (!Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function writeOrBuffer(stream, state, chunk, encoding, callback) {
      const len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      const ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked || state.errored || !state.constructed) {
        state.buffered.push({
          chunk,
          encoding,
          callback
        });
        if (state.allBuffers && encoding !== "buffer") {
          state.allBuffers = false;
        }
        if (state.allNoop && callback !== nop) {
          state.allNoop = false;
        }
      } else {
        state.writelen = len;
        state.writecb = callback;
        state.writing = true;
        state.sync = true;
        stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      return ret && !state.errored && !state.destroyed;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, er, cb) {
      --state.pendingcb;
      cb(er);
      errorBuffer(state);
      errorOrDestroy(stream, er);
    }
    function onwrite(stream, er) {
      const state = stream._writableState;
      const sync = state.sync;
      const cb = state.writecb;
      if (typeof cb !== "function") {
        errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
        return;
      }
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
      if (er) {
        er.stack;
        if (!state.errored) {
          state.errored = er;
        }
        if (stream._readableState && !stream._readableState.errored) {
          stream._readableState.errored = er;
        }
        if (sync) {
          process2.nextTick(onwriteError, stream, state, er, cb);
        } else {
          onwriteError(stream, state, er, cb);
        }
      } else {
        if (state.buffered.length > state.bufferedIndex) {
          clearBuffer(stream, state);
        }
        if (sync) {
          if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
            state.afterWriteTickInfo.count++;
          } else {
            state.afterWriteTickInfo = {
              count: 1,
              cb,
              stream,
              state
            };
            process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
          }
        } else {
          afterWrite(stream, state, 1, cb);
        }
      }
    }
    function afterWriteTick({ stream, state, count, cb }) {
      state.afterWriteTickInfo = null;
      return afterWrite(stream, state, count, cb);
    }
    function afterWrite(stream, state, count, cb) {
      const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
      if (needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
      while (count-- > 0) {
        state.pendingcb--;
        cb();
      }
      if (state.destroyed) {
        errorBuffer(state);
      }
      finishMaybe(stream, state);
    }
    function errorBuffer(state) {
      if (state.writing) {
        return;
      }
      for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
        var _state$errored;
        const { chunk, callback } = state.buffered[n];
        const len = state.objectMode ? 1 : chunk.length;
        state.length -= len;
        callback(
          (_state$errored = state.errored) !== null && _state$errored !== void 0 ? _state$errored : new ERR_STREAM_DESTROYED("write")
        );
      }
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        var _state$errored2;
        onfinishCallbacks[i](
          (_state$errored2 = state.errored) !== null && _state$errored2 !== void 0 ? _state$errored2 : new ERR_STREAM_DESTROYED("end")
        );
      }
      resetBuffer(state);
    }
    function clearBuffer(stream, state) {
      if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
        return;
      }
      const { buffered, bufferedIndex, objectMode } = state;
      const bufferedLength = buffered.length - bufferedIndex;
      if (!bufferedLength) {
        return;
      }
      let i = bufferedIndex;
      state.bufferProcessing = true;
      if (bufferedLength > 1 && stream._writev) {
        state.pendingcb -= bufferedLength - 1;
        const callback = state.allNoop ? nop : (err) => {
          for (let n = i; n < buffered.length; ++n) {
            buffered[n].callback(err);
          }
        };
        const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
        chunks.allBuffers = state.allBuffers;
        doWrite(stream, state, true, state.length, chunks, "", callback);
        resetBuffer(state);
      } else {
        do {
          const { chunk, encoding, callback } = buffered[i];
          buffered[i++] = null;
          const len = objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, callback);
        } while (i < buffered.length && !state.writing);
        if (i === buffered.length) {
          resetBuffer(state);
        } else if (i > 256) {
          buffered.splice(0, i);
          state.bufferedIndex = 0;
        } else {
          state.bufferedIndex = i;
        }
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      if (this._writev) {
        this._writev(
          [
            {
              chunk,
              encoding
            }
          ],
          cb
        );
      } else {
        throw new ERR_METHOD_NOT_IMPLEMENTED("_write()");
      }
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      const state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      let err;
      if (chunk !== null && chunk !== void 0) {
        const ret = _write(this, chunk, encoding);
        if (ret instanceof Error2) {
          err = ret;
        }
      }
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (err) {
      } else if (!state.errored && !state.ending) {
        state.ending = true;
        finishMaybe(this, state, true);
        state.ended = true;
      } else if (state.finished) {
        err = new ERR_STREAM_ALREADY_FINISHED("end");
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED("end");
      }
      if (typeof cb === "function") {
        if (err || state.finished) {
          process2.nextTick(cb, err);
        } else {
          state[kOnFinished].push(cb);
        }
      }
      return this;
    };
    function needFinish(state) {
      return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
    }
    function callFinal(stream, state) {
      let called = false;
      function onFinish(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        state.pendingcb--;
        if (err) {
          const onfinishCallbacks = state[kOnFinished].splice(0);
          for (let i = 0; i < onfinishCallbacks.length; i++) {
            onfinishCallbacks[i](err);
          }
          errorOrDestroy(stream, err, state.sync);
        } else if (needFinish(state)) {
          state.prefinished = true;
          stream.emit("prefinish");
          state.pendingcb++;
          process2.nextTick(finish, stream, state);
        }
      }
      state.sync = true;
      state.pendingcb++;
      try {
        stream._final(onFinish);
      } catch (err) {
        onFinish(err);
      }
      state.sync = false;
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function" && !state.destroyed) {
          state.finalCalled = true;
          callFinal(stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state, sync) {
      if (needFinish(state)) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          if (sync) {
            state.pendingcb++;
            process2.nextTick(
              (stream2, state2) => {
                if (needFinish(state2)) {
                  finish(stream2, state2);
                } else {
                  state2.pendingcb--;
                }
              },
              stream,
              state
            );
          } else if (needFinish(state)) {
            state.pendingcb++;
            finish(stream, state);
          }
        }
      }
    }
    function finish(stream, state) {
      state.pendingcb--;
      state.finished = true;
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        onfinishCallbacks[i]();
      }
      stream.emit("finish");
      if (state.autoDestroy) {
        const rState = stream._readableState;
        const autoDestroy = !rState || rState.autoDestroy && // We don't expect the readable to ever 'end'
        // if readable is explicitly set to false.
        (rState.endEmitted || rState.readable === false);
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
    ObjectDefineProperties(Writable.prototype, {
      closed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.closed : false;
        }
      },
      destroyed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.destroyed : false;
        },
        set(value) {
          if (this._writableState) {
            this._writableState.destroyed = value;
          }
        }
      },
      writable: {
        __proto__: null,
        get() {
          const w = this._writableState;
          return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
        },
        set(val) {
          if (this._writableState) {
            this._writableState.writable = !!val;
          }
        }
      },
      writableFinished: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.finished : false;
        }
      },
      writableObjectMode: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.objectMode : false;
        }
      },
      writableBuffer: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.getBuffer();
        }
      },
      writableEnded: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.ending : false;
        }
      },
      writableNeedDrain: {
        __proto__: null,
        get() {
          const wState = this._writableState;
          if (!wState) return false;
          return !wState.destroyed && !wState.ending && wState.needDrain;
        }
      },
      writableHighWaterMark: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.highWaterMark;
        }
      },
      writableCorked: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.corked : 0;
        }
      },
      writableLength: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.length;
        }
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._writableState ? this._writableState.errored : null;
        }
      },
      writableAborted: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
        }
      }
    });
    var destroy = destroyImpl.destroy;
    Writable.prototype.destroy = function(err, cb) {
      const state = this._writableState;
      if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
        process2.nextTick(errorBuffer, state);
      }
      destroy.call(this, err, cb);
      return this;
    };
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Writable.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Writable.fromWeb = function(writableStream, options) {
      return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
    };
    Writable.toWeb = function(streamWritable) {
      return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/duplexify.js"(exports, module) {
    var process2 = require_process();
    var bufferModule = __require("buffer");
    var {
      isReadable,
      isWritable,
      isIterable,
      isNodeStream,
      isReadableNodeStream,
      isWritableNodeStream,
      isDuplexNodeStream,
      isReadableStream,
      isWritableStream
    } = require_utils();
    var eos = require_end_of_stream();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE }
    } = require_errors();
    var { destroyer } = require_destroy();
    var Duplex = require_duplex();
    var Readable = require_readable();
    var Writable = require_writable();
    var { createDeferredPromise } = require_util();
    var from = require_from();
    var Blob2 = globalThis.Blob || bufferModule.Blob;
    var isBlob = typeof Blob2 !== "undefined" ? function isBlob2(b) {
      return b instanceof Blob2;
    } : function isBlob2(b) {
      return false;
    };
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var { FunctionPrototypeCall } = require_primordials();
    var Duplexify = class extends Duplex {
      constructor(options) {
        super(options);
        if ((options === null || options === void 0 ? void 0 : options.readable) === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if ((options === null || options === void 0 ? void 0 : options.writable) === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      }
    };
    module.exports = function duplexify(body, name) {
      if (isDuplexNodeStream(body)) {
        return body;
      }
      if (isReadableNodeStream(body)) {
        return _duplexify({
          readable: body
        });
      }
      if (isWritableNodeStream(body)) {
        return _duplexify({
          writable: body
        });
      }
      if (isNodeStream(body)) {
        return _duplexify({
          writable: false,
          readable: false
        });
      }
      if (isReadableStream(body)) {
        return _duplexify({
          readable: Readable.fromWeb(body)
        });
      }
      if (isWritableStream(body)) {
        return _duplexify({
          writable: Writable.fromWeb(body)
        });
      }
      if (typeof body === "function") {
        const { value, write, final, destroy } = fromAsyncGen(body);
        if (isIterable(value)) {
          return from(Duplexify, value, {
            // TODO (ronag): highWaterMark?
            objectMode: true,
            write,
            final,
            destroy
          });
        }
        const then2 = value === null || value === void 0 ? void 0 : value.then;
        if (typeof then2 === "function") {
          let d;
          const promise = FunctionPrototypeCall(
            then2,
            value,
            (val) => {
              if (val != null) {
                throw new ERR_INVALID_RETURN_VALUE("nully", "body", val);
              }
            },
            (err) => {
              destroyer(d, err);
            }
          );
          return d = new Duplexify({
            // TODO (ronag): highWaterMark?
            objectMode: true,
            readable: false,
            write,
            final(cb) {
              final(async () => {
                try {
                  await promise;
                  process2.nextTick(cb, null);
                } catch (err) {
                  process2.nextTick(cb, err);
                }
              });
            },
            destroy
          });
        }
        throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or AsyncFunction", name, value);
      }
      if (isBlob(body)) {
        return duplexify(body.arrayBuffer());
      }
      if (isIterable(body)) {
        return from(Duplexify, body, {
          // TODO (ronag): highWaterMark?
          objectMode: true,
          writable: false
        });
      }
      if (isReadableStream(body === null || body === void 0 ? void 0 : body.readable) && isWritableStream(body === null || body === void 0 ? void 0 : body.writable)) {
        return Duplexify.fromWeb(body);
      }
      if (typeof (body === null || body === void 0 ? void 0 : body.writable) === "object" || typeof (body === null || body === void 0 ? void 0 : body.readable) === "object") {
        const readable = body !== null && body !== void 0 && body.readable ? isReadableNodeStream(body === null || body === void 0 ? void 0 : body.readable) ? body === null || body === void 0 ? void 0 : body.readable : duplexify(body.readable) : void 0;
        const writable = body !== null && body !== void 0 && body.writable ? isWritableNodeStream(body === null || body === void 0 ? void 0 : body.writable) ? body === null || body === void 0 ? void 0 : body.writable : duplexify(body.writable) : void 0;
        return _duplexify({
          readable,
          writable
        });
      }
      const then = body === null || body === void 0 ? void 0 : body.then;
      if (typeof then === "function") {
        let d;
        FunctionPrototypeCall(
          then,
          body,
          (val) => {
            if (val != null) {
              d.push(val);
            }
            d.push(null);
          },
          (err) => {
            destroyer(d, err);
          }
        );
        return d = new Duplexify({
          objectMode: true,
          writable: false,
          read() {
          }
        });
      }
      throw new ERR_INVALID_ARG_TYPE(
        name,
        [
          "Blob",
          "ReadableStream",
          "WritableStream",
          "Stream",
          "Iterable",
          "AsyncIterable",
          "Function",
          "{ readable, writable } pair",
          "Promise"
        ],
        body
      );
    };
    function fromAsyncGen(fn) {
      let { promise, resolve } = createDeferredPromise();
      const ac = new AbortController();
      const signal = ac.signal;
      const value = fn(
        (async function* () {
          while (true) {
            const _promise = promise;
            promise = null;
            const { chunk, done, cb } = await _promise;
            process2.nextTick(cb);
            if (done) return;
            if (signal.aborted)
              throw new AbortError(void 0, {
                cause: signal.reason
              });
            ({ promise, resolve } = createDeferredPromise());
            yield chunk;
          }
        })(),
        {
          signal
        }
      );
      return {
        value,
        write(chunk, encoding, cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            chunk,
            done: false,
            cb
          });
        },
        final(cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            done: true,
            cb
          });
        },
        destroy(err, cb) {
          ac.abort();
          cb(err);
        }
      };
    }
    function _duplexify(pair) {
      const r = pair.readable && typeof pair.readable.read !== "function" ? Readable.wrap(pair.readable) : pair.readable;
      const w = pair.writable;
      let readable = !!isReadable(r);
      let writable = !!isWritable(w);
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        }
      }
      d = new Duplexify({
        // TODO (ronag): highWaterMark?
        readableObjectMode: !!(r !== null && r !== void 0 && r.readableObjectMode),
        writableObjectMode: !!(w !== null && w !== void 0 && w.writableObjectMode),
        readable,
        writable
      });
      if (writable) {
        eos(w, (err) => {
          writable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        d._write = function(chunk, encoding, callback) {
          if (w.write(chunk, encoding)) {
            callback();
          } else {
            ondrain = callback;
          }
        };
        d._final = function(callback) {
          w.end();
          onfinish = callback;
        };
        w.on("drain", function() {
          if (ondrain) {
            const cb = ondrain;
            ondrain = null;
            cb();
          }
        });
        w.on("finish", function() {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        eos(r, (err) => {
          readable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        r.on("readable", function() {
          if (onreadable) {
            const cb = onreadable;
            onreadable = null;
            cb();
          }
        });
        r.on("end", function() {
          d.push(null);
        });
        d._read = function() {
          while (true) {
            const buf = r.read();
            if (buf === null) {
              onreadable = d._read;
              return;
            }
            if (!d.push(buf)) {
              return;
            }
          }
        };
      }
      d._destroy = function(err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          destroyer(w, err);
          destroyer(r, err);
        }
      };
      return d;
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/duplex.js"(exports, module) {
    "use strict";
    var {
      ObjectDefineProperties,
      ObjectGetOwnPropertyDescriptor,
      ObjectKeys,
      ObjectSetPrototypeOf
    } = require_primordials();
    module.exports = Duplex;
    var Readable = require_readable();
    var Writable = require_writable();
    ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
    ObjectSetPrototypeOf(Duplex, Readable);
    {
      const keys = ObjectKeys(Writable.prototype);
      for (let i = 0; i < keys.length; i++) {
        const method = keys[i];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options) {
        this.allowHalfOpen = options.allowHalfOpen !== false;
        if (options.readable === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if (options.writable === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      } else {
        this.allowHalfOpen = true;
      }
    }
    ObjectDefineProperties(Duplex.prototype, {
      writable: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writable")
      },
      writableHighWaterMark: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableHighWaterMark")
      },
      writableObjectMode: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableObjectMode")
      },
      writableBuffer: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableBuffer")
      },
      writableLength: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableLength")
      },
      writableFinished: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableFinished")
      },
      writableCorked: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableCorked")
      },
      writableEnded: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableEnded")
      },
      writableNeedDrain: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableNeedDrain")
      },
      destroyed: {
        __proto__: null,
        get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set(value) {
          if (this._readableState && this._writableState) {
            this._readableState.destroyed = value;
            this._writableState.destroyed = value;
          }
        }
      }
    });
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Duplex.fromWeb = function(pair, options) {
      return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
    };
    Duplex.toWeb = function(duplex) {
      return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
    };
    var duplexify;
    Duplex.from = function(body) {
      if (!duplexify) {
        duplexify = require_duplexify();
      }
      return duplexify(body, "body");
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/transform.js"(exports, module) {
    "use strict";
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
    module.exports = Transform;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
    var Duplex = require_duplex();
    var { getHighWaterMark } = require_state();
    ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform, Duplex);
    var kCallback = Symbol2("kCallback");
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);
      const readableHighWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", true) : null;
      if (readableHighWaterMark === 0) {
        options = {
          ...options,
          highWaterMark: null,
          readableHighWaterMark,
          // TODO (ronag): 0 is not optimal since we have
          // a "bug" where we check needDrain before calling _write and not after.
          // Refs: https://github.com/nodejs/node/pull/32887
          // Refs: https://github.com/nodejs/node/pull/35941
          writableHighWaterMark: options.writableHighWaterMark || 0
        };
      }
      Duplex.call(this, options);
      this._readableState.sync = false;
      this[kCallback] = null;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function final(cb) {
      if (typeof this._flush === "function" && !this.destroyed) {
        this._flush((er, data) => {
          if (er) {
            if (cb) {
              cb(er);
            } else {
              this.destroy(er);
            }
            return;
          }
          if (data != null) {
            this.push(data);
          }
          this.push(null);
          if (cb) {
            cb();
          }
        });
      } else {
        this.push(null);
        if (cb) {
          cb();
        }
      }
    }
    function prefinish() {
      if (this._final !== final) {
        final.call(this);
      }
    }
    Transform.prototype._final = final;
    Transform.prototype._transform = function(chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_transform()");
    };
    Transform.prototype._write = function(chunk, encoding, callback) {
      const rState = this._readableState;
      const wState = this._writableState;
      const length = rState.length;
      this._transform(chunk, encoding, (err, val) => {
        if (err) {
          callback(err);
          return;
        }
        if (val != null) {
          this.push(val);
        }
        if (wState.ended || // Backwards compat.
        length === rState.length || // Backwards compat.
        rState.length < rState.highWaterMark) {
          callback();
        } else {
          this[kCallback] = callback;
        }
      });
    };
    Transform.prototype._read = function() {
      if (this[kCallback]) {
        const callback = this[kCallback];
        this[kCallback] = null;
        callback();
      }
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/passthrough.js"(exports, module) {
    "use strict";
    var { ObjectSetPrototypeOf } = require_primordials();
    module.exports = PassThrough;
    var Transform = require_transform();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports, module) {
    var process2 = require_process();
    var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator, SymbolDispose } = require_primordials();
    var eos = require_end_of_stream();
    var { once } = require_util();
    var destroyImpl = require_destroy();
    var Duplex = require_duplex();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_RETURN_VALUE,
        ERR_MISSING_ARGS,
        ERR_STREAM_DESTROYED,
        ERR_STREAM_PREMATURE_CLOSE
      },
      AbortError
    } = require_errors();
    var { validateFunction, validateAbortSignal } = require_validators();
    var {
      isIterable,
      isReadable,
      isReadableNodeStream,
      isNodeStream,
      isTransformStream,
      isWebStream,
      isReadableStream,
      isReadableFinished
    } = require_utils();
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var PassThrough;
    var Readable;
    var addAbortListener;
    function destroyer(stream, reading, writing) {
      let finished = false;
      stream.on("close", () => {
        finished = true;
      });
      const cleanup = eos(
        stream,
        {
          readable: reading,
          writable: writing
        },
        (err) => {
          finished = !err;
        }
      );
      return {
        destroy: (err) => {
          if (finished) return;
          finished = true;
          destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED("pipe"));
        },
        cleanup
      };
    }
    function popCallback(streams) {
      validateFunction(streams[streams.length - 1], "streams[stream.length - 1]");
      return streams.pop();
    }
    function makeAsyncIterable(val) {
      if (isIterable(val)) {
        return val;
      } else if (isReadableNodeStream(val)) {
        return fromReadable(val);
      }
      throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable"], val);
    }
    async function* fromReadable(val) {
      if (!Readable) {
        Readable = require_readable();
      }
      yield* Readable.prototype[SymbolAsyncIterator].call(val);
    }
    async function pumpToNode(iterable, writable, finish, { end }) {
      let error;
      let onresolve = null;
      const resume = (err) => {
        if (err) {
          error = err;
        }
        if (onresolve) {
          const callback = onresolve;
          onresolve = null;
          callback();
        }
      };
      const wait = () => new Promise2((resolve, reject) => {
        if (error) {
          reject(error);
        } else {
          onresolve = () => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          };
        }
      });
      writable.on("drain", resume);
      const cleanup = eos(
        writable,
        {
          readable: false
        },
        resume
      );
      try {
        if (writable.writableNeedDrain) {
          await wait();
        }
        for await (const chunk of iterable) {
          if (!writable.write(chunk)) {
            await wait();
          }
        }
        if (end) {
          writable.end();
          await wait();
        }
        finish();
      } catch (err) {
        finish(error !== err ? aggregateTwoErrors(error, err) : err);
      } finally {
        cleanup();
        writable.off("drain", resume);
      }
    }
    async function pumpToWeb(readable, writable, finish, { end }) {
      if (isTransformStream(writable)) {
        writable = writable.writable;
      }
      const writer = writable.getWriter();
      try {
        for await (const chunk of readable) {
          await writer.ready;
          writer.write(chunk).catch(() => {
          });
        }
        await writer.ready;
        if (end) {
          await writer.close();
        }
        finish();
      } catch (err) {
        try {
          await writer.abort(err);
          finish(err);
        } catch (err2) {
          finish(err2);
        }
      }
    }
    function pipeline(...streams) {
      return pipelineImpl(streams, once(popCallback(streams)));
    }
    function pipelineImpl(streams, callback, opts) {
      if (streams.length === 1 && ArrayIsArray(streams[0])) {
        streams = streams[0];
      }
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS("streams");
      }
      const ac = new AbortController();
      const signal = ac.signal;
      const outerSignal = opts === null || opts === void 0 ? void 0 : opts.signal;
      const lastStreamCleanup = [];
      validateAbortSignal(outerSignal, "options.signal");
      function abort() {
        finishImpl(new AbortError());
      }
      addAbortListener = addAbortListener || require_util().addAbortListener;
      let disposable;
      if (outerSignal) {
        disposable = addAbortListener(outerSignal, abort);
      }
      let error;
      let value;
      const destroys = [];
      let finishCount = 0;
      function finish(err) {
        finishImpl(err, --finishCount === 0);
      }
      function finishImpl(err, final) {
        var _disposable;
        if (err && (!error || error.code === "ERR_STREAM_PREMATURE_CLOSE")) {
          error = err;
        }
        if (!error && !final) {
          return;
        }
        while (destroys.length) {
          destroys.shift()(error);
        }
        ;
        (_disposable = disposable) === null || _disposable === void 0 ? void 0 : _disposable[SymbolDispose]();
        ac.abort();
        if (final) {
          if (!error) {
            lastStreamCleanup.forEach((fn) => fn());
          }
          process2.nextTick(callback, error, value);
        }
      }
      let ret;
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const reading = i < streams.length - 1;
        const writing = i > 0;
        const end = reading || (opts === null || opts === void 0 ? void 0 : opts.end) !== false;
        const isLastStream = i === streams.length - 1;
        if (isNodeStream(stream)) {
          let onError2 = function(err) {
            if (err && err.name !== "AbortError" && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
              finish(err);
            }
          };
          var onError = onError2;
          if (end) {
            const { destroy, cleanup } = destroyer(stream, reading, writing);
            destroys.push(destroy);
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
          stream.on("error", onError2);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(() => {
              stream.removeListener("error", onError2);
            });
          }
        }
        if (i === 0) {
          if (typeof stream === "function") {
            ret = stream({
              signal
            });
            if (!isIterable(ret)) {
              throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or Stream", "source", ret);
            }
          } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
            ret = stream;
          } else {
            ret = Duplex.from(stream);
          }
        } else if (typeof stream === "function") {
          if (isTransformStream(ret)) {
            var _ret;
            ret = makeAsyncIterable((_ret = ret) === null || _ret === void 0 ? void 0 : _ret.readable);
          } else {
            ret = makeAsyncIterable(ret);
          }
          ret = stream(ret, {
            signal
          });
          if (reading) {
            if (!isIterable(ret, true)) {
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable", `transform[${i - 1}]`, ret);
            }
          } else {
            var _ret2;
            if (!PassThrough) {
              PassThrough = require_passthrough();
            }
            const pt = new PassThrough({
              objectMode: true
            });
            const then = (_ret2 = ret) === null || _ret2 === void 0 ? void 0 : _ret2.then;
            if (typeof then === "function") {
              finishCount++;
              then.call(
                ret,
                (val) => {
                  value = val;
                  if (val != null) {
                    pt.write(val);
                  }
                  if (end) {
                    pt.end();
                  }
                  process2.nextTick(finish);
                },
                (err) => {
                  pt.destroy(err);
                  process2.nextTick(finish, err);
                }
              );
            } else if (isIterable(ret, true)) {
              finishCount++;
              pumpToNode(ret, pt, finish, {
                end
              });
            } else if (isReadableStream(ret) || isTransformStream(ret)) {
              const toRead = ret.readable || ret;
              finishCount++;
              pumpToNode(toRead, pt, finish, {
                end
              });
            } else {
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable or Promise", "destination", ret);
            }
            ret = pt;
            const { destroy, cleanup } = destroyer(ret, false, true);
            destroys.push(destroy);
            if (isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
        } else if (isNodeStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount += 2;
            const cleanup = pipe(ret, stream, finish, {
              end
            });
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          } else if (isTransformStream(ret) || isReadableStream(ret)) {
            const toRead = ret.readable || ret;
            finishCount++;
            pumpToNode(toRead, stream, finish, {
              end
            });
          } else if (isIterable(ret)) {
            finishCount++;
            pumpToNode(ret, stream, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              "val",
              ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
              ret
            );
          }
          ret = stream;
        } else if (isWebStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount++;
            pumpToWeb(makeAsyncIterable(ret), stream, finish, {
              end
            });
          } else if (isReadableStream(ret) || isIterable(ret)) {
            finishCount++;
            pumpToWeb(ret, stream, finish, {
              end
            });
          } else if (isTransformStream(ret)) {
            finishCount++;
            pumpToWeb(ret.readable, stream, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              "val",
              ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
              ret
            );
          }
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      }
      if (signal !== null && signal !== void 0 && signal.aborted || outerSignal !== null && outerSignal !== void 0 && outerSignal.aborted) {
        process2.nextTick(abort);
      }
      return ret;
    }
    function pipe(src, dst, finish, { end }) {
      let ended = false;
      dst.on("close", () => {
        if (!ended) {
          finish(new ERR_STREAM_PREMATURE_CLOSE());
        }
      });
      src.pipe(dst, {
        end: false
      });
      if (end) {
        let endFn2 = function() {
          ended = true;
          dst.end();
        };
        var endFn = endFn2;
        if (isReadableFinished(src)) {
          process2.nextTick(endFn2);
        } else {
          src.once("end", endFn2);
        }
      } else {
        finish();
      }
      eos(
        src,
        {
          readable: true,
          writable: false
        },
        (err) => {
          const rState = src._readableState;
          if (err && err.code === "ERR_STREAM_PREMATURE_CLOSE" && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
            src.once("end", finish).once("error", finish);
          } else {
            finish(err);
          }
        }
      );
      return eos(
        dst,
        {
          readable: false,
          writable: true
        },
        finish
      );
    }
    module.exports = {
      pipelineImpl,
      pipeline
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/compose.js"(exports, module) {
    "use strict";
    var { pipeline } = require_pipeline();
    var Duplex = require_duplex();
    var { destroyer } = require_destroy();
    var {
      isNodeStream,
      isReadable,
      isWritable,
      isWebStream,
      isTransformStream,
      isWritableStream,
      isReadableStream
    } = require_utils();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS }
    } = require_errors();
    var eos = require_end_of_stream();
    module.exports = function compose(...streams) {
      if (streams.length === 0) {
        throw new ERR_MISSING_ARGS("streams");
      }
      if (streams.length === 1) {
        return Duplex.from(streams[0]);
      }
      const orgStreams = [...streams];
      if (typeof streams[0] === "function") {
        streams[0] = Duplex.from(streams[0]);
      }
      if (typeof streams[streams.length - 1] === "function") {
        const idx = streams.length - 1;
        streams[idx] = Duplex.from(streams[idx]);
      }
      for (let n = 0; n < streams.length; ++n) {
        if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
          continue;
        }
        if (n < streams.length - 1 && !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be readable");
        }
        if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be writable");
        }
      }
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        } else if (!readable && !writable) {
          d.destroy();
        }
      }
      const head = streams[0];
      const tail = pipeline(streams, onfinished);
      const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
      const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
      d = new Duplex({
        // TODO (ronag): highWaterMark?
        writableObjectMode: !!(head !== null && head !== void 0 && head.writableObjectMode),
        readableObjectMode: !!(tail !== null && tail !== void 0 && tail.readableObjectMode),
        writable,
        readable
      });
      if (writable) {
        if (isNodeStream(head)) {
          d._write = function(chunk, encoding, callback) {
            if (head.write(chunk, encoding)) {
              callback();
            } else {
              ondrain = callback;
            }
          };
          d._final = function(callback) {
            head.end();
            onfinish = callback;
          };
          head.on("drain", function() {
            if (ondrain) {
              const cb = ondrain;
              ondrain = null;
              cb();
            }
          });
        } else if (isWebStream(head)) {
          const writable2 = isTransformStream(head) ? head.writable : head;
          const writer = writable2.getWriter();
          d._write = async function(chunk, encoding, callback) {
            try {
              await writer.ready;
              writer.write(chunk).catch(() => {
              });
              callback();
            } catch (err) {
              callback(err);
            }
          };
          d._final = async function(callback) {
            try {
              await writer.ready;
              writer.close().catch(() => {
              });
              onfinish = callback;
            } catch (err) {
              callback(err);
            }
          };
        }
        const toRead = isTransformStream(tail) ? tail.readable : tail;
        eos(toRead, () => {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        if (isNodeStream(tail)) {
          tail.on("readable", function() {
            if (onreadable) {
              const cb = onreadable;
              onreadable = null;
              cb();
            }
          });
          tail.on("end", function() {
            d.push(null);
          });
          d._read = function() {
            while (true) {
              const buf = tail.read();
              if (buf === null) {
                onreadable = d._read;
                return;
              }
              if (!d.push(buf)) {
                return;
              }
            }
          };
        } else if (isWebStream(tail)) {
          const readable2 = isTransformStream(tail) ? tail.readable : tail;
          const reader = readable2.getReader();
          d._read = async function() {
            while (true) {
              try {
                const { value, done } = await reader.read();
                if (!d.push(value)) {
                  return;
                }
                if (done) {
                  d.push(null);
                  return;
                }
              } catch {
                return;
              }
            }
          };
        }
      }
      d._destroy = function(err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          if (isNodeStream(tail)) {
            destroyer(tail, err);
          }
        }
      };
      return d;
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/operators.js
var require_operators = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/operators.js"(exports, module) {
    "use strict";
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var {
      codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
      AbortError
    } = require_errors();
    var { validateAbortSignal, validateInteger, validateObject } = require_validators();
    var kWeakHandler = require_primordials().Symbol("kWeak");
    var kResistStopPropagation = require_primordials().Symbol("kResistStopPropagation");
    var { finished } = require_end_of_stream();
    var staticCompose = require_compose();
    var { addAbortSignalNoValidate } = require_add_abort_signal();
    var { isWritable, isNodeStream } = require_utils();
    var { deprecate } = require_util();
    var {
      ArrayPrototypePush,
      Boolean: Boolean2,
      MathFloor,
      Number: Number2,
      NumberIsNaN,
      Promise: Promise2,
      PromiseReject,
      PromiseResolve,
      PromisePrototypeThen,
      Symbol: Symbol2
    } = require_primordials();
    var kEmpty = Symbol2("kEmpty");
    var kEof = Symbol2("kEof");
    function compose(stream, options) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      if (isNodeStream(stream) && !isWritable(stream)) {
        throw new ERR_INVALID_ARG_VALUE("stream", stream, "must be writable");
      }
      const composedStream = staticCompose(this, stream);
      if (options !== null && options !== void 0 && options.signal) {
        addAbortSignalNoValidate(options.signal, composedStream);
      }
      return composedStream;
    }
    function map(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      let concurrency = 1;
      if ((options === null || options === void 0 ? void 0 : options.concurrency) != null) {
        concurrency = MathFloor(options.concurrency);
      }
      let highWaterMark = concurrency - 1;
      if ((options === null || options === void 0 ? void 0 : options.highWaterMark) != null) {
        highWaterMark = MathFloor(options.highWaterMark);
      }
      validateInteger(concurrency, "options.concurrency", 1);
      validateInteger(highWaterMark, "options.highWaterMark", 0);
      highWaterMark += concurrency;
      return async function* map2() {
        const signal = require_util().AbortSignalAny(
          [options === null || options === void 0 ? void 0 : options.signal].filter(Boolean2)
        );
        const stream = this;
        const queue = [];
        const signalOpt = {
          signal
        };
        let next;
        let resume;
        let done = false;
        let cnt = 0;
        function onCatch() {
          done = true;
          afterItemProcessed();
        }
        function afterItemProcessed() {
          cnt -= 1;
          maybeResume();
        }
        function maybeResume() {
          if (resume && !done && cnt < concurrency && queue.length < highWaterMark) {
            resume();
            resume = null;
          }
        }
        async function pump() {
          try {
            for await (let val of stream) {
              if (done) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              try {
                val = fn(val, signalOpt);
                if (val === kEmpty) {
                  continue;
                }
                val = PromiseResolve(val);
              } catch (err) {
                val = PromiseReject(err);
              }
              cnt += 1;
              PromisePrototypeThen(val, afterItemProcessed, onCatch);
              queue.push(val);
              if (next) {
                next();
                next = null;
              }
              if (!done && (queue.length >= highWaterMark || cnt >= concurrency)) {
                await new Promise2((resolve) => {
                  resume = resolve;
                });
              }
            }
            queue.push(kEof);
          } catch (err) {
            const val = PromiseReject(err);
            PromisePrototypeThen(val, afterItemProcessed, onCatch);
            queue.push(val);
          } finally {
            done = true;
            if (next) {
              next();
              next = null;
            }
          }
        }
        pump();
        try {
          while (true) {
            while (queue.length > 0) {
              const val = await queue[0];
              if (val === kEof) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              if (val !== kEmpty) {
                yield val;
              }
              queue.shift();
              maybeResume();
            }
            await new Promise2((resolve) => {
              next = resolve;
            });
          }
        } finally {
          done = true;
          if (resume) {
            resume();
            resume = null;
          }
        }
      }.call(this);
    }
    function asIndexedPairs(options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      return async function* asIndexedPairs2() {
        let index = 0;
        for await (const val of this) {
          var _options$signal;
          if (options !== null && options !== void 0 && (_options$signal = options.signal) !== null && _options$signal !== void 0 && _options$signal.aborted) {
            throw new AbortError({
              cause: options.signal.reason
            });
          }
          yield [index++, val];
        }
      }.call(this);
    }
    async function some(fn, options = void 0) {
      for await (const unused of filter.call(this, fn, options)) {
        return true;
      }
      return false;
    }
    async function every(fn, options = void 0) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      return !await some.call(
        this,
        async (...args) => {
          return !await fn(...args);
        },
        options
      );
    }
    async function find(fn, options) {
      for await (const result of filter.call(this, fn, options)) {
        return result;
      }
      return void 0;
    }
    async function forEach(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      async function forEachFn(value, options2) {
        await fn(value, options2);
        return kEmpty;
      }
      for await (const unused of map.call(this, forEachFn, options)) ;
    }
    function filter(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      async function filterFn(value, options2) {
        if (await fn(value, options2)) {
          return value;
        }
        return kEmpty;
      }
      return map.call(this, filterFn, options);
    }
    var ReduceAwareErrMissingArgs = class extends ERR_MISSING_ARGS {
      constructor() {
        super("reduce");
        this.message = "Reduce of an empty stream requires an initial value";
      }
    };
    async function reduce(reducer, initialValue, options) {
      var _options$signal2;
      if (typeof reducer !== "function") {
        throw new ERR_INVALID_ARG_TYPE("reducer", ["Function", "AsyncFunction"], reducer);
      }
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      let hasInitialValue = arguments.length > 1;
      if (options !== null && options !== void 0 && (_options$signal2 = options.signal) !== null && _options$signal2 !== void 0 && _options$signal2.aborted) {
        const err = new AbortError(void 0, {
          cause: options.signal.reason
        });
        this.once("error", () => {
        });
        await finished(this.destroy(err));
        throw err;
      }
      const ac = new AbortController();
      const signal = ac.signal;
      if (options !== null && options !== void 0 && options.signal) {
        const opts = {
          once: true,
          [kWeakHandler]: this,
          [kResistStopPropagation]: true
        };
        options.signal.addEventListener("abort", () => ac.abort(), opts);
      }
      let gotAnyItemFromStream = false;
      try {
        for await (const value of this) {
          var _options$signal3;
          gotAnyItemFromStream = true;
          if (options !== null && options !== void 0 && (_options$signal3 = options.signal) !== null && _options$signal3 !== void 0 && _options$signal3.aborted) {
            throw new AbortError();
          }
          if (!hasInitialValue) {
            initialValue = value;
            hasInitialValue = true;
          } else {
            initialValue = await reducer(initialValue, value, {
              signal
            });
          }
        }
        if (!gotAnyItemFromStream && !hasInitialValue) {
          throw new ReduceAwareErrMissingArgs();
        }
      } finally {
        ac.abort();
      }
      return initialValue;
    }
    async function toArray(options) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      const result = [];
      for await (const val of this) {
        var _options$signal4;
        if (options !== null && options !== void 0 && (_options$signal4 = options.signal) !== null && _options$signal4 !== void 0 && _options$signal4.aborted) {
          throw new AbortError(void 0, {
            cause: options.signal.reason
          });
        }
        ArrayPrototypePush(result, val);
      }
      return result;
    }
    function flatMap(fn, options) {
      const values = map.call(this, fn, options);
      return async function* flatMap2() {
        for await (const val of values) {
          yield* val;
        }
      }.call(this);
    }
    function toIntegerOrInfinity(number) {
      number = Number2(number);
      if (NumberIsNaN(number)) {
        return 0;
      }
      if (number < 0) {
        throw new ERR_OUT_OF_RANGE("number", ">= 0", number);
      }
      return number;
    }
    function drop(number, options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      number = toIntegerOrInfinity(number);
      return async function* drop2() {
        var _options$signal5;
        if (options !== null && options !== void 0 && (_options$signal5 = options.signal) !== null && _options$signal5 !== void 0 && _options$signal5.aborted) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal6;
          if (options !== null && options !== void 0 && (_options$signal6 = options.signal) !== null && _options$signal6 !== void 0 && _options$signal6.aborted) {
            throw new AbortError();
          }
          if (number-- <= 0) {
            yield val;
          }
        }
      }.call(this);
    }
    function take(number, options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      number = toIntegerOrInfinity(number);
      return async function* take2() {
        var _options$signal7;
        if (options !== null && options !== void 0 && (_options$signal7 = options.signal) !== null && _options$signal7 !== void 0 && _options$signal7.aborted) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal8;
          if (options !== null && options !== void 0 && (_options$signal8 = options.signal) !== null && _options$signal8 !== void 0 && _options$signal8.aborted) {
            throw new AbortError();
          }
          if (number-- > 0) {
            yield val;
          }
          if (number <= 0) {
            return;
          }
        }
      }.call(this);
    }
    module.exports.streamReturningOperators = {
      asIndexedPairs: deprecate(asIndexedPairs, "readable.asIndexedPairs will be removed in a future version."),
      drop,
      filter,
      flatMap,
      map,
      take,
      compose
    };
    module.exports.promiseReturningOperators = {
      every,
      forEach,
      reduce,
      toArray,
      some,
      find
    };
  }
});

// node_modules/readable-stream/lib/stream/promises.js
var require_promises = __commonJS({
  "node_modules/readable-stream/lib/stream/promises.js"(exports, module) {
    "use strict";
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
    var { isIterable, isNodeStream, isWebStream } = require_utils();
    var { pipelineImpl: pl } = require_pipeline();
    var { finished } = require_end_of_stream();
    require_stream();
    function pipeline(...streams) {
      return new Promise2((resolve, reject) => {
        let signal;
        let end;
        const lastArg = streams[streams.length - 1];
        if (lastArg && typeof lastArg === "object" && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
          const options = ArrayPrototypePop(streams);
          signal = options.signal;
          end = options.end;
        }
        pl(
          streams,
          (err, value) => {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          },
          {
            signal,
            end
          }
        );
      });
    }
    module.exports = {
      finished,
      pipeline
    };
  }
});

// node_modules/readable-stream/lib/stream.js
var require_stream = __commonJS({
  "node_modules/readable-stream/lib/stream.js"(exports, module) {
    "use strict";
    var { Buffer: Buffer2 } = __require("buffer");
    var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials();
    var {
      promisify: { custom: customPromisify }
    } = require_util();
    var { streamReturningOperators, promiseReturningOperators } = require_operators();
    var {
      codes: { ERR_ILLEGAL_CONSTRUCTOR }
    } = require_errors();
    var compose = require_compose();
    var { setDefaultHighWaterMark, getDefaultHighWaterMark } = require_state();
    var { pipeline } = require_pipeline();
    var { destroyer } = require_destroy();
    var eos = require_end_of_stream();
    var promises = require_promises();
    var utils = require_utils();
    var Stream = module.exports = require_legacy().Stream;
    Stream.isDestroyed = utils.isDestroyed;
    Stream.isDisturbed = utils.isDisturbed;
    Stream.isErrored = utils.isErrored;
    Stream.isReadable = utils.isReadable;
    Stream.isWritable = utils.isWritable;
    Stream.Readable = require_readable();
    for (const key of ObjectKeys(streamReturningOperators)) {
      let fn = function(...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return Stream.Readable.from(ReflectApply(op, this, args));
      };
      const op = streamReturningOperators[key];
      ObjectDefineProperty(fn, "name", {
        __proto__: null,
        value: op.name
      });
      ObjectDefineProperty(fn, "length", {
        __proto__: null,
        value: op.length
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    for (const key of ObjectKeys(promiseReturningOperators)) {
      let fn = function(...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return ReflectApply(op, this, args);
      };
      const op = promiseReturningOperators[key];
      ObjectDefineProperty(fn, "name", {
        __proto__: null,
        value: op.name
      });
      ObjectDefineProperty(fn, "length", {
        __proto__: null,
        value: op.length
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    Stream.Writable = require_writable();
    Stream.Duplex = require_duplex();
    Stream.Transform = require_transform();
    Stream.PassThrough = require_passthrough();
    Stream.pipeline = pipeline;
    var { addAbortSignal } = require_add_abort_signal();
    Stream.addAbortSignal = addAbortSignal;
    Stream.finished = eos;
    Stream.destroy = destroyer;
    Stream.compose = compose;
    Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
    Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
    ObjectDefineProperty(Stream, "promises", {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    ObjectDefineProperty(pipeline, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.pipeline;
      }
    });
    ObjectDefineProperty(eos, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.finished;
      }
    });
    Stream.Stream = Stream;
    Stream._isUint8Array = function isUint8Array(value) {
      return value instanceof Uint8Array;
    };
    Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    };
  }
});

// node_modules/readable-stream/lib/ours/index.js
var require_ours = __commonJS({
  "node_modules/readable-stream/lib/ours/index.js"(exports, module) {
    "use strict";
    var Stream = __require("stream");
    if (Stream && process.env.READABLE_STREAM === "disable") {
      const promises = Stream.promises;
      module.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
      module.exports._isUint8Array = Stream._isUint8Array;
      module.exports.isDisturbed = Stream.isDisturbed;
      module.exports.isErrored = Stream.isErrored;
      module.exports.isReadable = Stream.isReadable;
      module.exports.Readable = Stream.Readable;
      module.exports.Writable = Stream.Writable;
      module.exports.Duplex = Stream.Duplex;
      module.exports.Transform = Stream.Transform;
      module.exports.PassThrough = Stream.PassThrough;
      module.exports.addAbortSignal = Stream.addAbortSignal;
      module.exports.finished = Stream.finished;
      module.exports.destroy = Stream.destroy;
      module.exports.pipeline = Stream.pipeline;
      module.exports.compose = Stream.compose;
      Object.defineProperty(Stream, "promises", {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        }
      });
      module.exports.Stream = Stream.Stream;
    } else {
      const CustomStream = require_stream();
      const promises = require_promises();
      const originalDestroy = CustomStream.Readable.destroy;
      module.exports = CustomStream.Readable;
      module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
      module.exports._isUint8Array = CustomStream._isUint8Array;
      module.exports.isDisturbed = CustomStream.isDisturbed;
      module.exports.isErrored = CustomStream.isErrored;
      module.exports.isReadable = CustomStream.isReadable;
      module.exports.Readable = CustomStream.Readable;
      module.exports.Writable = CustomStream.Writable;
      module.exports.Duplex = CustomStream.Duplex;
      module.exports.Transform = CustomStream.Transform;
      module.exports.PassThrough = CustomStream.PassThrough;
      module.exports.addAbortSignal = CustomStream.addAbortSignal;
      module.exports.finished = CustomStream.finished;
      module.exports.destroy = CustomStream.destroy;
      module.exports.destroy = originalDestroy;
      module.exports.pipeline = CustomStream.pipeline;
      module.exports.compose = CustomStream.compose;
      Object.defineProperty(CustomStream, "promises", {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        }
      });
      module.exports.Stream = CustomStream.Stream;
    }
    module.exports.default = module.exports;
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports, module) {
    try {
      util = __require("util");
      if (typeof util.inherits !== "function") throw "";
      module.exports = util.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/bl/BufferList.js
var require_BufferList = __commonJS({
  "node_modules/bl/BufferList.js"(exports, module) {
    "use strict";
    var { Buffer: Buffer2 } = __require("buffer");
    var symbol = Symbol.for("BufferList");
    function BufferList(buf) {
      if (!(this instanceof BufferList)) {
        return new BufferList(buf);
      }
      BufferList._init.call(this, buf);
    }
    BufferList._init = function _init(buf) {
      Object.defineProperty(this, symbol, { value: true });
      this._bufs = [];
      this.length = 0;
      if (buf) {
        this.append(buf);
      }
    };
    BufferList.prototype._new = function _new(buf) {
      return new BufferList(buf);
    };
    BufferList.prototype._offset = function _offset(offset) {
      if (offset === 0) {
        return [0, 0];
      }
      let tot = 0;
      for (let i = 0; i < this._bufs.length; i++) {
        const _t = tot + this._bufs[i].length;
        if (offset < _t || i === this._bufs.length - 1) {
          return [i, offset - tot];
        }
        tot = _t;
      }
    };
    BufferList.prototype._reverseOffset = function(blOffset) {
      const bufferId = blOffset[0];
      let offset = blOffset[1];
      for (let i = 0; i < bufferId; i++) {
        offset += this._bufs[i].length;
      }
      return offset;
    };
    BufferList.prototype.getBuffers = function getBuffers() {
      return this._bufs;
    };
    BufferList.prototype.get = function get(index) {
      if (index > this.length || index < 0) {
        return void 0;
      }
      const offset = this._offset(index);
      return this._bufs[offset[0]][offset[1]];
    };
    BufferList.prototype.slice = function slice(start, end) {
      if (typeof start === "number" && start < 0) {
        start += this.length;
      }
      if (typeof end === "number" && end < 0) {
        end += this.length;
      }
      return this.copy(null, 0, start, end);
    };
    BufferList.prototype.copy = function copy(dst, dstStart, srcStart, srcEnd) {
      if (typeof srcStart !== "number" || srcStart < 0) {
        srcStart = 0;
      }
      if (typeof srcEnd !== "number" || srcEnd > this.length) {
        srcEnd = this.length;
      }
      if (srcStart >= this.length) {
        return dst || Buffer2.alloc(0);
      }
      if (srcEnd <= 0) {
        return dst || Buffer2.alloc(0);
      }
      const copy2 = !!dst;
      const off = this._offset(srcStart);
      const len = srcEnd - srcStart;
      let bytes = len;
      let bufoff = copy2 && dstStart || 0;
      let start = off[1];
      if (srcStart === 0 && srcEnd === this.length) {
        if (!copy2) {
          return this._bufs.length === 1 ? this._bufs[0] : Buffer2.concat(this._bufs, this.length);
        }
        for (let i = 0; i < this._bufs.length; i++) {
          this._bufs[i].copy(dst, bufoff);
          bufoff += this._bufs[i].length;
        }
        return dst;
      }
      if (bytes <= this._bufs[off[0]].length - start) {
        return copy2 ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes) : this._bufs[off[0]].slice(start, start + bytes);
      }
      if (!copy2) {
        dst = Buffer2.allocUnsafe(len);
      }
      for (let i = off[0]; i < this._bufs.length; i++) {
        const l = this._bufs[i].length - start;
        if (bytes > l) {
          this._bufs[i].copy(dst, bufoff, start);
          bufoff += l;
        } else {
          this._bufs[i].copy(dst, bufoff, start, start + bytes);
          bufoff += l;
          break;
        }
        bytes -= l;
        if (start) {
          start = 0;
        }
      }
      if (dst.length > bufoff) return dst.slice(0, bufoff);
      return dst;
    };
    BufferList.prototype.shallowSlice = function shallowSlice(start, end) {
      start = start || 0;
      end = typeof end !== "number" ? this.length : end;
      if (start < 0) {
        start += this.length;
      }
      if (end < 0) {
        end += this.length;
      }
      if (start === end) {
        return this._new();
      }
      const startOffset = this._offset(start);
      const endOffset = this._offset(end);
      const buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);
      if (endOffset[1] === 0) {
        buffers.pop();
      } else {
        buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1]);
      }
      if (startOffset[1] !== 0) {
        buffers[0] = buffers[0].slice(startOffset[1]);
      }
      return this._new(buffers);
    };
    BufferList.prototype.toString = function toString(encoding, start, end) {
      return this.slice(start, end).toString(encoding);
    };
    BufferList.prototype.consume = function consume(bytes) {
      bytes = Math.trunc(bytes);
      if (Number.isNaN(bytes) || bytes <= 0) return this;
      while (this._bufs.length) {
        if (bytes >= this._bufs[0].length) {
          bytes -= this._bufs[0].length;
          this.length -= this._bufs[0].length;
          this._bufs.shift();
        } else {
          this._bufs[0] = this._bufs[0].slice(bytes);
          this.length -= bytes;
          break;
        }
      }
      return this;
    };
    BufferList.prototype.duplicate = function duplicate() {
      const copy = this._new();
      for (let i = 0; i < this._bufs.length; i++) {
        copy.append(this._bufs[i]);
      }
      return copy;
    };
    BufferList.prototype.append = function append(buf) {
      return this._attach(buf, BufferList.prototype._appendBuffer);
    };
    BufferList.prototype.prepend = function prepend(buf) {
      return this._attach(buf, BufferList.prototype._prependBuffer, true);
    };
    BufferList.prototype._attach = function _attach(buf, attacher, prepend) {
      if (buf == null) {
        return this;
      }
      if (buf.buffer) {
        attacher.call(this, Buffer2.from(buf.buffer, buf.byteOffset, buf.byteLength));
      } else if (Array.isArray(buf)) {
        const [starting, modifier] = prepend ? [buf.length - 1, -1] : [0, 1];
        for (let i = starting; i >= 0 && i < buf.length; i += modifier) {
          this._attach(buf[i], attacher, prepend);
        }
      } else if (this._isBufferList(buf)) {
        const [starting, modifier] = prepend ? [buf._bufs.length - 1, -1] : [0, 1];
        for (let i = starting; i >= 0 && i < buf._bufs.length; i += modifier) {
          this._attach(buf._bufs[i], attacher, prepend);
        }
      } else {
        if (typeof buf === "number") {
          buf = buf.toString();
        }
        attacher.call(this, Buffer2.from(buf));
      }
      return this;
    };
    BufferList.prototype._appendBuffer = function appendBuffer(buf) {
      this._bufs.push(buf);
      this.length += buf.length;
    };
    BufferList.prototype._prependBuffer = function prependBuffer(buf) {
      this._bufs.unshift(buf);
      this.length += buf.length;
    };
    BufferList.prototype.indexOf = function(search, offset, encoding) {
      if (encoding === void 0 && typeof offset === "string") {
        encoding = offset;
        offset = void 0;
      }
      if (typeof search === "function" || Array.isArray(search)) {
        throw new TypeError('The "value" argument must be one of type string, Buffer, BufferList, or Uint8Array.');
      } else if (typeof search === "number") {
        search = Buffer2.from([search]);
      } else if (typeof search === "string") {
        search = Buffer2.from(search, encoding);
      } else if (this._isBufferList(search)) {
        search = search.slice();
      } else if (Array.isArray(search.buffer)) {
        search = Buffer2.from(search.buffer, search.byteOffset, search.byteLength);
      } else if (!Buffer2.isBuffer(search)) {
        search = Buffer2.from(search);
      }
      offset = Number(offset || 0);
      if (isNaN(offset)) {
        offset = 0;
      }
      if (offset < 0) {
        offset = this.length + offset;
      }
      if (offset < 0) {
        offset = 0;
      }
      if (search.length === 0) {
        return offset > this.length ? this.length : offset;
      }
      const blOffset = this._offset(offset);
      let blIndex = blOffset[0];
      let buffOffset = blOffset[1];
      for (; blIndex < this._bufs.length; blIndex++) {
        const buff = this._bufs[blIndex];
        while (buffOffset < buff.length) {
          const availableWindow = buff.length - buffOffset;
          if (availableWindow >= search.length) {
            const nativeSearchResult = buff.indexOf(search, buffOffset);
            if (nativeSearchResult !== -1) {
              return this._reverseOffset([blIndex, nativeSearchResult]);
            }
            buffOffset = buff.length - search.length + 1;
          } else {
            const revOffset = this._reverseOffset([blIndex, buffOffset]);
            if (this._match(revOffset, search)) {
              return revOffset;
            }
            buffOffset++;
          }
        }
        buffOffset = 0;
      }
      return -1;
    };
    BufferList.prototype._match = function(offset, search) {
      if (this.length - offset < search.length) {
        return false;
      }
      for (let searchOffset = 0; searchOffset < search.length; searchOffset++) {
        if (this.get(offset + searchOffset) !== search[searchOffset]) {
          return false;
        }
      }
      return true;
    };
    (function() {
      const methods = {
        readDoubleBE: 8,
        readDoubleLE: 8,
        readFloatBE: 4,
        readFloatLE: 4,
        readBigInt64BE: 8,
        readBigInt64LE: 8,
        readBigUInt64BE: 8,
        readBigUInt64LE: 8,
        readInt32BE: 4,
        readInt32LE: 4,
        readUInt32BE: 4,
        readUInt32LE: 4,
        readInt16BE: 2,
        readInt16LE: 2,
        readUInt16BE: 2,
        readUInt16LE: 2,
        readInt8: 1,
        readUInt8: 1,
        readIntBE: null,
        readIntLE: null,
        readUIntBE: null,
        readUIntLE: null
      };
      for (const m in methods) {
        (function(m2) {
          if (methods[m2] === null) {
            BufferList.prototype[m2] = function(offset, byteLength) {
              return this.slice(offset, offset + byteLength)[m2](0, byteLength);
            };
          } else {
            BufferList.prototype[m2] = function(offset = 0) {
              return this.slice(offset, offset + methods[m2])[m2](0);
            };
          }
        })(m);
      }
    })();
    BufferList.prototype._isBufferList = function _isBufferList(b) {
      return b instanceof BufferList || BufferList.isBufferList(b);
    };
    BufferList.isBufferList = function isBufferList(b) {
      return b != null && b[symbol];
    };
    module.exports = BufferList;
  }
});

// node_modules/bl/bl.js
var require_bl = __commonJS({
  "node_modules/bl/bl.js"(exports, module) {
    "use strict";
    var DuplexStream = require_ours().Duplex;
    var inherits = require_inherits();
    var BufferList = require_BufferList();
    function BufferListStream(callback) {
      if (!(this instanceof BufferListStream)) {
        return new BufferListStream(callback);
      }
      if (typeof callback === "function") {
        this._callback = callback;
        const piper = function piper2(err) {
          if (this._callback) {
            this._callback(err);
            this._callback = null;
          }
        }.bind(this);
        this.on("pipe", function onPipe(src) {
          src.on("error", piper);
        });
        this.on("unpipe", function onUnpipe(src) {
          src.removeListener("error", piper);
        });
        callback = null;
      }
      BufferList._init.call(this, callback);
      DuplexStream.call(this);
    }
    inherits(BufferListStream, DuplexStream);
    Object.assign(BufferListStream.prototype, BufferList.prototype);
    BufferListStream.prototype._new = function _new(callback) {
      return new BufferListStream(callback);
    };
    BufferListStream.prototype._write = function _write(buf, encoding, callback) {
      this._appendBuffer(buf);
      if (typeof callback === "function") {
        callback();
      }
    };
    BufferListStream.prototype._read = function _read(size) {
      if (!this.length) {
        return this.push(null);
      }
      size = Math.min(size, this.length);
      this.push(this.slice(0, size));
      this.consume(size);
    };
    BufferListStream.prototype.end = function end(chunk) {
      DuplexStream.prototype.end.call(this, chunk);
      if (this._callback) {
        this._callback(null, this.slice());
        this._callback = null;
      }
    };
    BufferListStream.prototype._destroy = function _destroy(err, cb) {
      this._bufs.length = 0;
      this.length = 0;
      cb(err);
    };
    BufferListStream.prototype._isBufferList = function _isBufferList(b) {
      return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b);
    };
    BufferListStream.isBufferList = BufferList.isBufferList;
    module.exports = BufferListStream;
    module.exports.BufferListStream = BufferListStream;
    module.exports.BufferList = BufferList;
  }
});

// node_modules/mqtt-packet/packet.js
var require_packet2 = __commonJS({
  "node_modules/mqtt-packet/packet.js"(exports, module) {
    var Packet = class {
      constructor() {
        this.cmd = null;
        this.retain = false;
        this.qos = 0;
        this.dup = false;
        this.length = -1;
        this.topic = null;
        this.payload = null;
      }
    };
    module.exports = Packet;
  }
});

// node_modules/mqtt-packet/constants.js
var require_constants = __commonJS({
  "node_modules/mqtt-packet/constants.js"(exports, module) {
    var protocol = module.exports;
    var { Buffer: Buffer2 } = __require("buffer");
    protocol.types = {
      0: "reserved",
      1: "connect",
      2: "connack",
      3: "publish",
      4: "puback",
      5: "pubrec",
      6: "pubrel",
      7: "pubcomp",
      8: "subscribe",
      9: "suback",
      10: "unsubscribe",
      11: "unsuback",
      12: "pingreq",
      13: "pingresp",
      14: "disconnect",
      15: "auth"
    };
    protocol.requiredHeaderFlags = {
      1: 0,
      // 'connect'
      2: 0,
      // 'connack'
      4: 0,
      // 'puback'
      5: 0,
      // 'pubrec'
      6: 2,
      // 'pubrel'
      7: 0,
      // 'pubcomp'
      8: 2,
      // 'subscribe'
      9: 0,
      // 'suback'
      10: 2,
      // 'unsubscribe'
      11: 0,
      // 'unsuback'
      12: 0,
      // 'pingreq'
      13: 0,
      // 'pingresp'
      14: 0,
      // 'disconnect'
      15: 0
      // 'auth'
    };
    protocol.requiredHeaderFlagsErrors = {};
    for (const k in protocol.requiredHeaderFlags) {
      const v = protocol.requiredHeaderFlags[k];
      protocol.requiredHeaderFlagsErrors[k] = "Invalid header flag bits, must be 0x" + v.toString(16) + " for " + protocol.types[k] + " packet";
    }
    protocol.codes = {};
    for (const k in protocol.types) {
      const v = protocol.types[k];
      protocol.codes[v] = k;
    }
    protocol.CMD_SHIFT = 4;
    protocol.CMD_MASK = 240;
    protocol.DUP_MASK = 8;
    protocol.QOS_MASK = 3;
    protocol.QOS_SHIFT = 1;
    protocol.RETAIN_MASK = 1;
    protocol.VARBYTEINT_MASK = 127;
    protocol.VARBYTEINT_FIN_MASK = 128;
    protocol.VARBYTEINT_MAX = 268435455;
    protocol.SESSIONPRESENT_MASK = 1;
    protocol.SESSIONPRESENT_HEADER = Buffer2.from([protocol.SESSIONPRESENT_MASK]);
    protocol.CONNACK_HEADER = Buffer2.from([protocol.codes.connack << protocol.CMD_SHIFT]);
    protocol.USERNAME_MASK = 128;
    protocol.PASSWORD_MASK = 64;
    protocol.WILL_RETAIN_MASK = 32;
    protocol.WILL_QOS_MASK = 24;
    protocol.WILL_QOS_SHIFT = 3;
    protocol.WILL_FLAG_MASK = 4;
    protocol.CLEAN_SESSION_MASK = 2;
    protocol.CONNECT_HEADER = Buffer2.from([protocol.codes.connect << protocol.CMD_SHIFT]);
    protocol.properties = {
      sessionExpiryInterval: 17,
      willDelayInterval: 24,
      receiveMaximum: 33,
      maximumPacketSize: 39,
      topicAliasMaximum: 34,
      requestResponseInformation: 25,
      requestProblemInformation: 23,
      userProperties: 38,
      authenticationMethod: 21,
      authenticationData: 22,
      payloadFormatIndicator: 1,
      messageExpiryInterval: 2,
      contentType: 3,
      responseTopic: 8,
      correlationData: 9,
      maximumQoS: 36,
      retainAvailable: 37,
      assignedClientIdentifier: 18,
      reasonString: 31,
      wildcardSubscriptionAvailable: 40,
      subscriptionIdentifiersAvailable: 41,
      sharedSubscriptionAvailable: 42,
      serverKeepAlive: 19,
      responseInformation: 26,
      serverReference: 28,
      topicAlias: 35,
      subscriptionIdentifier: 11
    };
    protocol.propertiesCodes = {};
    for (const prop in protocol.properties) {
      const id = protocol.properties[prop];
      protocol.propertiesCodes[id] = prop;
    }
    protocol.propertiesTypes = {
      sessionExpiryInterval: "int32",
      willDelayInterval: "int32",
      receiveMaximum: "int16",
      maximumPacketSize: "int32",
      topicAliasMaximum: "int16",
      requestResponseInformation: "byte",
      requestProblemInformation: "byte",
      userProperties: "pair",
      authenticationMethod: "string",
      authenticationData: "binary",
      payloadFormatIndicator: "byte",
      messageExpiryInterval: "int32",
      contentType: "string",
      responseTopic: "string",
      correlationData: "binary",
      maximumQoS: "int8",
      retainAvailable: "byte",
      assignedClientIdentifier: "string",
      reasonString: "string",
      wildcardSubscriptionAvailable: "byte",
      subscriptionIdentifiersAvailable: "byte",
      sharedSubscriptionAvailable: "byte",
      serverKeepAlive: "int16",
      responseInformation: "string",
      serverReference: "string",
      topicAlias: "int16",
      subscriptionIdentifier: "var"
    };
    function genHeader(type) {
      return [0, 1, 2].map((qos) => {
        return [0, 1].map((dup) => {
          return [0, 1].map((retain) => {
            const buf = Buffer2.alloc(1);
            buf.writeUInt8(
              protocol.codes[type] << protocol.CMD_SHIFT | (dup ? protocol.DUP_MASK : 0) | qos << protocol.QOS_SHIFT | retain,
              0,
              true
            );
            return buf;
          });
        });
      });
    }
    protocol.PUBLISH_HEADER = genHeader("publish");
    protocol.SUBSCRIBE_HEADER = genHeader("subscribe");
    protocol.SUBSCRIBE_OPTIONS_QOS_MASK = 3;
    protocol.SUBSCRIBE_OPTIONS_NL_MASK = 1;
    protocol.SUBSCRIBE_OPTIONS_NL_SHIFT = 2;
    protocol.SUBSCRIBE_OPTIONS_RAP_MASK = 1;
    protocol.SUBSCRIBE_OPTIONS_RAP_SHIFT = 3;
    protocol.SUBSCRIBE_OPTIONS_RH_MASK = 3;
    protocol.SUBSCRIBE_OPTIONS_RH_SHIFT = 4;
    protocol.SUBSCRIBE_OPTIONS_RH = [0, 16, 32];
    protocol.SUBSCRIBE_OPTIONS_NL = 4;
    protocol.SUBSCRIBE_OPTIONS_RAP = 8;
    protocol.SUBSCRIBE_OPTIONS_QOS = [0, 1, 2];
    protocol.UNSUBSCRIBE_HEADER = genHeader("unsubscribe");
    protocol.ACKS = {
      unsuback: genHeader("unsuback"),
      puback: genHeader("puback"),
      pubcomp: genHeader("pubcomp"),
      pubrel: genHeader("pubrel"),
      pubrec: genHeader("pubrec")
    };
    protocol.SUBACK_HEADER = Buffer2.from([protocol.codes.suback << protocol.CMD_SHIFT]);
    protocol.VERSION3 = Buffer2.from([3]);
    protocol.VERSION4 = Buffer2.from([4]);
    protocol.VERSION5 = Buffer2.from([5]);
    protocol.VERSION131 = Buffer2.from([131]);
    protocol.VERSION132 = Buffer2.from([132]);
    protocol.QOS = [0, 1, 2].map((qos) => {
      return Buffer2.from([qos]);
    });
    protocol.EMPTY = {
      pingreq: Buffer2.from([protocol.codes.pingreq << 4, 0]),
      pingresp: Buffer2.from([protocol.codes.pingresp << 4, 0]),
      disconnect: Buffer2.from([protocol.codes.disconnect << 4, 0])
    };
    protocol.MQTT5_PUBACK_PUBREC_CODES = {
      0: "Success",
      16: "No matching subscribers",
      128: "Unspecified error",
      131: "Implementation specific error",
      135: "Not authorized",
      144: "Topic Name invalid",
      145: "Packet identifier in use",
      151: "Quota exceeded",
      153: "Payload format invalid"
    };
    protocol.MQTT5_PUBREL_PUBCOMP_CODES = {
      0: "Success",
      146: "Packet Identifier not found"
    };
    protocol.MQTT5_SUBACK_CODES = {
      0: "Granted QoS 0",
      1: "Granted QoS 1",
      2: "Granted QoS 2",
      128: "Unspecified error",
      131: "Implementation specific error",
      135: "Not authorized",
      143: "Topic Filter invalid",
      145: "Packet Identifier in use",
      151: "Quota exceeded",
      158: "Shared Subscriptions not supported",
      161: "Subscription Identifiers not supported",
      162: "Wildcard Subscriptions not supported"
    };
    protocol.MQTT5_UNSUBACK_CODES = {
      0: "Success",
      17: "No subscription existed",
      128: "Unspecified error",
      131: "Implementation specific error",
      135: "Not authorized",
      143: "Topic Filter invalid",
      145: "Packet Identifier in use"
    };
    protocol.MQTT5_DISCONNECT_CODES = {
      0: "Normal disconnection",
      4: "Disconnect with Will Message",
      128: "Unspecified error",
      129: "Malformed Packet",
      130: "Protocol Error",
      131: "Implementation specific error",
      135: "Not authorized",
      137: "Server busy",
      139: "Server shutting down",
      141: "Keep Alive timeout",
      142: "Session taken over",
      143: "Topic Filter invalid",
      144: "Topic Name invalid",
      147: "Receive Maximum exceeded",
      148: "Topic Alias invalid",
      149: "Packet too large",
      150: "Message rate too high",
      151: "Quota exceeded",
      152: "Administrative action",
      153: "Payload format invalid",
      154: "Retain not supported",
      155: "QoS not supported",
      156: "Use another server",
      157: "Server moved",
      158: "Shared Subscriptions not supported",
      159: "Connection rate exceeded",
      160: "Maximum connect time",
      161: "Subscription Identifiers not supported",
      162: "Wildcard Subscriptions not supported"
    };
    protocol.MQTT5_AUTH_CODES = {
      0: "Success",
      24: "Continue authentication",
      25: "Re-authenticate"
    };
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse3(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse3(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module) {
    var tty = __require("tty");
    var util = __require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = __require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node();
    }
  }
});

// node_modules/mqtt-packet/parser.js
var require_parser = __commonJS({
  "node_modules/mqtt-packet/parser.js"(exports, module) {
    var bl = require_bl();
    var { EventEmitter } = __require("events");
    var Packet = require_packet2();
    var constants = require_constants();
    var debug = require_src()("mqtt-packet:parser");
    var Parser = class _Parser extends EventEmitter {
      constructor() {
        super();
        this.parser = this.constructor.parser;
      }
      static parser(opt) {
        if (!(this instanceof _Parser)) return new _Parser().parser(opt);
        this.settings = opt || {};
        this._states = [
          "_parseHeader",
          "_parseLength",
          "_parsePayload",
          "_newPacket"
        ];
        this._resetState();
        return this;
      }
      _resetState() {
        debug("_resetState: resetting packet, error, _list, and _stateCounter");
        this.packet = new Packet();
        this.error = null;
        this._list = bl();
        this._stateCounter = 0;
      }
      parse(buf) {
        if (this.error) this._resetState();
        this._list.append(buf);
        debug("parse: current state: %s", this._states[this._stateCounter]);
        while ((this.packet.length !== -1 || this._list.length > 0) && this[this._states[this._stateCounter]]() && !this.error) {
          this._stateCounter++;
          debug("parse: state complete. _stateCounter is now: %d", this._stateCounter);
          debug("parse: packet.length: %d, buffer list length: %d", this.packet.length, this._list.length);
          if (this._stateCounter >= this._states.length) this._stateCounter = 0;
        }
        debug("parse: exited while loop. packet: %d, buffer list length: %d", this.packet.length, this._list.length);
        return this._list.length;
      }
      _parseHeader() {
        const zero = this._list.readUInt8(0);
        const cmdIndex = zero >> constants.CMD_SHIFT;
        this.packet.cmd = constants.types[cmdIndex];
        const headerFlags = zero & 15;
        const requiredHeaderFlags = constants.requiredHeaderFlags[cmdIndex];
        if (requiredHeaderFlags != null && headerFlags !== requiredHeaderFlags) {
          return this._emitError(new Error(constants.requiredHeaderFlagsErrors[cmdIndex]));
        }
        this.packet.retain = (zero & constants.RETAIN_MASK) !== 0;
        this.packet.qos = zero >> constants.QOS_SHIFT & constants.QOS_MASK;
        if (this.packet.qos > 2) {
          return this._emitError(new Error("Packet must not have both QoS bits set to 1"));
        }
        this.packet.dup = (zero & constants.DUP_MASK) !== 0;
        debug("_parseHeader: packet: %o", this.packet);
        this._list.consume(1);
        return true;
      }
      _parseLength() {
        const result = this._parseVarByteNum(true);
        if (result) {
          this.packet.length = result.value;
          this._list.consume(result.bytes);
        }
        debug("_parseLength %d", result.value);
        return !!result;
      }
      _parsePayload() {
        debug("_parsePayload: payload %O", this._list);
        let result = false;
        if (this.packet.length === 0 || this._list.length >= this.packet.length) {
          this._pos = 0;
          switch (this.packet.cmd) {
            case "connect":
              this._parseConnect();
              break;
            case "connack":
              this._parseConnack();
              break;
            case "publish":
              this._parsePublish();
              break;
            case "puback":
            case "pubrec":
            case "pubrel":
            case "pubcomp":
              this._parseConfirmation();
              break;
            case "subscribe":
              this._parseSubscribe();
              break;
            case "suback":
              this._parseSuback();
              break;
            case "unsubscribe":
              this._parseUnsubscribe();
              break;
            case "unsuback":
              this._parseUnsuback();
              break;
            case "pingreq":
            case "pingresp":
              break;
            case "disconnect":
              this._parseDisconnect();
              break;
            case "auth":
              this._parseAuth();
              break;
            default:
              this._emitError(new Error("Not supported"));
          }
          result = true;
        }
        debug("_parsePayload complete result: %s", result);
        return result;
      }
      _parseConnect() {
        debug("_parseConnect");
        let topic;
        let payload;
        let password;
        let username;
        const flags = {};
        const packet = this.packet;
        const protocolId = this._parseString();
        if (protocolId === null) return this._emitError(new Error("Cannot parse protocolId"));
        if (protocolId !== "MQTT" && protocolId !== "MQIsdp") {
          return this._emitError(new Error("Invalid protocolId"));
        }
        packet.protocolId = protocolId;
        if (this._pos >= this._list.length) return this._emitError(new Error("Packet too short"));
        packet.protocolVersion = this._list.readUInt8(this._pos);
        if (packet.protocolVersion >= 128) {
          packet.bridgeMode = true;
          packet.protocolVersion = packet.protocolVersion - 128;
        }
        if (packet.protocolVersion !== 3 && packet.protocolVersion !== 4 && packet.protocolVersion !== 5) {
          return this._emitError(new Error("Invalid protocol version"));
        }
        this._pos++;
        if (this._pos >= this._list.length) {
          return this._emitError(new Error("Packet too short"));
        }
        if (this._list.readUInt8(this._pos) & 1) {
          return this._emitError(new Error("Connect flag bit 0 must be 0, but got 1"));
        }
        flags.username = this._list.readUInt8(this._pos) & constants.USERNAME_MASK;
        flags.password = this._list.readUInt8(this._pos) & constants.PASSWORD_MASK;
        flags.will = this._list.readUInt8(this._pos) & constants.WILL_FLAG_MASK;
        const willRetain = !!(this._list.readUInt8(this._pos) & constants.WILL_RETAIN_MASK);
        const willQos = (this._list.readUInt8(this._pos) & constants.WILL_QOS_MASK) >> constants.WILL_QOS_SHIFT;
        if (flags.will) {
          packet.will = {};
          packet.will.retain = willRetain;
          packet.will.qos = willQos;
        } else {
          if (willRetain) {
            return this._emitError(new Error("Will Retain Flag must be set to zero when Will Flag is set to 0"));
          }
          if (willQos) {
            return this._emitError(new Error("Will QoS must be set to zero when Will Flag is set to 0"));
          }
        }
        packet.clean = (this._list.readUInt8(this._pos) & constants.CLEAN_SESSION_MASK) !== 0;
        this._pos++;
        packet.keepalive = this._parseNum();
        if (packet.keepalive === -1) return this._emitError(new Error("Packet too short"));
        if (packet.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        const clientId = this._parseString();
        if (clientId === null) return this._emitError(new Error("Packet too short"));
        packet.clientId = clientId;
        debug("_parseConnect: packet.clientId: %s", packet.clientId);
        if (flags.will) {
          if (packet.protocolVersion === 5) {
            const willProperties = this._parseProperties();
            if (Object.getOwnPropertyNames(willProperties).length) {
              packet.will.properties = willProperties;
            }
          }
          topic = this._parseString();
          if (topic === null) return this._emitError(new Error("Cannot parse will topic"));
          packet.will.topic = topic;
          debug("_parseConnect: packet.will.topic: %s", packet.will.topic);
          payload = this._parseBuffer();
          if (payload === null) return this._emitError(new Error("Cannot parse will payload"));
          packet.will.payload = payload;
          debug("_parseConnect: packet.will.paylaod: %s", packet.will.payload);
        }
        if (flags.username) {
          username = this._parseString();
          if (username === null) return this._emitError(new Error("Cannot parse username"));
          packet.username = username;
          debug("_parseConnect: packet.username: %s", packet.username);
        }
        if (flags.password) {
          password = this._parseBuffer();
          if (password === null) return this._emitError(new Error("Cannot parse password"));
          packet.password = password;
        }
        this.settings = packet;
        debug("_parseConnect: complete");
        return packet;
      }
      _parseConnack() {
        debug("_parseConnack");
        const packet = this.packet;
        if (this._list.length < 1) return null;
        const flags = this._list.readUInt8(this._pos++);
        if (flags > 1) {
          return this._emitError(new Error("Invalid connack flags, bits 7-1 must be set to 0"));
        }
        packet.sessionPresent = !!(flags & constants.SESSIONPRESENT_MASK);
        if (this.settings.protocolVersion === 5) {
          if (this._list.length >= 2) {
            packet.reasonCode = this._list.readUInt8(this._pos++);
          } else {
            packet.reasonCode = 0;
          }
        } else {
          if (this._list.length < 2) return null;
          packet.returnCode = this._list.readUInt8(this._pos++);
        }
        if (packet.returnCode === -1 || packet.reasonCode === -1) return this._emitError(new Error("Cannot parse return code"));
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        debug("_parseConnack: complete");
      }
      _parsePublish() {
        debug("_parsePublish");
        const packet = this.packet;
        packet.topic = this._parseString();
        if (packet.topic === null) return this._emitError(new Error("Cannot parse topic"));
        if (packet.qos > 0) {
          if (!this._parseMessageId()) {
            return;
          }
        }
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        packet.payload = this._list.slice(this._pos, packet.length);
        debug("_parsePublish: payload from buffer list: %o", packet.payload);
      }
      _parseSubscribe() {
        debug("_parseSubscribe");
        const packet = this.packet;
        let topic;
        let options;
        let qos;
        let rh;
        let rap;
        let nl;
        let subscription;
        packet.subscriptions = [];
        if (!this._parseMessageId()) {
          return;
        }
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        if (packet.length <= 0) {
          return this._emitError(new Error("Malformed subscribe, no payload specified"));
        }
        while (this._pos < packet.length) {
          topic = this._parseString();
          if (topic === null) return this._emitError(new Error("Cannot parse topic"));
          if (this._pos >= packet.length) return this._emitError(new Error("Malformed Subscribe Payload"));
          options = this._parseByte();
          if (this.settings.protocolVersion === 5) {
            if (options & 192) {
              return this._emitError(new Error("Invalid subscribe topic flag bits, bits 7-6 must be 0"));
            }
          } else {
            if (options & 252) {
              return this._emitError(new Error("Invalid subscribe topic flag bits, bits 7-2 must be 0"));
            }
          }
          qos = options & constants.SUBSCRIBE_OPTIONS_QOS_MASK;
          if (qos > 2) {
            return this._emitError(new Error("Invalid subscribe QoS, must be <= 2"));
          }
          nl = (options >> constants.SUBSCRIBE_OPTIONS_NL_SHIFT & constants.SUBSCRIBE_OPTIONS_NL_MASK) !== 0;
          rap = (options >> constants.SUBSCRIBE_OPTIONS_RAP_SHIFT & constants.SUBSCRIBE_OPTIONS_RAP_MASK) !== 0;
          rh = options >> constants.SUBSCRIBE_OPTIONS_RH_SHIFT & constants.SUBSCRIBE_OPTIONS_RH_MASK;
          if (rh > 2) {
            return this._emitError(new Error("Invalid retain handling, must be <= 2"));
          }
          subscription = { topic, qos };
          if (this.settings.protocolVersion === 5) {
            subscription.nl = nl;
            subscription.rap = rap;
            subscription.rh = rh;
          } else if (this.settings.bridgeMode) {
            subscription.rh = 0;
            subscription.rap = true;
            subscription.nl = true;
          }
          debug("_parseSubscribe: push subscription `%s` to subscription", subscription);
          packet.subscriptions.push(subscription);
        }
      }
      _parseSuback() {
        debug("_parseSuback");
        const packet = this.packet;
        this.packet.granted = [];
        if (!this._parseMessageId()) {
          return;
        }
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        if (packet.length <= 0) {
          return this._emitError(new Error("Malformed suback, no payload specified"));
        }
        while (this._pos < this.packet.length) {
          const code = this._list.readUInt8(this._pos++);
          if (this.settings.protocolVersion === 5) {
            if (!constants.MQTT5_SUBACK_CODES[code]) {
              return this._emitError(new Error("Invalid suback code"));
            }
          } else {
            if (code > 2 && code !== 128) {
              return this._emitError(new Error("Invalid suback QoS, must be 0, 1, 2 or 128"));
            }
          }
          this.packet.granted.push(code);
        }
      }
      _parseUnsubscribe() {
        debug("_parseUnsubscribe");
        const packet = this.packet;
        packet.unsubscriptions = [];
        if (!this._parseMessageId()) {
          return;
        }
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        if (packet.length <= 0) {
          return this._emitError(new Error("Malformed unsubscribe, no payload specified"));
        }
        while (this._pos < packet.length) {
          const topic = this._parseString();
          if (topic === null) return this._emitError(new Error("Cannot parse topic"));
          debug("_parseUnsubscribe: push topic `%s` to unsubscriptions", topic);
          packet.unsubscriptions.push(topic);
        }
      }
      _parseUnsuback() {
        debug("_parseUnsuback");
        const packet = this.packet;
        if (!this._parseMessageId()) return this._emitError(new Error("Cannot parse messageId"));
        if ((this.settings.protocolVersion === 3 || this.settings.protocolVersion === 4) && packet.length !== 2) {
          return this._emitError(new Error("Malformed unsuback, payload length must be 2"));
        }
        if (packet.length <= 0) {
          return this._emitError(new Error("Malformed unsuback, no payload specified"));
        }
        if (this.settings.protocolVersion === 5) {
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
          packet.granted = [];
          while (this._pos < this.packet.length) {
            const code = this._list.readUInt8(this._pos++);
            if (!constants.MQTT5_UNSUBACK_CODES[code]) {
              return this._emitError(new Error("Invalid unsuback code"));
            }
            this.packet.granted.push(code);
          }
        }
      }
      // parse packets like puback, pubrec, pubrel, pubcomp
      _parseConfirmation() {
        debug("_parseConfirmation: packet.cmd: `%s`", this.packet.cmd);
        const packet = this.packet;
        this._parseMessageId();
        if (this.settings.protocolVersion === 5) {
          if (packet.length > 2) {
            packet.reasonCode = this._parseByte();
            switch (this.packet.cmd) {
              case "puback":
              case "pubrec":
                if (!constants.MQTT5_PUBACK_PUBREC_CODES[packet.reasonCode]) {
                  return this._emitError(new Error("Invalid " + this.packet.cmd + " reason code"));
                }
                break;
              case "pubrel":
              case "pubcomp":
                if (!constants.MQTT5_PUBREL_PUBCOMP_CODES[packet.reasonCode]) {
                  return this._emitError(new Error("Invalid " + this.packet.cmd + " reason code"));
                }
                break;
            }
            debug("_parseConfirmation: packet.reasonCode `%d`", packet.reasonCode);
          } else {
            packet.reasonCode = 0;
          }
          if (packet.length > 3) {
            const properties = this._parseProperties();
            if (Object.getOwnPropertyNames(properties).length) {
              packet.properties = properties;
            }
          }
        }
        return true;
      }
      // parse disconnect packet
      _parseDisconnect() {
        const packet = this.packet;
        debug("_parseDisconnect");
        if (this.settings.protocolVersion === 5) {
          if (this._list.length > 0) {
            packet.reasonCode = this._parseByte();
            if (!constants.MQTT5_DISCONNECT_CODES[packet.reasonCode]) {
              this._emitError(new Error("Invalid disconnect reason code"));
            }
          } else {
            packet.reasonCode = 0;
          }
          const properties = this._parseProperties();
          if (Object.getOwnPropertyNames(properties).length) {
            packet.properties = properties;
          }
        }
        debug("_parseDisconnect result: true");
        return true;
      }
      // parse auth packet
      _parseAuth() {
        debug("_parseAuth");
        const packet = this.packet;
        if (this.settings.protocolVersion !== 5) {
          return this._emitError(new Error("Not supported auth packet for this version MQTT"));
        }
        packet.reasonCode = this._parseByte();
        if (!constants.MQTT5_AUTH_CODES[packet.reasonCode]) {
          return this._emitError(new Error("Invalid auth reason code"));
        }
        const properties = this._parseProperties();
        if (Object.getOwnPropertyNames(properties).length) {
          packet.properties = properties;
        }
        debug("_parseAuth: result: true");
        return true;
      }
      _parseMessageId() {
        const packet = this.packet;
        packet.messageId = this._parseNum();
        if (packet.messageId === null) {
          this._emitError(new Error("Cannot parse messageId"));
          return false;
        }
        debug("_parseMessageId: packet.messageId %d", packet.messageId);
        return true;
      }
      _parseString(maybeBuffer) {
        const length = this._parseNum();
        const end = length + this._pos;
        if (length === -1 || end > this._list.length || end > this.packet.length) return null;
        const result = this._list.toString("utf8", this._pos, end);
        this._pos += length;
        debug("_parseString: result: %s", result);
        return result;
      }
      _parseStringPair() {
        debug("_parseStringPair");
        return {
          name: this._parseString(),
          value: this._parseString()
        };
      }
      _parseBuffer() {
        const length = this._parseNum();
        const end = length + this._pos;
        if (length === -1 || end > this._list.length || end > this.packet.length) return null;
        const result = this._list.slice(this._pos, end);
        this._pos += length;
        debug("_parseBuffer: result: %o", result);
        return result;
      }
      _parseNum() {
        if (this._list.length - this._pos < 2) return -1;
        const result = this._list.readUInt16BE(this._pos);
        this._pos += 2;
        debug("_parseNum: result: %s", result);
        return result;
      }
      _parse4ByteNum() {
        if (this._list.length - this._pos < 4) return -1;
        const result = this._list.readUInt32BE(this._pos);
        this._pos += 4;
        debug("_parse4ByteNum: result: %s", result);
        return result;
      }
      _parseVarByteNum(fullInfoFlag) {
        debug("_parseVarByteNum");
        const maxBytes = 4;
        let bytes = 0;
        let mul = 1;
        let value = 0;
        let result = false;
        let current;
        const padding = this._pos ? this._pos : 0;
        while (bytes < maxBytes && padding + bytes < this._list.length) {
          current = this._list.readUInt8(padding + bytes++);
          value += mul * (current & constants.VARBYTEINT_MASK);
          mul *= 128;
          if ((current & constants.VARBYTEINT_FIN_MASK) === 0) {
            result = true;
            break;
          }
          if (this._list.length <= bytes) {
            break;
          }
        }
        if (!result && bytes === maxBytes && this._list.length >= bytes) {
          this._emitError(new Error("Invalid variable byte integer"));
        }
        if (padding) {
          this._pos += bytes;
        }
        if (result) {
          if (fullInfoFlag) {
            result = { bytes, value };
          } else {
            result = value;
          }
        } else {
          result = false;
        }
        debug("_parseVarByteNum: result: %o", result);
        return result;
      }
      _parseByte() {
        let result;
        if (this._pos < this._list.length) {
          result = this._list.readUInt8(this._pos);
          this._pos++;
        }
        debug("_parseByte: result: %o", result);
        return result;
      }
      _parseByType(type) {
        debug("_parseByType: type: %s", type);
        switch (type) {
          case "byte": {
            return this._parseByte() !== 0;
          }
          case "int8": {
            return this._parseByte();
          }
          case "int16": {
            return this._parseNum();
          }
          case "int32": {
            return this._parse4ByteNum();
          }
          case "var": {
            return this._parseVarByteNum();
          }
          case "string": {
            return this._parseString();
          }
          case "pair": {
            return this._parseStringPair();
          }
          case "binary": {
            return this._parseBuffer();
          }
        }
      }
      _parseProperties() {
        debug("_parseProperties");
        const length = this._parseVarByteNum();
        const start = this._pos;
        const end = start + length;
        const result = {};
        while (this._pos < end) {
          const type = this._parseByte();
          if (!type) {
            this._emitError(new Error("Cannot parse property code type"));
            return false;
          }
          const name = constants.propertiesCodes[type];
          if (!name) {
            this._emitError(new Error("Unknown property"));
            return false;
          }
          if (name === "userProperties") {
            if (!result[name]) {
              result[name] = /* @__PURE__ */ Object.create(null);
            }
            const currentUserProperty = this._parseByType(constants.propertiesTypes[name]);
            if (result[name][currentUserProperty.name]) {
              if (Array.isArray(result[name][currentUserProperty.name])) {
                result[name][currentUserProperty.name].push(currentUserProperty.value);
              } else {
                const currentValue = result[name][currentUserProperty.name];
                result[name][currentUserProperty.name] = [currentValue];
                result[name][currentUserProperty.name].push(currentUserProperty.value);
              }
            } else {
              result[name][currentUserProperty.name] = currentUserProperty.value;
            }
            continue;
          }
          if (result[name]) {
            if (Array.isArray(result[name])) {
              result[name].push(this._parseByType(constants.propertiesTypes[name]));
            } else {
              result[name] = [result[name]];
              result[name].push(this._parseByType(constants.propertiesTypes[name]));
            }
          } else {
            result[name] = this._parseByType(constants.propertiesTypes[name]);
          }
        }
        return result;
      }
      _newPacket() {
        debug("_newPacket");
        if (this.packet) {
          this._list.consume(this.packet.length);
          debug("_newPacket: parser emit packet: packet.cmd: %s, packet.payload: %s, packet.length: %d", this.packet.cmd, this.packet.payload, this.packet.length);
          this.emit("packet", this.packet);
        }
        debug("_newPacket: new packet");
        this.packet = new Packet();
        this._pos = 0;
        return true;
      }
      _emitError(err) {
        debug("_emitError", err);
        this.error = err;
        this.emit("error", err);
      }
    };
    module.exports = Parser;
  }
});

// node_modules/mqtt-packet/numbers.js
var require_numbers = __commonJS({
  "node_modules/mqtt-packet/numbers.js"(exports, module) {
    var { Buffer: Buffer2 } = __require("buffer");
    var max = 65536;
    var cache = {};
    var SubOk = Buffer2.isBuffer(Buffer2.from([1, 2]).subarray(0, 1));
    function generateBuffer(i) {
      const buffer = Buffer2.allocUnsafe(2);
      buffer.writeUInt8(i >> 8, 0);
      buffer.writeUInt8(i & 255, 0 + 1);
      return buffer;
    }
    function generateCache() {
      for (let i = 0; i < max; i++) {
        cache[i] = generateBuffer(i);
      }
    }
    function genBufVariableByteInt(num) {
      const maxLength = 4;
      let digit = 0;
      let pos = 0;
      const buffer = Buffer2.allocUnsafe(maxLength);
      do {
        digit = num % 128 | 0;
        num = num / 128 | 0;
        if (num > 0) digit = digit | 128;
        buffer.writeUInt8(digit, pos++);
      } while (num > 0 && pos < maxLength);
      if (num > 0) {
        pos = 0;
      }
      return SubOk ? buffer.subarray(0, pos) : buffer.slice(0, pos);
    }
    function generate4ByteBuffer(num) {
      const buffer = Buffer2.allocUnsafe(4);
      buffer.writeUInt32BE(num, 0);
      return buffer;
    }
    module.exports = {
      cache,
      generateCache,
      generateNumber: generateBuffer,
      genBufVariableByteInt,
      generate4ByteBuffer
    };
  }
});

// node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "node_modules/process-nextick-args/index.js"(exports, module) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module.exports = { nextTick };
    } else {
      module.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// node_modules/mqtt-packet/writeToStream.js
var require_writeToStream = __commonJS({
  "node_modules/mqtt-packet/writeToStream.js"(exports, module) {
    var protocol = require_constants();
    var { Buffer: Buffer2 } = __require("buffer");
    var empty = Buffer2.allocUnsafe(0);
    var zeroBuf = Buffer2.from([0]);
    var numbers = require_numbers();
    var nextTick = require_process_nextick_args().nextTick;
    var debug = require_src()("mqtt-packet:writeToStream");
    var numCache = numbers.cache;
    var generateNumber = numbers.generateNumber;
    var generateCache = numbers.generateCache;
    var genBufVariableByteInt = numbers.genBufVariableByteInt;
    var generate4ByteBuffer = numbers.generate4ByteBuffer;
    var writeNumber = writeNumberCached;
    var toGenerate = true;
    function generate(packet, stream, opts) {
      debug("generate called");
      if (stream.cork) {
        stream.cork();
        nextTick(uncork, stream);
      }
      if (toGenerate) {
        toGenerate = false;
        generateCache();
      }
      debug("generate: packet.cmd: %s", packet.cmd);
      switch (packet.cmd) {
        case "connect":
          return connect(packet, stream, opts);
        case "connack":
          return connack(packet, stream, opts);
        case "publish":
          return publish(packet, stream, opts);
        case "puback":
        case "pubrec":
        case "pubrel":
        case "pubcomp":
          return confirmation(packet, stream, opts);
        case "subscribe":
          return subscribe(packet, stream, opts);
        case "suback":
          return suback(packet, stream, opts);
        case "unsubscribe":
          return unsubscribe(packet, stream, opts);
        case "unsuback":
          return unsuback(packet, stream, opts);
        case "pingreq":
        case "pingresp":
          return emptyPacket(packet, stream, opts);
        case "disconnect":
          return disconnect(packet, stream, opts);
        case "auth":
          return auth(packet, stream, opts);
        default:
          stream.destroy(new Error("Unknown command"));
          return false;
      }
    }
    Object.defineProperty(generate, "cacheNumbers", {
      get() {
        return writeNumber === writeNumberCached;
      },
      set(value) {
        if (value) {
          if (!numCache || Object.keys(numCache).length === 0) toGenerate = true;
          writeNumber = writeNumberCached;
        } else {
          toGenerate = false;
          writeNumber = writeNumberGenerated;
        }
      }
    });
    function uncork(stream) {
      stream.uncork();
    }
    function connect(packet, stream, opts) {
      const settings = packet || {};
      const protocolId = settings.protocolId || "MQTT";
      let protocolVersion = settings.protocolVersion || 4;
      const will = settings.will;
      let clean = settings.clean;
      const keepalive = settings.keepalive || 0;
      const clientId = settings.clientId || "";
      const username = settings.username;
      const password = settings.password;
      const properties = settings.properties;
      if (clean === void 0) clean = true;
      let length = 0;
      if (!protocolId || typeof protocolId !== "string" && !Buffer2.isBuffer(protocolId)) {
        stream.destroy(new Error("Invalid protocolId"));
        return false;
      } else length += protocolId.length + 2;
      if (protocolVersion !== 3 && protocolVersion !== 4 && protocolVersion !== 5) {
        stream.destroy(new Error("Invalid protocol version"));
        return false;
      } else length += 1;
      if ((typeof clientId === "string" || Buffer2.isBuffer(clientId)) && (clientId || protocolVersion >= 4) && (clientId || clean)) {
        length += Buffer2.byteLength(clientId) + 2;
      } else {
        if (protocolVersion < 4) {
          stream.destroy(new Error("clientId must be supplied before 3.1.1"));
          return false;
        }
        if (clean * 1 === 0) {
          stream.destroy(new Error("clientId must be given if cleanSession set to 0"));
          return false;
        }
      }
      if (typeof keepalive !== "number" || keepalive < 0 || keepalive > 65535 || keepalive % 1 !== 0) {
        stream.destroy(new Error("Invalid keepalive"));
        return false;
      } else length += 2;
      length += 1;
      let propertiesData;
      let willProperties;
      if (protocolVersion === 5) {
        propertiesData = getProperties(stream, properties);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      if (will) {
        if (typeof will !== "object") {
          stream.destroy(new Error("Invalid will"));
          return false;
        }
        if (!will.topic || typeof will.topic !== "string") {
          stream.destroy(new Error("Invalid will topic"));
          return false;
        } else {
          length += Buffer2.byteLength(will.topic) + 2;
        }
        length += 2;
        if (will.payload) {
          if (will.payload.length >= 0) {
            if (typeof will.payload === "string") {
              length += Buffer2.byteLength(will.payload);
            } else {
              length += will.payload.length;
            }
          } else {
            stream.destroy(new Error("Invalid will payload"));
            return false;
          }
        }
        willProperties = {};
        if (protocolVersion === 5) {
          willProperties = getProperties(stream, will.properties);
          if (!willProperties) {
            return false;
          }
          length += willProperties.length;
        }
      }
      let providedUsername = false;
      if (username != null) {
        if (isStringOrBuffer(username)) {
          providedUsername = true;
          length += Buffer2.byteLength(username) + 2;
        } else {
          stream.destroy(new Error("Invalid username"));
          return false;
        }
      }
      if (password != null) {
        if (!providedUsername) {
          stream.destroy(new Error("Username is required to use password"));
          return false;
        }
        if (isStringOrBuffer(password)) {
          length += byteLength(password) + 2;
        } else {
          stream.destroy(new Error("Invalid password"));
          return false;
        }
      }
      stream.write(protocol.CONNECT_HEADER);
      writeVarByteInt(stream, length);
      writeStringOrBuffer(stream, protocolId);
      if (settings.bridgeMode) {
        protocolVersion += 128;
      }
      stream.write(
        protocolVersion === 131 ? protocol.VERSION131 : protocolVersion === 132 ? protocol.VERSION132 : protocolVersion === 4 ? protocol.VERSION4 : protocolVersion === 5 ? protocol.VERSION5 : protocol.VERSION3
      );
      let flags = 0;
      flags |= username != null ? protocol.USERNAME_MASK : 0;
      flags |= password != null ? protocol.PASSWORD_MASK : 0;
      flags |= will && will.retain ? protocol.WILL_RETAIN_MASK : 0;
      flags |= will && will.qos ? will.qos << protocol.WILL_QOS_SHIFT : 0;
      flags |= will ? protocol.WILL_FLAG_MASK : 0;
      flags |= clean ? protocol.CLEAN_SESSION_MASK : 0;
      stream.write(Buffer2.from([flags]));
      writeNumber(stream, keepalive);
      if (protocolVersion === 5) {
        propertiesData.write();
      }
      writeStringOrBuffer(stream, clientId);
      if (will) {
        if (protocolVersion === 5) {
          willProperties.write();
        }
        writeString(stream, will.topic);
        writeStringOrBuffer(stream, will.payload);
      }
      if (username != null) {
        writeStringOrBuffer(stream, username);
      }
      if (password != null) {
        writeStringOrBuffer(stream, password);
      }
      return true;
    }
    function connack(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const rc = version3 === 5 ? settings.reasonCode : settings.returnCode;
      const properties = settings.properties;
      let length = 2;
      if (typeof rc !== "number") {
        stream.destroy(new Error("Invalid return code"));
        return false;
      }
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getProperties(stream, properties);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(protocol.CONNACK_HEADER);
      writeVarByteInt(stream, length);
      stream.write(settings.sessionPresent ? protocol.SESSIONPRESENT_HEADER : zeroBuf);
      stream.write(Buffer2.from([rc]));
      if (propertiesData != null) {
        propertiesData.write();
      }
      return true;
    }
    function publish(packet, stream, opts) {
      debug("publish: packet: %o", packet);
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const qos = settings.qos || 0;
      const retain = settings.retain ? protocol.RETAIN_MASK : 0;
      const topic = settings.topic;
      const payload = settings.payload || empty;
      const id = settings.messageId;
      const properties = settings.properties;
      let length = 0;
      if (typeof topic === "string") length += Buffer2.byteLength(topic) + 2;
      else if (Buffer2.isBuffer(topic)) length += topic.length + 2;
      else {
        stream.destroy(new Error("Invalid topic"));
        return false;
      }
      if (!Buffer2.isBuffer(payload)) length += Buffer2.byteLength(payload);
      else length += payload.length;
      if (qos && typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      } else if (qos) length += 2;
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getProperties(stream, properties);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(protocol.PUBLISH_HEADER[qos][settings.dup ? 1 : 0][retain ? 1 : 0]);
      writeVarByteInt(stream, length);
      writeNumber(stream, byteLength(topic));
      stream.write(topic);
      if (qos > 0) writeNumber(stream, id);
      if (propertiesData != null) {
        propertiesData.write();
      }
      debug("publish: payload: %o", payload);
      return stream.write(payload);
    }
    function confirmation(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const type = settings.cmd || "puback";
      const id = settings.messageId;
      const dup = settings.dup && type === "pubrel" ? protocol.DUP_MASK : 0;
      let qos = 0;
      const reasonCode = settings.reasonCode;
      const properties = settings.properties;
      let length = version3 === 5 ? 3 : 2;
      if (type === "pubrel") qos = 1;
      if (typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      }
      let propertiesData = null;
      if (version3 === 5) {
        if (typeof properties === "object") {
          propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length);
          if (!propertiesData) {
            return false;
          }
          length += propertiesData.length;
        }
      }
      stream.write(protocol.ACKS[type][qos][dup][0]);
      if (length === 3) length += reasonCode !== 0 ? 1 : -1;
      writeVarByteInt(stream, length);
      writeNumber(stream, id);
      if (version3 === 5 && length !== 2) {
        stream.write(Buffer2.from([reasonCode]));
      }
      if (propertiesData !== null) {
        propertiesData.write();
      } else {
        if (length === 4) {
          stream.write(Buffer2.from([0]));
        }
      }
      return true;
    }
    function subscribe(packet, stream, opts) {
      debug("subscribe: packet: ");
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const dup = settings.dup ? protocol.DUP_MASK : 0;
      const id = settings.messageId;
      const subs = settings.subscriptions;
      const properties = settings.properties;
      let length = 0;
      if (typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      } else length += 2;
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getProperties(stream, properties);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      if (typeof subs === "object" && subs.length) {
        for (let i = 0; i < subs.length; i += 1) {
          const itopic = subs[i].topic;
          const iqos = subs[i].qos;
          if (typeof itopic !== "string") {
            stream.destroy(new Error("Invalid subscriptions - invalid topic"));
            return false;
          }
          if (typeof iqos !== "number") {
            stream.destroy(new Error("Invalid subscriptions - invalid qos"));
            return false;
          }
          if (version3 === 5) {
            const nl = subs[i].nl || false;
            if (typeof nl !== "boolean") {
              stream.destroy(new Error("Invalid subscriptions - invalid No Local"));
              return false;
            }
            const rap = subs[i].rap || false;
            if (typeof rap !== "boolean") {
              stream.destroy(new Error("Invalid subscriptions - invalid Retain as Published"));
              return false;
            }
            const rh = subs[i].rh || 0;
            if (typeof rh !== "number" || rh > 2) {
              stream.destroy(new Error("Invalid subscriptions - invalid Retain Handling"));
              return false;
            }
          }
          length += Buffer2.byteLength(itopic) + 2 + 1;
        }
      } else {
        stream.destroy(new Error("Invalid subscriptions"));
        return false;
      }
      debug("subscribe: writing to stream: %o", protocol.SUBSCRIBE_HEADER);
      stream.write(protocol.SUBSCRIBE_HEADER[1][dup ? 1 : 0][0]);
      writeVarByteInt(stream, length);
      writeNumber(stream, id);
      if (propertiesData !== null) {
        propertiesData.write();
      }
      let result = true;
      for (const sub of subs) {
        const jtopic = sub.topic;
        const jqos = sub.qos;
        const jnl = +sub.nl;
        const jrap = +sub.rap;
        const jrh = sub.rh;
        let joptions;
        writeString(stream, jtopic);
        joptions = protocol.SUBSCRIBE_OPTIONS_QOS[jqos];
        if (version3 === 5) {
          joptions |= jnl ? protocol.SUBSCRIBE_OPTIONS_NL : 0;
          joptions |= jrap ? protocol.SUBSCRIBE_OPTIONS_RAP : 0;
          joptions |= jrh ? protocol.SUBSCRIBE_OPTIONS_RH[jrh] : 0;
        }
        result = stream.write(Buffer2.from([joptions]));
      }
      return result;
    }
    function suback(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const id = settings.messageId;
      const granted = settings.granted;
      const properties = settings.properties;
      let length = 0;
      if (typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      } else length += 2;
      if (typeof granted === "object" && granted.length) {
        for (let i = 0; i < granted.length; i += 1) {
          if (typeof granted[i] !== "number") {
            stream.destroy(new Error("Invalid qos vector"));
            return false;
          }
          length += 1;
        }
      } else {
        stream.destroy(new Error("Invalid qos vector"));
        return false;
      }
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(protocol.SUBACK_HEADER);
      writeVarByteInt(stream, length);
      writeNumber(stream, id);
      if (propertiesData !== null) {
        propertiesData.write();
      }
      return stream.write(Buffer2.from(granted));
    }
    function unsubscribe(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const id = settings.messageId;
      const dup = settings.dup ? protocol.DUP_MASK : 0;
      const unsubs = settings.unsubscriptions;
      const properties = settings.properties;
      let length = 0;
      if (typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      } else {
        length += 2;
      }
      if (typeof unsubs === "object" && unsubs.length) {
        for (let i = 0; i < unsubs.length; i += 1) {
          if (typeof unsubs[i] !== "string") {
            stream.destroy(new Error("Invalid unsubscriptions"));
            return false;
          }
          length += Buffer2.byteLength(unsubs[i]) + 2;
        }
      } else {
        stream.destroy(new Error("Invalid unsubscriptions"));
        return false;
      }
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getProperties(stream, properties);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(protocol.UNSUBSCRIBE_HEADER[1][dup ? 1 : 0][0]);
      writeVarByteInt(stream, length);
      writeNumber(stream, id);
      if (propertiesData !== null) {
        propertiesData.write();
      }
      let result = true;
      for (let j = 0; j < unsubs.length; j++) {
        result = writeString(stream, unsubs[j]);
      }
      return result;
    }
    function unsuback(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const id = settings.messageId;
      const dup = settings.dup ? protocol.DUP_MASK : 0;
      const granted = settings.granted;
      const properties = settings.properties;
      const type = settings.cmd;
      const qos = 0;
      let length = 2;
      if (typeof id !== "number") {
        stream.destroy(new Error("Invalid messageId"));
        return false;
      }
      if (version3 === 5) {
        if (typeof granted === "object" && granted.length) {
          for (let i = 0; i < granted.length; i += 1) {
            if (typeof granted[i] !== "number") {
              stream.destroy(new Error("Invalid qos vector"));
              return false;
            }
            length += 1;
          }
        } else {
          stream.destroy(new Error("Invalid qos vector"));
          return false;
        }
      }
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(protocol.ACKS[type][qos][dup][0]);
      writeVarByteInt(stream, length);
      writeNumber(stream, id);
      if (propertiesData !== null) {
        propertiesData.write();
      }
      if (version3 === 5) {
        stream.write(Buffer2.from(granted));
      }
      return true;
    }
    function emptyPacket(packet, stream, opts) {
      return stream.write(protocol.EMPTY[packet.cmd]);
    }
    function disconnect(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const reasonCode = settings.reasonCode;
      const properties = settings.properties;
      let length = version3 === 5 ? 1 : 0;
      let propertiesData = null;
      if (version3 === 5) {
        propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length);
        if (!propertiesData) {
          return false;
        }
        length += propertiesData.length;
      }
      stream.write(Buffer2.from([protocol.codes.disconnect << 4]));
      writeVarByteInt(stream, length);
      if (version3 === 5) {
        stream.write(Buffer2.from([reasonCode]));
      }
      if (propertiesData !== null) {
        propertiesData.write();
      }
      return true;
    }
    function auth(packet, stream, opts) {
      const version3 = opts ? opts.protocolVersion : 4;
      const settings = packet || {};
      const reasonCode = settings.reasonCode;
      const properties = settings.properties;
      let length = version3 === 5 ? 1 : 0;
      if (version3 !== 5) stream.destroy(new Error("Invalid mqtt version for auth packet"));
      const propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length);
      if (!propertiesData) {
        return false;
      }
      length += propertiesData.length;
      stream.write(Buffer2.from([protocol.codes.auth << 4]));
      writeVarByteInt(stream, length);
      stream.write(Buffer2.from([reasonCode]));
      if (propertiesData !== null) {
        propertiesData.write();
      }
      return true;
    }
    var varByteIntCache = {};
    function writeVarByteInt(stream, num) {
      if (num > protocol.VARBYTEINT_MAX) {
        stream.destroy(new Error(`Invalid variable byte integer: ${num}`));
        return false;
      }
      let buffer = varByteIntCache[num];
      if (!buffer) {
        buffer = genBufVariableByteInt(num);
        if (num < 16384) varByteIntCache[num] = buffer;
      }
      debug("writeVarByteInt: writing to stream: %o", buffer);
      return stream.write(buffer);
    }
    function writeString(stream, string) {
      const strlen = Buffer2.byteLength(string);
      writeNumber(stream, strlen);
      debug("writeString: %s", string);
      return stream.write(string, "utf8");
    }
    function writeStringPair(stream, name, value) {
      writeString(stream, name);
      writeString(stream, value);
    }
    function writeNumberCached(stream, number) {
      debug("writeNumberCached: number: %d", number);
      debug("writeNumberCached: %o", numCache[number]);
      return stream.write(numCache[number]);
    }
    function writeNumberGenerated(stream, number) {
      const generatedNumber = generateNumber(number);
      debug("writeNumberGenerated: %o", generatedNumber);
      return stream.write(generatedNumber);
    }
    function write4ByteNumber(stream, number) {
      const generated4ByteBuffer = generate4ByteBuffer(number);
      debug("write4ByteNumber: %o", generated4ByteBuffer);
      return stream.write(generated4ByteBuffer);
    }
    function writeStringOrBuffer(stream, toWrite) {
      if (typeof toWrite === "string") {
        writeString(stream, toWrite);
      } else if (toWrite) {
        writeNumber(stream, toWrite.length);
        stream.write(toWrite);
      } else writeNumber(stream, 0);
    }
    function getProperties(stream, properties) {
      if (typeof properties !== "object" || properties.length != null) {
        return {
          length: 1,
          write() {
            writeProperties(stream, {}, 0);
          }
        };
      }
      let propertiesLength = 0;
      function getLengthProperty(name, value) {
        const type = protocol.propertiesTypes[name];
        let length = 0;
        switch (type) {
          case "byte": {
            if (typeof value !== "boolean") {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + 1;
            break;
          }
          case "int8": {
            if (typeof value !== "number" || value < 0 || value > 255) {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + 1;
            break;
          }
          case "binary": {
            if (value && value === null) {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + Buffer2.byteLength(value) + 2;
            break;
          }
          case "int16": {
            if (typeof value !== "number" || value < 0 || value > 65535) {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + 2;
            break;
          }
          case "int32": {
            if (typeof value !== "number" || value < 0 || value > 4294967295) {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + 4;
            break;
          }
          case "var": {
            if (typeof value !== "number" || value < 0 || value > 268435455) {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + Buffer2.byteLength(genBufVariableByteInt(value));
            break;
          }
          case "string": {
            if (typeof value !== "string") {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += 1 + 2 + Buffer2.byteLength(value.toString());
            break;
          }
          case "pair": {
            if (typeof value !== "object") {
              stream.destroy(new Error(`Invalid ${name}: ${value}`));
              return false;
            }
            length += Object.getOwnPropertyNames(value).reduce((result, name2) => {
              const currentValue = value[name2];
              if (Array.isArray(currentValue)) {
                result += currentValue.reduce((currentLength, value2) => {
                  currentLength += 1 + 2 + Buffer2.byteLength(name2.toString()) + 2 + Buffer2.byteLength(value2.toString());
                  return currentLength;
                }, 0);
              } else {
                result += 1 + 2 + Buffer2.byteLength(name2.toString()) + 2 + Buffer2.byteLength(value[name2].toString());
              }
              return result;
            }, 0);
            break;
          }
          default: {
            stream.destroy(new Error(`Invalid property ${name}: ${value}`));
            return false;
          }
        }
        return length;
      }
      if (properties) {
        for (const propName in properties) {
          let propLength = 0;
          let propValueLength = 0;
          const propValue = properties[propName];
          if (propValue === void 0) {
            continue;
          } else if (Array.isArray(propValue)) {
            for (let valueIndex = 0; valueIndex < propValue.length; valueIndex++) {
              propValueLength = getLengthProperty(propName, propValue[valueIndex]);
              if (!propValueLength) {
                return false;
              }
              propLength += propValueLength;
            }
          } else {
            propValueLength = getLengthProperty(propName, propValue);
            if (!propValueLength) {
              return false;
            }
            propLength = propValueLength;
          }
          if (!propLength) return false;
          propertiesLength += propLength;
        }
      }
      const propertiesLengthLength = Buffer2.byteLength(genBufVariableByteInt(propertiesLength));
      return {
        length: propertiesLengthLength + propertiesLength,
        write() {
          writeProperties(stream, properties, propertiesLength);
        }
      };
    }
    function getPropertiesByMaximumPacketSize(stream, properties, opts, length) {
      const mayEmptyProps = ["reasonString", "userProperties"];
      const maximumPacketSize = opts && opts.properties && opts.properties.maximumPacketSize ? opts.properties.maximumPacketSize : 0;
      let propertiesData = getProperties(stream, properties);
      if (maximumPacketSize) {
        while (length + propertiesData.length > maximumPacketSize) {
          const currentMayEmptyProp = mayEmptyProps.shift();
          if (currentMayEmptyProp && properties[currentMayEmptyProp]) {
            delete properties[currentMayEmptyProp];
            propertiesData = getProperties(stream, properties);
          } else {
            return false;
          }
        }
      }
      return propertiesData;
    }
    function writeProperty(stream, propName, value) {
      const type = protocol.propertiesTypes[propName];
      switch (type) {
        case "byte": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          stream.write(Buffer2.from([+value]));
          break;
        }
        case "int8": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          stream.write(Buffer2.from([value]));
          break;
        }
        case "binary": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          writeStringOrBuffer(stream, value);
          break;
        }
        case "int16": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          writeNumber(stream, value);
          break;
        }
        case "int32": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          write4ByteNumber(stream, value);
          break;
        }
        case "var": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          writeVarByteInt(stream, value);
          break;
        }
        case "string": {
          stream.write(Buffer2.from([protocol.properties[propName]]));
          writeString(stream, value);
          break;
        }
        case "pair": {
          Object.getOwnPropertyNames(value).forEach((name) => {
            const currentValue = value[name];
            if (Array.isArray(currentValue)) {
              currentValue.forEach((value2) => {
                stream.write(Buffer2.from([protocol.properties[propName]]));
                writeStringPair(stream, name.toString(), value2.toString());
              });
            } else {
              stream.write(Buffer2.from([protocol.properties[propName]]));
              writeStringPair(stream, name.toString(), currentValue.toString());
            }
          });
          break;
        }
        default: {
          stream.destroy(new Error(`Invalid property ${propName} value: ${value}`));
          return false;
        }
      }
    }
    function writeProperties(stream, properties, propertiesLength) {
      writeVarByteInt(stream, propertiesLength);
      for (const propName in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, propName) && properties[propName] != null) {
          const value = properties[propName];
          if (Array.isArray(value)) {
            for (let valueIndex = 0; valueIndex < value.length; valueIndex++) {
              writeProperty(stream, propName, value[valueIndex]);
            }
          } else {
            writeProperty(stream, propName, value);
          }
        }
      }
    }
    function byteLength(bufOrString) {
      if (!bufOrString) return 0;
      else if (bufOrString instanceof Buffer2) return bufOrString.length;
      else return Buffer2.byteLength(bufOrString);
    }
    function isStringOrBuffer(field) {
      return typeof field === "string" || field instanceof Buffer2;
    }
    module.exports = generate;
  }
});

// node_modules/mqtt-packet/generate.js
var require_generate = __commonJS({
  "node_modules/mqtt-packet/generate.js"(exports, module) {
    var writeToStream = require_writeToStream();
    var { EventEmitter } = __require("events");
    var { Buffer: Buffer2 } = __require("buffer");
    function generate(packet, opts) {
      const stream = new Accumulator();
      writeToStream(packet, stream, opts);
      return stream.concat();
    }
    var Accumulator = class extends EventEmitter {
      constructor() {
        super();
        this._array = new Array(20);
        this._i = 0;
      }
      write(chunk) {
        this._array[this._i++] = chunk;
        return true;
      }
      concat() {
        let length = 0;
        const lengths = new Array(this._array.length);
        const list = this._array;
        let pos = 0;
        let i;
        for (i = 0; i < list.length && list[i] !== void 0; i++) {
          if (typeof list[i] !== "string") lengths[i] = list[i].length;
          else lengths[i] = Buffer2.byteLength(list[i]);
          length += lengths[i];
        }
        const result = Buffer2.allocUnsafe(length);
        for (i = 0; i < list.length && list[i] !== void 0; i++) {
          if (typeof list[i] !== "string") {
            list[i].copy(result, pos);
            pos += lengths[i];
          } else {
            result.write(list[i], pos);
            pos += lengths[i];
          }
        }
        return result;
      }
      destroy(err) {
        if (err) this.emit("error", err);
      }
    };
    module.exports = generate;
  }
});

// node_modules/mqtt-packet/mqtt.js
var require_mqtt = __commonJS({
  "node_modules/mqtt-packet/mqtt.js"(exports) {
    exports.parser = require_parser().parser;
    exports.generate = require_generate();
    exports.writeToStream = require_writeToStream();
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/wrappy/wrappy.js"(exports, module) {
    module.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb) return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/once/once.js"(exports, module) {
    var wrappy = require_wrappy();
    module.exports = wrappy(once);
    module.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function() {
        if (f.called) return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/end-of-stream/index.js
var require_end_of_stream2 = __commonJS({
  "node_modules/end-of-stream/index.js"(exports, module) {
    var once = require_once();
    var noop = function() {
    };
    var qnt = global.Bare ? queueMicrotask : process.nextTick.bind(process);
    var isRequest = function(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    };
    var isChildProcess = function(stream) {
      return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
    };
    var eos = function(stream, opts, callback) {
      if (typeof opts === "function") return eos(stream, null, opts);
      if (!opts) opts = {};
      callback = once(callback || noop);
      var ws = stream._writableState;
      var rs = stream._readableState;
      var readable = opts.readable || opts.readable !== false && stream.readable;
      var writable = opts.writable || opts.writable !== false && stream.writable;
      var cancelled = false;
      var onlegacyfinish = function() {
        if (!stream.writable) onfinish();
      };
      var onfinish = function() {
        writable = false;
        if (!readable) callback.call(stream);
      };
      var onend = function() {
        readable = false;
        if (!writable) callback.call(stream);
      };
      var onexit = function(exitCode) {
        callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
      };
      var onerror = function(err) {
        callback.call(stream, err);
      };
      var onclose = function() {
        qnt(onclosenexttick);
      };
      var onclosenexttick = function() {
        if (cancelled) return;
        if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error("premature close"));
        if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error("premature close"));
      };
      var onrequest = function() {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req) onrequest();
        else stream.on("request", onrequest);
      } else if (writable && !ws) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      if (isChildProcess(stream)) stream.on("exit", onexit);
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (opts.error !== false) stream.on("error", onerror);
      stream.on("close", onclose);
      return function() {
        cancelled = true;
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("exit", onexit);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
    };
    module.exports = eos;
  }
});

// node_modules/aedes/lib/write.js
var require_write = __commonJS({
  "node_modules/aedes/lib/write.js"(exports, module) {
    "use strict";
    var mqtt = require_mqtt();
    function write(client, packet, done) {
      let error = null;
      if (client.connecting || client.connected) {
        try {
          const result = mqtt.writeToStream(packet, client.conn);
          if (!result && !client.errored) {
            client.conn.once("drain", done);
            return;
          }
        } catch (e) {
          error = new Error("packet received not valid");
        }
      } else {
        error = new Error("connection closed");
      }
      setImmediate(done, error, client);
    }
    module.exports = write;
  }
});

// node_modules/aedes/lib/qos-packet.js
var require_qos_packet = __commonJS({
  "node_modules/aedes/lib/qos-packet.js"(exports, module) {
    "use strict";
    var Packet = require_packet();
    var util = __require("util");
    function QoSPacket(original, client) {
      Packet.call(this, original, client.broker);
      this.writeCallback = client._onError.bind(client);
      if (!original.messageId) {
        this.messageId = client._nextId;
        if (client._nextId >= 65535) {
          client._nextId = 1;
        } else {
          client._nextId++;
        }
      } else {
        this.messageId = original.messageId;
      }
    }
    util.inherits(QoSPacket, Packet);
    module.exports = QoSPacket;
  }
});

// node_modules/fastfall/fall.js
var require_fall = __commonJS({
  "node_modules/fastfall/fall.js"(exports, module) {
    "use strict";
    var reusify = require_reusify();
    var empty = [];
    function fastfall(context, template) {
      if (Array.isArray(context)) {
        template = context;
        context = null;
      }
      var queue = reusify(Holder);
      return template ? compiled : fall;
      function fall() {
        var current = queue.get();
        current.release = release;
        if (arguments.length === 3) {
          current.context = arguments[0];
          current.list = arguments[1];
          current.callback = arguments[2] || noop;
        } else {
          current.context = context;
          current.list = arguments[0];
          current.callback = arguments[1] || noop;
        }
        current.work();
      }
      function release(holder) {
        queue.release(holder);
      }
      function compiled() {
        var current = queue.get();
        current.release = release;
        current.list = template;
        var args;
        var i;
        var len = arguments.length - 1;
        current.context = this || context;
        current.callback = arguments[len] || noop;
        switch (len) {
          case 0:
            current.work();
            break;
          case 1:
            current.work(null, arguments[0]);
            break;
          case 2:
            current.work(null, arguments[0], arguments[1]);
            break;
          case 3:
            current.work(null, arguments[0], arguments[1], arguments[2]);
            break;
          case 4:
            current.work(null, arguments[0], arguments[1], arguments[2], arguments[3]);
            break;
          default:
            args = new Array(len + 1);
            args[0] = null;
            for (i = 0; i < len; i++) {
              args[i + 1] = arguments[i];
            }
            current.work.apply(null, args);
        }
      }
    }
    function noop() {
    }
    function Holder() {
      this.list = empty;
      this.callback = noop;
      this.count = 0;
      this.context = void 0;
      this.release = noop;
      var that = this;
      this.work = function work() {
        if (arguments.length > 0 && arguments[0]) {
          return that.callback.call(that.context, arguments[0]);
        }
        var len = arguments.length;
        var i;
        var args;
        var func;
        if (that.count < that.list.length) {
          func = that.list[that.count++];
          switch (len) {
            case 0:
            case 1:
              return func.call(that.context, work);
            case 2:
              return func.call(that.context, arguments[1], work);
            case 3:
              return func.call(that.context, arguments[1], arguments[2], work);
            case 4:
              return func.call(that.context, arguments[1], arguments[2], arguments[3], work);
            default:
              args = new Array(len);
              for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
              }
              args[len - 1] = work;
              func.apply(that.context, args);
          }
        } else {
          switch (len) {
            case 0:
              that.callback.call(that.context);
              break;
            case 1:
              that.callback.call(that.context, arguments[0]);
              break;
            case 2:
              that.callback.call(that.context, arguments[0], arguments[1]);
              break;
            case 3:
              that.callback.call(that.context, arguments[0], arguments[1], arguments[2]);
              break;
            case 4:
              that.callback.call(that.context, arguments[0], arguments[1], arguments[2], arguments[3]);
              break;
            default:
              args = new Array(len);
              for (i = 0; i < len; i++) {
                args[i] = arguments[i];
              }
              that.callback.apply(that.context, args);
          }
          that.context = void 0;
          that.list = empty;
          that.count = 0;
          that.release(that);
        }
      };
    }
    module.exports = fastfall;
  }
});

// node_modules/aedes/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/aedes/lib/utils.js"(exports, module) {
    "use strict";
    var { Transform, Writable } = __require("stream");
    function validateTopic(topic, message) {
      if (!topic || topic.length === 0) {
        return new Error("impossible to " + message + " to an empty topic");
      }
      const end = topic.length - 1;
      const endMinus = end - 1;
      const slashInPreEnd = endMinus > 0 && topic.charCodeAt(endMinus) !== 47;
      for (let i = 0; i < topic.length; i++) {
        switch (topic.charCodeAt(i)) {
          case 35: {
            const notAtTheEnd = i !== end;
            if (notAtTheEnd || slashInPreEnd) {
              return new Error("# is only allowed in " + message + " in the last position");
            }
            break;
          }
          case 43: {
            const pastChar = i < end - 1 && topic.charCodeAt(i + 1) !== 47;
            const preChar = i > 1 && topic.charCodeAt(i - 1) !== 47;
            if (pastChar || preChar) {
              return new Error("+ is only allowed in " + message + " between /");
            }
            break;
          }
        }
      }
    }
    function through(transform) {
      return new Transform({
        objectMode: true,
        transform
      });
    }
    function bulk(fn) {
      return new Writable({
        objectMode: true,
        writev: function(chunks, cb) {
          fn(chunks.map((chunk) => chunk.chunk), cb);
        }
      });
    }
    module.exports = {
      validateTopic,
      through,
      bulk,
      $SYS_PREFIX: "$SYS/"
    };
  }
});

// node_modules/aedes/lib/handlers/subscribe.js
var require_subscribe = __commonJS({
  "node_modules/aedes/lib/handlers/subscribe.js"(exports, module) {
    "use strict";
    var fastfall = require_fall();
    var Packet = require_packet();
    var { through } = require_utils2();
    var { validateTopic, $SYS_PREFIX } = require_utils2();
    var write = require_write();
    var subscribeTopicActions = fastfall([
      authorize,
      storeSubscriptions,
      addSubs
    ]);
    var restoreTopicActions = fastfall([
      authorize,
      addSubs
    ]);
    function SubAck(packet, granted) {
      this.cmd = "suback";
      this.messageId = packet.messageId;
      this.granted = granted;
    }
    function Subscription(qos, func, rh, rap, nl) {
      this.qos = qos;
      this.func = func;
      this.rh = rh;
      this.rap = rap;
      this.nl = nl;
    }
    function SubscribeState(client, packet, restore, finish) {
      this.client = client;
      this.packet = packet;
      this.actions = restore ? restoreTopicActions : subscribeTopicActions;
      this.finish = finish;
      this.subState = [];
    }
    function SubState(client, packet, granted, rh, rap, nl) {
      this.client = client;
      this.packet = packet;
      this.granted = granted;
      this.rh = rh;
      this.rap = rap;
      this.nl = nl;
    }
    function _dedupe(subs) {
      const dedupeSubs = {};
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        dedupeSubs[sub.topic] = sub;
      }
      const ret = [];
      for (const key in dedupeSubs) {
        ret.push(dedupeSubs[key]);
      }
      return ret;
    }
    function handleSubscribe(client, packet, restore, done) {
      packet.subscriptions = packet.subscriptions.length === 1 ? packet.subscriptions : _dedupe(packet.subscriptions);
      client.broker._parallel(
        new SubscribeState(client, packet, restore, done),
        // what will be this in the functions
        doSubscribe,
        // function to call
        packet.subscriptions,
        // first argument of the function
        restore ? done : completeSubscribe
        // the function to be called when the parallel ends
      );
    }
    function doSubscribe(sub, done) {
      const s = new SubState(this.client, this.packet, sub.qos, sub.rh, sub.rap, sub.nl);
      this.subState.push(s);
      this.actions.call(s, sub, done);
    }
    function authorize(sub, done) {
      const err = validateTopic(sub.topic, "SUBSCRIBE");
      if (err) {
        return done(err);
      }
      const client = this.client;
      client.broker.authorizeSubscribe(client, sub, done);
    }
    function blockDollarSignTopics(func) {
      return function deliverSharp(packet, cb) {
        if (packet.topic.charCodeAt(0) === 36) {
          cb();
        } else {
          func(packet, cb);
        }
      };
    }
    function storeSubscriptions(sub, done) {
      if (!sub || typeof sub !== "object") {
        this.granted = 128;
        return done(null, null);
      }
      const packet = this.packet;
      const client = this.client;
      if (client.clean) {
        return done(null, sub);
      }
      client.broker.persistence.addSubscriptions(client, packet.subscriptions, function addSub(err) {
        done(err, sub);
      });
    }
    function addSubs(sub, done) {
      if (!sub || typeof sub !== "object") {
        return done();
      }
      const client = this.client;
      const broker2 = client.broker;
      const topic = sub.topic;
      const qos = sub.qos;
      const rh = this.rh;
      const rap = this.rap;
      const nl = this.nl;
      let func = qos > 0 ? client.deliverQoS : client.deliver0;
      const deliverFunc = func;
      func = function handlePacketSubscription(_packet, cb) {
        _packet = new Packet(_packet, broker2);
        _packet.nl = nl;
        if (!rap) _packet.retain = false;
        deliverFunc(_packet, cb);
      };
      if (isStartsWithWildcard(topic)) {
        func = blockDollarSignTopics(func);
      }
      if (client.closed || client.broker.closed) {
        return;
      }
      if (!client.subscriptions[topic]) {
        client.subscriptions[topic] = new Subscription(qos, func, rh, rap, nl);
        broker2.subscribe(topic, func, done);
      } else if (client.subscriptions[topic].qos !== qos || client.subscriptions[topic].rh !== rh || client.subscriptions[topic].rap !== rap || client.subscriptions[topic].nl !== nl) {
        broker2.unsubscribe(topic, client.subscriptions[topic].func);
        client.subscriptions[topic] = new Subscription(qos, func, rh, rap, nl);
        broker2.subscribe(topic, func, done);
      } else {
        done();
      }
    }
    function isStartsWithWildcard(topic) {
      const code = topic.charCodeAt(0);
      return code === 43 || code === 35;
    }
    function completeSubscribe(err) {
      const done = this.finish;
      if (err) {
        return done(err);
      }
      const packet = this.packet;
      const client = this.client;
      if (packet.messageId !== void 0) {
        write(
          client,
          new SubAck(packet, this.subState.map((obj) => obj.granted)),
          done
        );
      } else {
        done();
      }
      const broker2 = client.broker;
      const subs = packet.subscriptions;
      const topics = [];
      for (let i = 0; i < subs.length; i++) {
        if (this.subState[i].granted !== 128) {
          topics.push(subs[i].topic);
        }
        subs[i].qos = this.subState[i].granted;
      }
      this.subState = [];
      broker2.emit("subscribe", subs, client);
      broker2.publish({
        topic: $SYS_PREFIX + broker2.id + "/new/subscribes",
        payload: Buffer.from(JSON.stringify({
          clientId: client.id,
          subs
        }), "utf8")
      }, noop);
      if (topics.length > 0) {
        const persistence = broker2.persistence;
        const stream = persistence.createRetainedStreamCombi(topics);
        stream.pipe(through(function sendRetained(packet2, enc, cb) {
          packet2 = new Packet({
            cmd: packet2.cmd,
            qos: packet2.qos,
            topic: packet2.topic,
            payload: packet2.payload,
            retain: true
          }, broker2);
          packet2.brokerId = null;
          client.deliverQoS(packet2, cb);
        }));
      }
    }
    function noop() {
    }
    module.exports = handleSubscribe;
  }
});

// node_modules/aedes/lib/handlers/unsubscribe.js
var require_unsubscribe = __commonJS({
  "node_modules/aedes/lib/handlers/unsubscribe.js"(exports, module) {
    "use strict";
    var write = require_write();
    var { validateTopic, $SYS_PREFIX } = require_utils2();
    function UnSubAck(packet) {
      this.cmd = "unsuback";
      this.messageId = packet.messageId;
    }
    function UnsubscribeState(client, packet, finish) {
      this.client = client;
      this.packet = packet;
      this.finish = finish;
    }
    function handleUnsubscribe(client, packet, done) {
      const broker2 = client.broker;
      const unsubscriptions = packet.unsubscriptions;
      let err;
      for (let i = 0; i < unsubscriptions.length; i++) {
        err = validateTopic(unsubscriptions[i], "UNSUBSCRIBE");
        if (err) {
          return done(err);
        }
      }
      if (packet.messageId !== void 0) {
        if (client.clean) {
          return actualUnsubscribe(client, packet, done);
        }
        broker2.persistence.removeSubscriptions(client, unsubscriptions, function(err2) {
          if (err2) {
            return done(err2);
          }
          actualUnsubscribe(client, packet, done);
        });
      } else {
        actualUnsubscribe(client, packet, done);
      }
    }
    function actualUnsubscribe(client, packet, done) {
      const broker2 = client.broker;
      broker2._parallel(
        new UnsubscribeState(client, packet, done),
        doUnsubscribe,
        packet.unsubscriptions,
        completeUnsubscribe
      );
    }
    function doUnsubscribe(sub, done) {
      const client = this.client;
      const broker2 = client.broker;
      const s = client.subscriptions[sub];
      if (s) {
        const func = s.func;
        delete client.subscriptions[sub];
        broker2.unsubscribe(
          sub,
          func,
          done
        );
      } else {
        done();
      }
    }
    function completeUnsubscribe(err) {
      const client = this.client;
      if (err) {
        client.emit("error", err);
        return;
      }
      const packet = this.packet;
      const done = this.finish;
      if (packet.messageId !== void 0) {
        write(
          client,
          new UnSubAck(packet),
          done
        );
      } else {
        done();
      }
      if ((!client.closed || client.clean === true) && packet.unsubscriptions.length > 0) {
        client.broker.emit("unsubscribe", packet.unsubscriptions, client);
        client.broker.publish({
          topic: $SYS_PREFIX + client.broker.id + "/new/unsubscribes",
          payload: Buffer.from(JSON.stringify({
            clientId: client.id,
            subs: packet.unsubscriptions
          }), "utf8")
        }, noop);
      }
    }
    function noop() {
    }
    module.exports = handleUnsubscribe;
  }
});

// node_modules/retimer/time.js
var require_time = __commonJS({
  "node_modules/retimer/time.js"(exports, module) {
    "use strict";
    module.exports = function getTime() {
      const t = process.hrtime();
      return Math.floor(t[0] * 1e3 + t[1] / 1e6);
    };
  }
});

// node_modules/retimer/timers.js
var require_timers = __commonJS({
  "node_modules/retimer/timers.js"(exports, module) {
    module.exports = {
      clearInterval,
      clearTimeout,
      setInterval,
      setTimeout
    };
  }
});

// node_modules/retimer/retimer.js
var require_retimer = __commonJS({
  "node_modules/retimer/retimer.js"(exports, module) {
    "use strict";
    var getTime = require_time();
    var { clearTimeout: clearTimeout2, setTimeout: setTimeout2 } = require_timers();
    var Retimer = class {
      constructor(callback, timeout, args) {
        const that = this;
        this._started = getTime();
        this._rescheduled = 0;
        this._scheduled = timeout;
        this._args = args;
        this._triggered = false;
        this._timerWrapper = () => {
          if (that._rescheduled > 0) {
            that._scheduled = that._rescheduled - (getTime() - that._started);
            that._schedule(that._scheduled);
          } else {
            that._triggered = true;
            callback.apply(null, that._args);
          }
        };
        this._timer = setTimeout2(this._timerWrapper, timeout);
      }
      reschedule(timeout) {
        if (!timeout) {
          timeout = this._scheduled;
        }
        const now = getTime();
        if (now + timeout - (this._started + this._scheduled) < 0) {
          clearTimeout2(this._timer);
          this._schedule(timeout);
        } else if (!this._triggered) {
          this._started = now;
          this._rescheduled = timeout;
        } else {
          this._schedule(timeout);
        }
      }
      _schedule(timeout) {
        this._triggered = false;
        this._started = getTime();
        this._rescheduled = 0;
        this._scheduled = timeout;
        this._timer = setTimeout2(this._timerWrapper, timeout);
      }
      clear() {
        clearTimeout2(this._timer);
      }
    };
    function retimer() {
      if (typeof arguments[0] !== "function") {
        throw new Error("callback needed");
      }
      if (typeof arguments[1] !== "number") {
        throw new Error("timeout needed");
      }
      let args;
      if (arguments.length > 0) {
        args = new Array(arguments.length - 2);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 2];
        }
      }
      return new Retimer(arguments[0], arguments[1], args);
    }
    module.exports = retimer;
    module.exports.Retimer = Retimer;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/rng.js
import crypto5 from "crypto";
function rng2() {
  if (poolPtr2 > rnds8Pool2.length - 16) {
    crypto5.randomFillSync(rnds8Pool2);
    poolPtr2 = 0;
  }
  return rnds8Pool2.slice(poolPtr2, poolPtr2 += 16);
}
var rnds8Pool2, poolPtr2;
var init_rng2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/rng.js"() {
    rnds8Pool2 = new Uint8Array(256);
    poolPtr2 = rnds8Pool2.length;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/regex.js
var regex_default2;
var init_regex2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default2 = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/validate.js
function validate2(uuid) {
  return typeof uuid === "string" && regex_default2.test(uuid);
}
var validate_default2;
var init_validate2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex2();
    validate_default2 = validate2;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/stringify.js
function stringify2(arr, offset = 0) {
  const uuid = (byteToHex2[arr[offset + 0]] + byteToHex2[arr[offset + 1]] + byteToHex2[arr[offset + 2]] + byteToHex2[arr[offset + 3]] + "-" + byteToHex2[arr[offset + 4]] + byteToHex2[arr[offset + 5]] + "-" + byteToHex2[arr[offset + 6]] + byteToHex2[arr[offset + 7]] + "-" + byteToHex2[arr[offset + 8]] + byteToHex2[arr[offset + 9]] + "-" + byteToHex2[arr[offset + 10]] + byteToHex2[arr[offset + 11]] + byteToHex2[arr[offset + 12]] + byteToHex2[arr[offset + 13]] + byteToHex2[arr[offset + 14]] + byteToHex2[arr[offset + 15]]).toLowerCase();
  if (!validate_default2(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex2, stringify_default2;
var init_stringify2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate2();
    byteToHex2 = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex2.push((i + 256).toString(16).substr(1));
    }
    stringify_default2 = stringify2;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/v1.js
function v12(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId2;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq2;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng2)();
    if (node == null) {
      node = _nodeId2 = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq2 = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs2 + 1;
  const dt = msecs - _lastMSecs2 + (nsecs - _lastNSecs2) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs2) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs2 = msecs;
  _lastNSecs2 = nsecs;
  _clockseq2 = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default2(b);
}
var _nodeId2, _clockseq2, _lastMSecs2, _lastNSecs2, v1_default2;
var init_v12 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng2();
    init_stringify2();
    _lastMSecs2 = 0;
    _lastNSecs2 = 0;
    v1_default2 = v12;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/parse.js
function parse2(uuid) {
  if (!validate_default2(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default2;
var init_parse2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate2();
    parse_default2 = parse2;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/v35.js
function stringToBytes2(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version3, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes2(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default2(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version3;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default2(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS2;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS2, URL2;
var init_v352 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify2();
    init_parse2();
    DNS2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/md5.js
import crypto6 from "crypto";
function md52(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto6.createHash("md5").update(bytes).digest();
}
var md5_default2;
var init_md52 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/md5.js"() {
    md5_default2 = md52;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/v3.js
var v32, v3_default2;
var init_v32 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/v3.js"() {
    init_v352();
    init_md52();
    v32 = v35_default("v3", 48, md5_default2);
    v3_default2 = v32;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/v4.js
function v42(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng2)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default2(rnds);
}
var v4_default2;
var init_v42 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/v4.js"() {
    init_rng2();
    init_stringify2();
    v4_default2 = v42;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/sha1.js
import crypto7 from "crypto";
function sha12(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto7.createHash("sha1").update(bytes).digest();
}
var sha1_default2;
var init_sha12 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/sha1.js"() {
    sha1_default2 = sha12;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/v5.js
var v52, v5_default2;
var init_v52 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/v5.js"() {
    init_v352();
    init_sha12();
    v52 = v35_default("v5", 80, sha1_default2);
    v5_default2 = v52;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/nil.js
var nil_default2;
var init_nil2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default2 = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/version.js
function version2(uuid) {
  if (!validate_default2(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default2;
var init_version2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/version.js"() {
    init_validate2();
    version_default2 = version2;
  }
});

// node_modules/hyperid/node_modules/uuid/dist/esm-node/index.js
var esm_node_exports2 = {};
__export(esm_node_exports2, {
  NIL: () => nil_default2,
  parse: () => parse_default2,
  stringify: () => stringify_default2,
  v1: () => v1_default2,
  v3: () => v3_default2,
  v4: () => v4_default2,
  v5: () => v5_default2,
  validate: () => validate_default2,
  version: () => version_default2
});
var init_esm_node2 = __esm({
  "node_modules/hyperid/node_modules/uuid/dist/esm-node/index.js"() {
    init_v12();
    init_v32();
    init_v42();
    init_v52();
    init_nil2();
    init_version2();
    init_validate2();
    init_stringify2();
    init_parse2();
  }
});

// node_modules/hyperid/uuid-node.js
var require_uuid_node = __commonJS({
  "node_modules/hyperid/uuid-node.js"(exports, module) {
    "use strict";
    var uuid = (init_esm_node2(), __toCommonJS(esm_node_exports2));
    var crypto8 = __require("crypto");
    module.exports = typeof crypto8.randomUUID === "function" ? crypto8.randomUUID : uuid.v4;
  }
});

// node_modules/uuid-parse/uuid-parse.js
var require_uuid_parse = __commonJS({
  "node_modules/uuid-parse/uuid-parse.js"(exports, module) {
    "use strict";
    var _byteToHex = [];
    var _hexToByte = {};
    for (i = 0; i < 256; i++) {
      _byteToHex[i] = (i + 256).toString(16).substr(1);
      _hexToByte[_byteToHex[i]] = i;
    }
    var i;
    function parse3(s, buf, offset) {
      var i2 = buf && offset || 0;
      var ii = 0;
      buf = buf || [];
      s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
        if (ii < 16) {
          buf[i2 + ii++] = _hexToByte[oct];
        }
      });
      while (ii < 16) {
        buf[i2 + ii++] = 0;
      }
      return buf;
    }
    function unparse(buf, offset) {
      var i2 = offset || 0;
      var bth = _byteToHex;
      return bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]];
    }
    module.exports = {
      parse: parse3,
      unparse
    };
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/hyperid/node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/hyperid/node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        var arr = new Uint8Array(1);
        var proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      var buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      var valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      var b = fromObject(value);
      if (b) return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer2.from(
          value[Symbol.toPrimitive]("string"),
          encodingOrOffset,
          length
        );
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    Buffer2.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      var length = byteLength(string, encoding) | 0;
      var buf = createBuffer(length);
      var actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      var buf = createBuffer(length);
      for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        var copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      var buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype;
    };
    Buffer2.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer2.from(b, b.offset, b.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b) return 0;
      var x = a.length;
      var y = b.length;
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      var i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      var buffer = Buffer2.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            Buffer2.from(buf).copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      var len = string.length;
      var mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      var loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      var loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer2.prototype.swap16 = function swap16() {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      var length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b) {
      if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      var str = "";
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);
      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);
      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      var strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      var remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      var loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];
      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      var res = "";
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      var len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      var out = "";
      for (var i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = "";
      for (var i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      var len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      var newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      var val = this[offset + --byteLength2];
      var mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var i = byteLength2;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      var mul = 1;
      var i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      var i = byteLength2 - 1;
      var mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      var i = byteLength2 - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      var len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      var i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        var len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];
      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function() {
      var alphabet = "0123456789abcdef";
      var table = new Array(256);
      for (var i = 0; i < 16; ++i) {
        var i16 = i * 16;
        for (var j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    })();
  }
});

// node_modules/hyperid/hyperid.js
var require_hyperid = __commonJS({
  "node_modules/hyperid/hyperid.js"(exports, module) {
    "use strict";
    var uuidv4 = require_uuid_node();
    var parser = require_uuid_parse();
    var Buffer2 = loadBuffer();
    function loadBuffer() {
      const b = __require("buffer");
      return b && b.Buffer ? b.Buffer : require_buffer().Buffer;
    }
    var base64Padding = Buffer2.from("==", "base64");
    function hyperid(opts) {
      let fixedLength = false;
      let urlSafe = false;
      let maxInt = Math.pow(2, 31) - 1;
      if (typeof opts === "boolean") {
        fixedLength = opts;
      } else {
        opts = opts || {};
        maxInt = opts.maxInt || Math.pow(2, 31) - 1;
        urlSafe = !!opts.urlSafe;
        fixedLength = !!opts.fixedLength;
      }
      generate.uuid = uuidv4();
      generate.decode = decode;
      let id = baseId(generate.uuid, urlSafe);
      let count = Math.floor(opts.startFrom || 0);
      if (isNaN(maxInt)) throw new Error(`maxInt must be a number. recieved ${opts.maxInt}`);
      if (isNaN(count) || !(maxInt > count && count >= 0)) {
        throw new Error([
          `when passed, opts.startFrom must be a number between 0 and ${maxInt}.`,
          "Only the integer part matters.",
          `- got: ${opts.startFrom}`
        ].join("\n"));
      }
      return generate;
      function generate() {
        let result;
        if (count === maxInt) {
          generate.uuid = uuidv4();
          id = baseId(generate.uuid, urlSafe);
          count = 0;
        }
        if (fixedLength) {
          result = id + `0000000000${count}`.slice(-10);
        } else {
          result = id + count;
        }
        count = count + 1 | 0;
        return result;
      }
    }
    function baseId(id, urlSafe) {
      const base64Id = Buffer2.concat([Buffer2.from(parser.parse(id)), base64Padding]).toString("base64");
      if (urlSafe) {
        return base64Id.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "-");
      }
      return base64Id.replace(/=+$/, "/");
    }
    function decode(id, opts) {
      opts = opts || {};
      const urlSafe = !!opts.urlSafe;
      if (urlSafe) {
        id = id.replace(/-([^-]*)$/, "/$1").replace(/-/g, "+").replace(/_/g, "/");
      }
      if (id.length < 22) {
        return null;
      }
      const lastSlashIndex = id.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        return null;
      }
      const uuidPart = id.substring(0, lastSlashIndex);
      const countPart = Number(id.substring(lastSlashIndex + 1));
      if (!uuidPart || isNaN(countPart)) {
        return null;
      }
      const result = {
        uuid: parser.unparse(Buffer2.from(uuidPart + "==", "base64")),
        count: countPart
      };
      return result;
    }
    module.exports = hyperid;
    module.exports.decode = decode;
  }
});

// node_modules/aedes/lib/handlers/connect.js
var require_connect = __commonJS({
  "node_modules/aedes/lib/handlers/connect.js"(exports, module) {
    "use strict";
    var retimer = require_retimer();
    var { pipeline } = __require("stream");
    var write = require_write();
    var QoSPacket = require_qos_packet();
    var { through } = require_utils2();
    var handleSubscribe = require_subscribe();
    var uniqueId = require_hyperid()();
    function Connack(arg) {
      this.cmd = "connack";
      this.returnCode = arg.returnCode;
      this.sessionPresent = arg.sessionPresent;
    }
    function ClientPacketStatus(client, packet) {
      this.client = client;
      this.packet = packet;
    }
    var connectActions = [
      authenticate,
      setKeepAlive,
      fetchSubs,
      restoreSubs,
      storeWill,
      registerClient,
      doConnack,
      emptyQueue
    ];
    var errorMessages = [
      "",
      "unacceptable protocol version",
      "identifier rejected",
      "Server unavailable",
      "bad user name or password",
      "not authorized",
      "keep alive limit exceeded"
    ];
    function handleConnect(client, packet, done) {
      clearTimeout(client._connectTimer);
      client._connectTimer = null;
      client.connecting = true;
      client.broker.preConnect(client, packet, negate);
      function negate(err, successful) {
        if (!err && successful === true) {
          setImmediate(init, client, packet, done);
        } else {
          client.connecting = false;
          done(err);
        }
      }
    }
    function init(client, packet, done) {
      const clientId = packet.clientId;
      let returnCode = 0;
      if (packet.protocolVersion < 3 || packet.protocolVersion > 4) {
        returnCode = 1;
      }
      if (packet.protocolVersion === 3 && clientId.length > client.broker.maxClientsIdLength) {
        returnCode = 2;
      }
      if (client.broker.keepaliveLimit && (!packet.keepalive || packet.keepalive > client.broker.keepaliveLimit)) {
        returnCode = 6;
      }
      if (returnCode > 0) {
        const error = new Error(errorMessages[returnCode]);
        error.errorCode = returnCode;
        doConnack(
          { client, returnCode, sessionPresent: false },
          done.bind(this, error)
        );
        return;
      }
      client.id = clientId || "aedes_" + uniqueId();
      client.clean = packet.clean;
      client.version = packet.protocolVersion;
      client._will = packet.will;
      client.broker._series(
        new ClientPacketStatus(client, packet),
        connectActions,
        { returnCode: 0, sessionPresent: false },
        // [MQTT-3.1.4-4], [MQTT-3.2.2-4]
        function(err) {
          this.client.connecting = false;
          if (!err) {
            this.client.connected = true;
            this.client.broker.emit("clientReady", client);
            this.client.emit("connected");
          }
          done(err);
        }
      );
    }
    function authenticate(arg, done) {
      const client = this.client;
      client.pause();
      client.broker.authenticate(
        client,
        this.packet.username,
        this.packet.password,
        negate
      );
      function negate(err, successful) {
        if (client.closed || client.broker.closed) {
          return;
        }
        if (!err && successful) {
          client._authorized = true;
          return done();
        }
        if (err) {
          const errCode = err.returnCode;
          if (errCode && (errCode >= 2 && errCode <= 5)) {
            arg.returnCode = errCode;
          } else {
            arg.returnCode = 5;
          }
          if (!err.message) {
            err.message = errorMessages[arg.returnCode];
          }
        } else {
          arg.returnCode = 5;
          err = new Error(errorMessages[arg.returnCode]);
        }
        err.errorCode = arg.returnCode;
        arg.client = client;
        doConnack(
          arg,
          // [MQTT-3.2.2-5]
          client.close.bind(client, done.bind(this, err))
        );
      }
    }
    function setKeepAlive(arg, done) {
      if (this.packet.keepalive > 0) {
        const client = this.client;
        client._keepaliveInterval = this.packet.keepalive * 1500 + 1;
        client._keepaliveTimer = retimer(function keepaliveTimeout() {
          client.broker.emit("keepaliveTimeout", client);
          client.emit("error", new Error("keep alive timeout"));
        }, client._keepaliveInterval);
      }
      done();
    }
    function fetchSubs(arg, done) {
      const client = this.client;
      if (!this.packet.clean) {
        client.broker.persistence.subscriptionsByClient({
          id: client.id,
          done,
          arg
        }, gotSubs);
        return;
      }
      arg.sessionPresent = false;
      client.broker.persistence.cleanSubscriptions(
        client,
        done
      );
    }
    function gotSubs(err, subs, client) {
      if (err) {
        return client.done(err);
      }
      client.arg.subs = subs;
      client.done();
    }
    function restoreSubs(arg, done) {
      if (arg.subs) {
        handleSubscribe(this.client, { subscriptions: arg.subs }, true, done);
        arg.sessionPresent = !!arg.subs;
        return;
      }
      arg.sessionPresent = false;
      done();
    }
    function storeWill(arg, done) {
      const client = this.client;
      client.will = client._will;
      client.broker.persistence.delWill(client, function() {
        if (client.will) {
          client.broker.persistence.putWill(
            client,
            client.will,
            done
          );
        } else {
          done();
        }
      });
    }
    function registerClient(arg, done) {
      const client = this.client;
      client.broker.registerClient(client);
      done();
    }
    function doConnack(arg, done) {
      const client = arg.client || this.client;
      const connack = new Connack(arg);
      write(client, connack, function(err) {
        if (!err) {
          client.broker.emit("connackSent", connack, client);
          client.connackSent = true;
        }
        done(err);
      });
    }
    function emptyQueue(arg, done) {
      const client = this.client;
      const persistence = client.broker.persistence;
      const outgoing = persistence.outgoingStream(client);
      client.resume();
      pipeline(
        outgoing,
        through(function clearQueue(data, enc, next) {
          const packet = new QoSPacket(data, client);
          packet.writeCallback = (error, _client) => next(error);
          persistence.outgoingUpdate(client, packet, emptyQueueFilter);
        }),
        done
      );
    }
    function emptyQueueFilter(err, client, packet) {
      const next = packet.writeCallback;
      if (err) {
        client.emit("error", err);
        return next();
      }
      const authorized = packet.cmd === "publish" ? client.broker.authorizeForward(client, packet) : true;
      const persistence = client.broker.persistence;
      if (client.clean || !authorized) {
        persistence.outgoingClearMessageId(client, packet, next);
      } else {
        write(client, packet, next);
      }
    }
    module.exports = handleConnect;
  }
});

// node_modules/aedes/lib/handlers/publish.js
var require_publish = __commonJS({
  "node_modules/aedes/lib/handlers/publish.js"(exports, module) {
    "use strict";
    var write = require_write();
    function PubAck(packet) {
      this.cmd = "puback";
      this.messageId = packet.messageId;
    }
    function PubRec(packet) {
      this.cmd = "pubrec";
      this.messageId = packet.messageId;
    }
    var publishActions = [
      authorizePublish,
      enqueuePublish
    ];
    function handlePublish(client, packet, done) {
      const topic = packet.topic;
      let err;
      if (topic.length === 0) {
        err = new Error("empty topic not allowed in PUBLISH");
        return done(err);
      }
      if (topic.indexOf("#") > -1) {
        err = new Error("# is not allowed in PUBLISH");
        return done(err);
      }
      if (topic.indexOf("+") > -1) {
        err = new Error("+ is not allowed in PUBLISH");
        return done(err);
      }
      client.broker._series(client, publishActions, packet, done);
    }
    function enqueuePublish(packet, done) {
      const client = this;
      switch (packet.qos) {
        case 2:
          client.broker.persistence.incomingStorePacket(client, packet, function(err) {
            if (err) {
              return done(err);
            }
            write(client, new PubRec(packet), done);
          });
          break;
        case 1:
          write(client, new PubAck(packet), function(err) {
            if (err) {
              return done(err);
            }
            client.broker.publish(packet, client, done);
          });
          break;
        case 0:
          client.broker.publish(packet, client, done);
          break;
        default:
      }
    }
    function authorizePublish(packet, done) {
      this.broker.authorizePublish(this, packet, done);
    }
    module.exports = handlePublish;
  }
});

// node_modules/aedes/lib/handlers/puback.js
var require_puback = __commonJS({
  "node_modules/aedes/lib/handlers/puback.js"(exports, module) {
    "use strict";
    function handlePuback(client, packet, done) {
      const persistence = client.broker.persistence;
      persistence.outgoingClearMessageId(client, packet, function(err, origPacket) {
        client.broker.emit("ack", origPacket, client);
        done(err);
      });
    }
    module.exports = handlePuback;
  }
});

// node_modules/aedes/lib/handlers/pubrel.js
var require_pubrel = __commonJS({
  "node_modules/aedes/lib/handlers/pubrel.js"(exports, module) {
    "use strict";
    var write = require_write();
    function ClientPacketStatus(client, packet) {
      this.client = client;
      this.packet = packet;
    }
    function PubComp(packet) {
      this.cmd = "pubcomp";
      this.messageId = packet.messageId;
    }
    var pubrelActions = [
      pubrelGet,
      pubrelPublish,
      pubrelWrite,
      pubrelDel
    ];
    function handlePubrel(client, packet, done) {
      client.broker._series(
        new ClientPacketStatus(client, packet),
        pubrelActions,
        {},
        done
      );
    }
    function pubrelGet(arg, done) {
      const persistence = this.client.broker.persistence;
      persistence.incomingGetPacket(this.client, this.packet, reply);
      function reply(err, packet) {
        arg.packet = packet;
        done(err);
      }
    }
    function pubrelPublish(arg, done) {
      this.client.broker.publish(arg.packet, this.client, done);
    }
    function pubrelWrite(arg, done) {
      write(this.client, new PubComp(arg.packet), done);
    }
    function pubrelDel(arg, done) {
      const persistence = this.client.broker.persistence;
      persistence.incomingDelPacket(this.client, arg.packet, done);
    }
    module.exports = handlePubrel;
  }
});

// node_modules/aedes/lib/handlers/pubrec.js
var require_pubrec = __commonJS({
  "node_modules/aedes/lib/handlers/pubrec.js"(exports, module) {
    "use strict";
    var write = require_write();
    function PubRel(packet) {
      this.cmd = "pubrel";
      this.messageId = packet.messageId;
    }
    function handlePubrec(client, packet, done) {
      const pubrel = new PubRel(packet);
      if (client.clean) {
        write(client, pubrel, done);
        return;
      }
      client.broker.persistence.outgoingUpdate(
        client,
        pubrel,
        reply
      );
      function reply(err) {
        if (err) {
          done(err);
        } else {
          write(client, pubrel, done);
        }
      }
    }
    module.exports = handlePubrec;
  }
});

// node_modules/aedes/lib/handlers/ping.js
var require_ping = __commonJS({
  "node_modules/aedes/lib/handlers/ping.js"(exports, module) {
    "use strict";
    var write = require_write();
    var pingResp = {
      cmd: "pingresp"
    };
    function handlePing(client, packet, done) {
      client.broker.emit("ping", packet, client);
      write(client, pingResp, done);
    }
    module.exports = handlePing;
  }
});

// node_modules/aedes/lib/handlers/index.js
var require_handlers = __commonJS({
  "node_modules/aedes/lib/handlers/index.js"(exports, module) {
    "use strict";
    var handleConnect = require_connect();
    var handleSubscribe = require_subscribe();
    var handleUnsubscribe = require_unsubscribe();
    var handlePublish = require_publish();
    var handlePuback = require_puback();
    var handlePubrel = require_pubrel();
    var handlePubrec = require_pubrec();
    var handlePing = require_ping();
    function handle(client, packet, done) {
      if (packet.cmd === "connect") {
        if (client.connecting || client.connected) {
          finish(client.conn, packet, done);
          return;
        }
        handleConnect(client, packet, done);
        return;
      }
      if (!client.connecting && !client.connected) {
        finish(client.conn, packet, done);
        return;
      }
      switch (packet.cmd) {
        case "publish":
          handlePublish(client, packet, done);
          break;
        case "subscribe":
          handleSubscribe(client, packet, false, done);
          break;
        case "unsubscribe":
          handleUnsubscribe(client, packet, done);
          break;
        case "pubcomp":
        case "puback":
          handlePuback(client, packet, done);
          break;
        case "pubrel":
          handlePubrel(client, packet, done);
          break;
        case "pubrec":
          handlePubrec(client, packet, done);
          break;
        case "pingreq":
          handlePing(client, packet, done);
          break;
        case "disconnect":
          client._disconnected = true;
          client.conn.destroy();
          done();
          return;
        default:
          client.conn.destroy();
          done();
          return;
      }
      if (client._keepaliveInterval > 0) {
        client._keepaliveTimer.reschedule(client._keepaliveInterval);
      }
    }
    function finish(conn, packet, done) {
      conn.destroy();
      const error = new Error("Invalid protocol");
      error.info = packet;
      done(error);
    }
    module.exports = handle;
  }
});

// node_modules/aedes/lib/client.js
var require_client = __commonJS({
  "node_modules/aedes/lib/client.js"(exports, module) {
    "use strict";
    var mqtt = require_mqtt();
    var EventEmitter = __require("events");
    var util = __require("util");
    var eos = require_end_of_stream2();
    var Packet = require_packet();
    var write = require_write();
    var QoSPacket = require_qos_packet();
    var handleSubscribe = require_subscribe();
    var handleUnsubscribe = require_unsubscribe();
    var handle = require_handlers();
    var { pipeline } = __require("stream");
    var { through } = require_utils2();
    module.exports = Client;
    function Client(broker2, conn, req) {
      const that = this;
      this.closed = false;
      this.connecting = false;
      this.connected = false;
      this.connackSent = false;
      this.errored = false;
      this.id = null;
      this.clean = true;
      this.version = null;
      this.subscriptions = {};
      this.duplicates = {};
      this.broker = broker2;
      this.conn = conn;
      conn.client = this;
      this._disconnected = false;
      this._authorized = false;
      this._parsingBatch = 1;
      this._nextId = Math.ceil(Math.random() * 65535);
      this.req = req;
      this.connDetails = req ? req.connDetails : null;
      this.will = null;
      this._will = null;
      this._parser = mqtt.parser();
      this._parser.client = this;
      this._parser._queue = [];
      this._parser.on("packet", enqueue);
      this.once("connected", dequeue);
      function nextBatch(err) {
        if (err) {
          that.emit("error", err);
          return;
        }
        const client = that;
        if (client._paused) {
          return;
        }
        that._parsingBatch--;
        if (that._parsingBatch <= 0) {
          that._parsingBatch = 0;
          const buf = client.conn.read(null);
          if (buf) {
            client._parser.parse(buf);
          }
        }
      }
      this._nextBatch = nextBatch;
      conn.on("readable", nextBatch);
      this.on("error", onError);
      conn.on("error", this.emit.bind(this, "error"));
      this._parser.on("error", this.emit.bind(this, "error"));
      conn.on("end", this.close.bind(this));
      this._eos = eos(this.conn, this.close.bind(this));
      const getToForwardPacket = (_packet) => {
        if (_packet.clientId === that.id && _packet.nl) return;
        const toForward = dedupe(that, _packet) && that.broker.authorizeForward(that, _packet);
        return toForward;
      };
      this.deliver0 = function deliverQoS0(_packet, cb) {
        const toForward = getToForwardPacket(_packet);
        if (toForward) {
          setImmediate(() => {
            const packet = new Packet(toForward, broker2);
            packet.qos = 0;
            write(that, packet, function(err) {
              that._onError(err);
              cb();
            });
          });
        } else {
          setImmediate(cb);
        }
      };
      this.deliverQoS = function deliverQoS(_packet, cb) {
        if (_packet.qos === 0) {
          that.deliver0(_packet, cb);
          return;
        }
        const toForward = getToForwardPacket(_packet);
        if (toForward) {
          setImmediate(() => {
            const packet = new QoSPacket(toForward, that);
            const clientSub = that.subscriptions[packet.topic];
            if (clientSub && (clientSub.qos || 0) < packet.qos) {
              packet.qos = clientSub.qos;
            }
            packet.writeCallback = cb;
            if (that.clean || packet.retain) {
              writeQoS(null, that, packet);
            } else {
              broker2.persistence.outgoingUpdate(that, packet, writeQoS);
            }
          });
        } else if (that.clean === false) {
          that.broker.persistence.outgoingClearMessageId(that, _packet, noop);
          setImmediate(cb);
        } else {
          setImmediate(cb);
        }
      };
      this._keepaliveTimer = null;
      this._keepaliveInterval = -1;
      this._connectTimer = setTimeout(function() {
        that.emit("error", new Error("connect did not arrive in time"));
      }, broker2.connectTimeout);
    }
    function dedupe(client, packet) {
      const id = packet.brokerId;
      if (!id) {
        return true;
      }
      const duplicates = client.duplicates;
      const counter = packet.brokerCounter;
      const result = (duplicates[id] || 0) < counter;
      if (result) {
        duplicates[id] = counter;
      }
      return result;
    }
    function writeQoS(err, client, packet) {
      if (err) {
        client.emit("error", err);
        packet.writeCallback();
      } else {
        write(client, packet, function(err2) {
          if (err2) {
            client.emit("error", err2);
          }
          packet.writeCallback();
        });
      }
    }
    function drainRequest(req) {
      req.callback();
    }
    function onError(err) {
      if (!err) return;
      this.errored = true;
      this.conn.removeAllListeners("error");
      this.conn.on("error", noop);
      const state = this.conn._writableState;
      const list = typeof state.getBuffer === "function" ? state.getBuffer() : state.buffer;
      list.forEach(drainRequest);
      this.broker.emit(this.id ? "clientError" : "connectionError", this, err);
      this.close();
    }
    util.inherits(Client, EventEmitter);
    Client.prototype._onError = onError;
    Client.prototype.publish = function(message, done) {
      const packet = new Packet(message, this.broker);
      const that = this;
      if (packet.qos === 0) {
        this.deliver0(packet, done);
        return;
      }
      if (!this.clean && this.id) {
        this.broker.persistence.outgoingEnqueue({
          clientId: this.id
        }, packet, function deliver(err) {
          if (err) {
            return done(err);
          }
          that.deliverQoS(packet, done);
        });
      } else {
        that.deliverQoS(packet, done);
      }
    };
    Client.prototype.subscribe = function(packet, done) {
      if (!packet.subscriptions) {
        if (!Array.isArray(packet)) {
          packet = [packet];
        }
        packet = {
          subscriptions: packet
        };
      }
      handleSubscribe(this, packet, false, done);
    };
    Client.prototype.unsubscribe = function(packet, done) {
      if (!packet.unsubscriptions) {
        if (!Array.isArray(packet)) {
          packet = [packet];
        }
        packet = {
          unsubscriptions: packet
        };
      }
      handleUnsubscribe(this, packet, done);
    };
    Client.prototype.close = function(done) {
      if (this.closed) {
        if (typeof done === "function") {
          done();
        }
        return;
      }
      const that = this;
      const conn = this.conn;
      this.closed = true;
      this._parser.removeAllListeners("packet");
      conn.removeAllListeners("readable");
      this._parser._queue = null;
      if (this._keepaliveTimer) {
        this._keepaliveTimer.clear();
        this._keepaliveInterval = -1;
        this._keepaliveTimer = null;
      }
      if (this._connectTimer) {
        clearTimeout(this._connectTimer);
        this._connectTimer = null;
      }
      this._eos();
      this._eos = noop;
      handleUnsubscribe(
        this,
        {
          unsubscriptions: Object.keys(this.subscriptions)
        },
        finish
      );
      function finish() {
        const will = that.will;
        if (!that._disconnected && will) {
          that.broker.authorizePublish(that, will, function(err) {
            if (err) {
              return done2();
            }
            that.broker.publish(will, that, done2);
            function done2() {
              that.broker.persistence.delWill({
                id: that.id,
                brokerId: that.broker.id
              }, noop);
            }
          });
        } else if (will) {
          that.broker.persistence.delWill({
            id: that.id,
            brokerId: that.broker.id
          }, noop);
        }
        that.will = null;
        that._will = null;
        that.connected = false;
        that.connecting = false;
        conn.removeAllListeners("error");
        conn.on("error", noop);
        if (that.broker.clients[that.id] && that._authorized) {
          that.broker.unregisterClient(that);
        }
        that.conn.emit("drain");
        that.conn.removeAllListeners("drain");
        conn.destroy();
        if (typeof done === "function") {
          done();
        }
      }
    };
    Client.prototype.pause = function() {
      this._paused = true;
    };
    Client.prototype.resume = function() {
      this._paused = false;
      this._nextBatch();
    };
    function enqueue(packet) {
      const client = this.client;
      client._parsingBatch++;
      if (client.connackSent || client._parsingBatch === 1) {
        handle(client, packet, client._nextBatch);
      } else {
        if (this._queue.length < client.broker.queueLimit) {
          this._queue.push(packet);
        } else {
          this.emit("error", new Error("Client queue limit reached"));
        }
      }
    }
    function dequeue() {
      const q = this._parser._queue;
      if (q) {
        for (let i = 0, len = q.length; i < len; i++) {
          handle(this, q[i], this._nextBatch);
        }
        this._parser._queue = null;
      }
    }
    Client.prototype.emptyOutgoingQueue = function(done) {
      const client = this;
      const persistence = client.broker.persistence;
      function filter(packet, enc, next) {
        persistence.outgoingClearMessageId(client, packet, next);
      }
      pipeline(
        persistence.outgoingStream(client),
        through(filter),
        done
      );
    };
    function noop() {
    }
  }
});

// node_modules/aedes/package.json
var require_package = __commonJS({
  "node_modules/aedes/package.json"(exports, module) {
    module.exports = {
      name: "aedes",
      version: "0.51.3",
      description: "Stream-based MQTT broker",
      main: "aedes.js",
      types: "aedes.d.ts",
      scripts: {
        lint: "npm run lint:standard && npm run lint:typescript && npm run lint:markdown",
        "lint:fix": "standard --fix && eslint -c types/.eslintrc.json --fix aedes.d.ts types/**/*.ts test/types/**/*.test-d.ts",
        "lint:standard": "standard --verbose | snazzy",
        "lint:typescript": "eslint -c types/.eslintrc.json aedes.d.ts types/**/*.ts test/types/**/*.test-d.ts",
        "lint:markdown": "markdownlint docs/*.md README.md",
        test: "npm run lint && npm run unit && npm run test:typescript",
        "test:ci": "npm run lint && npm run unit -- --cov --no-check-coverage --coverage-report=lcovonly && npm run test:typescript",
        "test:report": "npm run lint && npm run unit:report && npm run test:typescript",
        "test:typescript": "tsd",
        unit: "tap -J test/*.js",
        "unit:report": "tap -J test/*.js --cov --coverage-report=html --coverage-report=cobertura | tee out.tap",
        "license-checker": 'license-checker --production --onlyAllow="MIT;ISC;BSD-3-Clause;BSD-2-Clause;0BSD"',
        release: "read -p 'GITHUB_TOKEN: ' GITHUB_TOKEN && export GITHUB_TOKEN=$GITHUB_TOKEN && release-it --disable-metrics"
      },
      "release-it": {
        github: {
          release: true
        },
        git: {
          tagName: "v${version}"
        },
        hooks: {
          "before:init": [
            "npm run test:ci"
          ]
        },
        npm: {
          publish: true
        }
      },
      "pre-commit": [
        "test"
      ],
      tsd: {
        directory: "test/types"
      },
      standard: {
        ignore: [
          "types/*",
          "test/types/*"
        ]
      },
      repository: {
        type: "git",
        url: "git+https://github.com/moscajs/aedes.git"
      },
      keywords: [
        "mqtt",
        "broker",
        "server",
        "mqtt-server",
        "stream",
        "streams",
        "publish",
        "subscribe",
        "pubsub",
        "messaging",
        "mosca",
        "mosquitto",
        "iot",
        "internet",
        "of",
        "things"
      ],
      author: "Matteo Collina <hello@matteocollina.com>",
      contributors: [
        {
          name: "Gavin D'mello",
          url: "https://github.com/GavinDmello"
        },
        {
          name: "Behrad Zari",
          url: "https://github.com/behrad"
        },
        {
          name: "Gnought",
          url: "https://github.com/gnought"
        },
        {
          name: "Daniel Lando",
          url: "https://github.com/robertsLando"
        }
      ],
      license: "MIT",
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/aedes"
      },
      bugs: {
        url: "https://github.com/moscajs/aedes/issues"
      },
      homepage: "https://github.com/moscajs/aedes#readme",
      engines: {
        node: ">=16"
      },
      devDependencies: {
        "@sinonjs/fake-timers": "^11.2.2",
        "@types/node": "^20.11.17",
        "@typescript-eslint/eslint-plugin": "^7.0.1",
        "@typescript-eslint/parser": "^7.0.1",
        "concat-stream": "^2.0.0",
        duplexify: "^4.1.2",
        "license-checker": "^25.0.1",
        "markdownlint-cli": "^0.41.0",
        mqtt: "^5.3.5",
        "mqtt-connection": "^4.1.0",
        "pre-commit": "^1.2.2",
        proxyquire: "^2.1.3",
        "release-it": "^17.0.5",
        snazzy: "^9.0.0",
        standard: "^17.1.0",
        tap: "^16.3.10",
        tsd: "^0.31.0",
        typescript: "^5.3.3",
        "websocket-stream": "^5.5.2"
      },
      dependencies: {
        "aedes-packet": "^3.0.0",
        "aedes-persistence": "^9.1.2",
        "end-of-stream": "^1.4.4",
        fastfall: "^1.5.1",
        fastparallel: "^2.4.1",
        fastseries: "^2.0.0",
        hyperid: "^3.2.0",
        mqemitter: "^6.0.0",
        "mqtt-packet": "^9.0.0",
        retimer: "^4.0.0",
        reusify: "^1.0.4",
        uuid: "^10.0.0"
      }
    };
  }
});

// node_modules/aedes/aedes.js
var require_aedes = __commonJS({
  "node_modules/aedes/aedes.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var util = __require("util");
    var parallel = require_parallel();
    var series = require_series();
    var { v4: uuidv4 } = (init_esm_node(), __toCommonJS(esm_node_exports));
    var reusify = require_reusify();
    var { pipeline } = __require("stream");
    var Packet = require_packet();
    var memory = require_persistence();
    var mqemitter = require_mqemitter();
    var Client = require_client();
    var { $SYS_PREFIX, bulk } = require_utils2();
    module.exports = Aedes.createBroker = Aedes;
    var defaultOptions = {
      concurrency: 100,
      heartbeatInterval: 6e4,
      // 1 minute
      connectTimeout: 3e4,
      // 30 secs
      decodeProtocol: null,
      preConnect: defaultPreConnect,
      authenticate: defaultAuthenticate,
      authorizePublish: defaultAuthorizePublish,
      authorizeSubscribe: defaultAuthorizeSubscribe,
      authorizeForward: defaultAuthorizeForward,
      published: defaultPublished,
      trustProxy: false,
      trustedProxies: [],
      queueLimit: 42,
      maxClientsIdLength: 23,
      keepaliveLimit: 0
    };
    function Aedes(opts) {
      const that = this;
      if (!(this instanceof Aedes)) {
        return new Aedes(opts);
      }
      opts = Object.assign({}, defaultOptions, opts);
      this.id = opts.id || uuidv4();
      this.counter = 0;
      this.queueLimit = opts.queueLimit;
      this.connectTimeout = opts.connectTimeout;
      this.keepaliveLimit = opts.keepaliveLimit;
      this.maxClientsIdLength = opts.maxClientsIdLength;
      this.mq = opts.mq || mqemitter({
        concurrency: opts.concurrency,
        matchEmptyLevels: true
        // [MQTT-4.7.1-3]
      });
      this.handle = function handle(conn, req) {
        conn.setMaxListeners(opts.concurrency * 2);
        return new Client(that, conn, req);
      };
      this.persistence = opts.persistence || memory();
      this.persistence.broker = this;
      this._parallel = parallel();
      this._series = series();
      this._enqueuers = reusify(DoEnqueues);
      this.preConnect = opts.preConnect;
      this.authenticate = opts.authenticate;
      this.authorizePublish = opts.authorizePublish;
      this.authorizeSubscribe = opts.authorizeSubscribe;
      this.authorizeForward = opts.authorizeForward;
      this.published = opts.published;
      this.decodeProtocol = opts.decodeProtocol;
      this.trustProxy = opts.trustProxy;
      this.trustedProxies = opts.trustedProxies;
      this.clients = {};
      this.brokers = {};
      const heartbeatTopic = $SYS_PREFIX + that.id + "/heartbeat";
      const birthTopic = $SYS_PREFIX + that.id + "/birth";
      this._heartbeatInterval = setInterval(heartbeat, opts.heartbeatInterval);
      const bufId = Buffer.from(that.id, "utf8");
      that.publish({
        topic: birthTopic,
        payload: bufId
      }, noop);
      function heartbeat() {
        that.publish({
          topic: heartbeatTopic,
          payload: bufId
        }, noop);
      }
      function deleteOldBrokers(broker2) {
        if (that.brokers[broker2] + 3 * opts.heartbeatInterval < Date.now()) {
          delete that.brokers[broker2];
        }
      }
      this._clearWillInterval = setInterval(function() {
        Object.keys(that.brokers).forEach(deleteOldBrokers);
        pipeline(
          that.persistence.streamWill(that.brokers),
          bulk(receiveWills),
          function done(err) {
            if (err) {
              that.emit("error", err);
            }
          }
        );
      }, opts.heartbeatInterval * 4);
      function receiveWills(chunks, done) {
        that._parallel(that, checkAndPublish, chunks, done);
      }
      function checkAndPublish(will, done) {
        const notPublish = that.brokers[will.brokerId] !== void 0 && that.brokers[will.brokerId] + 3 * opts.heartbeatInterval >= Date.now();
        if (notPublish) return done();
        this.authorizePublish(that.clients[will.clientId] || null, will, function(err) {
          if (err) {
            return doneWill();
          }
          that.publish(will, doneWill);
          function doneWill(err2) {
            if (err2) {
              return done(err2);
            }
            that.persistence.delWill({
              id: will.clientId,
              brokerId: will.brokerId
            }, done);
          }
        });
      }
      this.mq.on($SYS_PREFIX + "+/heartbeat", function storeBroker(packet, done) {
        that.brokers[packet.payload.toString()] = Date.now();
        done();
      });
      this.mq.on($SYS_PREFIX + "+/birth", function brokerBorn(packet, done) {
        const brokerId = packet.payload.toString();
        if (brokerId !== that.id) {
          for (const clientId in that.clients) {
            delete that.clients[clientId].duplicates[brokerId];
          }
        }
        done();
      });
      this.mq.on($SYS_PREFIX + "+/new/clients", function closeSameClients(packet, done) {
        const serverId = packet.topic.split("/")[1];
        const clientId = packet.payload.toString();
        if (that.clients[clientId] && serverId !== that.id) {
          if (that.clients[clientId].closed) {
            that.deleteClient(clientId);
            done();
          } else {
            that.clients[clientId].close(done);
          }
        } else {
          done();
        }
      });
      this.connectedClients = 0;
      this.closed = false;
    }
    util.inherits(Aedes, EventEmitter);
    function storeRetained(packet, done) {
      if (packet.retain) {
        this.broker.persistence.storeRetained(packet, done);
      } else {
        done();
      }
    }
    function emitPacket(packet, done) {
      if (this.client) packet.clientId = this.client.id;
      this.broker.mq.emit(packet, done);
    }
    function enqueueOffline(packet, done) {
      const enqueuer = this.broker._enqueuers.get();
      enqueuer.complete = done;
      enqueuer.packet = packet;
      enqueuer.topic = packet.topic;
      enqueuer.broker = this.broker;
      this.broker.persistence.subscriptionsByTopic(
        packet.topic,
        enqueuer.done
      );
    }
    function DoEnqueues() {
      this.next = null;
      this.complete = null;
      this.packet = null;
      this.topic = null;
      this.broker = null;
      const that = this;
      this.done = function doneEnqueue(err, subs) {
        const broker2 = that.broker;
        if (err) {
          broker2.emit("error", err);
          return;
        }
        if (that.topic.indexOf($SYS_PREFIX) === 0) {
          subs = subs.filter(removeSharp);
        }
        const packet = that.packet;
        const complete = that.complete;
        that.packet = null;
        that.complete = null;
        that.topic = null;
        broker2.persistence.outgoingEnqueueCombi(subs, packet, complete);
        broker2._enqueuers.release(that);
      };
    }
    function removeSharp(sub) {
      const code = sub.topic.charCodeAt(0);
      return code !== 43 && code !== 35;
    }
    function callPublished(_, done) {
      this.broker.published(this.packet, this.client, done);
      this.broker.emit("publish", this.packet, this.client);
    }
    var publishFuncsSimple = [
      storeRetained,
      emitPacket,
      callPublished
    ];
    var publishFuncsQoS = [
      storeRetained,
      enqueueOffline,
      emitPacket,
      callPublished
    ];
    Aedes.prototype.publish = function(packet, client, done) {
      if (typeof client === "function") {
        done = client;
        client = null;
      }
      const p = new Packet(packet, this);
      const publishFuncs = p.qos > 0 ? publishFuncsQoS : publishFuncsSimple;
      this._series(new PublishState(this, client, packet), publishFuncs, p, done);
    };
    Aedes.prototype.subscribe = function(topic, func, done) {
      this.mq.on(topic, func, done);
    };
    Aedes.prototype.unsubscribe = function(topic, func, done) {
      this.mq.removeListener(topic, func, done);
    };
    Aedes.prototype.registerClient = function(client) {
      const that = this;
      if (this.clients[client.id]) {
        this.clients[client.id].close(function closeClient2() {
          that._finishRegisterClient(client);
        });
      } else {
        this._finishRegisterClient(client);
      }
    };
    Aedes.prototype._finishRegisterClient = function(client) {
      this.connectedClients++;
      this.clients[client.id] = client;
      this.emit("client", client);
      this.publish({
        topic: $SYS_PREFIX + this.id + "/new/clients",
        payload: Buffer.from(client.id, "utf8")
      }, noop);
    };
    Aedes.prototype.unregisterClient = function(client) {
      this.deleteClient(client.id);
      this.emit("clientDisconnect", client);
      this.publish({
        topic: $SYS_PREFIX + this.id + "/disconnect/clients",
        payload: Buffer.from(client.id, "utf8")
      }, noop);
    };
    Aedes.prototype.deleteClient = function(clientId) {
      this.connectedClients--;
      delete this.clients[clientId];
    };
    function closeClient(client, cb) {
      this.clients[client].close(cb);
    }
    Aedes.prototype.close = function(cb = noop) {
      const that = this;
      if (this.closed) {
        return cb();
      }
      this.closed = true;
      clearInterval(this._heartbeatInterval);
      clearInterval(this._clearWillInterval);
      this._parallel(this, closeClient, Object.keys(this.clients), doneClose);
      function doneClose() {
        that.emit("closed");
        that.mq.close(cb);
      }
    };
    Aedes.prototype.version = require_package().version;
    function defaultPreConnect(client, packet, callback) {
      callback(null, true);
    }
    function defaultAuthenticate(client, username, password, callback) {
      callback(null, true);
    }
    function defaultAuthorizePublish(client, packet, callback) {
      if (packet.topic.startsWith($SYS_PREFIX)) {
        return callback(new Error($SYS_PREFIX + " topic is reserved"));
      }
      callback(null);
    }
    function defaultAuthorizeSubscribe(client, sub, callback) {
      callback(null, sub);
    }
    function defaultAuthorizeForward(client, packet) {
      return packet;
    }
    function defaultPublished(packet, client, callback) {
      callback(null);
    }
    function PublishState(broker2, client, packet) {
      this.broker = broker2;
      this.client = client;
      this.packet = packet;
    }
    function noop() {
    }
  }
});

// node_modules/ws/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants2();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants2();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants2();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants2();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants2();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants2();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse3(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse: parse3 };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL3 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants2();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse: parse3 } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL3) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL3(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL3(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse3(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream2 = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse3(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse: parse3 };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants2();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version3 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version3 !== 13 && version3 !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version3 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// packages/gateway/src/demoBroker.ts
var import_aedes = __toESM(require_aedes(), 1);
import { createServer as createHttpServer } from "node:http";
import { createServer as createTcpServer } from "node:net";

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream2(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// packages/gateway/src/demoBroker.ts
var broker = (0, import_aedes.createBroker)();
var tcpServer = createTcpServer(broker.handle);
var httpServer = createHttpServer();
var webSocketServer = new import_websocket_server.default({ server: httpServer });
webSocketServer.on("connection", (socket) => {
  broker.handle((0, import_stream.default)(socket));
});
tcpServer.listen(1883, "0.0.0.0", () => {
  console.log("Demo MQTT TCP listening on 0.0.0.0:1883");
});
httpServer.listen(9001, "0.0.0.0", () => {
  console.log("Demo MQTT WebSocket listening on 0.0.0.0:9001");
});
async function stop() {
  webSocketServer.close();
  await Promise.all([
    new Promise((resolve) => tcpServer.close(() => resolve())),
    new Promise((resolve) => httpServer.close(() => resolve())),
    new Promise((resolve) => broker.close(() => resolve()))
  ]);
}
process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());
/*! Bundled license information:

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
