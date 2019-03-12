const expect = require('chai').expect;

describe('#rootDomain document', function(){
  var rootDomain, collection, document;
  
  before(function(done){
	this.timeout(5000);
	client.login("administrator","!QAZ)OKM", function(err, token){
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

  it('Creating collection should return the collection object', function(done){
  	this.timeout(10000);
	Collection.create('.root', "policies", {hello:"world"}, function(err, c){
	  if(err) return done(err);	
   	  expect(c).to.be.an('object');
   	  collection = c;
      done();
	});
  });

  it('Creating document with id should return the document object', function(done){
  	this.timeout(5000);
	collection.createDocument("helloWorld", {hello:"world"}, function(err, d){
	  if(err) return done(err);	
   	  expect(d).to.be.an('object');
      done();
	});
  });

  it('Creating document with null id should return the document object', function(done){
  	this.timeout(5000);
	collection.createDocument({hello2:"world2"}, function(err, d){
	  if(err) return done(err);	
	  else expect(d).to.be.an('object');
      done();
	});
  });
  
  it('Getting document with id should return the document object', function(done){
	collection.getDocument("helloWorld", function(err, d){
	  if(err) return done(err);	
      document = d
	  expect(document).to.be.an('object');
      done();
	});
  });
  
  it('Adding content should return updated document', function(done){
  	this.timeout(5000);
  	document.hello200 = 'world200';
	document.save(function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
	  done();
	});
  });

  it('Removing content should return updated document', function(done){
  	this.timeout(5000);
  	delete document.hello200;
	document.save(function(err, d){
	  if(err) return done(err);	
	  expect(d).to.be.an('object');
	  done();
	});
  });
  
  it('Removing document should return true', function(done){
  	this.timeout(5000);
	document.delete(function(err, result){
	  if(err) return done(err);	
	  expect(result).to.be.ok;
	  done();
	});
  });
  
  it('Removing collection should return true', function(done){
  	this.timeout(5000);
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

describe('#testDomain document', function(){
  var rootDomain, testDomain, testCollection, testDocument;
 
  before(function(done){
	this.timeout(5000);
	client.login("administrator","!QAZ)OKM", function(err, token){
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
  	this.timeout(5000);  	
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
  
  it('Removing testCollection should return true', function(done){
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

  it('removing testDomain should return true', function(done){
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