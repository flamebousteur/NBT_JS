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

class Shematic {
	static from(data, format = 'Buffer') {
		if (data instanceof Buffer || format === "Buffer") data = NBT.parse(data)
		if (!data["Schematic"]) throw new Error("data arn't Schematic format")

		let { Width, Height, Length } = data["Schematic"]; // get size of the structure
		let shematic = new Structure({ width: Width, height: Height, depth: Length }); // create new structure

		// palette is a list of blocks (the position in the list is the block id)
		shematic.palette = Blocks.parseList(data["Schematic"]["Palette"]);
		shematic.blocks = data["Schematic"].BlockData;

		return shematic;
	}

	toNBT(dt) {
		let data = {
			Schematic: {
				PalletMax: dt.palette.length,
				Palette: Object.fromEntries(dt.palette.map((b, i) => [b.toString(), i])),
				Version: 2,
				Length: dt.depth,
				Metadata: { WEOffsetX: 0, WEOffsetY: 0, WEOffsetZ: 0 },
				Height: dt.height,
				DataVersion: 2865,
				BlockData: dt.blocks,
				BlockEntities: [],
				Width: dt.width,
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

var a = Shematic.from(testData)
console.log(a)