const express = require('express');
//Parser not necessary as index.js (express app) already uses body parser
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

//leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.get((req, res, next) => {
    Leaders.find({}).then(leaders => {
        res.status(200)
        .json(leaders);
    }, err => next(err))
    .catch(err => next(err));
})
.put((req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /leaders');
})
.post((req, res, next) => {
    Leaders.create(req.body).then(leader => {
        console.log('Leader Created: ', leader);
        res.status(200)
        .json(leader);
    }, err => next(err))
    .catch(err => next(err));
})
.delete((req, res, next) => {
    //remove() is deprecated, hence I have used deleteMany, which is equivalent
    Leaders.deleteMany({}).then(result => {
        res.status(200)
        .json(result);
    }, err => next(err))
    .catch(err => next(err));
})

leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    Leaders.findById(req.params.leaderId).then(leader => {
        res.status(200)
        .json(leader);
    }, err => next(err))
    .catch(err => next(err));
})
.post((req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /leaders/' + req.params.leaderId);
})
.put((req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, { new: true }).then(leader => {
        res.status(200)
        .json(leader);
    }, err => next(err))
    .catch(err => next(err));
})
.delete((req, res, next) => {
    //findByIdAndRemove is deprecated, which is why I have used findByIdAndDelete, which is equivalent
    Leaders.findByIdAndDelete(req.params.leaderId).then(leader => {
        res.status(200)
        .json(leader);
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = leaderRouter;