
import PerfectScrollbar from 'perfect-scrollbar';

import './im.scss';
import imHtml from './im.html';

$.widget('nm.im', {
  options:{

  },

  _create:function(){
    var o = this.options, self = this;

    this._addClass('nm-im','full-container');
    this.element.html(imHtml);

    this._on({
      "click #chat-sidebar-toggle": function(e){
        $('#chat-sidebar', self.element).toggleClass('open');
        e.preventDefault();
      }
    });

    const scrollables = $('.scrollable');
    if (scrollables.length > 0) {
      scrollables.each((index, el) => {
        new PerfectScrollbar(el);
      });
    }
  }
});
