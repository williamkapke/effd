ƒ
==

**This is NOT Promise library.** This a a small module that makes working with [ES6 Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) a bit easier and/or more semantic.

**FYI:**<br>
The `ƒ` character is `ALT+f` on the Mac.<br>
The `Ø` character is `ALT+SHIFT+o` on the Mac.


### Here's an example...
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
Hmm… converting that _callback style_ is still pretty ugly! That `Ø` argument is a converter too! Check it out...
```javascript
var ƒ = require('effd');
modules.exports = {
  find: id=>{
    return ƒ(Ø=> some.db.find(id, Ø));
  }
}
```

Better, but... Gaaahh! This is really just a proxy to `db.find`. Lets just Promisify it...
```javascript
var ƒ = require('effd');
modules.exports = {
  find: ƒ.ƒ(some.db.find)
}
```
Oops... Doing it like that screws up its scope. We need to pass in the `db` context and then function name to fix it:
```javascript
var ƒ = require('effd');
modules.exports = {
  find: ƒ.ƒ(some.db, 'find')
}
```
👍

#### About that `Ø` argument...
It's a Swiss Army knife argument. As mentioned above, it is a [lambda](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) that converts [error first callback style](http://thenodeway.io/posts/understanding-error-first-callbacks) to Promise's `(resolve,reject)` style.

##### Ø.resolve = Ø.done = Ø.accept = Ø.ok
Aliases to `resolve` the promise.

##### Ø.reject = Ø.error = Ø.fail = Ø.no
Aliases to `reject` the promise.



##Some other goodies
#### ƒ.[then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) & ƒ.[catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)
A getter that returns a resolved Promise.

`ƒ.catch` also returns a **resolved** Promise- therefor its callback will never get called. Its only purpose is to provide a consistent interface.
```javascript
var promise = ƒ;
promise.catch(()=>'never called').then(()=>'but this is!').then(console.log);
promise.then(()=>'eureka!',()=>'never called').then(console.log);
```

#### ƒ.[resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) = ƒ.done = ƒ.accept = ƒ.ok = ƒ.noop = ƒ.echo
Aliases for `Promise.resolve()`. Use whichever _reads_ the best to you!

#### ƒ.[reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) = ƒ.error = ƒ.fail = ƒ.no
Aliases for `Promise.reject()`. Use whichever _reads_ the best to you!

#### ƒ.[all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) & ƒ.[race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
Yeah... those are there too.

#### ƒ.passthrough(function) / ƒ.passthrough(context, name)
Turns a function that isn't async into a resolved promise. Since [lambdas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) allow us to drop the `{}`s and `return` statement if everything is chained, you can use this to help simplify your code.

```javascript
var log = ƒ.passthrough(console.log);
var wait = seconds=> ƒ(Ø=>{
  setTimeout(Ø.done, seconds*1000)
});

var doit = ()=>
  log('start')
    .then(()=>wait(1))
    .then(log('end'));

doit();
```

Here's another example:
```javascript
var debug = ƒ.passthrough(console.log);
module.exports = {
  find: id =>
    debug('finding: %s', id)
      .then(()=>db.find({_id:id}))
      //use a lambda to get access to the value being passedthrough!
      .then(debug('found: %s %s',id,u=>u.name))
};
```
In this example, the `debug` passthrough is used in 2 ways. The first, creates a resolved Promise that is thenable. There isn't a value to passthrough, so there isn't a value to pass to the first `then()`. The second is passed the `user` object returned from the database


license
=======
MIT © 2015 William Kapke


