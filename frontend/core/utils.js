const _ = require('lodash')
  , client = require('../../lib/client')();

var showErrorsForInput, showErrors, clearErrors, checkPermission;

showErrorsForInput = function($input, errors) {
  var $formGroup = $input.closest(".form-group")
    , $messages = $formGroup.find(".messages");

  $input.removeClass("is-valid is-invalid");
  $messages.removeClass("invalid-feedback valid-feedback").empty();

  if (errors) {
    $input.addClass("is-invalid");
    $messages.addClass("invalid-feedback");
    _.each(errors, function(error) {
      $("<p/>").text(error).appendTo($messages);
    });
  } else {
    $input.addClass("is-valid");
    $messages.addClass("valid-feedback");
  }
}

showErrors = function($form, errors) {
  $form.find("input[name]").each(function() {
    showErrorsForInput($(this), errors[this.name]);
  });
}

clearErrors = function($form) {
  $('.messages', $form).removeClass("invalid-feedback valid-feedback").empty();
  $('input', $form).removeClass("is-valid is-invalid");
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
  checkPermission: checkPermission
}
