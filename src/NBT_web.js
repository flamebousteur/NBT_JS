// recreating Buffer functions for browser vertion
var Buffer = function (array) {
	if (typeof array === "string") {
		// string to Uint8Array
		var buf = new Uint8Array(array.length);
		for (var i = 0, strLen = array.length; i < strLen; i++) {
			buf[i] = array.charCodeAt(i);
		}
		return buf;
	}
	return new Uint8Array(array);
}

// read
Uint8Array.prototype.readInt8 = function(offset) { return this[offset]; }
Uint8Array.prototype.readInt16BE = function(offset) { return (this[offset] << 8) | this[offset + 1]; }
Uint8Array.prototype.readInt32BE = function(offset) { return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]; }
Uint8Array.prototype.readBigInt64BE = function(offset) { return (this[offset] << 56n) | (this[offset + 1] << 48n) | (this[offset + 2] << 40n) | (this[offset + 3] << 32n) | (this[offset + 4] << 24n) | (this[offset + 5] << 16n) | (this[offset + 6] << 8n) | this[offset + 7]; }
Uint8Array.prototype.readFloatBE = function(offset) { return new DataView(this.buffer, offset, 4).getFloat32(0); }
Uint8Array.prototype.readDoubleBE = function(offset) { return new DataView(this.buffer, offset, 8).getFloat64(0); }
Uint8Array.prototype.slice = function(start, end) { return this.subarray(start, end); }
Uint8Array.prototype.set = function(data, offset) { for (let i = 0; i < data.length; i++) this[offset + i] = data[i]; }

// write (no ready)
Uint8Array.prototype.write = function(value, offset) { for (let i = 0; i < value.length; i++) this[offset + i] = value.charCodeAt(i); }
Uint8Array.prototype.writeInt8 = function(value, offset) { this[offset] = value; }
Uint8Array.prototype.writeInt16BE = function(value, offset) { this[offset] = value >> 8; this[offset + 1] = value; }
Uint8Array.prototype.writeInt32BE = function(value, offset) { this[offset] = value >> 24; this[offset + 1] = value >> 16; this[offset + 2] = value >> 8; this[offset + 3] = value; }
Uint8Array.prototype.writeBigInt64BE = function(value, offset) { this[offset] = value >> 56n; this[offset + 1] = value >> 48n; this[offset + 2] = value >> 40n; this[offset + 3] = value >> 32n; this[offset + 4] = value >> 24n; this[offset + 5] = value >> 16n; this[offset + 6] = value >> 8n; this[offset + 7] = value; }
Uint8Array.prototype.writeFloatBE = function(value, offset) { new DataView(this.buffer, offset, 4).setFloat32(0, value); }
Uint8Array.prototype.writeDoubleBE = function(value, offset) { new DataView(this.buffer, offset, 8).setFloat64(0, value); }

Uint8Array.prototype.toString = function(format) { return String.fromCharCode.apply(null,this) }

// static
Buffer.alloc = function(size) { return new Buffer(size); }
Buffer.from = function(data) { return new Buffer(data); }
Buffer.concat = function(list) {
	let size = 0;
	for (let i = 0; i < list.length; i++) size += list[i].length;
	const buffer = new Buffer(size);
	let offset = 0;
	for (let i = 0; i < list.length; i++) {
		buffer.set(list[i], offset);
		offset += list[i].length;
	}
	return buffer;
}