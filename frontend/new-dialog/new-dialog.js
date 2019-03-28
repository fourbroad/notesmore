
import Loader from 'core/loader';
import Masonry from 'masonry-layout';

import newDialogHtml from './new-dialog.html';

const client = require('../../lib/client')()
      , uuidv4 = require('uuid/v4');

const { Meta } = client;

$.widget('nm.newdialog', {
  options: {},

  _create: function(){
    var o = this.options, self = this;

    this._addClass('nm-newdialog', 'modal fade');
    this.element.html(newDialogHtml);
    this.element.attr({tabindex:-1, role:'dialog', 'aria-labelledby':'newModalLabel', 'aria-hidden':'true'})
    
    this.element.appendTo('body').modal({show:false});

    this.$metaGrid = $('.masonry', this.element);
    this.$createBtn = $('button.create', this.element);

    this.masonry = new Masonry(this.$metaGrid.get(0), {
      itemSelector: '.masonry-item',
      columnWidth: '.masonry-sizer',
      percentPosition: true,
    });

    this.element.on('shown.bs.modal', function (e) {
      $('.masonry-item', self.$metaGrid).remove();
      Meta.find(currentDomain.id, {size:1000}, function(err, result){
        if(err) return console.log(err);
        var $items = _.reduce(result.metas, function(items, meta){
          var item = $('<div class="masonry-item col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">'
                      +'<div class="meta p-10 bd">'
                        +'<img class="meta-img" alt="Form image">'
                        +'<h6 class="c-grey-900">' + (meta.title||meta.id) +'</h6>'
                      +'</div>'
                    +'</div>').data('item',meta);
          return items.add(item);
        },$());

        self.$metaGrid.append($items);
        self.masonry.appended($items);
        self.masonry.layout();
      });
    });

    this._on(this.$metaGrid, {
      'click .meta': function(e){
        $('.masonry-item.selected', this.$metaGrid).removeClass('selected');
        $(e.currentTarget).parent('.masonry-item').addClass('selected');
      }
    });

    this._on(this.$createBtn, {'click': this._onCreate});
  },

  getSelected: function(){
    return $('.masonry-item.selected', this.$metaGrid).data('item');
  },

  _onCreate: function(e){
    var o = this.options, meta = this.getSelected();
    o.$anchor.trigger('createdocument', [meta.domainId, meta.id]);
    this.element.modal('toggle');
  },

  show: function(){
    this.element.modal('show');
  }
});
