const assert = require('assert');
  
describe('Root Domain', function(){
  var rootDomain, bulkCollection, policyCollection, document, scrollId;

//    this.slow(300);

  before(function(done){
	this.timeout(5000);
	client.login("administrator","!QAZ)OKM", function(err, token){
	  if(err) return done(err);	
	  assert.deepEqual(typeof token, 'string');
	  done();
	});
  });

  beforeEach(function(done) {
    Domain.get('.root',function(err, d){
      if(err) return done(err);	
      rootDomain = d
      assert.deepEqual(typeof d, 'object');
  	  done();
  	});
  }); 
  
  it('When the ID is equal to root, it returns the root domain.', function(done){
    Domain.get('.root',function(err, d){
      if(err) return done(err);	
      rootDomain = d
      assert.deepEqual(typeof d, 'object');
  	  done();
  	});
  });

  it('Adding content should return updated domain', function(done){
  	rootDomain.hello2 = 'world2';
	rootDomain.save(function(err, d){
	  if(err) return done(err);	
      assert.deepEqual(typeof d, 'object');
      done();
	});
  });

  it('Removing content should return true', function(done){
  	delete rootDomain.hello2;
	rootDomain.save(function(err, d){
	  if(err) return done(err);	
      assert.deepEqual(typeof d, 'object');
      done();
	});
  });

  it('Getting events of root domain.', function(done){
	rootDomain.getEvents(function(err, events){
	  if(err) return done(err);	
      assert.deepEqual(typeof events, 'object');
      done();
	});
  });

  it('Creating collection should return the collection object', function(done){
  	this.timeout(10000);
	rootDomain.createCollection("bulk", {hello:"world"}, function(err, c){
	  if(err) return done(err);	
      assert.deepEqual(typeof c, 'object');
      done();
	});
  });

  it('Getting collection should return the collection object', function(done){
	rootDomain.getCollection("bulk", function(err, c){
	  if(err) return done(err);	
	  bulkCollection = c
      assert.deepEqual(typeof c, 'object');
      done();
	});
  });

  it('Adding content in collection should return updated collection', function(done){
	bulkCollection.hello3 = "world3";
	bulkCollection.save(function(err, c){
	  if(err) return done(err);	
      assert.deepEqual(typeof c, 'object');
	  done();
	});
  });

  it('Removing content in collection should return updated collection', function(done){
  	delete bulkCollection.hello3;
	bulkCollection.save(function(err, c){
	  if(err) return done(err);	
      assert.deepEqual(typeof c, 'object');
	  done();
	});
  });

  it('Adding documents in batches.', function(done){
  	this.timeout(30000);
	bulkCollection.bulk(_.times(1000,function (n) {
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
      assert.deepEqual(typeof c, 'object');
	  done();
	});
  });

  it('Find documents with scroll.', function(done){
  	bulkCollection.findDocuments({scroll:'200s', size:500},function (err, docs) {
  	  if(err) return done(err)
  	  scrollId = docs.scrollId;
      assert.deepEqual(typeof docs, 'object');
	  done();
    });
  });

  it('Scroll document resutl set.', function(done){
  	bulkCollection.scroll({scroll:'200s', scrollId: scrollId},function (err, docs) {
  	  if(err) return done(err)
      assert.deepEqual(typeof docs, 'object');
	  done();
    });
  });

  it('Clear scroll.', function(done){
  	bulkCollection.clearScroll({scrollId: scrollId},function (err, result) {
  	  if(err) return done(err)
      assert.deepEqual(typeof result, 'object');
	  done();
    });
  });

  it('Delete collection should return true', function(done){
	bulkCollection.delete(function(err, result){
	  if(err) return done(err);	
      assert.ok(result);
	  done();
	});
  });  

  it('Creating collection should return the collection object', function(done){
  	this.timeout(10000);
	rootDomain.createCollection("policies", {hello:"world"}, function(err, c){
	  if(err) return done(err);	
      assert.deepEqual(typeof c, 'object');
      done();
	});
  });

  it('Getting collection should return the collection object', function(done){
	rootDomain.getCollection("policies", function(err, c){
	  if(err) return done(err);	
	  policyCollection = c
      assert.deepEqual(typeof c, 'object');
   	  done();
	});
  });

  it('Creating document with id should return the document object', function(done){
  	this.retries(3);
	policyCollection.createDocument("helloWorld", {hello:"world"}, function(err, d){
	  if(err) {
	  	console.log(err);
	  return done(err);		
	  }
      assert.deepEqual(typeof d, 'object');
      done();
	});
  });

  it('Creating document with null id should return the document object', function(done){
	policyCollection.createDocument({hello2:"world2"}, function(err, d){
	  if(err) return done(err);	
	  assert.deepEqual(typeof d, 'object');
      done();
	});
  });
  
  it('Getting document with id should return the document object', function(done){
	policyCollection.getDocument("helloWorld", function(err, d){
	  if(err) return done(err);	
      document = d
      assert.deepEqual(typeof d, 'object');
      done();
	});
  });
  
  it('Adding content should return updated document', function(done){
  	this.timeout(5000);
  	document.hello200 = 'world200';
	document.save(function(err, d){
	  if(err) return done(err);	
      assert.deepEqual(typeof d, 'object');
	  done();
	});
  });

  it('Removing content should return updated document', function(done){
  	this.timeout(5000);
  	delete document.hello200;
	document.save(function(err, d){
	  if(err) return done(err);	
      assert.deepEqual(typeof d, 'object');
	  done();
	});
  });
  
  it('Removing document should return true', function(done){
  	this.timeout(5000);
	document.delete(function(err, result){
	  if(err) return done(err);	
	  assert.ok(result);
	  done();
	});
  });

  it('Delete collection should return true', function(done){
	policyCollection.delete(function(err, result){
	  if(err) return done(err);	
	  assert.ok(result);
	  done();
	});
  });  

  it('RootDomain refresh should return true', function(done){
    rootDomain.refresh(function(err, result){
	  if(err) return done(err);	
	  assert.ok(result);
	  done();
	});
  });

});
