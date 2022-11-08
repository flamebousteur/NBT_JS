/**
 * hello, I'm flamebousteur and I'm a french developer
 * You can use and modify this code for free but please keep this comment;
 * thanks.
 * 
 * author: flamebousteur
 * my web site: https://flamebousteur.github.io
 * source code: https://github.com/flamebousteur/NBT_JS
 */

class Blocks {
	constructor(name, properties = {}, nbt = {}) {
		this.name = name;
		this.properties = properties;
		this.nbt = nbt;
	}

	static parse(str) {
		let name = str;
		let properties = {};
		let index = str.indexOf('[');
		if (index != -1) {
			name = str.substring(0, index);
			let propertiesStr = str.substring(index + 1, str.length - 1);
			properties = Object.fromEntries(propertiesStr.split(',').map(s => s.split('=')));
		}
		return { name, properties };
	}

	static parseList(list) {
		// list is a Object with key is name and value is id
		let blocks = [];
		for (let [name, id] of Object.entries(list)) blocks[id] = new Blocks(...Object.values(Blocks.parse(name)));
		return blocks;
	}

	Stringify() {
		let str = this.name;
		if (Object.keys(this.properties).length > 0) {
			str += '[';
			for (let [k, v] of Object.entries(this.properties)) str += k + '=' + v + ',';
			str = str.substring(0, str.length - 1) + ']';
		}
		return str;
	}

	fromString(str) {
		let { name, properties } = Blocks.parse(str);
		this.name = name;
		this.properties = properties;
	}

	static fromString(str) {
		let block = new Blocks();
		block.fromString(str);
		return block;
	}

	toString() { return this.name + (Object.keys(this.properties).length > 0 ? '[' + Object.entries(this.properties).map(([k, v]) => k + '=' + v).join(',') + ']' : ''); }

	getName() { return this.name; }
	setName(name) { this.name = name; }
	setPropertie(key, value) { this.properties[key] = value; }
	getPropertie(key) { return this.properties[key]; }
}