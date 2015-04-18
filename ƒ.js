`requires es6`;

const ƒ = cb=> instant(cb) || new Promise(converter(cb));

function instant(val) {
  if(typeof val === 'function') return false;
  return val instanceof Error? Promise.reject(val) : Promise.resolve(val)
}
function converter(cb) {
  return (ok,no)=>{
    //convert callback --> Promise style
    var Ø = (err, result)=> err ? no(err) : ok(result);
    //choose your flavor
    Ø.done = Ø.resolve = Ø.accept = Ø.ok = ok;
    Ø.error = Ø.reject = Ø.fail = Ø.no = no;
    var ret = cb(Ø);
    if(ret!==undefined) ret instanceof Error? no(ret) : ok(ret);
  }
}
ƒ.converter = converter;

var map = Array.prototype.map;
ƒ.passthrough = (fn,prop)=>()=>{
  if(typeof prop==='string') fn = fn[prop];
  var args = arguments;
  var promise;
  var cb = v=> promise || (promise = ƒ(Ø=>{
    args = map.call(args, a=> typeof a==='function'? a(v) : a);
    fn.apply(fn,args);
    Ø.ok(v)
  }));
  Object.defineProperty(cb, 'then', { get:()=>cb().then.bind(promise) });
  return cb;
};

//converts callback(err, value) to Promise style
ƒ.ƒ = (fn, prop)=>{
  var ctx = fn;
  if(typeof prop==='string') fn = fn[prop];
  return ()=> {
    var args=arguments;
    return ƒ(Ø=> {
      Array.prototype.push.call(args, Ø);
      fn.apply(ctx, args);
    });
  };
};

ƒ.done = ƒ.resolve = ƒ.accept = ƒ.ok = ƒ.noop = ƒ.echo = Promise.resolve.bind(Promise);
ƒ.error = ƒ.reject = ƒ.fail = ƒ.no = Promise.reject.bind(Promise);
ƒ.all = Promise.all.bind(Promise);
ƒ.race = Promise.race.bind(Promise);

Object.defineProperty(ƒ, 'then', { get:()=>Promise.prototype.then.bind(ƒ()) })
Object.defineProperty(ƒ, 'catch', { get:()=>Promise.prototype.catch.bind(ƒ()) })

module.exports = ƒ;
