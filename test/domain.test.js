const 
  expect = require('chai').expect;

describe('#rootDomain', function(){
  var rootDomain;

  before(function(done){
	this.timeout(5000);
	client.login("administrator","!QAZ)OKM", function(err, token){
	  if(err) return done(err);	
  	  expect(client).to.be.an('object');
	  done();
	});
  });
  
  after(function(done){
	client.logout(function(err, result){
	  if(err) return done(err);	
  	  expect(result).to.be.ok;
	  done();
	});
  })

  it('Getting rootDomain should return rootDomain', function(done){
    Domain.get('.root',function(err, d){
	  if(err) return done(err);	
      rootDomain = d
  	  expect(rootDomain).to.be.an('object');
  	  done();
  	});
  });

  it('Adding content should return updated domain', function(done){
  	rootDomain.hello2 = 'world2';
	rootDomain.save(function(err, d){
	  if(err) return done(err);	
      expect(d).to.be.an('object');
      done();
	});
  });

  it('Removing content should return true', function(done){
  	delete rootDomain.hello2;
	rootDomain.save(function(err, d){
	  if(err) return done(err);	
      expect(d).to.be.an('object');
      done();
	});
  });

  it('Getting events of root domain.', function(done){
	rootDomain.getEvents(function(err, events){
	  if(err) return done(err);	
      expect(events).to.be.an('object');
      done();
	});
  });

  it('RootDomain refresh should return true', function(done){
    rootDomain.refresh(function(err, result){
	  if(err) return done(err);	
      expect(result).to.be.ok;
	  done();
	});
  });

});

describe('#testDomain', function(){
  var rootDomain, testDomain;

  before(function(done){
	client.login("administrator","!QAZ)OKM", function(err, token){
      Domain.get('.root',function(err, d){
  	    if(err) return done(err);	
	    rootDomain = d
	    expect(rootDomain).to.be.an('object');
	    done();
	  });
	});
  });
	  
  after(function(done){
	client.logout(function(err, result){
	  if(err) return done(err);	
  	  expect(result).to.be.ok;
	  done();
	});
  })
  

  it('Creating testDomain should return domain', function(done){
  	this.timeout(30000);
    Domain.create('www.notes.com',{}, function(err, d){
	  if(err) return done(err);	
  	  expect(d).to.be.an('object');
  	  done();
  	});
  });
	  
  it('Getting testDomain should return domain', function(done){
    Domain.get('www.notes.com', function(err, d){
	  if(err) return done(err);	
      testDomain = d
	  expect(testDomain).to.be.an('object');
	  done();
	});
  });  

  it('Adding content should return updated domain', function(done){
  	testDomain.hello2 = 'world2';
	testDomain.save(function(err, d){
	  if(err) return done(err);	
      expect(d).to.be.an('object');
      done();
	});
  });

  it('Removing content should return updated domain', function(done){
  	delete testDomain.hello2;
	testDomain.save(function(err, d){
	  if(err) return done(err);	
      expect(d).to.be.an('object');
      done();
	});
  });

  it('Removing testDomain should return true', function(done){
	testDomain.delete(function(err, result){
	  if(err) return done(err);	
      expect(result).to.be.ok;
      done();
	});
  });

  it('RootDomain refresh should return true', function(done){
    rootDomain.refresh(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.ok;
	  done();
	});
  });

});