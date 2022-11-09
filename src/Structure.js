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

var isNode = (typeof module !== "undefined" && typeof module.exports !== "undefined")
var isWeb = (typeof window !== "undefined" && typeof window.document !== "undefined")

if (isNode) {
	var Blocks = require('./Blocks');
	var NBT = require('./NBT').NBT;
} else if (isWeb) {
	if (window.Blocks != undefined) var Blocks = window.Blocks; else throw new Error("Blocks.js is required");
	if (window.NBT != undefined) var NBT = window.NBT; else throw new Error("NBT.js is required");
} else throw new Error("Unsupported environment");

class Structure {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.blocks = new Uint16Array(width * height * depth); // array of blocks index
		this.palette = []; // liste of blocks
		this.entities = []; // liste of entities
		this.DataVersion = 2586;
	}

	IsInPalette(blockData) {
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object'); // blockData is a Blocks Object
		return this.palette.find(b => b.toString() == blockData.toString()) != undefined;
	}

	addToPalette(blockData) {
		// blockData is a Blocks Object
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object');
		let block = this.palette.find(b => b.toString() == blockData.toString());
		if (block == undefined) {
			this.palette.push(blockData);
			return this.palette.length - 1;
		}
		return this.palette.indexOf(block);
	}

	setBlock(x = 1, y = 1, z = 1, blockData) {
		if (!(blockData instanceof Blocks)){
			if (typeof blockData == "Object") blockData = new Blocks(blockData["name"] || "void", blockData["properties"] || {}, blockData["nbt"] || {});
			else throw new Error('blockData must be a Blocks Object'); // blockData is a Blocks Object
		}
		if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) return;
		let index = x + y * this.width + z * this.width * this.height;
		return this.blocks[index] = this.addToPalette(blockData)
	}

	getBlock(x, y, z) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) return;
		let index = x + y * this.width + z * this.width * this.height;
		return this.palette[this.blocks[index]];
	}

	static fromNBT(nbt) { // nbt is a Object
		nbt = nbt[""]
		let structure = new Structure({
			width: nbt["size"][0],
			height: nbt["size"][1],
			depth: nbt["size"][2]
		});
		structure.DataVersion = nbt.DataVersion;
		structure.palette = nbt["palette"].map(b => new Blocks(b["Name"], b["Properties"]));

		nbt["blocks"].forEach(b => {
			let block = new Blocks(structure.palette[b["state"]]["name"], structure.palette[b["state"]]["properties"], (b["nbt"] || {}));
			structure.setBlock(b["pos"][0], b["pos"][1], b["pos"][2], block);
		});

		structure.entities = nbt["entities"];
		return structure
	}

	static fromBuf(buf) { return this.fromNBT(NBT.parse(buf)); }
	static from(data, type = null) {
		if (type == null) {
			if (data instanceof Buffer) type = "buf";
			else if (typeof data == "string") type = "path";
			else if (typeof data == "object") type = "nbt";
			else type = "nbt";
		}
		switch (type) {
			case "buf": return this.fromBuf(data);
			case "path": return this.fromBuf(fs.readFileSync(data));
			case "nbt": return this.fromNBT(data);
			case "base64": return this.fromBuf(Buffer.from(data, "base64"));
			default: throw new Error("Unknown type");
		}
	}

	toNBT() { // not implemented yet
		let nbtBlocks = [];
		let nbt = {
			size: [this.width, this.height, this.depth],
			DataVersion: this.DataVersion,
			palette: [],
			blocks: [],
			entities: this.entities
		}
		this.palette.forEach(b => {
			if (b["nbt"] != undefined) nbt.blocks.push({ Name: b["name"], Properties: b["properties"] });
			else nbtBlocks.push({ Name: b["name"], Properties: b["properties"] });
		})

		this.blocks.forEach((b, i) => {
			let x = i % this.width;
			let y = Math.floor((i - x) / this.width) % this.height;
			let z = Math.floor((i - x - y * this.width) / (this.width * this.height));
			nbt.blocks.push({
				pos: [x, y, z],
				state: b
			})
		});
		return { "": nbt };
	}
}

class ComplexStruct {
	/* NBT format
	{
		"globalPalette": [],
		"structures": [
			{
				"ID": ID,
				"position": [x, y, z],
				"size": [width, height, depth],
				"Wpos": [x, y, z],
				"data": Buffer,
				"childs": [
					{
						ID: 0,
						position: [x, y, z],
						rotation: [x, y, z],
						mirror: [x, y, z], // boolean
					},
				]
			}
		]
	}
	*/
	constructor() {
		this.structures = [];
		/* structures = [
			{
				ID: 0,
				size: { width: 0, height: 0, depth: 0 }, // size of the structure
				Wpos: { x: 0, y: 0, z: 0 }, // position of the content in the structure
				data: Buffer, // index of blocks in globalPalette
				childs: [ // Array of ID of child structuress
					{
						childID: 0, // ID of the child structure
						ID: 0, // ID of the structure in the child array
						position: { x: 0, y: 0, z: 0 }, // position offset of the child structure
						rotation: { x: 0, y: 0, z: 0 }, // rotation of the child structure in degree
						mirror: { x: false, y: false, z: false }, // mirror of the child structure
					},
				],
			}
		] */
		this.rootID = null; // ID of the first structure
		this.globalPalette = [];
	}

	IsInPalette(blockData) {
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object'); // blockData is a Blocks Object
		return this.globalPalette.find(b => b.toString() == blockData.toString()) != undefined;
	}

	addToPalette(blockData) {
		// blockData is a Blocks Object
		if (!(blockData instanceof Blocks)) throw new Error('blockData must be a Blocks Object');
		let block = this.globalPalette.find(b => b.toString() == blockData.toString());
		if (block == undefined) {
			this.globalPalette.push(blockData);
			return this.globalPalette.length - 1;
		}
		return this.globalPalette.indexOf(block);
	}	

	addStructure = (structure, { x = 0, y = 0, z = 0 } = {}) => {
		if (!(structure instanceof Structure)) throw new Error("structure must be a Structure Object");
		let strucResult = {
			ID: Math.random().toString(36).substr(2, 9), // ID is a random unique id
			size: { width: structure.width, height: structure.height, depth: structure.depth },
			Wpos: { x: x, y: y, z: z },
			data: null,
		}
		// combine palette and change blocks index
		let blocks = structure.blocks.map(b => this.addToPalette(structure.palette[b]));
		strucResult.data = Buffer.from(blocks);
		this.structures.push(strucResult);
		return strucResult.ID;
	}

	addChild = (parentID, childID, {x = 0, y = 0, z = 0} = {}, rot = null, mir = null) => {
		let parent = this.structures.find(s => s.ID == parentID);
		if (parent == undefined) throw new Error("parentID not found");
		let child = this.structures.find(s => s.ID == childID);
		if (child == undefined) throw new Error("childID not found");
		if (parent.childs == undefined) parent.childs = [];
		let res = {
			childID: childID,
			ID: Math.random().toString(36).substr(2, 9),
			position: { x: x, y: y, z: z },
		}
		if (rot != null) res.rotation = rot;
		if (mir != null) res.mirror = mir;
		parent.childs.push(res);
		return res.ID;
	}

	toNBT() {
		let nbt = {
			"globalPalette": this.globalPalette.map(b => b.toNBT()),
			"structures": this.structures.map(s => {
				let res = {
					"ID": s.ID,
					"position": [s.Wpos.x, s.Wpos.y, s.Wpos.z],
					"size": [s.size.width, s.size.height, s.size.depth],
					"data": s.data,
				}
				if (s.childs != undefined) res.childs = s.childs.map(c => {
					let res = {
						"ID": c.ID,
						"position": [c.position.x, c.position.y, c.position.z],
					}
					if (c.rotation != undefined) res.rotation = [c.rotation.x, c.rotation.y, c.rotation.z];
					if (c.mirror != undefined) res.mirror = [c.mirror.x, c.mirror.y, c.mirror.z];
					return res;
				});
				return res;
			})
		}
		return nbt;
	}

	build() { return NBT.build(this.toNBT()); }

	getStructureSize(id) { // calculate the size of the structure (including childs)
		let structure = this.structures.find(s => s.ID == id);
		if (structure == undefined) throw new Error("structure not found");
		let size = { width: structure.size.width, height: structure.size.height, depth: structure.size.depth };
		if (structure.childs != undefined) {
			structure.childs.forEach(c => {
				let child = this.structures.find(s => s.ID == c.childID);
				if (child == undefined) throw new Error("child not found");
				let childSize = this.getStructureSize(c.childID);
				let pos = c.position;
				if (c.rotation != undefined) {
					let rot = c.rotation;
					let rotX = rot.x % 360;
					let rotY = rot.y % 360;
					let rotZ = rot.z % 360;
					if (rotX == 90 || rotX == 270) {
						let temp = childSize.width;
						childSize.width = childSize.depth;
						childSize.depth = temp;
					}
					if (rotY == 90 || rotY == 270) {
						let temp = childSize.width;
						childSize.width = childSize.height;
						childSize.height = temp;
					}
					if (rotZ == 90 || rotZ == 270) {
						let temp = childSize.height;
						childSize.height = childSize.depth;
						childSize.depth = temp;
					}

					if (rotX == 180 || rotY == 180 || rotZ == 180) {
						pos.x = -pos.x;
						pos.y = -pos.y;
						pos.z = -pos.z;
					}

					if (rotX == 90 || rotX == 270) { pos.z = -pos.z; pos.x += childSize.depth; }
					if (rotY == 90 || rotY == 270) { pos.x = -pos.x; pos.y += childSize.height; }
					if (rotZ == 90 || rotZ == 270) { pos.y = -pos.y; pos.z += childSize.width; }
				}
				if (c.mirror != undefined) {
					let mir = c.mirror;
					if (mir.x == true) {
						pos.x = -pos.x;
						childSize.width = -childSize.width;
					}
					if (mir.y == true) {
						pos.y = -pos.y;
						childSize.height = -childSize.height;
					}
					if (mir.z == true) {
						pos.z = -pos.z;
						childSize.depth = -childSize.depth;
					}
				}
				if (pos.x < 0) {
					size.width += Math.abs(pos.x);
					pos.x = 0;
				}
				if (pos.y < 0) {
					size.height += Math.abs(pos.y);
					pos.y = 0;
				}
				if (pos.z < 0) {
					size.depth += Math.abs(pos.z);
					pos.z = 0;
				}
				if (pos.x + childSize.width > size.width) size.width = pos.x + childSize.width;
				if (pos.y + childSize.height > size.height) size.height = pos.y + childSize.height;
				if (pos.z + childSize.depth > size.depth) size.depth = pos.z + childSize.depth;
			});
		}
		return size;
	}

	get size() { return this.getStructureSize(this.rootID); } // calculate the size of the structure { width: 0, height: 0, depth: 0 }

	compile() { // compile the structure to a new Structure Object
		let structure = new Structure();
		let size = this.size;
		structure.data = new Array(size.width * size.height * size.depth).fill(0);
		let palette = [];
		let blocks = [];

		structure.width = width;
		structure.height = height;
		structure.depth = depth;
		structure.blocks = new Uint16Array(width * height * depth);
		structure.palette = [new Blocks("void")];
	}
}

if (isNode) module.exports = { Structure, ComplexStruct };
else if (isWeb) window.Structure = { Structure, ComplexStruct };