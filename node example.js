const fs = require('node:fs');
const { NBT, NBTReader, NBTWriter } = require("./NBT");

var file = ""
if (process.argv.length > 2) file = process.argv[2];
else {
	console.log("No file specified");
	process.exit(1);
}

var nbt = new NBTReader(fs.readFileSync(file));
console.log(nbt.read())