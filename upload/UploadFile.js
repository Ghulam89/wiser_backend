const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, callBack) {
        callBack(null, 'images/');
    },
    filename: function (req, file, callBack) {
        let filename = Date.now() + path.extname(file.originalname);
        callBack(null, filename);
    },
});

const fileFilter = (req, file, callBack) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return callBack(null, true);
    }
    callBack('Error: Only image files (jpeg, jpg, png, gif) are allowed!');
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 3145728 },
    fileFilter: fileFilter
});

module.exports = {
    uploadUserImages: upload.fields([
        { name: 'CPRFrontSide', maxCount: 1 },
        { name: 'CPRBackSide', maxCount: 1 },
        { name: 'CPRReader', maxCount: 1 },
        { name: 'passport', maxCount: 1 }
    ])
};