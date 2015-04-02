`requires es6`;

const ƒ = cb=> new Promise((ok,no)=>cb({ done:ok, error:no }));

//converts callback(err, value) to Promise style
ƒ.ƒ = fn=>()=> {
  var args=arguments;
  return ƒ(Ø=> {
    var converter = (err, result)=> err ? Ø.error(err) : Ø.done(result);
    Array.prototype.push.call(args, converter);
    fn.apply(null, args);
  });
};

module.exports = ƒ;