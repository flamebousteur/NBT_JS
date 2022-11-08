/* web reference:
schematic WorldEdit
https://github.com/EngineHub/WorldEdit
https://minecraft.fandom.com/wiki/Schematic_file_format
*/

/**
 * hello, I'm flamebousteur and I'm a french developer
 * You can use and modify this code for free but please keep this comment;
 * thanks.
 * 
 * author: flamebousteur
 * my web site: https://flamebousteur.github.io
 * source code: https://github.com/flamebousteur/NBT_JS
 */

const fs = require('node:fs');
const { NBT, NBTReader, NBTWriter } = require("./NBT");

class Blocks {
	constructor(name, properties = {}) {
		this.name = name;
		this.properties = properties;
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

class Structure {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.blocks = new Uint16Array(width * height * depth);
		this.palette = [];
	}

	setBlock(x, y, z, blockData) {
		if (!blockData.name || !blockData.properties) throw new Error('blockData must contain name and properties');
		let index = x + y * this.width + z * this.width * this.height;
		let block = this.palette.find(b => b.toString() == blockData.toString());
		if (block == undefined) {
			block = blockData;
			this.palette.push(block);
		}
	}

	getBlock(x, y, z) {
		let index = x + y * this.width + z * this.width * this.height;
		return this.palette[this.blocks[index]];
	}
}

class shematicCore extends Structure {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		super({ width, height, depth });
		this.Schematic = {}
	}

	static from(data, format = 'Buffer') {
		if (data instanceof Buffer || format === "Buffer") data = NBT.parse(data)
		if (!data["Schematic"]) throw new Error("data arn't Schematic format")

		let { Width, Height, Length } = data["Schematic"]; // get size of the structure
		let shematic = new shematicCore({ width: Width, height: Height, depth: Length }); // create new structure

		// palette is a list of blocks (the position in the list is the block id)
		shematic.palette = Blocks.parseList(data["Schematic"]["Palette"]);
		shematic.blocks = data["Schematic"].BlockData;

		return shematic;
	}

	toNBT() {
		let data = {
			Schematic: {
				PalletMax: this.palette.length,
				Palette: Object.fromEntries(this.palette.map((b, i) => [b.toString(), i])),
				Version: 2,
				Length: this.depth,
				Metadata: { WEOffsetX: 0, WEOffsetY: 0, WEOffsetZ: 0 },
				Height: this.height,
				DataVersion: 2865,
				BlockData: this.blocks,
				BlockEntities: [],
				Width: this.width,
				Offset: [0, 0, 0]
			}
		}
		return NBT.build(data, true);
	}
}

var testData = {
	Schematic: {
		PaletteMax: 7,
		Palette: {
			'minecraft:stone_brick_wall[east=low,north=none,south=none,up=true,waterlogged=false,west=none]': 5,
			'minecraft:stone': 0,
			'minecraft:stone_brick_wall[east=tall,north=none,south=low,up=true,waterlogged=false,west=none]': 3,
			'minecraft:air': 6,
			'minecraft:andesite': 2,
			'minecraft:polished_andesite': 1,
			'minecraft:andesite_wall[east=none,north=low,south=none,up=true,waterlogged=false,west=low]': 4
		},
		Version: 2,
		Length: 2,
		Metadata: { WEOffsetX: 2, WEOffsetY: -1, WEOffsetZ: 1 },
		Height: 3,
		DataVersion: 2865,
		BlockData: Buffer.from([00, 01, 02, 02, 03, 02, 02, 04, 05, 02, 06, 06]),
		BlockEntities: [],
		Width: 2,
		Offset: [ 113, 4, 417 ]
	}
}

var a = shematicCore.from(testData)
console.log(a)