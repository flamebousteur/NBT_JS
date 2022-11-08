/**
 * hello, I'm flamebousteur and I'm a french developer
 * You can use and modify this code for free but please keep this comment;
 * thanks.
 * 
 * author: flamebousteur
 * my web site: https://flamebousteur.github.io
 * source code: https://github.com/flamebousteur/NBT_JS
 */

class Items {
    constructor(name, count = 1, tags = {}) {
        this.name = name;
        this.count = count;
        this.tags = tags;
    }

    setTag(key, value) { this.tags[key] = value}
    getTag(key) { return this.tags[key]; }
    removeTag(key) { delete this.tags[key]; }
}