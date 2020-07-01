const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
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
.options(cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('GET operation not supported on /imageUpload');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not allowed on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res, next) => {
    res.status(200)
    .json(req.file);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('DELETE operation not allowed on /imageUpload');
});

module.exports = uploadRouter;