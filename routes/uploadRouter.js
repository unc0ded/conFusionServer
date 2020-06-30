const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/))
        return cb(new Error('You can only upload image files!'), false);
    else
        return cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
});

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('GET operation not supported on /imageUpload');
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not allowed on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res, next) => {
    res.status(200)
    .json(req.file);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('DELETE operation not allowed on /imageUpload');
});

module.exports = uploadRouter;