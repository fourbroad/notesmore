import  _  from 'lodash';

var showErrorsForInput, showErrors, clearErrors, clearInputError, checkPermission, get;

showErrorsForInput = function($input, errors) {
  var $parent = $input.parent();

  $input.removeClass("is-valid is-invalid");

  if (errors) {
    var $feedback = $parent.find('.invalid-feedback, .valid-feedback').empty();
    $input.addClass("is-invalid");
    _.each(errors, function(error) {
      $('<p/>').text(error).appendTo($feedback);
    });
  }
}

showErrors = function($form, errors) {
  $form.find("input[name]").each(function() {
    showErrorsForInput($(this), errors[this.name]);
  });
}

clearErrors = function($form) {
  $form.find('.is-invalid').val('');
  $form.find('.invalid-feedback, .valid-feedback').empty();
  $('input', $form).removeClass("is-valid is-invalid");
}

clearInputError = function($input){
  $input.removeClass("is-valid is-invalid");
  $input.parent().find('.invalid-feedback, .valid-feedback').empty();
}

checkPermission = function(domainId, userId, method, doc, callback) {
  const client = doc.getClient(), Profile = client.Profile, permissions = _.at(doc, '_meta.acl.'+method)[0];

  if (!permissions)
    return callback ? callback(null, true) : console.log(true);

  Profile.get(domainId, userId, function(err, profile) {
    if(err) return callback ? callback(err) : console.error(err);
    if (_.intersection(profile.roles, permissions.roles).length > 0 
    || _.intersection(profile.groups, permissions.groups).length > 0 
    || (permissions.users && permissions.users.indexOf(userId) >= 0)) {
      return callback ? callback(null, true) : console.log(true);
    } else {
      return callback ? callback(null, false) : console.log(false);
    }
  });
}

get = function(object, path){
  if(!object || !path) return;
  if(_.isString(path)) path = path.split('.');
  if(_.isArray(object)){
    if(path.length == 1){
      return _.reduce(object, function(r,v,k){
        if(v[path[0]]) r.push(v[path[0]]);
        return r;
      },[]);
    }else{
      return get(_.reduce(object, function(r,v,k){
        if(v[path[0]]) r.push(v[path[0]]);
        return r;
      },[]), _drop[path]);
    }
  } else {
    if(path.length == 1){
      return object[path[0]];
    } else{
      return get(object[path[0]], _.drop(path));
    }
  }
}

export default {
  showErrorsForInput: showErrorsForInput,
  showErrors: showErrors,
  clearErrors: clearErrors,
  clearInputError: clearInputError,
  checkPermission: checkPermission,
  get: get
}
