
import PerfectScrollbar from 'perfect-scrollbar';

import './chat.scss';
import chatHtml from './chat.html';

$.widget('nm.chat', {
  options:{

  },

  _create:function(){
    var o = this.options, self = this;

    this._addClass('nm-chat','full-container');
    this.element.html(chatHtml);

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
