ƒ
=
Very simple tools for working with [ES6 Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

This wonderful new world of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
now means I have **2** arguments to deal with _(`reject`, `resolve`)_ instead of just `callback` that we had all these years:
```javascript
modules.exports = {
  find: id=>{
    return new Promise((reject, resolve)=>{
      some.db.find(id, (err, result)=>{
        if(err) reject(err);
        else resolve(result);
      });
    });
  }
}
```

Well, ƒ all those extra characters crowding things!!
```javascript
var ƒ = require('effd');
modules.exports = {
  find: id=>{
    return ƒ(Ø=>{
      some.db.find(id, (err, result)=>{
        if(err) Ø.error(err);
        else Ø.done(result);
      });
    });
  }
}
```
Hmm. Converting the _callback style_ is still ugly!
```javascript
var ƒ = require('effd');
modules.exports = {
  find: id=>{
    return ƒ(Ø=> some.db.find(id, Ø));
  }
}
```

Better, but... Gaaahh! This is really just a proxy. Lets just Promisify it...
```javascript
var ƒ = require('effd');
modules.exports = {
  find: ƒ.ƒ(some.db.find)
}
```
👍

## FYI
The ƒ character is `ALT+f` on the Mac.
The Ø character is `ALT+SHIFT+o` on the Mac.


license
=======
MIT © 2015 William Kapke


