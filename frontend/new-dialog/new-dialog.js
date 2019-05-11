
import Masonry from 'masonry-layout';
import './new-dialog.scss';
import newDialogHtml from './new-dialog.html';

$.widget('nm.newdialog', {
  options: {
    i18n:{
      'zh-CN':{
        selectMeta: "请选择元文档类型",
        create: "创建",
        cancel: "取消"
      }      
    }
  },

  _create: function(){
    var o = this.options, _this = this, client = o.client, currentUser = client.currentUser, {Meta, Profile} = client;

    this._addClass('nm-newdialog', 'modal fade');
    this.element.html(newDialogHtml);
    this.element.attr({tabindex:-1, role:'dialog', 'aria-labelledby':'newModalLabel', 'aria-hidden':'true'})
    
    this.element.appendTo('body').modal({show:false});

　　 this.$dialogTitle = $('.title', this.element);
    this.$metaGrid = $('.masonry', this.element);
    this.$createBtn = $('button.create', this.element);
    this.$cancelBtn = $('button.cancel', this.element);

    this.masonry = new Masonry(this.$metaGrid.get(0), {
      itemSelector: '.masonry-item',
      columnWidth: '.masonry-sizer',
      percentPosition: true,
    });

    this.refresh();

    this.element.on('shown.bs.modal', function (e) {
      $('.masonry-item', _this.$metaGrid).remove();

      Profile.get(o.domainId, currentUser.id, function(err, profile){
        if(err) return console.error(err);
        Meta.find(o.domainId, {size:1000}, function(err, result){
          if(err) return console.log(err);
          var $items = _.reduce(result.metas, function(items, meta){
            let permissions = _.at(meta, 'acl.create')[0];
            if (!permissions
              || _.intersection(profile.roles, permissions.roles).length > 0 
              || _.intersection(profile.groups, permissions.groups).length > 0 
              || (permissions.users && permissions.users.indexOf(currentUser.id) >= 0)) {
              let metaLocale = meta.get(o.locale),
              $item = $('<div class="masonry-item col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">'
                      +'<div class="meta p-10 bd">'
                        +'<span class="icon-holder"><i class="'+ meta._meta.iconClass+'"></i></span>'
                        +'<h6>' + (metaLocale.title||metaLocale.id) +'</h6>'
                      +'</div>'
                    +'</div>');
              $('.meta', $item).data('item',meta);
              items = items.add($item);
            }
            return items;
          },$());
          
          _this.$metaGrid.append($items);
          _this.masonry.appended($items);
          _this.masonry.layout();
        });
      });
    });

    this._on(this.$metaGrid, {
      'click .meta': function(e){
        $('.meta.selected', this.$metaGrid).removeClass('selected');
        $(e.currentTarget).addClass('selected');
      }
    });

    this._on(this.$createBtn, {'click': this._onCreate});
  },

  getSelected: function(){
    return $('.meta.selected', this.$metaGrid).data('item');
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },

  _onCreate: function(e){
    var o = this.options, meta = this.getSelected();
    o.$anchor.trigger('createdocument', meta);
    this.element.modal('toggle');
  },

  refresh: function(){
　　 this.$dialogTitle.html(this._i18n('selectMeta', 'Please select a type of meta-document'));
    this.$createBtn.html(this._i18n('create', 'Create'));
    this.$cancelBtn.html(this._i18n('cancel', 'Cancel'));
  },

  show: function(){
    this.refresh();
    this.element.modal('show');
  }
});
