const _ = require('lodash')
  , client = require('../../lib/client')();

var showErrorsForInput, showErrors, clearErrors, clearInputError, checkPermission;

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
  const {Profile} = client, permissions = _.at(doc, '_meta.acl.'+method)[0];

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

module.exports = {
  showErrorsForInput: showErrorsForInput,
  showErrors: showErrors,
  clearErrors: clearErrors,
  clearInputError: clearInputError,
  checkPermission: checkPermission
}
