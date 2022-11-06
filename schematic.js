const fs = require('node:fs');
const { NBT, NBTReader, NBTWriter } = require("./NBT");

class shematicCore extends NBT {
	constructor({ width = 1, height = 1, depth = 1 } = {}) {
		super();
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.blocks = new Uint16Array(width * height * depth);
	}
	setBlock(x, y, z, blockID) {}
	getBlock(x, y, z) {}
}

var file = ""
if (process.argv.length > 2) {
	file = process.argv[2];
} else {
	console.log("No file specified");
	process.exit(1);
}

var nbt = new NBTReader(fs.readFileSync(file));
console.log(nbt.readTag())