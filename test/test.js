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
var asyncish = n=>ƒ(Ø=>{
  setTimeout(_=>Ø.done(n),10);
});

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

  it('should have aliases for Promise.reject', function (done) {
    ƒ.reject.should.equal(ƒ.no);
    ƒ.fail.should.equal(ƒ.no);
    ƒ.no().then(x=>done(Error('then should not be called'))).catch(x=>done());
  });

  it('should make Error instances with Promise.error', function (done) {
    ƒ.all([
      ƒ.error('make me an error')
        .then(x=>done(Error('then should not be called')))
        .catch(x=>{
          x.should.be.an.instanceOf(Error);
          x.should.have.property('message', 'make me an error');
        }),
      ƒ.error(Error('I am an error'))
        .then(x=>done(Error('then should not be called')))
        .catch(x=>{
          x.should.be.an.instanceOf(Error);
          x.should.have.property('message', 'I am an error');
        })
      ])
    .then(x=>done())
    .catch(done);
  });

  describe('passthrough functions', function () {

    it('should allow values to pass through', function (done) {
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

    var match = ƒ.passthrough((value1, value2)=> ƒ(Ø=>{
        setTimeout(_=>{
          //return a rejected thenable to interrupt the pipeline
          if(value1!==value2)
            Ø.error("I don't like it");
          else Ø.done("I'll work with it");//this will always be ignored
        }, 10);
      })
    );

    it('should allow it to inject a thenable', function (done) {

      //first try it with a successful match
      ƒ.done('happy')
        .then(match('happy', v=>v))
        .then(result=>{
          result.should.equal('happy');
          done();
        })
        .catch(done);
    });

    it('should only allow a rejected Promise to interrupt', function (done) {

      //now with a non-match
      ƒ.done('sad')
        .then(match('happy', v=>v))
        .then(x=>done(Error('then should not be called')))
        .catch(err=>{
          should.exist(err);
          err.should.have.property("message", "I don't like it");
          done();
        });

    });

  });

  describe('filters', function () {
    it('should filter data', function (done) {
      ƒ({foo:111})
        .then(ƒ('foo', (foo)=>999))
        .then(data=>{
          data.foo.should.equal(999);


          return ƒ({foo:111})
            .then(ƒ('foo', (foo)=>{
              return asyncish(999)
            }))
            .then(data=>{
              data.foo.should.equal(999);
              done();
            })

        })
        .catch(done);
    });

    it('should ignore the property if it doesn\'t exist in the source', function (done) {
      var source = {bar:111};
      ƒ(source)
        .then(ƒ('foo', (foo)=>999))
        .then(result=>{
          result.should.equal(source);

          var asyncish = n=>ƒ(Ø=>{
            setTimeout(_=>Ø.done(n),10);
          });

          return ƒ(source)
            .then(ƒ('foo', (foo)=>{
              return asyncish(999)
            }))
            .then(result=>{
              result.should.equal(source);
              done();
            })

        })
        .catch(done);
    });

  });

  describe('ƒ.all', function () {

    it('should accept an array', function (done) {
      ƒ.all([
        asyncish(111),
        asyncish(222),
        asyncish(333)
      ])
      .then(function (results) {
        results.should.be.an.array;
        results.should.deepEqual([111,222,333]);
        done();
      })
      .catch(done);
    });

    it('should accept params', function (done) {
      ƒ.all(
        asyncish(111),
        asyncish(222),
        asyncish(333)
      )
      .then(function (results) {
        results.should.be.an.array;
        results.should.deepEqual([111,222,333]);
        done();
      })
      .catch(done);
    });

    it('should accept an object', function (done) {
      ƒ.all({
        task1:asyncish(111),
        task2:asyncish(222),
        task3:asyncish(333)
      })
      .then(function (results) {
        results.should.not.be.an.array;
        results.should.deepEqual({task1:111, task2:222, task3:333 });
        done();
      })
      .catch(done);
    });

  })

});

