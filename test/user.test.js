const expect = require('chai').expect;

describe('#user', function(){
  var rootDomain, testUser, userCollection;

  before(function(done){
	this.timeout(5000);
	client.login('administrator', '!QAZ)OKM', function(err, token){
	  if(err) return done(err);	
  	  expect(client).to.be.an('object');
	  done();
	});
  });
  
//   after(function(done){
// 	client.logout(function(err, result){
//   	  expect(result).to.be.ok;
// 	  done();
// 	});
//   });
  
  it('register new test user and should return user object.', function(done){
	User.create('test', {password:'z4bb4z'}, function(err, userData){
	  if(err) return done(err);	
      expect(userData).to.be.an('object');
      done();
	});	
  });

  it('create profile in domain and return profile.', function(done){
	Profile.create(".root", "test", {}, function(err, profile){
	  if(err) return done(err);	
	  expect(profile).to.be.ok;
	  done();
	});
  });

  it('test user login and return token.', function(done){
    client.login('test', 'z4bb4z', function(err, token){
	  if(err) return done(err);	
   	  expect(token).to.be.an('string');
      done();
	});	
  });

  it('Getting test user and shoud return the user object.', function(done){
	User.get('test', function(err, user){
	  if(err) return done(err);	
	  testUser = user;
	  expect(testUser).to.be.an('object');
   	  done();
	});	
  });

  it('Login with administrator.', function(done){
	client.login("administrator","!QAZ)OKM", function(err, token){
	  if(err) return done(err);	
  	  expect(token).to.be.an('string');
	  done();
	});
  });  

  it('replace content of test user and should return updated user', function(done){
  	testUser.replace({ hello100: "world100"});
	testUser.save(function(err, u){
	  if(err) return done(err);	
	  expect(u).to.be.an('object');
	  done();
	});
  });

  it('Clear content of test user and should return updated user', function(done){
  	testUser.replace({});
	testUser.save(function(err, u){
	  if(err) return done(err);	
	  expect(u).to.be.an('object');
	  done();
	});
  });

  it('Add content to test user and should return updated user', function(done){
  	testUser.hello200 = 'world200';
	testUser.save(function(err, u){
	  if(err) return done(err);	
	  expect(u).to.be.an('object');
	  done();
	});
  });

  it('Remove content from test user and should return updated user', function(done){
  	delete testUser.hello200;
	testUser.save(function(err, u){
	  if(err) return done(err);	
	  expect(u).to.be.an('object');
	  done();
	});
  });
	  
  it('test user reset password and should return true', function(done){
	testUser.resetPassword("z4b", function(err, result){
	  if(err) return done(err);	
   	  expect(result).to.be.ok;
	  done();
	});
  });
  
  it('Create a new user named hello and should return user object', function(done){
	User.create('hello', {password:'world'}, function(err, user){
	  if(err) return done(err);	
   	  expect(user).to.be.an('object');
	  done();
	});	
  });
  
  it('test client get user named hello and remove the returned user.', function(done){
	User.get('hello', function(err, user){
	  if(err) return done(err);	
	  user.delete(function(err, result){
  	    if(err) return done(err);	
	   	expect(result).to.be.ok;
	   	done();
	  });
	});	
  });

  it('Delete profile in domain.', function(done){
	Profile.get(".root", "test", function(err, profile){
	  if(err) return done(err);
	  profile.delete(function(err, result){
	  	if(err) return done(err);
  	    expect(result).to.be.ok;
	    done();
	  });
	});
  });  

  it('remove test user and should return true', function(done){
	testUser.delete(function(err, result){
	  if(err) return done(err);	
   	  expect(result).to.be.ok;
	  done();
	});	
  });

});