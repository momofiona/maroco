//http://www.plupload.com/plupload/docs/api/index.html#class_plupload.Uploader.html
define(function(require, exports, module) {
    plupload.addI18n({
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
    });
    var notify = require('ui/notify'),
        options, //上传相关指令
        dialog = notify({
            title: '上传文件',
            cls: 'link',
            draggable: true,
            closeable: false,
            msg: '<b class="b note ac-upload m2 va-m">上传文件</b><span class="ac-path ellipsis"></span><div class="m1 scroll ac-showcase" style="height:250px;border:solid 1px #e4e5e9;background:#FAFBFE"></div>',
            mask: true,
            width: 500,
            events: {
                'click .ac-cancel': function(e, conf) {
                    var item = $(this).parent().fadeOut(function() {
                            conf.el.position(conf.position);
                            $(this).remove();
                        }),
                        up = conf.uploader;
                    file = up.getFile($(this).data('id'));
                    file && up.removeFile(file);
                    return false;
                }
            },
            buttons: [{
                label: '取消',
                cls: 'silver ac-btncancel',
                click: 'close'
            }, {
                label: '完成',
                cls: 'note ac-btnfinish',
                click: 'finish'
            }],
            show: function(config) {
                options = config;
                this.mask.show();
                this.el.position(this.position);
                this.path.html('到：' + options.path);
            },
            hide: function() {
                this.mask.hide();
            },
            close: function(e, conf) {
                conf = conf || this;
                if (confirm('确定取消所有正在上传的文件？')) {
                    conf.uploader;
                    conf.finish();
                }
            },
            finish: function(e, conf) {
                conf = conf || this;
                this.showcase.empty();
                conf.hide();
            },
            oncreate: function() {
                var _t = this;
                _t.path = _t.$('.ac-path');
                _t.showcase = _t.$('.ac-showcase');
                _t.contentEl.addClass('p10');
                _t.btnCancel = _t.$('.ac-btncancel').hide();
                _t.btnFinish = _t.$('.ac-btnfinish');
                $('<i class="f f-minus dialog-tool m2"></i>').prependTo(_t.el);
                //绑定上传插件
                //trigger order: init -> Error $ ro QueueChanged -> FilesAdded -> BeforeUpload -> UploadProgress -> FileUploaded -> QueueChanged -> UploadComplete 
                //上传失败: QueueChanged - FilesAdded - BeforeUpload - UploadProgress - Error - QueueChanged - UploadComplete
                require.async('js/vendor/plupload/plupload.full.min.js', function() {
                    _t.uploader = new plupload.Uploader({
                        browse_button: _t.$('.ac-upload')[0],
                        url: '/',
                        drop_element: _t.showcase[0],
                        runtimes: 'html5,flash',
                        max_file_size: '100mb',
                        flash_swf_url: require.resolve('../') + 'vendor/plupload/Moxie.swf',
                        //trigger order: init -> Error $ ro FilesAdded -> BeforeUpload -> QueueChanged? -> UploadProgress -> FileUploaded
                        init: {
                            PostInit: function(up) {},
                            FilesAdded: function(up, files) {
                                dialog.add(files);
                                up.start();
                            },
                            QueueChanged: function(up) {
                                dialog.btnCancel.show();
                                dialog.btnFinish.hide();
                                // dialog.queueChanged(up);
                            },
                            BeforeUpload: function(up, file) {
                                options.beforeUploaded && options.beforeUploaded(up, file);
                                up.settings.url = file.url;
                                up.settings.multipart_params = file.multipart_params;
                            },
                            UploadProgress: function(up, file) {
                                file.bar.width(file.percent + "%");
                                file.pcnt.html(file.percent + "%");
                            },
                            FileUploaded: function(up, file, data) {
                                data = JSON.parse(data.response);
                                file.bar.parent().parent().html('<img style="position:absolute;margin:-22px 0 0 -22px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTFGQUY0MzNFNjgzMTFFMzk0MUJBQjQ5OTYxNjk2NTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTFGQUY0MzRFNjgzMTFFMzk0MUJBQjQ5OTYxNjk2NTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMUZBRjQzMUU2ODMxMUUzOTQxQkFCNDk5NjE2OTY1MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMUZBRjQzMkU2ODMxMUUzOTQxQkFCNDk5NjE2OTY1MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmbfOy8AAAE7SURBVHjaYvz//z8DDCSdapIDUuVA7APE0kAMknwMxJuBuGueWd1ToBqwWkaYRqBAKpCaCMScDNjBdyBOA+IlIA4LVFM6kJrBgB+ADFwEdcVS5kdeTPJAxhaYIQQAIxB7gAxgAhKFQMyBT2Wioh+Dv7Q9TIgLiAtAGn3xaUoAarIRNWB49+sjspQHSKM8TFGcgjeDkaAGhqYF9zcxHH59AVmjEhPUswzMjMwMfKzcDBkqwQzGQpr4NIEAK0jjfRDrz/+/DDPurGW49OE2Q7ZKKD5NIHCDCRq5DMiaz767jk8TCGxlTDzZCEoht6ChRQz4DMTqTKBkBGTkw/xKAIDUJADxc1ACAAmcA+LbQOwOxGw4NH0C4hggXgfiMCFJLANiNSDuBuIrQPwNiL8C8WUg7gBiZSBeC1MMEGAAnj9lymrUGWkAAAAASUVORK5CYII=">成功上传到：'+options.path);
                                options.uploaded && options.uploaded(up, file, data);
                            },
                            UploadComplete: function(up, files) {
                                dialog.btnCancel.hide();
                                dialog.btnFinish.show();
                                options.complete && options.complete(up, files);
                            },
                            Error: function(up, err) {
                                var file = err.file;
                                if (file) {
                                    if (!file.dom) {
                                        dialog.add([file]);
                                    } else {
                                        up.removeFile(file);
                                    }
                                    file.bar.parent().parent().html('<div class="c-error">' + (err.code == -600 ? '文件大小不能超过' + up.settings.filters.max_file_size : err.message) + '</div>');
                                    file.dom.addClass('ac-error');
                                } else {
                                    notify.error(err.message);
                                }
                            }
                        }
                    });
                    _t.uploader.init();
                });
            },
            //添加队列上传
            add: function(files) {
                $.each(files, function(i, file) {
                    file.dom = $('<div id="' + file.id + '" class="xc" style="margin-top:-1px;border-top:solid 1px #e4e5e9;padding:10px 10px 10px 30px">' + '<span class="xr">' + plupload.formatSize(file.size) + '</span><div class="ellipsis w12"><strong>' + file.name + '</strong></div>' + '<div class="xc" style="height:30px;padding-top:6px;"><div class="progress w11 xl" style="height:10px;margin:5px 10px 0 0;"><div class="bar safe"></div></div>' + '<span class="ac-percent xl"></span>' + '<a href="#" class="ac-cancel xr" data-id="' + file.id + '">取消</a></div>' + '</div>');
                    file.bar = file.dom.find('.bar');
                    file.pcnt = file.dom.find('.ac-percent');
                    file.url = options.url;
                    file.multipart_params = options.data;
                    dialog.showcase.append(file.dom);
                });
            }
        });
    return dialog;
});
