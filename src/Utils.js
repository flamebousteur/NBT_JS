var isNode = (typeof module !== "undefined" && typeof module.exports !== "undefined")
var isWeb = (typeof window !== "undefined" && typeof window.document !== "undefined")

if (isNode) {
    module.exports = {
        Blocks: require('./Blocks'),
        Items: require('./Items'),
        NBT_Tag: require('./NBT').NBT_Tag,
        NBTReader: require('./NBT').NBTReader,
        NBTWriter: require('./NBT').NBTWriter,
        NBT: require('./NBT').NBT,
        Structure: require('./Structure'),
    }
} else if (isWeb) {
    if (window.Blocks === undefined) throw new Error("Blocks.js is required");
    if (window.Items === undefined) throw new Error("Items.js is required");
    if (window.NBT === undefined) throw new Error("NBT.js is required");
    if (window.Structure === undefined) throw new Error("Structure.js is required");
} else throw new Error("Unsupported environment");