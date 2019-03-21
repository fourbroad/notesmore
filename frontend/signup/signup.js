import * as $ from 'jquery';
import 'bootstrap';
import moment from 'moment';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import signupHtml from './signup.html';

$.widget('nm.signup', {
  options: {
    
  },

  _create: function(){
    var o = this.options, self = this, client = o.page.getClient();

    this._addClass("nm-signup");
    this.element.html(signupHtml);

  }

});
