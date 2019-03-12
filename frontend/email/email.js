import PerfectScrollbar from 'perfect-scrollbar';

import './email.scss';
import emailHtml from './email.html';

$.widget('nm.email',{
  options:{},

  _create: function(){
    var o = this.options, self = this;

    this._addClass('nm-email', 'full-container');
    this.element.html(emailHtml);

    this.$newMessageBtn = $('.new-message', this.element);
    this.$emailList = $('.email-list', this.element);
    this.$emailContent = $('.email-content', this.element);
    this.$emailCompose = $('.email-compose', this.element);
    this.$emailSideToggle = $('.email-side-toggle', this.element);
    this.$backToMailbox = $('.email-list-item, .back-to-mailbox', this.element);

    const scrollables = $('.scrollable', this.element);
    if (scrollables.length > 0) {
      scrollables.each((index, el) => {
        new PerfectScrollbar(el,{suppressScrollX:true, wheelPropagation: true});
      });
    }

    this._on(this.$emailSideToggle, {
      click: function(e) {
        $('.email-app', this.element).toggleClass('side-active');
        e.preventDefault();
      }
    });

    this._on(this.$backToMailbox, {
      click: function(e) {
        $('.email-content',this.element).toggleClass('open');
        e.preventDefault();
      }
    });

    this._on(this.$newMessageBtn, {
      click: function(e) {
        this.$emailList.toggleClass('d-none');
        this.$emailContent.toggleClass('d-none');
        this.$emailCompose.toggleClass('d-none');
      }
    });
  }
});