const fs = require('node:fs');
const { NBTReader, NBTWriter, NBT_Tag, NBT } = require("../src/NBT");

var file = ""
if (process.argv.length > 2) file = process.argv[2];
else {
	console.log("No file specified");
	process.exit(1);
}

console.log(NBT.parse(fs.readFileSync(file)))