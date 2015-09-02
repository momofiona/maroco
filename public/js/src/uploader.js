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
            //国际化
            i18n: {
                "Stop Upload": "停止上传",
                "Upload URL might be wrong or doesn't exist.": "上传的URL可能是错误的或不存在。",
                "tb": "TB",
                "Size": "大小",
                "Close": "关闭",
                "Init error.": "初始化错误。",
                "Add files to the upload queue and click the start button.": "将文件添加到上传队列，然后点击”开始上传“按钮。",
                "Filename": "文件名",
                "Image format either wrong or not supported.": "图片格式错误或者不支持。",
                "Status": "状态",
                "HTTP Error.": "HTTP 错误。",
                "Start Upload": "开始上传",
                "mb": "MB",
                "kb": "KB",
                "Duplicate file error.": "重复文件错误。",
                "File size error.": "文件体积太大。",
                "N/A": "N/A",
                "gb": "GB",
                "Error: Invalid file extension:": "错误：无效的文件扩展名:",
                "Select files": "选择文件",
                "%s already present in the queue.": "%s 已经在当前队列里。",
                "File: %s": "文件: %s",
                "b": "B",
                "Uploaded %d/%d files": "已上传 %d/%d 个文件",
                "Upload element accepts only %d file(s) at a time. Extra files were stripped.": "每次只接受同时上传 %d 个文件，多余的文件将会被删除。",
                "%d files queued": "%d 个文件加入到队列",
                "File: %s, size: %d, max file size: %d": "文件: %s, 大小: %d, 最大文件大小: %d",
                "Drag files here.": "把文件拖到这里。",
                "Runtime ran out of available memory.": "运行时已消耗所有可用内存。",
                "File count error.": "文件数量错误。",
                "File extension error.": "文件类型错误。",
                "Error: File too large:": "错误: 文件太大:",
                "Add Files": "增加文件"
            },
            show: function(options) {
                var _t = this;
                _t.mask.appendTo('body').show();
                _t.el.position(_t.position);
                _t.path.html(_t.ellipsis(options.uploadPath));
                _t.footLabel.html(options.footLabel);
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
                                if (!data.success) {
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
                                    file.bar.parent().parent().html('<div class="c-error">' + (err.code == -600 ? '文件大小超过' + up.settings.filters.max_file_size + '，建议使用<a target="_blank" href="#" onclick="ls.startIMClient();">客户端</a>，高速、稳定' : err.message) + '</div>');
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
                    this.uploader.destroy()
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
                conf.dropTip.show && conf.dropTip.show();
                var up = conf.uploader;
                _.each(up.files, function(o) {
                    o && up.removeFile(o);
                });
                conf.hide();
            },
            oncreate: function() {
                var _t = this;
                _t.path = _t.$('.ac-path');
                _t.showcase = _t.$('.ac-showcase');
                _t.footLabel = $('<div class="xl m1"></div>');
                _t.contentEl.addClass('p10').next().prepend(_t.footLabel);
                _t.btnCancel = _t.$('.ac-btncancel').hide();
                _t.btnFinish = _t.$('.ac-btnfinish');
            },
            //添加队列上传
            add: function(files) {
                this.dropTip.hide && this.dropTip.hide();
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
