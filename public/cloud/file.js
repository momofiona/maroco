/* 处理文件操作 */
define(function(require, exports, module) {
    //文件类型
    var EXTS = {
        txt: ['txt'],
        jpg: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
        mp3: ['mp3'],
        mp4: ['mp4', 'rmvb', 'avi', 'rm', 'mkv', 'wmv'],
        doc: ['doc', 'docx', 'wps', 'wpt'],
        ppt: ['ppt', 'pptx', 'dps', 'dpt'],
        xls: ['xls', 'xlsx', 'et', 'ett'],
        zip: ['zip', 'rar', '7z', 'tar'],
        pdf: ['pdf']
    };
    //转换成map
    var extMap = {};
    _.each(EXTS, function(o, i) {
        _.each(o, function(v) {
            extMap[v] = i;
        });
    });


    /**
     * 获取文件名后缀
     * @param  {[type]} filename [description]
     * @return {[type]}          [description]
     */
    var extReg = /.*\./g;
    exports.getExt = function(name) {
        var dp = name.lastIndexOf('.');
        return (dp == -1 ? '' : name.slice(dp + 1)).toLocaleLowerCase();
    };

    /**
     * 获取文件对应图标css class
     * @param  {Object} file [文件对象]
     * @return {String}      [图标文件路径]
     * fileType="1" 文件
     * fileType="0" 文件夹
     * node.png?
     */
    exports.getFileIcon = function(file) {
        if (file.fileType == "0") return 'folder';
        var ext = this.getExt(file.fileName);
        ext = extMap[ext] ? extMap[ext] : 'unknow';
        return ext;
    }

    /**
     * 获取同步共享图标css class_只在同步共享栏目中用到
     * @param  {Object} file [文件对象]
     * @return {String}      [图标文件路径]
    otherType:0    个人
        useType: {
            personalShare: 0, 右箭头 [myshare]
            departmentShare: 1, 3个人 [departmentShare]
            personalSyn: 2  人 [personalSyn]
        }
    otherType:1  左箭头 [othershare]
     */
    var shareFolderIconMap = ['myshare', 'departmentShare', 'personalSyn'];
    exports.getShareFolderIcon = function(file) {
        return (file.otherType ? 'othershare' : shareFolderIconMap[file.useType]);
    }

});
