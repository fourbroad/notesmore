import Loader from 'core/loader';
import Masonry from 'masonry-layout';

import newDialogHtml from './new-dialog.html';

$.widget('nm.newdialog', {
  options: {},

  _create: function(){
    var o = this.options, self = this;

    this._addClass('nm-newdialog', 'modal fade');
    this.element.html(newDialogHtml);
    this.element.attr({tabindex:-1, role:'dialog', 'aria-labelledby':'newModalLabel', 'aria-hidden':'true'})
    
    this.element.appendTo('body').modal({show:false});

    this.$formGrid = $('.masonry', this.element);
    this.$createBtn = $('button.create', this.element);

    this.masonry = new Masonry(this.$formGrid.get(0), {
      itemSelector: '.masonry-item',
      columnWidth: '.masonry-sizer',
      percentPosition: true,
    });

    this.element.on('shown.bs.modal', function (e) {
      $('.masonry-item', self.$formGrid).remove();
      o.domain.findForms({}, function(err, forms){
        if(err) return console.log(err);
        var $items = _.reduce(forms.forms, function(items, form){
          var item = $('<div class="masonry-item col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">'
                      +'<div class="form p-10 bd">'
                        +'<img class="form-img" alt="Form image">'
                        +'<h6 class="c-grey-900">' + (form.title||form.id) +'</h6>'
                      +'</div>'
                    +'</div>').data('item',form);
          return items.add(item);
        },$());

        self.$formGrid.append($items);
        self.masonry.appended($items);
        self.masonry.layout();

//         $(window).trigger('hashchange');
      });
    });

    this._on(this.$formGrid, {
      'click .form': function(e){
        var form = $(e.currentTarget).parent('.masonry-item').data('item');
        Loader.load(form.plugin, function(module){
          o.$container.jsonform({
            client: o.client,
            form: form,
            document: {}
          });
        });
      }
    });

    this._on(this.$createBtn, {utap: this._onCreate});
  },

  createDocument: function(form){
    var o = this.options;
    Loader.load(form.plugin, function(module){
      o.$container.jsonform({
        client: o.client,
        form: form,
        document: {}
      });
    });
  },

  getSelected: function(){
    return $('.masonry-item.selected', $formGrid).data('item');
  },

  _onCreate: function(e){
    this.createDocument(getSelected());
  },

  show: function(){
    this.element.modal('show');
  }
});
