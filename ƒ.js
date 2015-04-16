`requires es6`;

const ƒ = cb=> passthrough(cb) || new Promise((ok,no)=>{
  //convert callback --> Promise style
  var Ø = (err, result)=> err ? no(err) : ok(result);
  //choose your flavor
  Ø.done = Ø.resolve = Ø.accept = Ø.ok = ok;
  Ø.error = Ø.reject = Ø.fail = Ø.no = no;
  var ret = cb(Ø);
  if(ret!==undefined) ret instanceof Error? no(ret) : ok(ret);
});

function passthrough(val) {
  if(typeof val === 'function') return false;
  return val instanceof Error? Promise.reject(val) : Promise.resolve(val)
}

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

module.exports = ƒ;