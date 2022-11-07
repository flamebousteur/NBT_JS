Welcome to NBTJS documentation!

NBTJS is a library for reading and writing NBT files in JavaScript. It is written in JavaScript and can be used in both Node.js and the browser (no yet tested).

# NBT control class

## NBT_Tag
> contain all of the TAG type

### getTagType (type)
type (String): the tag name

result (Number): the tag value

### getTagName (type)
type (Number): the tag value

result (String): the tag name

## NBTReader class
### constructor (buffer)
buffer (Buffer): the data of the NBT file (compressed or not)
> /!\ can't deflate on Browser (zlib not available)

### readByte()
return (Number): the data on the actual offest

### readShort()
return (Number): the data on the actual offest

### readInt()
return (Number): the data on the actual offest

### readLong()
return (Number): the data on the actual offest

### readFloat()
return (Number): the data on the actual offest

### readDouble()
return (Number): the data on the actual offest

### readByteArray()
return (Array): the data on the actual offest

### readString()
return (String): the data on the actual offest

### readList()
return (Array): the data on the actual offest

### readIntArray()
return (Array): the data on the actual offest

### readLongArray()
return (Array): the data on the actual offest

### readTagValue(type)
type (Number): NBT_Tag Type

> call the appropriate function depending on the TAG_TYPE

return (Array | String | Number): the result of the read function called

### readTag()
> read a full tag at the offset position

return ({ type, name, value:(Array | String | Number) }): the data of the tag at the offset position

### readCompound()
read a Compound at the offset position

return (Object): the data of the compound

### read()
reset offset
read the full data

return (Object): the data of the NBT

## NBTWriter class
### contructor(data)
data (object): the data to change in NBT format

### getTagType(value)
value (String | Number)
write the data at the current offset

### writeByte(value)
value (Number)
write the data at the current offset

### writeShort(value)
value (Number)
write the data at the current offset

### writeInt(value)
value (Number)
write the data at the current offset

### writeLong(value)
value (Number)
write the data at the current offset

### writeFloat(value)
value (Number)
write the data at the current offset

### writeDouble(value)
value (Number)
write the data at the current offset

### writeString(value)
value (String)
write the data at the current offset

### writeList(value)
value (Array)
write the data at the current offset

### writeIntArray(value)
value (Array)
write the data at the current offset

### writeLongArray(value)
value (Array)
write the data at the current offset

### writeCompound(value)
value (object)
write the data at the current offset

### writeTagValue(type, value)
type (Number)
value (Array | String | Number)

> call the appropriate function depending on the TAG_TYPE

### writeTag(name, value)
name (string)
value (Array | String | Number)

> write a full tag at the offset position

### write()
reset Buffer
write the full data

return (Buffer): the data in the NBT format

## NBT
contain the NBT class
{
    NBT_Tag
    NBTReader
    NBTWriter
}

### parse(buffer)
buffer (Buffer): the file content
> use the NBTReader to change the Buffer into a Object

return (Object)

```js
var nbt = new NBTReader(fileContent);
console.log(JSON.stringify(nbt.read()))
```

### build(data)
data (Objet)
> use the NBTWriter to change the Object into a Buffet

return (Buffer)