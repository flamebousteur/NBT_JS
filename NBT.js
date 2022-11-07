/* web reference:
NBT:
=> https://wiki.vg/NBT <=
https://web.archive.org/web/20110723210920/http://www.minecraft.net/docs/NBT.txt
https://minecraft.fandom.com/wiki/NBT_format
*/

/**hello, I'm flamebousteur and I'm a french developer
 * You can use and modify this code for free but please keep this comment;
 * thanks.
 * 
 * author: flamebousteur
 * my web site: https://flamebousteur.github.io
 * source code: https://github.com/flamebousteur/NBT_JS
 */

const isNode = (typeof module !== "undefined" && typeof module.exports !== "undefined")
const isWeb = (typeof window !== "undefined" && typeof window.document !== "undefined")
if (isNode) {
	// include the zlib module
	var zlib = require('node:zlib');
} else if (isWeb) {
	// recreating Buffer functions for browser vertion
	Buffer = function (array) {
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
	Uint8Array.prototype.write = function(value, offset) {}
	Uint8Array.prototype.writeInt8
	Uint8Array.prototype.writeInt16BE
	Uint8Array.prototype.writeInt32BE
	Uint8Array.prototype.writeBigInt64BE
	Uint8Array.prototype.writeFloatBE
	Uint8Array.prototype.writeDoubleBE

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
} else throw new Error("Unsupported environment");

class NBT_Tag {
	static tagTypes = {
		END: 0,
		BYTE: 1,
		SHORT: 2,
		INT: 3,
		LONG: 4,
		FLOAT: 5,
		DOUBLE: 6,
		BYTE_ARRAY: 7,
		STRING: 8,
		LIST: 9,
		COMPOUND: 10,
		INT_ARRAY: 11,
		LONG_ARRAY: 12,
	};

	static TAG_End = 0; // Signifies the end of a TAG_Compound. It is only ever used inside a TAG_Compound, and is not named despite being in a TAG_Compound
	static TAG_Byte = 1; // A single signed byte
	static TAG_Short = 2; // A single signed 16-bit integer
	static TAG_Int = 3; // A single signed 32-bit integer
	static TAG_Long = 4; // A single signed 64-bit integer
	static TAG_Float = 5; // A single 32-bit IEEE 754 floating point number
	static TAG_Double = 6; // A single 64-bit IEEE 754 floating point number
	static TAG_Byte_Array = 7; // An array of signed bytes
	static TAG_String = 8; // A string of 8-bit characters
	static TAG_List = 9; // A list of unnamed tags of the same type
	static TAG_Compound = 10; // A list of named tags of different types
	static TAG_Int_Array = 11; // An array of signed 32-bit integers
	static TAG_Long_Array = 12; // An array of signed 64-bit integers

	static getTagType(type) { return NBT_Tag.tagTypes[type]; }
	static getTagName(type) { return Object.keys(NBT_Tag.tagTypes).find((key) => NBT_Tag.tagTypes[key] === type); }
}

class NBTReader {
	constructor(buffer) {
		if (buffer[0] === 0x1f && buffer[1] === 0x8b) buffer = zlib.gunzipSync(buffer);
		this.buffer = buffer;
		this.offset = 0;
		this.MaxOffset = buffer.length;
	}

	readByte() {
		const value = this.buffer.readInt8(this.offset);
		this.offset += 1;
		return value;
	}

	readShort() {
		const value = this.buffer.readInt16BE(this.offset);
		this.offset += 2;
		return value;
	}

	readInt() {
		const value = this.buffer.readInt32BE(this.offset);
		this.offset += 4;
		return value;
	}

	readLong() {
		const value = this.buffer.readBigInt64BE(this.offset);
		this.offset += 8;
		return value;
	}

	readFloat() {
		const value = this.buffer.readFloatBE(this.offset);
		this.offset += 4;
		return value;
	}

	readDouble() {
		const value = this.buffer.readDoubleBE(this.offset);
		this.offset += 8;
		return value;
	}

	readByteArray() {
		const length = this.readInt();
		const value = this.buffer.slice(this.offset, this.offset + length);
		this.offset += length;
		return value;
	}

	readString() {
		const length = this.readShort();
		const value = this.buffer.slice(this.offset, this.offset + length).toString('utf8');
		this.offset += length;
		return value;
	}

	readList() {
		const type = this.readByte();
		const length = this.readInt();
		const value = [];
		for (let i = 0; i < length; i++) value.push(this.readTagValue(type));
		return value;
	}

	readIntArray() {
		const length = this.readInt();
		const value = [];
		for (let i = 0; i < length; i++) value.push(this.readInt());
		return value;
	}

	readLongArray() {
		const length = this.readInt();
		const value = [];
		for (let i = 0; i < length; i++) value.push(this.readLong());
		return value;
	}

	readTagValue(type) {
		switch (type) {
			case NBT_Tag.TAG_End: return null; // 00
			case NBT_Tag.TAG_Byte: return this.readByte(); // 01
			case NBT_Tag.TAG_Short: return this.readShort(); // 02
			case NBT_Tag.TAG_Int: return this.readInt(); // 03
			case NBT_Tag.TAG_Long: return this.readLong(); // 04
			case NBT_Tag.TAG_Float: return this.readFloat(); // 05
			case NBT_Tag.TAG_Double: return this.readDouble(); // 06
			case NBT_Tag.TAG_Byte_Array: return this.readByteArray(); // 07
			case NBT_Tag.TAG_String: return this.readString(); // 08
			case NBT_Tag.TAG_List: return this.readList(); // 09
			case NBT_Tag.TAG_Compound: return this.readCompound(); // 10
			case NBT_Tag.TAG_Int_Array: return this.readIntArray(); // 11
			case NBT_Tag.TAG_Long_Array: return this.readLongArray(); // 12
			default: throw new Error(`Unknown tag type: ${type} ${this.offset}`);
		}
	}

	readTag() {
		const type = this.readByte();
		if (type === NBT_Tag.TAG_End) return null;
		const name = this.readString();
		const value = this.readTagValue(type);
		return { type, name, value };
	}

	readCompound() {
		const value = {};
		while (this.offset < this.MaxOffset){
			let tag = this.readTag();
			if (tag === null) break;
			value[tag.name] = tag.value;
		}
		return value;
	}

	read() {
		this.offset = 0;
		return this.readCompound();
	}
}

class NBTWriter {
	constructor(data) {
		this.data = data;
		this.buffer = Buffer.alloc(0);
	}

	getTagType(value) {
		if (typeof value === 'string') return NBT_Tag.TAG_String; // string
		if (typeof value === 'number') {
			if (Number.isInteger(value)) {
				if (value >= -128 && value <= 127) return NBT_Tag.TAG_Byte; // byte
				if (value >= -32768 && value <= 32767) return NBT_Tag.TAG_Short; // short
				if (value >= -2147483648 && value <= 2147483647) return NBT_Tag.TAG_Int; // int
				return NBT_Tag.TAG_Long; // long
			}
			if (n % 1 !== 0)  if (Math.abs(value) < 3.4028234663852886e+38) return NBT_Tag.TAG_Float; // float
			return NBT_Tag.TAG_Double; // double
		}
		// array
		if (Array.isArray(value)) {
			if (value.length === 0) return NBT_Tag.TAG_List; // empty array
			if (value.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) return NBT_Tag.TAG_Byte_Array; // byte array
			if (value.every((v) => typeof v === 'number' && Number.isInteger(v))) return NBT_Tag.TAG_Int_Array; // int array
			if (value.every((v) => typeof v === 'bigint')) return NBT_Tag.TAG_Long_Array; // long array
			return NBT_Tag.TAG_List; // list
		}
		if (value === null) return NBT_Tag.TAG_End; // end
		return NBT_Tag.TAG_Compound; // compound
	}

	writeByte(value) {
		const buffer = Buffer.alloc(1);
		buffer.writeInt8(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeShort(value) {
		const buffer = Buffer.alloc(2);
		buffer.writeInt16BE(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeInt(value) {
		const buffer = Buffer.alloc(4);
		buffer.writeInt32BE(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeLong(value) {
		const buffer = Buffer.alloc(8);
		buffer.writeBigInt64BE(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeFloat(value) {
		const buffer = Buffer.alloc(4);
		buffer.writeFloatBE(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeDouble(value) {
		const buffer = Buffer.alloc(8);
		buffer.writeDoubleBE(value, 0);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeByteArray(value) {
		this.writeInt(value.length);
		this.buffer = Buffer.concat([this.buffer, Buffer.from(value)]);
	}

	writeString(value) {
		const buffer = Buffer.alloc(2 + value.length);
		buffer.writeInt16BE(value.length, 0);
		buffer.write(value, 2);
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	writeList(value) {
		const type = this.getTagType(value[0]);
		this.writeByte(type);
		this.writeInt(value.length);
		for (let i = 0; i < value.length; i++) this.writeTagValue(type, value[i]);
	}

	writeCompound(value) {
		for (const key in value) {
			const type = this.getTagType(value[key]);
			this.writeByte(type);
			this.writeString(key);
			this.writeTagValue(type, value[key]);
		}
		this.writeByte(NBT_Tag.TAG_End);
	}

	writeTagValue(type, value) {
		switch (type) {
			case NBT_Tag.TAG_End: return; // 00
			case NBT_Tag.TAG_Byte: return this.writeByte(value); // 01
			case NBT_Tag.TAG_Short: return this.writeShort(value); // 02
			case NBT_Tag.TAG_Int: return this.writeInt(value); // 03
			case NBT_Tag.TAG_Long: return this.writeLong(value); // 04
			case NBT_Tag.TAG_Float: return this.writeFloat(value); // 05
			case NBT_Tag.TAG_Double: return this.writeDouble(value); // 06
			case NBT_Tag.TAG_Byte_Array: return this.writeByteArray(value); // 07
			case NBT_Tag.TAG_String: return this.writeString(value); // 08
			case NBT_Tag.TAG_List: return this.writeList(value); // 09
			case NBT_Tag.TAG_Compound: return this.writeCompound(value); // 10
			case NBT_Tag.TAG_Int_Array: return this.writeIntArray(value); // 11 not implemented yet
			case NBT_Tag.TAG_Long_Array: return this.writeLongArray(value); // 12 not implemented yet
			default: throw new Error(`Unknown tag type: ${type}`);
		}
	}

	writeTag(name, value) {
		const type = this.getTagType(value);
		this.writeByte(type);
		this.writeString(name);
		this.writeTagValue(type, value);
	}

	write() {
		this.offset = Buffer.alloc(0);
		this.writeCompound(this.data);
		return this.buffer;
	}
}

class NBT {
	static NBT_Tag = NBT_Tag
	static NBTReader = NBTReader
	static NBTWriter = NBTWriter
	static parse(buffer) { return new NBTReader(buffer).read(); }
	static build(data) { return new NBTWriter(data).write(); }
}

if (isNode) module.exports = { NBT_Tag, NBTReader, NBTWriter, NBT };
else if (isWeb) window.NBT = { NBT_Tag, NBTReader, NBTWriter, NBT };
else throw new Error("Unsupported environment");