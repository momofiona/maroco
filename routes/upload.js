var express = require('express');
var router = express.Router();
var weedClient = require("weed-fs");
var path = require('path');
var fs = require('fs');

function GUID(){
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
        ).toString(16);
    };

    return  S4() + S4()  +S4() + S4() + S4() ;
}
var weedfs  = new weedClient({
    server:   "localhost",
    port:   "9333"
});

var filepath = path.join(path.normalize(__dirname + '/..'),'public','temp/');
/* GET users listing. */
router.post('/', function(req, res) {
/*    req.form.on('end', function() {
        if(req.query.action==="weed"){
            weedfs.write(req.files.thumbnail.path, function(err, fileInfo) {
                res.redirect('http://'+fileInfo.publicUrl+'/'+fileInfo.fid);
            });
        }else{
            res.send(JSON.stringify(req.files));
        }
    });*/
    if (req.busboy) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var ext=path.extname(filename), newFilename=GUID()+ext;
            ext=ext.slice(1);
            fstream = fs.createWriteStream(filepath + newFilename);
            file.pipe(fstream);
            fstream.on('close', function () {
                res.end(JSON.stringify({name:newFilename,ext:ext,filename:filename}));
            });
        });
        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            console.log(key);
        });
        req.pipe(req.busboy);
    }
});

module.exports = router;
