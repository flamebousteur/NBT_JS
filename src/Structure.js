/* web reference:
https://minecraft.fandom.com/wiki/Structure_Block_file_format
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

const { Blocks } = require('./Blocks');

class Structure {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.blocks = new Uint16Array(width * height * depth);
		this.palette = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.ContentStructures = [];
	}

	addToPalette(blockData) {
		// blockData is a Blocks Object
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object');
		let block = this.palette.find(b => b.toString() == blockData.toString());
		if (block == undefined) {
			this.palette.push(blockData);
			return this.palette.length - 1;
		} else return this.palette.indexOf(block);
	}

	setBlock(x, y, z, blockData) {
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object'); // blockData is a Blocks Object
		if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) return;
		let index = x + y * this.width + z * this.width * this.height;
		let block = this.palette.find(b => b.toString() == blockData.toString());
		if (block == undefined) {
			block = blockData;
			this.palette.push(block);
		}
		this.blocks[index] = this.palette.indexOf(block);
	}

	getBlock(x, y, z) {
		let index = x + y * this.width + z * this.width * this.height;
		return this.palette[this.blocks[index]];
	}

	static fromNBT(nbt) { // nbt is a Object
		let structure = new Structure();
		nbt = nbt[""]
		structure.DataVersion = nbt.DataVersion;
		structure.width = nbt["size"][0];
		structure.height = nbt["size"][1];
		structure.depth = nbt["size"][2];

		structure.blocks = new Uint16Array(structure.width * structure.height * structure.depth);
		structure.palette = nbt["palette"].map(b => new Blocks(b["Name"], b["Properties"]));
		// push block
		/*
		nbt["blocks"] is a Array
		nbt["blocks"][i] is a Object
		{
			"nbt": {}, // optional
			"pos": [
				2, // x
				1, // y
				3 // z
			],
			"state": 0 // index of palette
		}
		*/
		nbt["blocks"].forEach(b => {
			let index = b["pos"][0] + b["pos"][1] * structure.width + b["pos"][2] * structure.width * structure.height;
			structure.blocks[index] = b["state"];
			// add nbt not implemented yet
			if (b["nbt"] != undefined) {
				let block = structure.palette[b["state"]];
				block.nbt = b["nbt"];
			}
		});

		// add entities not implemented yet
		/*
		nbt["entities"] is a Array
		nbt["entities"][i] is a Object
		{
			"nbt": {}, // required
			"pos": [
				2, // x
				1, // y
				3, // z
			],
			"blockPos": []
		} */
	}
}

module.exports = Structure;