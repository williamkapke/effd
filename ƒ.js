
const ƒ = (arg1,arg2)=> filter(arg1,arg2) || instant(arg1) || new Promise(converter(arg1));

function instant(val) {
  if(typeof val === 'function') return false;
  return val instanceof Error? Promise.reject(val) : Promise.resolve(val)
}
function filter(property, fn) {
  if(typeof fn !== 'function' || typeof property !== 'string') return false;

  return data=>{
    if(!data || !data[property])
      return data;

    function set_value(result){
      data[property] = result;
      return data;
    }

    var result = fn(data[property]);
    return result.then? result.then(set_value) : set_value(result);
  }
}
function converter(cb) {
  return (ok,no)=>{
    //convert callback --> Promise style
    var Ø = (err, result)=> err ? no(err) : ok(result);
    //choose your flavor
    Ø.done = Ø.resolve = Ø.accept = Ø.ok = ok;
    Ø.reject = Ø.fail = Ø.no = no;
    Ø.error = (err)=>no(err instanceof Error? err : Error(err));
    var ret = cb(Ø);
    if(ret!==undefined) ret instanceof Error? no(ret) : ok(ret);
  }
}
ƒ.converter = converter;
ƒ.filter = filter;

var map = Array.prototype.map;
ƒ.passthrough = (fn,prop)=>function(){
  if(typeof prop==='string') fn = fn[prop];
  var args = arguments;
  var promise;
  var cb = v=> promise || (promise = ƒ(Ø=>{
    args = map.call(args, a=> typeof a==='function'? a(v) : a);
    var result = fn.apply(fn,args);
    if(result && result.then)
      result.then(_=>Ø.ok(v)).catch(Ø.error);
    else Ø.ok(v);
  }));
  Object.defineProperty(cb, 'then', { get:()=>cb().then.bind(promise) });
  return cb;
};

//converts callback(err, value) to Promise style
ƒ.promisify = ƒ.ƒ = function(fn, prop1, prop2) {
  var ctx = fn;
  if(typeof prop1==='undefined' && typeof fn==='object') prop1 = Object.keys(fn);
  if(Array.isArray(prop1) || (typeof prop1==='string' && typeof prop2==='string'))
    return promisify_all(fn, Array.isArray(prop1)? prop1 : Array.prototype.slice.call(arguments, 1));

  if(typeof prop1==='string') fn = fn[prop1];

  return function() {
    var args=arguments;
    return ƒ(Ø=> {
      Array.prototype.push.call(args, Ø);
      fn.apply(ctx, args);
    });
  };
};
function promisify_all(obj, keys) {
  var out = {};
  keys.forEach(key=>{
    if(typeof obj[key] === 'function')
      out[key] = ƒ.ƒ(obj, key);
  });
  return out;
}

ƒ.done = ƒ.resolve = ƒ.accept = ƒ.ok = ƒ.noop = ƒ.echo = Promise.resolve.bind(Promise);
ƒ.reject = ƒ.fail = ƒ.no = Promise.reject.bind(Promise);
ƒ.error = (err)=>ƒ.reject(err instanceof Error? err : Error(err));
ƒ.race = Promise.race.bind(Promise);
ƒ.all = function(arg1) {
  if(arguments.length>1) return Promise.all(Array.prototype.slice.call(arguments));

  //support { task1:promise1, task2:promise2, ...}
  if(!Array.isArray(arg1) && typeof arg1==='object') {
    return all_obj(arg1);
  }

  return Promise.all(arg1);
};

function all_obj(obj) {
  var keys = Object.keys(obj);
  return Promise.all(keys.map(function(key) { return obj[key] }))
    .then(function(results){
      return results.reduce(function(out, result, i) { return (out[keys[i]] = result) && out; }, {});
    });
}

Object.defineProperty(ƒ, 'then', { get:()=>Promise.prototype.then.bind(ƒ()) });
Object.defineProperty(ƒ, 'catch', { get:()=>Promise.prototype.catch.bind(ƒ()) });

module.exports = ƒ;
