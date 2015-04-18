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

describe('ƒ', function () {
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
  it('should return a resolved Promise if the argument is not a function and not an Error', function (done) {
    ƒ(99)
      .then(x=>{
        x.should.equal(99);

        ƒ()
          .then(x=>{
            should.not.exist(x);
            done();
          })
          .catch(done);
      })
      .catch(done);
  });
  it('should return a resolved Promise if the callback returns something that isn\'t an Error', function (done) {
    ƒ(Ø=>99)
      .then(x=>{
        x.should.equal(99);
        done();
      })
      .catch(done);
  });

  it('should return a rejected Promise if the callback returns an Error', function (done) {
    ƒ(Ø=>Error('you are a reject'))
      .then(x=>{
        done(Error('then should not be called'));
      },
      err=>{
        err.message.should.equal('you are a reject');
        done();
      })
      .catch(done);
  });
  it('should return a rejected Promise if the argument is an Error', function (done) {
    ƒ(Error('you are a reject'))
      .then(x=>{
        done(Error('then should not be called'));
      },
      err=>{
        err.message.should.equal('you are a reject');
        done();
      })
      .catch(done);
  });

  it('should have aliases for Promise.resolve', function (done) {
    ƒ.done.should.equal(ƒ.ok);
    ƒ.done.should.equal(ƒ.ok);
    ƒ.resolve.should.equal(ƒ.ok);
    ƒ.accept.should.equal(ƒ.ok);
    ƒ.noop.should.equal(ƒ.ok);
    ƒ.echo.should.equal(ƒ.ok);
    ƒ.ok().then(done).catch(done);
  });

  it('should have aliases for Promise.resolve', function (done) {
    ƒ.error.should.equal(ƒ.no);
    ƒ.reject.should.equal(ƒ.no);
    ƒ.fail.should.equal(ƒ.no);
    ƒ.no().then(x=>done(Error('then should not be called'))).catch(x=>done());
  });

  it('should support passthrough functions', function (done) {
    function Logger() {
      this.lines = [];
      this.log = this.lines.push.bind(this.lines);
    }

    var logger = new Logger();
    var log = ƒ.passthrough(logger,'log');
    log('yippie')
      .then(Ø=>{
        logger.lines.should.eql(['yippie']);
        done();
      })
      .catch(done);
  });


});

