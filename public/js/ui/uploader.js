//http://www.plupload.com/plupload/docs/api/index.html#class_plupload.Uploader.html
define(function(require, exports, module) {

    var notify = require('ui/notify'),
        isChrome = UI.browser.chrome,
        supportFileApi = window.File && window.FileReader && window.FileList && window.Blob,
        dialog = notify({
            title: '上传文件',
            cls: 'link',
            draggable: true,
            // closeable: false,
            dropTip: '<div class="text-center c-gray" style="width:100%;top:130px;left:0;z-index:10;position:absolute;"><h2 style="font-size:20px;">试试将文件' + (isChrome ? '或文件夹' : '') + '拖拽到屏幕上上传</h2><div>(您的浏览器支持拖拽上传)</div></div>',
            msg: '<b class="b note ac-upload va-m m2">上传文件</b>' + (isChrome ? '<input type="file" webkitdirectory="" hidden><b class="b note ac-upload-folder va-m">上传文件夹</b>' : '') + '<span class="ac-path c-gray ellipsis ml"></span><div class="m1 scroll ac-showcase" style="height:250px;position:relative;border:solid 1px #e4e5e9;background:#FAFBFE"></div>',
            mask: true,
            width: 550,
            events: {
                'click .ac-cancel': function(e, conf) {
                    var up = conf.uploader,
                        file = up.getFile($(this).data('id'));
                    if (file) {
                        file.dom.fadeOut(function() {
                            $(this).remove();
                        });
                        up.removeFile(file);
                    }
                    return false;
                }
            },
            buttons: [{
                label: '取消',
                cls: 'silver ac-btncancel',
                click: 'close'
            }, {
                label: '完成',
                cls: 'silver ac-btnfinish',
                click: 'finish'
            }],
            ellipsis: function(s, len) {
                if (!s) return "";
                len = len || 20;
                if (s.length > len) {
                    return '到：... ' + s.slice(-len);
                }
                return '到：' + s;
            },
            handError: function(up, err) {
                if (err.code == -600) {
                    return '文件大小超过' + up.settings.filters.max_file_size + '，建议使用<a target="_blank" href="#" onclick="ls.startIMClient();">客户端</a>，高速、稳定';
                }
                return err.message;
            },
            //国际化
            i18n: {
                "N/A": "N/A",
                "tb": "TB",
                "mb": "MB",
                "kb": "KB",
                "b": "B",
                "gb": "GB",
                "File extension error.": "文件类型错误。",
                "File size error.": "文件体积太大。",
                "Duplicate file error.": "重复文件错误。",
                "Init error.": "初始化错误。",
                "HTTP Error.": "HTTP 错误。"
            },
            show: function(options) {
                var _t = this;
                _t.mask.appendTo('body').show();
                _t.el.position(_t.position);
                _t.path.html(_t.ellipsis(options.uploadPath));
                _t.footLabel.html('网页版单文件最大支持200M <br><a target="_blank" href="#" onclick="ls.startIMClient();">使用PC客户端</a>，支持文件秒传、断点续传');
                //绑定上传插件
                //trigger order: init -> Error $ ro QueueChanged -> FilesAdded -> BeforeUpload -> UploadProgress -> FileUploaded -> QueueChanged -> UploadComplete 
                //上传失败: QueueChanged - FilesAdded - BeforeUpload - UploadProgress - Error - QueueChanged - UploadComplete
                require.async('js/vendor/plupload/plupload.full.min.js', function() {
                    var browserBtn = _t.$('.ac-upload');
                    //国际化
                    if (_t.i18n) {
                        plupload.addI18n(_t.i18n);
                        delete _t.i18n;
                        if (supportFileApi) {
                            //拖拽提示
                            _t.dropTip = $(_t.dropTip).insertBefore(_t.showcase);
                            //上传文件夹
                            if (isChrome) {
                                var dirInput = browserBtn.next().change(function() {
                                    _t.uploader.addFile(this);
                                });
                                dirInput.next().click(function() {
                                    dirInput.trigger('click');
                                    return false;
                                });
                            }
                        }
                    }
                    //upload对象
                    _t.uploader = new plupload.Uploader(_.extend({
                        browse_button: browserBtn[0],
                        url: '/',
                        drop_element: _t.mask[0],
                        runtimes: 'html5,flash',
                        max_file_size: '100mb',
                        flash_swf_url: require.resolve('../') + 'vendor/plupload/Moxie.swf',
                        //trigger order: init -> Error $ ro FilesAdded -> BeforeUpload -> QueueChanged? -> UploadProgress -> FileUploaded
                        beforeUploaded: $.noop, //上传前
                        uploaded: $.noop, //上传后
                        complete: $.noop,
                        init: {
                            FilesAdded: function(up, files) {
                                if (_t.dropTip.hide) {
                                    _t.dropTip.hide();
                                }
                                dialog.add(files);
                                up.start();
                            },
                            QueueChanged: function(up) {
                                dialog.btnCancel.show();
                                dialog.btnFinish.hide();
                            },
                            BeforeUpload: function(up, file) {
                                up.settings.beforeUploaded(up, file);
                            },
                            UploadProgress: function(up, file) {
                                file.bar.width(file.percent + "%");
                                file.pcnt.html(file.percent + "%");
                            },
                            FileUploaded: function(up, file, data) {
                                data = JSON.parse(data.response);
                                //服务器自定义错误，切换到错误模式
                                if (data.code) {
                                    up.trigger('Error', {
                                        code: 'sugon',
                                        message: data.msg,
                                        file: file
                                    });
                                    return;
                                }
                                up.removeFile(file);
                                var settings = up.settings;
                                file.bar.parent().parent().html('<img style="position:absolute;margin:-22px 0 0 -22px;" src="' + UI.server + 'cloud/img/ok.png">' + '成功上传' + dialog.ellipsis(settings.uploadPath, 30));
                                settings.uploaded(up, file, data);
                            },
                            UploadComplete: function(up, files) {
                                dialog.btnCancel.hide();
                                dialog.btnFinish.show();
                                up.settings.complete(up, files);
                            },
                            Error: function(up, err) {
                                var file = err.file;
                                if (file) {
                                    if (!file.dom) {
                                        dialog.add([file]);
                                    } else {
                                        up.removeFile(file);
                                    }
                                    file.bar.parent().parent().html('<div class="c-error">' + dialog.handError(up, err) + '</div>');
                                    file.dom.addClass('ac-error');
                                } else {
                                    notify.error(err.message);
                                }
                            }
                        }
                    }, options));
                    _t.uploader.init();
                });
            },
            hide: function() {
                this.mask.hide();
                if (this.uploader) {
                    this.uploader.destroy();
                }
            },
            //点击取消
            close: function(e, conf) {
                conf = conf || this;
                var up = conf.uploader;
                //如果队列中还有任务
                if (up.total.queued) {
                    if (confirm('确定取消所有正在上传的文件？')) {
                        conf.finish();
                    }
                } else {
                    conf.finish();
                }
            },
            //点击完成
            finish: function(e, conf) {
                conf = conf || this;
                this.showcase.empty();
                if (conf.dropTip.show) {
                    conf.dropTip.show();
                }
                var up = conf.uploader;
                _.each(up.files, function(o) {
                    if (o) {
                        up.removeFile(o);
                    }
                });
                conf.hide();
            },
            oncreate: function() {
                var _t = this;
                _t.path = _t.$('.ac-path');
                _t.showcase = _t.$('.ac-showcase');
                _t.footLabel = $('<div style="height:40px;width:400px;" class="xl text-left vam c-gray"><div class="vam-helper"></div><div class="vam-con"></div></div>');
                _t.contentEl.addClass('p10').next().prepend(_t.footLabel);
                _t.footLabel = _t.footLabel.find('.vam-con');
                _t.btnCancel = _t.$('.ac-btncancel').hide();
                _t.btnFinish = _t.$('.ac-btnfinish');
            },
            //添加队列上传
            add: function(files) {
                if (this.dropTip.hide) {
                    this.dropTip.hide();
                }
                $.each(files, function(i, file) {
                    file.dom = $('<div id="' + file.id + '" class="xc" style="margin-top:-1px;border-top:solid 1px #e4e5e9;padding:10px 10px 10px 30px">' + '<span class="xr">' + plupload.formatSize(file.size) + '</span><div class="ellipsis w13"><strong>' + file.name + '</strong></div>' + '<div class="xc" style="height:30px;padding-top:6px;"><div class="progress w11 xl" style="height:10px;margin:5px 10px 0 0;"><div class="bar safe"></div></div>' + '<span class="ac-percent xl"></span>' + '<a href="#" class="ac-cancel xr" data-id="' + file.id + '">取消</a></div>' + '</div>');
                    file.bar = file.dom.find('.bar');
                    file.pcnt = file.dom.find('.ac-percent');
                    dialog.showcase.append(file.dom);
                });
            }
        });
    return dialog;
});
