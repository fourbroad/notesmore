const expect = require('chai').expect;

describe('#rootDomain collection', function(){
  var rootDomain, collection, testDomain, testCollection;
  
  before(function(done){
	client.login("administrator","!QAZ)OKM", function(err, token){
	  Domain.get('.root',function(err, d){
	    rootDomain = d
	    expect(rootDomain).to.be.an('object');
	    done();
	  });	  
	});
  });

  it('Creating collection should return the collection object', function(done){
  	this.timeout(10000);
	rootDomain.createCollection("policies", {hello:"world"}, function(err, c){
	  if(err) return done(err);	
   	  expect(c).to.be.an('object');
      done();
	});
  });

  it('Getting collection should return the collection object', function(done){
	rootDomain.getCollection("policies", function(err, c){
	  if(err) return done(err);	
	  collection = c
   	  expect(collection).to.be.an('object');
      done();
	});
  });

  it('Adding content in collection should return updated collection', function(done){
	collection.hello3 = "world3";
	collection.save(function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });

  it('Removing content in collection should return updated collection', function(done){
  	delete collection.hello3;
	collection.save(function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });

  it('Adding documents in batches.', function(done){
  	this.timeout(30000);
	collection.bulk(_.times(1000,function (n) {
      return { 
        id:n, 
        name:faker.name.findName(), 
        avatar:faker.internet.avatar(),
        email: faker.internet.email(),
        website: faker.internet.url(),
        address: faker.address.streetAddress() + faker.address.city() + faker.address.country(),
        bio: faker.lorem.sentences(),
        image: faker.image.avatar()
      }
    }), function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });
 
  it('Delete collection should return true', function(done){
	collection.delete(function(err, result){
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

describe('#testDomain collection', function(){
  var rootDomain, collection, testDomain, testCollection;
 
  before(function(done){
	this.timeout(5000);
	client.login("administrator","!QAZ)OKM", function(err, token){
  	  expect(client).to.be.an('object');
	  done();
	});
  });
  
  after(function(done){
	client.logout(function(err, result){
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

  it('Creating collection should return the collection object', function(done){
	testDomain.createCollection("policies", {hello:"world"}, function(err, c){
	  if(err) return done(err);	
   	  expect(c).to.be.an('object');
      done();
	});
  });

  it('Getting collection should return the collection object', function(done){
	testDomain.getCollection("policies", function(err, c){
	  if(err) return done(err);	
	  testCollection = c
   	  expect(testCollection).to.be.an('object');
      done();
	});
  });

  it('Adding content should return updated Colection', function(done){
  	testCollection.hello3 = 'world3';
	testCollection.save(function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });

  it('Removing content should return updated Colection', function(done){
  	delete testCollection.hello3;
	testCollection.save(function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });

  it('Adding documents in batches.', function(done){
  	this.timeout(30000);
	testCollection.bulk(_.times(1000,function (n) {
      return { 
        id:n, 
        name:faker.name.findName(), 
        avatar:faker.internet.avatar(),
        email: faker.internet.email(),
        website: faker.internet.url(),
        address: faker.address.streetAddress() + faker.address.city() + faker.address.country(),
        bio: faker.lorem.sentences(),
        image: faker.image.avatar()
      }
    }), function(err, c){
	  if(err) return done(err);	
	  expect(c).to.be.an('object');
	  done();
	});
  });
	  
  it('Delete testCollection should return true', function(done){
	testCollection.delete(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.ok;
	  done();
	});
  });

  it('testDomain refresh should return true', function(done){
	testDomain.refresh(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.ok;
	  done();
	});
  });

  it('delete testDomain should return true', function(done){
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