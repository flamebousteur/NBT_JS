NBT class documentation >> [doc](./NBT%20doc.md)

Schematic class documentation >> [doc](./Schematic%20doc.md)

files checked:
- hotbar.nbt: read and write
```jsonc
{
  "": {
    "< 0 to 8 >": [
      {"id":"< item >","Count": 1}, // 1 to 64
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1},
      {"id":"< item >","Count": 1, "tag": {}} // tag is optional
    ],
    "DataVersion":2865
  }
}
```

- servers.dat: read and write
```json
{"": {
    "servers":[{
        "hidden":0,
        "ip":"play.hypixel.net",
        "name":"hypixel",
        "icon": "< base64 string >"
      }]
  }}
```

- level.dat: read
> to read data you maybe need to add: `BigInt.prototype.toJSON = function () { return this.toString(); };` in your code if you get the `(TypeError: Do not know how to serialize a BigInt)` error

> for somme reason I can't write the file