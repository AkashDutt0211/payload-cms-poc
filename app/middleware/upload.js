const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

exports.imageUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
        if (mimetype && extname) {
          return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
      }
}).single('file');

exports.fileUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        var filetypes = /pdf/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
        if (mimetype && extname) {
          return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
      }
}).single('file');

