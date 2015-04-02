var should = require('should');
var ƒ = require('../');

function async_thing(hasError, value, callback) {
  setTimeout(function () {
    if(hasError) callback(Error('Err!'));
    else callback(null, value);
  }, 1);
}
function FileReader() {
  this.id = new Date();
}
FileReader.prototype.async_thing = function (hasError, callback) {
  async_thing(hasError, this.id, callback);
};

describe('Promisify', function () {
  var x1 = ƒ.ƒ(async_thing);
  var reader = new FileReader();
  var x2 = ƒ.ƒ(reader, 'async_thing');

  it('should return a wrapped Function', function () {
    x1.should.be.type('function');
  });
  it('should return a Promise when the function is executed', function () {
    var p1 = x1();
    var p2 = x1();
    p1.should.be.instanceOf(Promise);
    p2.should.be.instanceOf(Promise);
    p1.should.not.equal(p2);
  });
  it('should bind properties to their instances', function (done) {
    var p1 = x2(false);
    p1.should.be.instanceOf(Promise);
    p1.then(id=>{
      id.should.equal(reader.id);
    });

    var p2 = x2(true);
    p2.should.be.instanceOf(Promise);
    p2.then(id=>done(Error('it should have errord')))
    .catch(err=>should.exist(err));

    //the wrong way (looses context)
    var x3 = ƒ.ƒ(reader.async_thing);
    var p3 = x3(false);
    p3.should.be.instanceOf(Promise);
    p3.then(id=>{
      should.not.exist(id);
      done()
    });
  });
});

