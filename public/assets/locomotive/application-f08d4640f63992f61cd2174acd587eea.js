(function() {
  window.Locomotive = {
    mounted_on: window.Locomotive.mounted_on,
    Views: {
      CustomFields: {}
    },
    Flags: {}
  };

}).call(this);
(function() {
  var View;

  View = Backbone.View;

  Backbone.View = View.extend({
    constructor: function(options) {
      this.options = options || {};
      return View.apply(this, arguments);
    },
    replace: function($new_el) {
      var _view;
      $(this.el).hide();
      $new_el.insertAfter($(this.el));
      _view = new this.constructor({
        el: $new_el
      });
      _view.render();
      this.remove();
      return _view;
    }
  });

}).call(this);
(function() {
  String.prototype.trim = function() {
    return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
  }

  String.prototype.repeat = function(num) {
    for (var i = 0, buf = ""; i < num; i++) buf += this;
    return buf;
  }

  String.prototype.truncate = function(length) {
    if (this.length > length) {
      return this.slice(0, length - 3) + '...';
    } else {
      return this;
    }
  }

  String.prototype.slugify = function(sep) {
    if (typeof sep == 'undefined') sep = '_';
    var alphaNumRegexp = new RegExp('[^\\w\\' + sep + ']', 'g');
    var avoidDuplicateRegexp = new RegExp('[\\' + sep + ']{2,}', 'g');
    return this.replace(/\s/g, sep).replace(alphaNumRegexp, '').replace(avoidDuplicateRegexp, sep).toLowerCase();
  }

  window.addParameterToURL = function(key, value, context) { // code from http://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
    if (typeof context == 'undefined') context = document;

    key = encodeURIComponent(key); value = encodeURIComponent(value);

    var kvp = context.location.search.substr(1).split('&');

    var i = kvp.length; var x; while(i--) {
      x = kvp[i].split('=');

      if (x[0] == key) {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
      }
    }

    if (i < 0) { kvp[kvp.length] = [key,value].join('='); }

    //this will reload the page, it's likely better to store this until finished
    context.location.search = kvp.join('&');
  }

  window.addJavascript = function(doc, src, options) {
    var script = doc.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    if (options && options.onload) {
      script.onload = options.onload;
      delete(options.onload);
    }
    for (var key in options) {
      script.setAttribute(key, options[key]);
    }
    doc.body.appendChild(script);
  }

  window.addStylesheet = function(doc, src, options) {
    var stylesheet = doc.createElement('link');
    stylesheet.style = 'text/css';
    stylesheet.href = src;
    stylesheet.media = 'screen';
    stylesheet.rel = 'stylesheet';
    doc.head.appendChild(stylesheet);
  }

  $.ui.dialog.prototype.overlayEl = function() { return this.overlay.$el; }

})();

(function() {
  (function() {
    return window.remote_file_to_base64 = function(url, callback) {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob, reader;
        if (this.status === 200) {
          blob = this.response;
          reader = new window.FileReader();
          reader.readAsDataURL(blob);
          return reader.onloadend = function() {
            return callback(reader.result);
          };
        } else {
          return callback(null);
        }
      };
      xhr.onerror = function(event) {
        return callback(null);
      };
      return xhr.send();
    };
  })();

}).call(this);
(function() {
  $(function() {
    jQuery.fn.equalize = function() {
      var items, max;
      items = this;
      max = -1;
      this.find_max = function() {
        return $(items).each(function() {
          var h;
          h = $(this).height();
          return max = Math.max(h, max);
        });
      };
      this.apply_max = function() {
        return $(items).css({
          'min-height': max
        });
      };
      this.find_max();
      this.apply_max();
      return this;
    };
    return $('section.main > *').equalize();
  });

}).call(this);
(function() {
  Locomotive.notify = function(message, type) {
    var icon;
    icon = type === 'danger' ? 'exclamation-triangle' : type === 'success' ? 'check' : 'exclamation-circle';
    return $.notify({
      message: message,
      icon: "fa fa-" + icon
    }, {
      type: type,
      placement: {
        from: 'bottom',
        align: 'right'
      }
    });
  };

}).call(this);
(function() {
  NProgress.configure({
    showSpinner: false,
    ease: 'ease',
    speed: 500,
    parent: '.content'
  });

}).call(this);
(function() {
  $.rails.safe_confirm = function(question) {
    return prompt(question.question) === question.answer;
  };

  $.rails.allowAction = function(element) {
    var answer, callback, message, question;
    message = element.data('confirm');
    question = element.data('safe-confirm');
    answer = false;
    callback = null;
    if (!message && !question) {
      return true;
    }
    if ($.rails.fire(element, 'confirm')) {
      if (message) {
        answer = $.rails.confirm(message);
      } else if (question) {
        answer = $.rails.safe_confirm(question);
      }
      callback = $.rails.fire(element, 'confirm:complete', [answer]);
    }
    return answer && callback;
  };

  $.rails.ajax = function(options) {
    if (_.isArray(options.data)) {
      return $.ajax(_.extend(options, {
        contentType: false
      }));
    } else {
      return $.ajax(options);
    }
  };

  $(function() {
    $('body').delegate($.rails.formSubmitSelector, 'ajax:beforeSend', function(event, xhr, settings) {
      return xhr.setRequestHeader('X-Flash', true);
    });
    $('body').delegate($.rails.formSubmitSelector, 'ajax:complete', function(event, xhr, status) {
      var message, type;
      $(this).find('button[type=submit], input[type=submit]').button('reset');
      if (message = xhr.getResponseHeader('X-Message')) {
        type = status === 'success' ? 'success' : 'error';
        return Locomotive.notify(decodeURIComponent($.parseJSON(message)), type);
      }
    });
    $('body').delegate($.rails.formSubmitSelector, 'ajax:aborted:file', function(element) {
      $.rails.handleRemote($(this));
      return false;
    });
    return $('body').delegate($.rails.formSubmitSelector, 'ajax:beforeSend', function(event, xhr, settings) {
      settings.data = new FormData($(this)[0]);
      $(this).find('input[type=file]').each(function() {
        return settings.data.append($(this).attr('name'), this.files[0]);
      });
      return true;
    });
  });

}).call(this);
(function() {
  Select2.helpers = (function() {
    var build_results, default_build_options;
    default_build_options = function(input) {
      return {
        minimumInputLength: 1,
        quietMillis: 100,
        formatNoMatches: input.data('no-matches'),
        formatSearching: input.data('searching'),
        formatInputTooShort: input.data('too-short'),
        ajax: {
          url: input.data('list-url'),
          data: function(term, page) {
            return {
              q: term,
              page: page
            };
          },
          results: function(data, page) {
            return {
              results: build_results(data, input.data('label-method'), input.data('group-by')),
              more: data.length === input.data('per-page')
            };
          }
        }
      };
    };
    build_results = function(raw_data, label_method, group_by) {
      return _.tap([], (function(_this) {
        return function(list) {
          return _.each(raw_data, function(data) {
            var group, group_name;
            if ((_this.collection == null) || (_this.collection.get(data._id) == null)) {
              data.text = data[label_method];
              if (group_by != null) {
                group_name = _.result(data, group_by);
                group = _.find(list, function(_group) {
                  return _group.text === group_name;
                });
                if (group == null) {
                  group = {
                    text: group_name,
                    children: []
                  };
                  list.push(group);
                }
                return group.children.push(data);
              } else {
                return list.push(data);
              }
            }
          });
        };
      })(this));
    };
    return {
      build: function(input, options) {
        var _options;
        options || (options = {});
        _options = _.extend(default_build_options(input), options);
        return input.select2(_options);
      }
    };
  })();

}).call(this);
(function() {
  wysihtml5.commands.strike = {
    exec: function(composer, command, param) {
      return wysihtml5.commands.formatInline.exec(composer, command, 'strike');
    },
    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, 'strike');
    }
  };

  (function(wysihtml5) {
    var CLASS_NAME, REG_EXP;
    CLASS_NAME = "wysiwyg-text-align-justify";
    REG_EXP = /wysiwyg-text-align-[0-9a-z]+/g;
    return wysihtml5.commands.justifyFull = {
      exec: function(composer, command, param) {
        return wysihtml5.commands.formatBlock.exec(composer, 'formatBlock', null, CLASS_NAME, REG_EXP);
      },
      state: function(composer, command) {
        return wysihtml5.commands.formatBlock.state(composer, "formatBlock", null, CLASS_NAME, REG_EXP);
      }
    };
  })(wysihtml5);

  (function(wysihtml5) {
    return wysihtml5.commands.insertFile = {
      exec: function(composer, command, param) {
        return console.log("[insertFile] exec(" + command + ", " + param + ")");
      },
      state: function(composer, command) {
        return wysihtml5.commands.insertImage.state(composer, command, "IMG");
      }
    };
  })(wysihtml5);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.FormView = (function(superClass) {
    extend(FormView, superClass);

    function FormView() {
      return FormView.__super__.constructor.apply(this, arguments);
    }

    FormView.prototype.el = '.main';

    FormView.prototype.namespace = null;

    FormView.prototype.events = {
      'submit form': 'save'
    };

    FormView.prototype.render = function() {
      this.inputs = [];
      this.display_active_nav();
      this.enable_hover();
      this.enable_file_inputs();
      this.enable_array_inputs();
      this.enable_toggle_inputs();
      this.enable_date_inputs();
      this.enable_datetime_inputs();
      this.enable_text_inputs();
      this.enable_rte_inputs();
      this.enable_tags_inputs();
      this.enable_document_picker_inputs();
      this.enable_select_inputs();
      return this;
    };

    FormView.prototype.display_active_nav = function() {
      var name, url;
      url = document.location.toString();
      if (url.match('#')) {
        name = url.split('#')[1];
        return this.$(".nav-tabs a[href='#" + name + "']").tab('show');
      }
    };

    FormView.prototype.record_active_tab = function() {
      var tab_name;
      if ($('form .nav-tabs li.active a').size() > 0) {
        tab_name = $('form .nav-tabs li.active a').attr('href').replace('#', '');
        return this.$('#active_tab').val(tab_name);
      }
    };

    FormView.prototype.change_state = function() {
      return this.$('form button[type=submit]').button('loading');
    };

    FormView.prototype.reset_state = function() {
      return this.$('form button[type=submit]').button('reset');
    };

    FormView.prototype.save = function(event) {
      this.change_state();
      return this.record_active_tab();
    };

    FormView.prototype.enable_hover = function() {
      return $('.form-group.input').hover(function() {
        return $(this).addClass('hovered');
      }, function() {
        return $(this).removeClass('hovered');
      });
    };

    FormView.prototype.enable_file_inputs = function() {
      var self;
      self = this;
      return this.$('.input.file').each(function() {
        var view;
        view = new Locomotive.Views.Inputs.FileView({
          el: $(this)
        });
        view.render();
        return self.inputs.push(view);
      });
    };

    FormView.prototype.enable_array_inputs = function() {
      var self;
      self = this;
      return this.$('.input.array').each(function() {
        var view;
        view = new Locomotive.Views.Inputs.ArrayView({
          el: $(this)
        });
        view.render();
        return self.inputs.push(view);
      });
    };

    FormView.prototype.enable_toggle_inputs = function() {
      return this.$('.input.toggle input[type=checkbox]').each(function() {
        var $toggle;
        $toggle = $(this);
        $toggle.data('label-text', ($toggle.is(':checked') ? $toggle.data('off-text') : $toggle.data('on-text')));
        return $toggle.bootstrapSwitch({
          onSwitchChange: function(event, state) {
            return $toggle.data('bootstrap-switch').labelText((state ? $toggle.data('off-text') : $toggle.data('on-text')));
          }
        });
      });
    };

    FormView.prototype.enable_date_inputs = function() {
      return this.$('.input.date input[type=text]').each(function() {
        return $(this).datetimepicker({
          language: window.content_locale,
          pickTime: false,
          widgetParent: '.main',
          format: $(this).data('format')
        });
      });
    };

    FormView.prototype.enable_datetime_inputs = function() {
      return this.$('.input.date-time input[type=text]').each(function() {
        return $(this).datetimepicker({
          language: window.content_locale,
          pickTime: true,
          widgetParent: '.main',
          use24hours: true,
          useseconds: false,
          format: $(this).data('format')
        });
      });
    };

    FormView.prototype.enable_text_inputs = function() {
      var self;
      self = this;
      return this.$('.input.text').each(function() {
        var view;
        view = new Locomotive.Views.Inputs.TextView({
          el: $(this)
        });
        view.render();
        return self.inputs.push(view);
      });
    };

    FormView.prototype.enable_rte_inputs = function() {
      var self;
      self = this;
      return this.$('.input.rte').each(function() {
        var view;
        view = new Locomotive.Views.Inputs.RteView({
          el: $(this)
        });
        view.render();
        return self.inputs.push(view);
      });
    };

    FormView.prototype.enable_tags_inputs = function() {
      return this.$('.input.tags input[type=text]').tagsinput();
    };

    FormView.prototype.enable_select_inputs = function() {
      return this.$('.input.select select:not(.disable-select2)').select2();
    };

    FormView.prototype.enable_document_picker_inputs = function() {
      var self;
      self = this;
      return this.$('.input.document_picker').each(function() {
        var view;
        view = new Locomotive.Views.Inputs.DocumentPickerView({
          el: $(this)
        });
        view.render();
        return self.inputs.push(view);
      });
    };

    FormView.prototype.remove = function() {
      _.each(this.inputs, function(view) {
        return view.remove();
      });
      this.$('.input.tags input[type=text]').tagsinput('destroy');
      return this.$('.input.select select').select2('destroy');
    };

    FormView.prototype._stop_event = function(event) {
      return event.stopPropagation() & event.preventDefault();
    };

    return FormView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Accounts || (base.Accounts = {});

  Locomotive.Views.Accounts.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      return NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.el = '.main';

    return NewView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Locomotive.Views.ApplicationView = (function(superClass) {
    extend(ApplicationView, superClass);

    function ApplicationView() {
      return ApplicationView.__super__.constructor.apply(this, arguments);
    }

    ApplicationView.prototype.el = 'body';

    ApplicationView.prototype.events = {
      'click .navbar .navbar-toggle': 'slide_sidebar'
    };

    ApplicationView.prototype.initialize = function() {
      this.header_view = new Locomotive.Views.Shared.HeaderView();
      this.sidebar_view = new Locomotive.Views.Shared.SidebarView();
      return this.drawer_view = new Locomotive.Views.Shared.DrawerView();
    };

    ApplicationView.prototype.render = function() {
      this.render_flash_messages(this.options.flash);
      this.sidebar_view.render();
      this.drawer_view.render();
      this.set_max_height();
      this.automatic_max_height();
      if (this.options.view != null) {
        this.view = new this.options.view(this.options.view_data || {});
        this.view.render();
      }
      return this;
    };

    ApplicationView.prototype.slide_sidebar = function(event) {
      return $('body').toggleClass('slide-right-sidebar');
    };

    ApplicationView.prototype.render_flash_messages = function(messages) {
      return _.each(messages, function(couple) {
        return Locomotive.notify(couple[1], couple[0]);
      });
    };

    ApplicationView.prototype.automatic_max_height = function() {
      return $(window).on('resize', (function(_this) {
        return function() {
          return _this.set_max_height();
        };
      })(this));
    };

    ApplicationView.prototype.set_max_height = function() {
      var height, max_height;
      max_height = $(window).height();
      height = max_height - this.header_view.height();
      return this.$('> .wrapper').height(height);
    };

    return ApplicationView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentAssets || (base.ContentAssets = {});

  Locomotive.Views.ContentAssets.DropzoneView = (function(superClass) {
    extend(DropzoneView, superClass);

    function DropzoneView() {
      return DropzoneView.__super__.constructor.apply(this, arguments);
    }

    DropzoneView.prototype.events = {
      'click a.upload': 'open_file_browser',
      'dragover': 'hover',
      'dragleave': 'unhover',
      'dragenter': '_stop_event',
      'drop': 'drop_files',
      'change input[type=file]': 'drop_files'
    };

    DropzoneView.prototype.render = function() {
      console.log('[DropzoneView] rendering');
      return DropzoneView.__super__.render.apply(this, arguments);
    };

    DropzoneView.prototype.hover = function(event) {
      this._stop_event(event);
      return $(this.el).addClass('hovered');
    };

    DropzoneView.prototype.unhover = function(event) {
      this._stop_event(event);
      return $(this.el).removeClass('hovered');
    };

    DropzoneView.prototype.show_progress = function(value) {
      return this.$('.progress').removeClass('hide').find('> .progress-bar').width(value + "%");
    };

    DropzoneView.prototype.reset_progress = function() {
      return setTimeout((function(_this) {
        return function() {
          return _this.$('.progress').addClass('hide').find('> .progress-bar').width('0%');
        };
      })(this), 400);
    };

    DropzoneView.prototype.open_file_browser = function(event) {
      console.log('[DropzoneView] open_file_browser');
      this._stop_event(event);
      return this.$('form input[type=file]').trigger('click');
    };

    DropzoneView.prototype.drop_files = function(event) {
      var form_data;
      console.log('[DropzoneView] drop_files');
      this._stop_event(event) & this.unhover(event);
      form_data = new FormData();
      _.each(event.target.files || event.originalEvent.dataTransfer.files, function(file, i) {
        return form_data.append("content_assets[][source]", file);
      });
      return this.upload_files(form_data);
    };

    DropzoneView.prototype.upload_files = function(data) {
      return $.ajax(this._ajax_options(data)).always((function(_this) {
        return function() {
          return _this.reset_progress();
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this.$('.instructions').effect('shake');
        };
      })(this)).done((function(_this) {
        return function() {
          console.log('uploaded');
          return _this._refresh();
        };
      })(this));
    };

    DropzoneView.prototype._refresh = function() {
      var $link;
      $link = this.$('a.refresh');
      if ($link.data('remote')) {
        return $link.trigger('click');
      } else {
        return $link[0].click();
      }
    };

    DropzoneView.prototype._ajax_options = function(data) {
      return {
        url: $(this.el).data('url'),
        type: 'POST',
        xhr: (function(_this) {
          return function() {
            return _this._build_xhr();
          };
        })(this),
        data: data,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false
      };
    };

    DropzoneView.prototype._build_xhr = function() {
      return _.tap($.ajaxSettings.xhr(), (function(_this) {
        return function(xhr) {
          if (xhr.upload) {
            return xhr.upload.addEventListener('progress', function(progress) {
              return _this.show_progress(~~((progress.loaded / progress.total) * 100));
            });
          }
        };
      })(this));
    };

    DropzoneView.prototype._stop_event = function(event) {
      event.stopPropagation() & event.preventDefault();
      return true;
    };

    return DropzoneView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentAssets || (base.ContentAssets = {});

  Locomotive.Views.ContentAssets.EditImageView = (function(superClass) {
    extend(EditImageView, superClass);

    function EditImageView() {
      return EditImageView.__super__.constructor.apply(this, arguments);
    }

    EditImageView.prototype.events = {
      'click .apply-btn': 'apply',
      'click .resize-btn': 'toggle_resize_modal',
      'click .crop-btn': 'enable_crop'
    };

    EditImageView.prototype.initialize = function() {
      _.bindAll(this, 'change_size', 'apply_resizing', 'cancel_resizing', 'update_cropper_label');
      return EditImageView.__super__.initialize.apply(this, arguments);
    };

    EditImageView.prototype.render = function() {
      this.filename = this.$('.image-container').data('filename');
      this.width = parseInt(this.$('.image-container').data('width'));
      this.height = parseInt(this.$('.image-container').data('height'));
      this.ratio = this.width / this.height;
      this.create_cropper();
      return this.create_resize_popover();
    };

    EditImageView.prototype.create_cropper = function() {
      this.$cropper = this.$('.image-container > img');
      this.cropper_enabled = false;
      this.set_cropper_height();
      return this.$cropper.cropper({
        autoCrop: false,
        done: this.update_cropper_label
      });
    };

    EditImageView.prototype.create_resize_popover = function() {
      var container;
      this.$link = this.$('.resize-btn');
      this.$content = this.$('.resize-form').show();
      this.$content.find('input').on('keyup', this.change_size);
      this.$content.find('.apply-resizing-btn').on('click', this.apply_resizing);
      this.$content.find('.cancel-resizing-btn').on('click', this.cancel_resizing);
      container = $('.drawer').size() > 0 ? '.drawer' : '.main';
      this.$link.popover({
        container: container,
        placement: 'left',
        content: this.$content,
        html: true,
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><form><div class="popover-content"></div></form></div>'
      });
      return this.$link.data('bs.popover').setContent();
    };

    EditImageView.prototype.enable_crop = function(event) {
      this.cropper_enabled = true;
      this.$cropper.cropper('clear');
      return this.$cropper.cropper('setDragMode', 'crop');
    };

    EditImageView.prototype.toggle_resize_modal = function(event) {
      var state;
      state = this.resize_modal_opened ? 'hide' : 'show';
      this.$link.popover(state);
      return this.resize_modal_opened = !this.resize_modal_opened;
    };

    EditImageView.prototype.change_size = function(event) {
      var $input, _value, value;
      $input = $(event.target);
      value = parseInt($input.val().replace(/\D+/, ''));
      if (_.isNaN(value)) {
        return;
      }
      $input.val(value);
      if ($input.attr('name') === 'image_resize_form[width]') {
        _value = Math.round(value / this.ratio);
        return this._resize_input_el('height').val(_value);
      } else {
        _value = Math.round(value * this.ratio);
        return this._resize_input_el('width').val(_value);
      }
    };

    EditImageView.prototype.apply_resizing = function(event) {
      var $btn, height, width;
      event.stopPropagation() & event.preventDefault();
      width = parseInt(this._resize_input_el('width').val());
      height = parseInt(this._resize_input_el('height').val());
      if (_.isNaN(width) || _.isNaN(height)) {
        return;
      }
      $btn = $(event.target).button('loading');
      return window.resizeImageStep(this.$cropper[0], width, height).then((function(_this) {
        return function(image) {
          _this.width = width;
          _this.height = height;
          _this.cropper_enabled = true;
          _this.$cropper.cropper('replace', image.src);
          _this.set_cropper_height();
          $btn.button('reset');
          return _this.toggle_resize_modal();
        };
      })(this));
    };

    EditImageView.prototype.cancel_resizing = function(event) {
      event.stopPropagation() & event.preventDefault();
      return this.toggle_resize_modal();
    };

    EditImageView.prototype.apply = function(event) {
      var $link, blob, form_data, image_url;
      event.stopPropagation() & event.preventDefault();
      if (!this.cropper_enabled) {
        return;
      }
      $link = $(event.target).closest('.apply-btn');
      image_url = this.$cropper.cropper('getDataURL') || this.$cropper.attr('src');
      blob = window.dataURLtoBlob(image_url);
      form_data = new FormData();
      form_data.append('xhr', true);
      form_data.append('content_asset[source]', blob, this.filename);
      return $.ajax({
        url: $link.data('url'),
        type: 'POST',
        data: form_data,
        processData: false,
        contentType: false,
        success: (function(_this) {
          return function(data) {
            if (_this.options.on_apply_callback != null) {
              _this.options.on_apply_callback(data);
            }
            return _this.options.drawer.close();
          };
        })(this)
      });
    };

    EditImageView.prototype.set_cropper_height = function() {
      var container_height;
      container_height = this.$('.edit-assets-container').height();
      if (this.height < 150) {
        return this.$('.image-container').css('max-height', this.height * 2);
      } else if (this.height < container_height) {
        return this.$('.image-container').css('max-height', this.height);
      } else {
        return this.$('.image-container').css('max-height', 'inherit');
      }
    };

    EditImageView.prototype.update_cropper_label = function(data) {
      var $dragger, $label, height, width;
      $dragger = this.$('.cropper-dragger');
      width = Math.round(data.width);
      height = Math.round(data.height);
      $label = $dragger.find('> .cropper-label');
      if ($label.size() === 0) {
        $label = $dragger.append('<span class="cropper-label"><span>').find('> .cropper-label');
      }
      return $label.html(width + " x " + height);
    };

    EditImageView.prototype._resize_input_el = function(property) {
      var name;
      name = "image_resize_form[" + property + "]";
      return this.$content.find("input[name=\"" + name + "\"]");
    };

    EditImageView.prototype.remove = function() {
      console.log('[EditView] remove');
      this.$cropper.cropper('destroy');
      this.$link.popover('destroy');
      return EditImageView.__super__.remove.apply(this, arguments);
    };

    return EditImageView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentAssets || (base.ContentAssets = {});

  Locomotive.Views.ContentAssets.IndexView = (function(superClass) {
    extend(IndexView, superClass);

    function IndexView() {
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.el = '.main';

    IndexView.prototype.events = {
      'click .header-row a.upload': 'open_file_browser',
      'click a.edit': 'open_edit_drawer'
    };

    IndexView.prototype.initialize = function() {
      _.bindAll(this, 'set_sidebar_max_height');
      this.refresh_url = this.$('.content-assets').data('refresh-url');
      return this.dropzone = new Locomotive.Views.ContentAssets.DropzoneView({
        el: this.$('.dropzone')
      });
    };

    IndexView.prototype.render = function() {
      this.dropzone.render();
      this.automatic_sidebar_max_height();
      this.set_sidebar_max_height();
      return IndexView.__super__.render.apply(this, arguments);
    };

    IndexView.prototype.open_edit_drawer = function(event) {
      var $link;
      console.log('[IndexView] open_edit_drawer');
      event.stopPropagation() & event.preventDefault();
      $link = $(event.target);
      return window.application_view.drawer_view.open($link.attr('href'), Locomotive.Views.ContentAssets.EditImageView, {
        on_apply_callback: (function(_this) {
          return function(data) {
            return window.location.href = _this.refresh_url;
          };
        })(this)
      });
    };

    IndexView.prototype.hide_from_drawer = function(stack_size) {
      console.log('[IndexView] hide_from_drawer');
      if (this.options.parent_view && stack_size === 0) {
        return this.options.parent_view.opened.picker = false;
      }
    };

    IndexView.prototype.open_file_browser = function(event) {
      return this.dropzone.open_file_browser(event);
    };

    IndexView.prototype.automatic_sidebar_max_height = function() {
      return $(window).on('resize', this.set_sidebar_max_height);
    };

    IndexView.prototype.set_sidebar_max_height = function() {
      var main_height, max_height;
      main_height = $(this.el).height();
      max_height = this.$('.content-assets').height();
      if (main_height > max_height) {
        max_height = main_height;
      }
      return $(this.dropzone.el).height(max_height);
    };

    IndexView.prototype.remove = function() {
      $(window).off('resize', this.set_sidebar_max_height);
      return this.dropzone.remove();
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentAssets || (base.ContentAssets = {});

  Locomotive.Views.ContentAssets.PickerView = (function(superClass) {
    extend(PickerView, superClass);

    function PickerView() {
      return PickerView.__super__.constructor.apply(this, arguments);
    }

    PickerView.prototype.events = {
      'click a.select': 'select',
      'click a.edit': 'open_edit_drawer'
    };

    PickerView.prototype.ajaxified_elements = ['.nav-tabs a', '.pagination a', '.search-bar form', '.asset a.remove', 'a.refresh'];

    PickerView.prototype.render = function() {
      console.log('[PickerView] rendering');
      this.ajaxify();
      this.enable_dropzone();
      return PickerView.__super__.render.apply(this, arguments);
    };

    PickerView.prototype.ajaxify = function() {
      var i, len, ref, results, selector;
      ref = this.ajaxified_elements;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selector = ref[i];
        results.push($(this.el).on('ajax:success', selector, (function(_this) {
          return function(event, data, status, xhr) {
            return _this.$('.updatable').html($(data).find('.updatable').html());
          };
        })(this)));
      }
      return results;
    };

    PickerView.prototype.unajaxify = function() {
      var i, len, ref, results, selector;
      ref = this.ajaxified_elements;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selector = ref[i];
        results.push($(this.el).off('ajax:success', selector));
      }
      return results;
    };

    PickerView.prototype.select = function(event) {
      var $link;
      console.log('[PickerView] select');
      event.stopPropagation() & event.preventDefault();
      $link = $(event.target);
      return PubSub.publish('file_picker.select', {
        parent_view: this.options.parent_view,
        image: $link.data('image'),
        title: $link.attr('title'),
        url: $link.attr('href'),
        filename: $link.attr('href').split(/[\\\/]/).pop()
      });
    };

    PickerView.prototype.open_edit_drawer = function(event) {
      var $link;
      console.log('[PickerView] open_edit_drawer');
      event.stopPropagation() & event.preventDefault();
      $link = $(event.target);
      return window.application_view.drawer_view.open($link.attr('href'), Locomotive.Views.ContentAssets.EditImageView);
    };

    PickerView.prototype.enable_dropzone = function() {
      return this.dropzone = new Locomotive.Views.ContentAssets.DropzoneView({
        el: this.$('.dropzone')
      }).render();
    };

    PickerView.prototype.hide_from_drawer = function(stack_size) {
      console.log('[PickerView] hide_from_drawer');
      if (this.options.parent_view && this.options.parent_view.hide_from_picker) {
        return this.options.parent_view.hide_from_picker(stack_size);
      }
    };

    PickerView.prototype.remove = function() {
      console.log('[PickerView] remove');
      this.unajaxify();
      this.dropzone.remove();
      return PickerView.__super__.remove.apply(this, arguments);
    };

    return PickerView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentEntries || (base.ContentEntries = {});

  Locomotive.Views.ContentEntries.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentEntries || (base.ContentEntries = {});

  Locomotive.Views.ContentEntries.IndexView = (function(superClass) {
    extend(IndexView, superClass);

    function IndexView() {
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.el = '.main';

    IndexView.prototype.initialize = function() {
      return this.list_view = new Locomotive.Views.Shared.ListView({
        el: this.$('.big-list')
      });
    };

    IndexView.prototype.render = function() {
      return this.list_view.render();
    };

    IndexView.prototype.remove = function() {
      this.list_view.remove();
      return IndexView.__super__.remove.call(this);
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).ContentEntries || (base.ContentEntries = {});

  Locomotive.Views.ContentEntries.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      return NewView.__super__.constructor.apply(this, arguments);
    }

    return NewView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).CurrentSite || (base.CurrentSite = {});

  Locomotive.Views.CurrentSite.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views.CustomFields).SelectOptions || (base.SelectOptions = {});

  Locomotive.Views.CustomFields.SelectOptions.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    EditView.prototype.events = {
      'click .buttons .edit': 'start_inline_editing',
      'click .editable .apply': 'apply_inline_editing',
      'click .editable .cancel': 'cancel_inline_editing'
    };

    EditView.prototype.start_inline_editing = function(event) {
      var $button, $cancel_button, $input, $label, $row;
      this._stop_event(event);
      $row = $(event.target).parents('.inner-row');
      $label = $row.find('.editable > span').addClass('hide');
      $input = $label.next('input').removeClass('hide');
      $button = $input.next('.btn').removeClass('hide');
      $cancel_button = $button.next('.btn').removeClass('hide');
      return $input.data('previous', $input.val());
    };

    EditView.prototype.apply_inline_editing = function(event) {
      var $button, $cancel_button, $input, $label;
      this._stop_event(event);
      $button = $(event.target).closest('.btn').addClass('hide');
      $cancel_button = $button.next('.btn').addClass('hide');
      $input = $button.prev('input').addClass('hide');
      return $label = $input.prev('span').html($input.val()).removeClass('hide');
    };

    EditView.prototype.cancel_inline_editing = function(event) {
      var $button, $cancel_button, $input, $label;
      this._stop_event(event);
      $cancel_button = $(event.target).closest('.btn').addClass('hide');
      $button = $cancel_button.prev('.btn').addClass('hide');
      $input = $button.prev('input').addClass('hide');
      $input.val($input.data('previous'));
      return $label = $input.prev('span').html($input.val()).removeClass('hide');
    };

    EditView.prototype.mark_as_destroyed = function(event) {
      var $destroy_input;
      $destroy_input = $(event.target).parents('.item').find('.mark-as-destroyed');
      if ($destroy_input.size() > 0) {
        return $destroy_input.val('1');
      }
    };

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Dashboard || (base.Dashboard = {});

  Locomotive.Views.Dashboard.ShowView = (function(superClass) {
    extend(ShowView, superClass);

    function ShowView() {
      return ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.el = '.main';

    ShowView.prototype.infinite_activity_button = 'a[data-behavior~=load-more]';

    ShowView.prototype.events = {
      'ajax:beforeSend  a[data-behavior~=load-more]': 'loading_activity_feed',
      'ajax:success     a[data-behavior~=load-more]': 'refresh_activity_feed'
    };

    ShowView.prototype.loading_activity_feed = function(event) {
      return $(event.target).button('loading');
    };

    ShowView.prototype.refresh_activity_feed = function(event, data, status, xhr) {
      var $btn, $last, $new_btn, $response;
      $btn = $(event.target).button('reset');
      $last = this.$('.activity-feed > li:last-child');
      $response = $(data);
      $response.find('.activity-feed > li').appendTo(this.$('.activity-feed'));
      if (($new_btn = $response.find(this.infinite_activity_button)).size() > 0) {
        $btn.replaceWith($new_btn);
      } else {
        this.$(this.infinite_activity_button).hide();
      }
      return $(this.el).parent().animate({
        scrollTop: $last.offset().top + 'px'
      }, 2000);
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).DevelopersDocumentation || (base.DevelopersDocumentation = {});

  Locomotive.Views.DevelopersDocumentation.ShowView = (function(superClass) {
    extend(ShowView, superClass);

    function ShowView() {
      return ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.el = '.main';

    ShowView.prototype.render = function() {
      ShowView.__super__.render.call(this);
      return hljs.initHighlightingOnLoad();
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).EditableElements || (base.EditableElements = {});

  Locomotive.Views.EditableElements.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.content > .inner';

    EditView.prototype.render = function() {
      EditView.__super__.render.apply(this, arguments);
      $('form.edit_page').on('ajax:success', (function(_this) {
        return function(event, data, status, xhr) {
          if (_this.need_reload != null) {
            return window.location.reload();
          } else {
            return _this.refresh_inputs($(data));
          }
        };
      })(this));
      $('.info-row select[name=block]').select2().on('change', (function(_this) {
        return function(event) {
          return _this.filter_elements_by(event.val);
        };
      })(this));
      return $('.editable-elements .form-group.input.select select').select2().on('change', (function(_this) {
        return function(event) {
          return _this.need_reload = true;
        };
      })(this));
    };

    EditView.prototype.refresh_inputs = function($html) {
      return this.inputs = _.map(this.inputs, (function(_this) {
        return function(view) {
          var $new_el, dom_id;
          if (view.need_refresh == null) {
            return view;
          }
          dom_id = $(view.el).attr('id');
          $new_el = $html.find("#" + dom_id);
          view.replace($new_el);
          return view;
        };
      })(this));
    };

    EditView.prototype.filter_elements_by = function(block) {
      return this.$('.editable-elements .form-group.input').each(function() {
        var $el;
        $el = $(this);
        if (block === '' || (block === '_unknown' && $el.data('block') === '') || $el.data('block') === block) {
          return $el.parent().show();
        } else {
          return $el.parent().hide();
        }
      });
    };

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).EditableElements || (base.EditableElements = {});

  Locomotive.Views.EditableElements.IndexView = (function(superClass) {
    extend(IndexView, superClass);

    function IndexView() {
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.el = '.wrapper';

    IndexView.prototype.events = {
      'click .expand-button': 'expand_preview',
      'click .close-button': 'shrink_preview'
    };

    IndexView.prototype.expand_preview = function(event) {
      return $('body').addClass('full-width-preview');
    };

    IndexView.prototype.shrink_preview = function(event) {
      return $('body').removeClass('full-width-preview');
    };

    IndexView.prototype.initialize = function() {
      var view_options;
      _.bindAll(this, 'refresh_elements', 'refresh_image', 'refresh_image_on_remove', 'refresh_text');
      view_options = $('body').hasClass('live-editing') ? {} : {
        el: '.main'
      };
      this.startup = true;
      this.edit_view = new Locomotive.Views.EditableElements.EditView(view_options);
      this.pubsub_text_token = PubSub.subscribe('inputs.text_changed', this.refresh_text);
      this.pubsub_image_changed_token = PubSub.subscribe('inputs.image_changed', this.refresh_image);
      this.pubsub_image_removed_token = PubSub.subscribe('inputs.image_removed', this.refresh_image_on_remove);
      return $('.preview iframe').load((function(_this) {
        return function(event) {
          return _this.on_iframe_load(event);
        };
      })(this));
    };

    IndexView.prototype.render = function() {
      IndexView.__super__.render.call(this);
      return this.edit_view.render();
    };

    IndexView.prototype.refresh_elements = function(type, view, callback) {
      var $iframe_document, $parent_view, element_id;
      $parent_view = $(view.el).parent();
      element_id = $parent_view.find('input[name*="[id]"]').val();
      $iframe_document = $($('iframe')[0].contentWindow.document);
      return callback($iframe_document.find("*[data-element-id=" + element_id + "]"), element_id, $iframe_document);
    };

    IndexView.prototype.refresh_image_on_remove = function(msg, data) {
      data.url = $(data.view.el).parent().find('input[name*="[default_source_url]"]').val();
      return this.refresh_image(msg, data);
    };

    IndexView.prototype.refresh_image = function(msg, data) {
      return this.refresh_elements('image', data.view, function($elements, element_id, $iframe_document) {
        var $el, current_image_url, image_url;
        current_image_url = data.view.$('input[name*="[content]"]').val();
        image_url = data.url || current_image_url;
        if ($elements.size() > 0) {
          return $elements.each(function() {
            if (this.nodeName === 'IMG') {
              return $(this).attr('src', image_url);
            } else {
              return $(this).css("background-image", "url('" + image_url + "')");
            }
          });
        } else {
          $el = $iframe_document.find("*[style*='" + current_image_url + "']").attr('data-element-id', element_id);
          $el.css("background-image", "url('" + image_url + "')");
          $el = $iframe_document.find("img[src*='" + current_image_url + "']").attr('data-element-id', element_id);
          return $el.attr('src', image_url);
        }
      });
    };

    IndexView.prototype.refresh_text = function(msg, data) {
      return this.refresh_elements('text', data.view, function($elements) {
        return $elements.each(function() {
          return $(this).html(data.content);
        });
      });
    };

    IndexView.prototype.on_iframe_load = function(event) {
      var $iframe, $iframe_document, $target_window, e, editable_elements_path;
      $iframe = $('.preview iframe');
      $target_window = $iframe[0].contentWindow;
      editable_elements_path = null;
      try {
        $iframe_document = $($target_window.document);
        editable_elements_path = $iframe_document.find('meta[name=locomotive-editable-elements-path]').attr('content');
      } catch (_error) {
        e = _error;
        $iframe.attr('src', this.preview_url);
        Locomotive.notify($iframe.data('redirection-error'), 'warning');
        return;
      }
      this.preview_url = $('.preview iframe')[0].contentWindow.document.location.href;
      if ((editable_elements_path != null) && this.startup === false) {
        History.replaceState({
          live_editing: true,
          url: this.preview_url
        }, '', editable_elements_path);
        return this.replace_edit_view(editable_elements_path);
      } else {
        return this.startup = false;
      }
    };

    IndexView.prototype.replace_edit_view = function(url) {
      return $(this.edit_view.el).load(url, (function(_this) {
        return function() {
          _this.edit_view.remove();
          _this.edit_view = new Locomotive.Views.EditableElements.EditView();
          return _this.edit_view.render();
        };
      })(this));
    };

    IndexView.prototype.remove = function() {
      IndexView.__super__.remove.apply(this, arguments);
      this.edit_view.remove();
      PubSub.unsubscribe(this.pubsub_image_changed_token);
      PubSub.unsubscribe(this.pubsub_image_removed_token);
      return PubSub.unsubscribe(this.pubsub_text_token);
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Inputs || (base.Inputs = {});

  Locomotive.Views.Inputs.ArrayView = (function(superClass) {
    extend(ArrayView, superClass);

    function ArrayView() {
      return ArrayView.__super__.constructor.apply(this, arguments);
    }

    ArrayView.prototype.events = {
      'click a.add': 'begin_add_item',
      'keypress input[type=text]': 'begin_add_item_from_enter',
      'click a.delete': 'delete_item'
    };

    ArrayView.prototype.initialize = function() {
      this.$list = this.$('.list');
      this.$new_input = this.$('.new-field .input');
      this.$new_button = this.$('.new-field a');
      return this.template_url = this.$new_button.attr('href');
    };

    ArrayView.prototype.render = function() {
      this.make_sortable();
      this.make_selectable();
      return this.hide_if_empty();
    };

    ArrayView.prototype.make_sortable = function() {
      return this.$list.sortable({
        items: '> .item',
        handle: '.draggable',
        axis: 'y',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        start: function(e, ui) {
          return ui.placeholder.html('<div class="inner">&nbsp;</div>');
        },
        update: (function(_this) {
          return function(e, ui) {
            return _this.$list.find('> .item:not(".hide")').each(function(index) {
              return $(this).find('.position-in-list').val(index);
            });
          };
        })(this)
      });
    };

    ArrayView.prototype.make_selectable = function() {
      if (this.$new_input.prop('tagName') === 'SELECT') {
        return this.make_simple_selectable();
      } else if (this.$new_input.attr('type') === 'hidden') {
        return this.make_remote_selectable();
      }
    };

    ArrayView.prototype.make_remote_selectable = function() {
      return Select2.helpers.build(this.$new_input);
    };

    ArrayView.prototype.make_simple_selectable = function() {
      return this.$new_input.select2({
        containerCssClass: 'form-control',
        formatResult: this.format_select_result,
        formatSelection: this.format_select_result,
        escapeMarkup: function(m) {
          return {
            m: m
          };
        }
      });
    };

    ArrayView.prototype.format_select_result = function(state) {
      var display;
      if (state.id == null) {
        return state.text;
      }
      display = $(state.element).data('display');
      if (display != null) {
        return display;
      } else {
        return state.text;
      }
    };

    ArrayView.prototype.begin_add_item_from_enter = function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      return this.begin_add_item(event);
    };

    ArrayView.prototype.begin_add_item = function(event) {
      var data;
      event.stopPropagation() & event.preventDefault();
      if (!this.is_unique()) {
        return;
      }
      data = {};
      data[this.$new_input.attr('name')] = this.$new_input.val();
      return $.ajax({
        url: this.template_url,
        data: data,
        success: (function(_this) {
          return function(response) {
            return _this.add_item(response);
          };
        })(this)
      });
    };

    ArrayView.prototype.add_item = function(html) {
      this.$list.append(html);
      this.showEl(this.$list);
      return this.reset_input_field();
    };

    ArrayView.prototype.delete_item = function(event) {
      var $destroy_input, $item, $link;
      $link = $(event.target).closest('a');
      if ($link.attr('href') !== '#') {
        return;
      }
      $item = $link.parents('.item');
      $destroy_input = $item.find('.mark-as-destroyed');
      if ($destroy_input.size() > 0) {
        $destroy_input.val('1');
        $item.addClass('hide');
        this.$list.find('> .item.last-child').removeClass('last-child');
        this.$list.find('> .item:not(".hide"):last').addClass('last-child');
      } else {
        $item.remove();
      }
      return this.hide_if_empty();
    };

    ArrayView.prototype.hide_if_empty = function() {
      if (this.$list.find('> .item:not(".hide")').size() === 0) {
        this.hideEl(this.$list);
        if (this.$list.hasClass('new-input-disabled')) {
          return $(this.el).find('> .form-wrapper').hide();
        }
      }
    };

    ArrayView.prototype.is_unique = function() {
      return _.indexOf(this.get_ids(), this.$new_input.val()) === -1;
    };

    ArrayView.prototype.get_ids = function() {
      return _.map(this.$list.find('> .item'), function(item, i) {
        return $(item).data('id');
      });
    };

    ArrayView.prototype.reset_input_field = function() {
      this.$new_input.val('');
      return this.$new_input.select2('val', '');
    };

    ArrayView.prototype.showEl = function(el) {
      return el.removeClass('hide');
    };

    ArrayView.prototype.hideEl = function(el) {
      return el.addClass('hide');
    };

    return ArrayView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Inputs || (base.Inputs = {});

  Locomotive.Views.Inputs.DocumentPickerView = (function(superClass) {
    extend(DocumentPickerView, superClass);

    function DocumentPickerView() {
      return DocumentPickerView.__super__.constructor.apply(this, arguments);
    }

    DocumentPickerView.prototype.initialize = function() {
      DocumentPickerView.__super__.initialize.apply(this, arguments);
      this.$input = this.$('input[type=hidden]');
      return this.$link = this.$('a.edit');
    };

    DocumentPickerView.prototype.render = function() {
      var label;
      label = this.$input.data('label');
      Select2.helpers.build(this.$input, {
        allowClear: true,
        initSelection: function(element, callback) {
          return callback({
            text: label
          });
        }
      });
      return this.$input.on('select2-selecting', (function(_this) {
        return function(el) {
          return _this.$link.addClass('hide');
        };
      })(this));
    };

    DocumentPickerView.prototype.remove = function() {
      this.$input.select2('destroy');
      return DocumentPickerView.__super__.remove.apply(this, arguments);
    };

    return DocumentPickerView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Inputs || (base.Inputs = {});

  Locomotive.Views.Inputs.FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.events = {
      'change input[type=file]': 'change_file',
      'click a.choose': 'begin_choose_file',
      'click a.change': 'begin_change_file',
      'click a.content-assets': 'open_content_assets_drawer',
      'click a.cancel': 'cancel_new_file',
      'click a.delete': 'mark_file_as_deleted'
    };

    FileView.prototype.initialize = function() {
      _.bindAll(this, 'use_content_asset');
      this.$file = this.$('input[type=file]');
      this.$remove_file = this.$('input[type=hidden].remove');
      this.$remote_url = this.$('input[type=hidden].remote-url');
      this.$current_file = this.$('.current-file');
      this.$no_file = this.$('.no-file');
      this.$new_file = this.$('.new-file');
      this.$choose_btn = this.$('.buttons > .choose');
      this.$change_btn = this.$('.buttons > .change');
      this.$cancel_btn = this.$('.buttons .cancel');
      this.$delete_btn = this.$('.buttons .delete');
      this.persisted_file = this.$('.row').data('persisted-file');
      return this.pubsub_token = PubSub.subscribe('file_picker.select', this.use_content_asset);
    };

    FileView.prototype.begin_change_file = function() {
      return this.$file.click();
    };

    FileView.prototype.begin_choose_file = function() {
      return this.$file.click();
    };

    FileView.prototype.open_content_assets_drawer = function(event) {
      event.stopPropagation() & event.preventDefault();
      $(event.target).closest('.btn-group').removeClass('open');
      return window.application_view.drawer_view.open($(event.target).attr('href'), Locomotive.Views.ContentAssets.PickerView, {
        parent_view: this
      });
    };

    FileView.prototype.use_content_asset = function(msg, data) {
      var url;
      if (data.parent_view.cid !== this.cid) {
        return;
      }
      window.application_view.drawer_view.close();
      url = this.absolute_url(data.url);
      return window.remote_file_to_base64(url, (function(_this) {
        return function(base64) {
          if (base64) {
            _this.update_ui_on_changing_file(data.title);
            base64 = base64.replace(';base64,', ";" + data.filename + ";base64,");
            _this.$remote_url.val(base64);
            if (data.image) {
              _this.$new_file.html("<img src='" + url + "' /> " + (_this.$new_file.html()));
              return PubSub.publish('inputs.image_changed', {
                view: _this,
                url: url
              });
            }
          } else {
            return Locomotive.notify('Unable to load the asset', 'error');
          }
        };
      })(this));
    };

    FileView.prototype.change_file = function(event) {
      var file, text;
      file = event.target.files ? event.target.files[0] : null;
      text = file != null ? file.name : 'New file';
      this.update_ui_on_changing_file(text);
      if (file.type.match('image.*')) {
        return this.image_to_base_64(file, (function(_this) {
          return function(base64) {
            _this.$new_file.html("<img src='" + base64 + "' /> " + (_this.$new_file.html()));
            return PubSub.publish('inputs.image_changed', {
              view: _this,
              url: base64,
              file: file
            });
          };
        })(this));
      }
    };

    FileView.prototype.update_ui_on_changing_file = function(text) {
      this.$new_file.html(text);
      this.showEl(this.$new_file) && this.hideEl(this.$current_file) && this.hideEl(this.$no_file);
      return this.hideEl(this.$change_btn) && this.hideEl(this.$delete_btn) && this.hideEl(this.$choose_btn) && this.showEl(this.$cancel_btn);
    };

    FileView.prototype.cancel_new_file = function(event) {
      this.hideEl(this.$new_file);
      this.$remote_url.val('');
      this.$file.wrap('<form>').closest('form').get(0).reset();
      this.$file.unwrap();
      $(this.el).removeClass('mark-as-removed');
      this.$remove_file.val('0');
      this.hideEl(this.$cancel_btn);
      if (this.persisted_file) {
        this.showEl(this.$current_file);
        this.showEl(this.$change_btn) && this.showEl(this.$delete_btn);
      } else {
        this.showEl(this.$no_file);
        this.showEl(this.$choose_btn);
      }
      return PubSub.publish('inputs.image_changed', {
        view: this
      });
    };

    FileView.prototype.mark_file_as_deleted = function(event) {
      this.$remove_file.val('1');
      $(this.el).addClass('mark-as-removed');
      this.hideEl(this.$change_btn) && this.hideEl(this.$delete_btn) && this.showEl(this.$cancel_btn);
      return PubSub.publish('inputs.image_removed', {
        view: this
      });
    };

    FileView.prototype.image_to_base_64 = function(file, callback) {
      var reader;
      reader = new FileReader();
      reader.onload = function(e) {
        return callback(e.target.result);
      };
      return reader.readAsDataURL(file);
    };

    FileView.prototype.absolute_url = function(url) {
      var http, slashes;
      if (url.indexOf('http') === 0) {
        return url;
      }
      http = location.protocol;
      slashes = http.concat("//");
      return slashes.concat(window.location.host).concat(url);
    };

    FileView.prototype.showEl = function(el) {
      return el.removeClass('hide');
    };

    FileView.prototype.hideEl = function(el) {
      return el.addClass('hide');
    };

    FileView.prototype.need_refresh = function() {
      return true;
    };

    FileView.prototype.remove = function() {
      FileView.__super__.remove.apply(this, arguments);
      return PubSub.unsubscribe(this.pubsub_token);
    };

    return FileView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views.Inputs).Rte || (base.Rte = {});

  Locomotive.Views.Inputs.Rte.FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.opened = {
      popover: false,
      picker: false
    };

    FileView.prototype.initialize = function() {
      _.bindAll(this, 'change_image', 'insert_file', 'hide');
      this.$link = $(this.el);
      this.editor = this.options.editor;
      this.$popover = this.$link.next('.image-dialog-content');
      return this.pubsub_token = PubSub.subscribe('file_picker.select', this.insert_file);
    };

    FileView.prototype.render = function() {
      this.attach_editor();
      return this.create_popover();
    };

    FileView.prototype.attach_editor = function() {
      var command;
      command = this.editor.toolbar.commandMapping['insertFile:null'];
      command.dialog = this;
      return console.log("[insertFileView] attach_editor");
    };

    FileView.prototype.create_popover = function() {
      this.$popover.show();
      this.$link.popover({
        container: '.main',
        placement: 'left',
        content: this.$popover,
        html: true,
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><form class="simple_form"><div class="popover-content"></div></form></div>'
      });
      this.$link.data('bs.popover').setContent();
      return this.attach_popover_events();
    };

    FileView.prototype.attach_popover_events = function() {
      this.$popover.parents('form').on('click', '.apply', this.change_image);
      this.$popover.on('click', '.apply', this.change_image);
      return this.$popover.on('click', '.cancel', this.hide);
    };

    FileView.prototype.detach_popover_events = function() {
      this.$popover.parents('form').on('click', '.apply', this.change_image);
      this.$popover.on('click', '.apply', this.change_image);
      return this.$popover.on('click', '.cancel', this.hide);
    };

    FileView.prototype.change_image = function(event) {
      this.editor.composer.commands.exec('insertImage', {
        src: this._input_el('src').val(),
        "class": this._input_el('alignment', 'select').val(),
        title: this._input_el('title').val()
      });
      return this.hide();
    };

    FileView.prototype.insert_file = function(msg, data) {
      var html;
      if (data.parent_view.cid !== this.cid) {
        return;
      }
      if (data.image) {
        this.editor.composer.commands.exec('insertImage', {
          src: data.url,
          title: data.title
        });
      } else {
        html = "<a href='" + data.url + "' title='" + data.title + "'>" + data.title + "</a>";
        this.editor.composer.commands.exec('insertHTML', html);
      }
      return this.hide();
    };

    FileView.prototype.show = function(state) {
      var $image;
      console.log("[insertFileView] show " + state);
      this.editor.focus();
      if (state != null) {
        $image = $(state);
        this._input_el('src').val($image.attr('src'));
        this._input_el('alignment', 'select').val($image.attr('class'));
        this._input_el('title').val($image.attr('title'));
        return this.show_popover();
      } else {
        this.hide_popover();
        return this.show_picker();
      }
    };

    FileView.prototype.show_picker = function() {
      if (this.opened.picker === false) {
        window.application_view.drawer_view.open(this.$link.data('url'), Locomotive.Views.ContentAssets.PickerView, {
          parent_view: this
        });
        return this.opened.picker = true;
      }
    };

    FileView.prototype.show_popover = function() {
      if (this.opened.popover === false) {
        this.$link.popover('show');
        return this.opened.popover = true;
      }
    };

    FileView.prototype.hide = function() {
      console.log("[insertFileView] hide");
      console.log(this.opened);
      if (this.opened.picker) {
        return this.hide_picker();
      } else if (this.opened.popover) {
        return this.hide_popover();
      }
    };

    FileView.prototype.hide_picker = function() {
      console.log("[insertFileView] hide picker");
      window.application_view.drawer_view.close();
      return this.opened.picker = false;
    };

    FileView.prototype.hide_from_picker = function(stack_size) {
      if (stack_size === 0) {
        return this.opened.picker = false;
      }
    };

    FileView.prototype.hide_popover = function() {
      this.$link.popover('hide');
      return this.opened.popover = false;
    };

    FileView.prototype._input_el = function(property, type) {
      var name;
      type || (type = 'input');
      name = "rte_input_image_form[" + property + "]";
      return this.$popover.find(type + "[name=\"" + name + "\"]");
    };

    FileView.prototype.remove = function() {
      console.log("[insertFileView] remove");
      this.detach_popover_events();
      this.$link.popover('destroy');
      this.$('.popover').remove();
      PubSub.unsubscribe(this.pubsub_token);
      return FileView.__super__.remove.apply(this, arguments);
    };

    return FileView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views.Inputs).Rte || (base.Rte = {});

  Locomotive.Views.Inputs.Rte.LinkView = (function(superClass) {
    extend(LinkView, superClass);

    function LinkView() {
      return LinkView.__super__.constructor.apply(this, arguments);
    }

    LinkView.prototype.opened = false;

    LinkView.prototype.initialize = function() {
      _.bindAll(this, 'apply', 'show', 'hide');
      this.$link = $(this.el);
      this.editor = this.options.editor;
      return this.$content = this.$link.next('.link-dialog-content');
    };

    LinkView.prototype.render = function() {
      this.create_popover();
      this.attach_events();
      return this.attach_editor();
    };

    LinkView.prototype.create_popover = function() {
      this.$content.show();
      this.$link.popover({
        container: '.main',
        placement: 'left',
        content: this.$content,
        html: true,
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><form class="simple_form"><div class="popover-content"></div></form></div>'
      });
      return this.$link.data('bs.popover').setContent();
    };

    LinkView.prototype.attach_events = function() {
      this.$content.parents('form').on('click', '.apply', this.apply);
      this.$content.on('click', '.apply', this.apply);
      return this.$content.on('click', '.cancel', this.hide);
    };

    LinkView.prototype.detach_events = function() {
      this.$content.parents('form').off('click', '.apply', this.apply);
      this.$content.off('click', '.apply', this.apply);
      return this.$content.off('click', '.cancel', this.hide);
    };

    LinkView.prototype.attach_editor = function() {
      var command;
      command = this.editor.toolbar.commandMapping['createLink:null'];
      return command.dialog = this;
    };

    LinkView.prototype.apply = function(event) {
      var url;
      url = this._input_el('url').val();
      if (!_.isEmpty(url)) {
        this.editor.composer.commands.exec('createLink', {
          href: url,
          target: this._input_el('target', 'select').val(),
          title: this._input_el('title').val(),
          rel: "nofollow"
        });
        return this.hide();
      }
    };

    LinkView.prototype.show = function(state) {
      var $link;
      console.log("[LinkView] show (" + state + ")");
      if (state != null) {
        $link = $(state);
        this._input_el('url').val($link.attr('href'));
        this._input_el('target', 'select').val($link.attr('target'));
        this._input_el('title').val($link.attr('title'));
        if (!this.opened) {
          this.$link.popover('show');
        }
      } else {
        this.$content.parents('form')[0].reset();
      }
      return this.opened = true;
    };

    LinkView.prototype.hide = function() {
      this.$link.popover('hide');
      return this.opened = false;
    };

    LinkView.prototype._input_el = function(property, type) {
      var name;
      type || (type = 'input');
      name = "rte_input_link_form[" + property + "]";
      return this.$content.find(type + "[name=\"" + name + "\"]");
    };

    LinkView.prototype.remove = function() {
      this.detach_events();
      this.$link.popover('destroy');
      return this.$('.popover').remove();
    };

    return LinkView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Inputs || (base.Inputs = {});

  Locomotive.Views.Inputs.RteView = (function(superClass) {
    extend(RteView, superClass);

    function RteView() {
      return RteView.__super__.constructor.apply(this, arguments);
    }

    RteView.prototype.events = {
      'click a.style': 'open_styles_dialog'
    };

    RteView.prototype.initialize = function() {
      var $textarea, that;
      _.bindAll(this, 'register_keydown_event', 'on_content_change');
      $textarea = this.$('textarea');
      this.editor = new wysihtml5.Editor($textarea.attr('id'), {
        toolbar: "wysihtml5-toolbar-" + ($textarea.attr('id')),
        useLineBreaks: false,
        parserRules: wysihtml5ParserRules,
        stylesheets: ['/assets/locomotive/wysihtml5_editor-bceabbd255815c04d69c7143b1defe78.css']
      });
      this.editor.on('load', this.register_keydown_event);
      this.editor.on('change', this.on_content_change);
      this.editor.on('aftercommand:composer', this.on_content_change);
      that = this;
      return setTimeout(function() {
        that.create_link_view();
        return that.create_file_view();
      }, 200);
    };

    RteView.prototype.render = function() {};

    RteView.prototype.open_styles_dialog = function(event) {
      var $button;
      $button = $(event.target).closest('a');
      return this.$style_popover = this.$style_popover || ($button.popover({
        placement: 'bottom',
        content: $button.next('.style-dialog-content').html(),
        html: true,
        title: void 0
      })).popover('show');
    };

    RteView.prototype.create_link_view = function() {
      this.link_view = new Locomotive.Views.Inputs.Rte.LinkView({
        el: this.$('a[data-wysihtml5-command=createLink]'),
        editor: this.editor
      });
      return this.link_view.render();
    };

    RteView.prototype.create_file_view = function() {
      this.file_view = new Locomotive.Views.Inputs.Rte.FileView({
        el: this.$('a[data-wysihtml5-command=insertFile]'),
        editor: this.editor
      });
      return this.file_view.render();
    };

    RteView.prototype.register_keydown_event = function() {
      return this.$('.wysihtml5-sandbox').contents().find('body').on('keyup', (function(_this) {
        return function() {
          return _this.on_content_change();
        };
      })(this));
    };

    RteView.prototype.on_content_change = function() {
      return PubSub.publish('inputs.text_changed', {
        view: this,
        content: this.editor.getValue()
      });
    };

    RteView.prototype.remove = function() {
      this.link_view.remove();
      this.file_view.remove();
      this.editor.stopObserving('onLoad', this.register_keydown_event);
      this.editor.stopObserving('onChange', this.on_content_change);
      return RteView.__super__.remove.apply(this, arguments);
    };

    return RteView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Inputs || (base.Inputs = {});

  Locomotive.Views.Inputs.TextView = (function(superClass) {
    extend(TextView, superClass);

    function TextView() {
      return TextView.__super__.constructor.apply(this, arguments);
    }

    TextView.prototype.events = {
      'change input[type=text]': 'content_change',
      'paste input[type=text]': 'content_change',
      'keyup input[type=text]': 'content_change',
      'change textarea': 'content_change',
      'paste textarea': 'content_change',
      'keyup textarea': 'content_change'
    };

    TextView.prototype.content_change = function(event) {
      return PubSub.publish('inputs.text_changed', {
        view: this,
        content: $(event.target).val()
      });
    };

    return TextView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Memberships || (base.Memberships = {});

  Locomotive.Views.Memberships.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Memberships || (base.Memberships = {});

  Locomotive.Views.Memberships.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      return NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.el = '.main';

    return NewView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).MyAccount || (base.MyAccount = {});

  Locomotive.Views.MyAccount.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    EditView.prototype.events = {
      'click .api_key.input button': 'regenerate_api_key',
      'submit form': 'save'
    };

    EditView.prototype.initialize = function() {};

    EditView.prototype.render = function() {
      this.render_locale_select();
      return EditView.__super__.render.call(this);
    };

    EditView.prototype.regenerate_api_key = function(event) {
      var button;
      event.stopPropagation() & event.preventDefault();
      button = $(event.target);
      if (confirm(button.data('confirm'))) {
        return $.rails.ajax({
          url: button.data('url'),
          type: 'put',
          dataType: 'json',
          success: (function(_this) {
            return function(data) {
              return button.prev('code').html(data.api_key);
            };
          })(this)
        });
      }
    };

    EditView.prototype.render_locale_select = function() {
      return this.$('.locomotive_account_locale.input select').select2({
        formatResult: this.format_locale,
        formatSelection: this.format_locale,
        escapeMarkup: function(m) {
          return {
            m: m
          };
        }
      });
    };

    EditView.prototype.format_locale = function(state) {
      var flag_url;
      if (state.id == null) {
        return state.text;
      }
      flag_url = $(state.element).data('flag');
      return ("<img class='flag' src='" + flag_url + "' width='24px' />") + state.text;
    };

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Pages || (base.Pages = {});

  Locomotive.Views.Pages.FormView = (function(superClass) {
    extend(FormView, superClass);

    function FormView() {
      return FormView.__super__.constructor.apply(this, arguments);
    }

    FormView.prototype.el = '#content';

    FormView.prototype.initialize = function() {
      return this.attach_events_on_redirect_attribute();
    };

    FormView.prototype.attach_events_on_redirect_attribute = function() {
      return this.$('#page_redirect').on('switchChange.bootstrapSwitch', function(event, state) {
        var $inputs;
        $inputs = $('.locomotive_page_redirect_url, .locomotive_page_redirect_type');
        return $inputs.toggleClass('hide');
      });
    };

    return FormView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Pages || (base.Pages = {});

  Locomotive.Views.Pages.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    return EditView;

  })(Locomotive.Views.Pages.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Pages || (base.Pages = {});

  Locomotive.Views.Pages.ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.el = '.pages-tree';

    ListView.prototype.render = function() {
      this.make_foldable();
      this.make_sortable();
      this.make_hoverable();
      return this;
    };

    ListView.prototype.make_foldable = function() {
      var self;
      self = this;
      return this.$('ul .fold-unfold').each(function() {
        var $children, $toggler;
        $toggler = $(this);
        $children = $toggler.next('ul.leaves');
        if ($toggler.hasClass('folded')) {
          return $children.hide();
        }
      }).click(function(event) {
        var $children, $node, $toggler;
        $toggler = $(this);
        $node = $toggler.parents('li.node');
        $children = $toggler.next('ul.leaves');
        if ($toggler.hasClass('folded')) {
          return $children.slideDown('fast', function() {
            $toggler.removeClass('folded').addClass('unfolded');
            return $.cookie($node.attr('id'), 'unfolded', {
              path: window.Locomotive.mounted_on
            });
          });
        } else {
          return $children.slideUp('fast', function() {
            $toggler.removeClass('unfolded').addClass('folded');
            return $.cookie($node.attr('id'), 'folded', {
              path: window.Locomotive.mounted_on
            });
          });
        }
      });
    };

    ListView.prototype.make_sortable = function() {
      var self;
      self = this;
      return this.$('ul').sortable({
        items: '> li.page',
        handle: '.draggable',
        axis: 'y',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        update: function(event, ui) {
          return self.call_sort($(this));
        },
        stop: function(event, ui) {
          var position;
          if ($(this).hasClass('root')) {
            position = ui.item.index();
            if (position === 0 || position >= $(this).find('> li').size() - 2) {
              return $(this).sortable('cancel');
            }
          }
        }
      });
    };

    ListView.prototype.make_hoverable = function() {
      return this.$('a').hover(function() {
        return $(this).prev('i.icon').addClass('on');
      }, function() {
        return $(this).prev('i.icon').removeClass('on');
      });
    };

    ListView.prototype.call_sort = function(folder) {
      return $.rails.ajax({
        url: folder.data('url'),
        type: 'post',
        dataType: 'json',
        data: {
          children: _.map(folder.sortable('toArray'), function(el) {
            return el.replace('node-', '');
          }),
          _method: 'put'
        },
        success: this.on_successful_sort,
        error: this.on_failed_sort
      });
    };

    ListView.prototype.on_successful_sort = function(data, status, xhr) {
      return Locomotive.notify(decodeURIComponent($.parseJSON(xhr.getResponseHeader('X-Message'))), 'success');
    };

    ListView.prototype.on_failed_sort = function(data, status, xhr) {
      return Locomotive.notify(decodeURIComponent($.parseJSON(xhr.getResponseHeader('X-Message'))), 'error');
    };

    return ListView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Pages || (base.Pages = {});

  Locomotive.Views.Pages.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      return NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.el = '.main';

    return NewView;

  })(Locomotive.Views.Pages.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).PublicSubmissionAccounts || (base.PublicSubmissionAccounts = {});

  Locomotive.Views.PublicSubmissionAccounts.EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.el = '.main';

    return EditView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.DrawerView = (function(superClass) {
    extend(DrawerView, superClass);

    function DrawerView() {
      return DrawerView.__super__.constructor.apply(this, arguments);
    }

    DrawerView.prototype.el = 'section.drawer';

    DrawerView.prototype.delays = {
      fade: 50,
      remove: 200
    };

    DrawerView.prototype.events = {
      'click .close-button': 'close'
    };

    DrawerView.prototype.initialize = function() {
      this.stack = [];
      return DrawerView.__super__.initialize.apply(this, arguments);
    };

    DrawerView.prototype.open = function(url, view_klass, options) {
      var entry;
      if (options == null) {
        options = {};
      }
      console.log("[DrawerView] open, stack(" + this.stack.length + ") opened = " + ($('body').hasClass('drawer-opened')) + ", " + url);
      entry = {
        url: url,
        view_klass: view_klass,
        options: options
      };
      return this.push(entry);
    };

    DrawerView.prototype.close = function() {
      console.log("[DrawerView] close, stack(" + this.stack.length + ")");
      return this.pop();
    };

    DrawerView.prototype.push = function(entry) {
      this.hide(this.last_entry());
      this.stack.push(entry);
      return this.show(entry);
    };

    DrawerView.prototype.pop = function() {
      var entry;
      entry = this.stack.pop();
      return this.hide(entry, (function(_this) {
        return function() {
          return _this.show(_this.last_entry());
        };
      })(this));
    };

    DrawerView.prototype.replace = function(entry) {
      var _container, last_entry;
      last_entry = this.stack.pop();
      _container = this.container(true);
      this.stack.push(entry);
      if (entry.url != null) {
        return _container.load(entry.url, (function(_this) {
          return function() {
            if (last_entry) {
              last_entry.view.remove();
            }
            return _this._show(entry, _container);
          };
        })(this));
      } else {
        return this._show(entry, _container);
      }
    };

    DrawerView.prototype.show = function(entry) {
      var timeout;
      if (entry === null) {
        return;
      }
      timeout = this.stack.length === 1 ? 0 : this.delays.fade;
      return setTimeout((function(_this) {
        return function() {
          var _container;
          _container = _this.container();
          if (entry.url != null) {
            return _container.load(entry.url, function() {
              return _this._show(entry, _container);
            });
          } else {
            return _this._show(entry, _container);
          }
        };
      })(this), timeout);
    };

    DrawerView.prototype.hide = function(entry, callback) {
      if (this.stack.length === 0) {
        $('body').removeClass('drawer-opened');
      } else {
        if (entry != null) {
          entry.view.$el.addClass('fadeout');
        }
      }
      return setTimeout((function(_this) {
        return function() {
          if (entry != null) {
            if (entry.view.hide_from_drawer != null) {
              entry.view.hide_from_drawer(_this.stack.length);
            }
            entry.view.remove();
          }
          if (callback != null) {
            return callback();
          }
        };
      })(this), this.delays.remove);
    };

    DrawerView.prototype.last_entry = function() {
      if (this.stack.length === 0) {
        return null;
      } else {
        return this.stack[this.stack.length - 1];
      }
    };

    DrawerView.prototype.container = function(preserve) {
      if ((preserve != null) && preserve) {
        return this.$('> .inner').find('> div');
      } else {
        return this.$('> .inner').html('<div></div>').find('> div');
      }
    };

    DrawerView.prototype._show = function(entry, container) {
      var _klass, attributes;
      _klass = entry.view_klass;
      attributes = _.extend({
        el: container,
        drawer: this
      }, entry.options);
      entry.view = new _klass(attributes);
      entry.view.render();
      return $('body').addClass('drawer-opened');
    };

    return DrawerView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.HeaderView = (function(superClass) {
    extend(HeaderView, superClass);

    function HeaderView() {
      return HeaderView.__super__.constructor.apply(this, arguments);
    }

    HeaderView.prototype.el = 'nav.navbar';

    HeaderView.prototype.initialize = function() {};

    HeaderView.prototype.render = function() {};

    HeaderView.prototype.height = function() {
      return $(this.el).outerHeight(true);
    };

    return HeaderView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.ListItemView = (function(superClass) {
    extend(ListItemView, superClass);

    function ListItemView() {
      return ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.tagName = 'li';

    ListItemView.prototype.events = {
      'click a.remove': 'remove_item'
    };

    ListItemView.prototype.template = function() {};

    ListItemView.prototype.render = function() {
      $(this.el).html(this.template()(this.model.toJSON()));
      return this;
    };

    ListItemView.prototype.remove_item = function(event) {
      event.stopPropagation() & event.preventDefault();
      if (confirm($(event.target).closest('a').data('confirm'))) {
        return this.model.destroy();
      }
    };

    return ListItemView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function() {
      return this.sort_url = $(this.el).data('sort-url');
    };

    ListView.prototype.render = function() {
      if (this.sort_url != null) {
        return this.make_sortable();
      }
    };

    ListView.prototype.make_sortable = function() {
      var self;
      self = this;
      return $(this.el).sortable({
        items: '> .item',
        handle: '.draggable',
        axis: 'y',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        start: function(e, ui) {
          return ui.placeholder.html('<div class="inner">&nbsp;</div>');
        },
        update: function(event, ui) {
          return self.call_sort(ui);
        }
      });
    };

    ListView.prototype.call_sort = function() {
      return $.rails.ajax({
        url: this.sort_url,
        type: 'post',
        dataType: 'json',
        data: {
          entries: _.map($(this.el).find('> .item'), function(el) {
            return $(el).data('id');
          }),
          _method: 'put'
        },
        success: this.on_successful_sort,
        error: this.on_failed_sort
      });
    };

    ListView.prototype.on_successful_sort = function(data, status, xhr) {
      var message;
      message = xhr.getResponseHeader('X-Message');
      return Locomotive.notify(decodeURIComponent($.parseJSON(message)), 'success');
    };

    ListView.prototype.on_failed_sort = function(data, status, xhr) {
      var message;
      message = _.isObject(xhr) ? $.parseJSON(xhr.getResponseHeader('X-Message')) : xhr;
      return Locomotive.notify(decodeURIComponent(message), 'danger');
    };

    return ListView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Shared || (base.Shared = {});

  Locomotive.Views.Shared.SidebarView = (function(superClass) {
    extend(SidebarView, superClass);

    function SidebarView() {
      return SidebarView.__super__.constructor.apply(this, arguments);
    }

    SidebarView.prototype.el = 'nav.sidebar';

    SidebarView.prototype.initialize = function() {
      return this.pages_view = new Locomotive.Views.Pages.ListView();
    };

    SidebarView.prototype.render = function() {
      return this.pages_view.render();
    };

    return SidebarView;

  })(Backbone.View);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Sites || (base.Sites = {});

  Locomotive.Views.Sites.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      return NewView.__super__.constructor.apply(this, arguments);
    }

    return NewView;

  })(Locomotive.Views.Shared.FormView);

}).call(this);
(function() {
  var base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Locomotive.Views).Translations || (base.Translations = {});

  Locomotive.Views.Translations.IndexView = (function(superClass) {
    extend(IndexView, superClass);

    function IndexView() {
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.el = '.main';

    return IndexView;

  })(Backbone.View);

}).call(this);
