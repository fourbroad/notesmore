const 
  expect = require('chai').expect;

describe('#testDomain', function(){
  var rootDomain, testDomain, testCollection, testDocument, scrollId;

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
  	this.timeout(120000);
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

  it('Find documents with scroll.', function(done){
  	testCollection.findDocuments({scroll:'200s', size:500},function (err, docs) {
  	  if(err) return done(err)

  	  scrollId = docs.scrollId;
	  expect(docs).to.be.an('object');
	  done();
    });
  });

  it('Scroll document resutl set.', function(done){
  	testCollection.scroll({scroll:'200s', scrollId: scrollId},function (err, docs) {
  	  if(err) return done(err)
	  expect(docs).to.be.an('object');
	  done();
    });
  });

  it('Clear scroll.', function(done){
  	testCollection.clearScroll({scrollId: scrollId},function (err, result) {
  	  if(err) return done(err)
	  expect(result).to.be.an('object');
	  done();
    });
  });

  it('Creating testDocument with id should return the document object', function(done){
	testCollection.createDocument("helloWorld", {hello:"world"}, function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
      done();
	});
  });

  it('Creating testDocument with null id should return the document object', function(done){
	testCollection.createDocument({hello2:"world2"}, function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
      done();
	});
  });
  
  it('Getting testDocument with id should return the document object', function(done){
	testCollection.getDocument("helloWorld", function(err, d){
	  if(err) return done(err);	
 	  testDocument = d
	  expect(testDocument).to.be.an('object');
      done();
	});
  });
  
  it('replacing content should return updated document', function(done){
  	testDocument.replace({ hello100: "world100"});
	testDocument.save(function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
	  done();
	});
  });

  it('Clearing content should return updated document', function(done){
  	testDocument.replace({});
	testDocument.save(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.an('object');
	  done();
	});
  });

  it('Adding content should return updated document', function(done){
  	testDocument.hello200 = 'world200';
	testDocument.save(function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
	  done();
	});
  });

  it('Removing content should return updated document', function(done){
  	delete testDocument.hello200;
	testDocument.save(function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
	  done();
	});
  });
  
  it('Delete testDocument should return true', function(done){
	testDocument.delete(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.ok;
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