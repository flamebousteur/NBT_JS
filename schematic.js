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

	getName() { return this.name; }
	setName(name) { this.name = name; }
}

class shematicCore extends NBT {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		super();
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.blocks = new Uint16Array(width * height * depth);
	}

	static from(data, format = "") {
		if (data instanceof Buffer || format === "Buffer") data = NBT.parse(data)
		if (!data["Schematic"]) throw new Error("data arn't Schematic format")
	}

	setBlock(x, y, z, blockData) {}
	getBlock(x, y, z) {}
}