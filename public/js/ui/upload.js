//http://www.plupload.com/plupload/docs/api/index.html#class_plupload.Uploader.html
define(function(require, exports, module) {
    require('js/vendor/plupload/plupload.full.min.js');
    plupload.addI18n({
        "Stop Upload": "停止上传",
        "Upload URL might be wrong or doesn't exist.": "上传的URL可能是错误的或不存在。",
        "tb": "tb",
        "Size": "大小",
        "Close": "关闭",
        "Init error.": "初始化错误。",
        "Add files to the upload queue and click the start button.": "将文件添加到上传队列，然后点击”开始上传“按钮。",
        "Filename": "文件名",
        "Image format either wrong or not supported.": "图片格式错误或者不支持。",
        "Status": "状态",
        "HTTP Error.": "HTTP 错误。",
        "Start Upload": "开始上传",
        "mb": "mb",
        "kb": "kb",
        "Duplicate file error.": "重复文件错误。",
        "File size error.": "文件体积太大。",
        "N/A": "N/A",
        "gb": "gb",
        "Error: Invalid file extension:": "错误：无效的文件扩展名:",
        "Select files": "选择文件",
        "%s already present in the queue.": "%s 已经在当前队列里。",
        "File: %s": "文件: %s",
        "b": "b",
        "Uploaded %d/%d files": "已上传 %d/%d 个文件",
        "Upload element accepts only %d file(s) at a time. Extra files were stripped.": "每次只接受同时上传 %d 个文件，多余的文件将会被删除。",
        "%d files queued": "%d 个文件加入到队列",
        "File: %s, size: %d, max file size: %d": "文件: %s, 大小: %d, 最大文件大小: %d",
        "Drag files here.": "把文件拖到这里。",
        "Runtime ran out of available memory.": "运行时已消耗所有可用内存。",
        "File count error.": "文件数量错误。",
        "File extension error.": "文件扩展名错误。",
        "Error: File too large:": "错误: 文件太大:",
        "Add Files": "增加文件"
    });
    var notify = require('ui/notify'),
        dialog = {
            add: function(up, files) {
                if (!this.dialog) {
                    this.dialog = notify({
                        title: '文件上传 <span class="ac-num m4"></span>',
                        cls: 'link',
                        draggable: true,
                        mask: true,
                        width: 500,
                        events: {
                            'click .ac-cancel': function(e, config) {
                                var item = $(this).parent().fadeOut(function() {
                                        config.el.position(config.position);
                                        $(this).remove();
                                    })/*,
                                    file = up.getFile($(this).data('id'));
                                file && up.removeFile(file);*/
                            }
                        },
                        close: function(e, config) {
                            config = config || this;
                            config.el.hide();
                            config.contentEl.children('.ac-error').remove();
                            config.mask.hide();
                        }
                    });
                    this.queue = this.dialog.el.find('.ac-num');
                } else {
                    this.dialog.el.show();
                    this.dialog.mask.show();
                }
                $.each(files, function(i, file) {
                    file.dom = $('<div id="' + file.id + '" class="log" style="margin-bottom:-1px">' + '<b class="f f-multiply am-rotate xr ac-cancel" data-id="' + file.id + '"></b>' + '<span class="xr m2">' + plupload.formatSize(file.size) + '</span><div class="ellipsis w12">' + file.name + '</div><div class="progress"><div class="note bar"></div></div></div>');
                    file.bar = file.dom.find('.bar');
                    dialog.dialog.contentEl.append(file.dom);
                });
                this.dialog.el.position(this.dialog.position);
            },
            queueChanged: function(up) {
                if (!this.dialog) return;
                var num = up.files.length;
                this.queue.html(num ? '正在上传 ' + num + ' 个文件...' : '');
                if (num == 0 && this.dialog.contentEl.children('.ac-error').length == 0) {
                    this.dialog.close();
                }
            },
            progress: function(up, file) {
                file.bar.width(file.percent + "%");
            },
            success: function(up, file) {
                file.dom.find('.ac-cancel').trigger('click');
            },
            error: function(up, err) {
                err.file.bar.parent().replaceWith('<div class="c-error">' + (err.code==-600?'文件大小不能超过'+up.settings.filters.max_file_size:err.message) + '</div>');
                err.file.dom.addClass('ac-error');
            }
        };
    return function(options) {
        var uploader = new plupload.Uploader($.extend(true, {
            /*browse_button: [document.getElementById('pickfiles'), 'pickfiles2'],
            container: document.getElementById('container'),
            multi_selection: true,
            container: document.body, //id||dom
            url: "/examples/upload",
            filters: {
                max_file_size: '10mb',
                prevent_duplicates: false,//防止重复
                mime_types: [{
                    title: "Image files",
                    extensions: "jpg,gif,png"
                }, {
                    title: "Zip files",
                    extensions: "zip"
                }]
            },
            resize: {
                width: undefined,
                height: undefined,
                enabled: false,
                preserve_headers: true,
                crop: false //Whether to crop images to exact dimensions. By default they will be resized proportionally.
            },
            max_retries: 0, //How many times to retry the chunk or file, before triggering Error event.
            chunk_size: 0, //Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or "204800b" or "200kb"`. By default - disabled.
            multipart: true, //Whether to send file and additional parameters as Multipart formated message.
            multi_selection: true, //Enable ability to select multiple files at once in file dialog.
            file_data_name: 'file', //Name for the file field in Multipart formated message.
            send_file_name: true, // Whether to send file name as additional argument - 'name' (required for chunked uploads and some other cases where file name cannot be sent via normal ways).
            send_chunk_number: true, //Whether to send chunks and chunk numbers, or total and offset bytes.
            multipart_params:{}//Hash of key/value pairs to send with every file upload.*/
            runtimes: 'html5,flash',
            max_file_size: '100mb',
            flash_swf_url: require.resolve('../') + 'vendor/plupload/Moxie.swf',
            //trigger order: init -> Error $ ro FilesAdded -> BeforeUpload -> QueueChanged? -> UploadProgress -> FileUploaded
            init: {
                PostInit: function(up) {},
                FilesAdded: function(up, files) {
                    dialog.add(up, files);
                    options.FilesAdded && options.FilesAdded.call(this, up, files);
                    up.start();
                },
                QueueChanged: function(up) {
                    dialog.queueChanged(up);
                },
                BeforeUpload: function(up, file) {
                    options.BeforeUpload && options.BeforeUpload.call(this, up, file);
                },
                UploadProgress: function(up, file) {
                    dialog.progress(up, file);
                },
                FileUploaded: function(up, file, data) {
                    data = JSON.parse(data.response);
                    dialog.success(up, file, data);
                    options.FileUploaded && options.FileUploaded(up, file, data);
                    up.removeFile(file);
                },
                UploadComplete: function(up, files) {
                    options.UploadComplete && options.UploadComplete(up, files);
                },
                Error: function(up, err) {
                    var file = err.file;
                    if (file) {
                        if (!file.dom) {
                            dialog.add(up, [file]);
                        }else{
                            up.removeFile(file);
                        }
                        dialog.error(up, err);
                    } else {
                        notify.error(err.message);
                    }
                }
            }
        }, options));
        uploader.init();
        return uploader;
    }
});
