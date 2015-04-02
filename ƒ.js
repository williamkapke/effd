`requires es6`;

const ƒ = cb=> new Promise((ok,no)=>{
  //convert callback --> Promise style
  var Ø = (err, result)=> err ? no(err) : ok(result);
  //choose your flavor
  Ø.done = Ø.resolve = Ø.accept = Ø.ok = ok;
  Ø.error = Ø.reject = Ø.fail = Ø.no = no;
  cb(Ø)
});

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

module.exports = ƒ;