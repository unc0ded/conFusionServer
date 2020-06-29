const express = require('express');
//Parser not necessary as index.js (express app) already uses body parser
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

//promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req, res, next) => {
    Promotions.find({}).then(promotions => {
        res.status(200)
        .json(promotions);
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /promotions');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then(promo => {
        console.log('Promo created: ', promo);
        res.status(200)
        .json(promo);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    //remove() is deprecated, hence I have used deleteMany, which is equivalent
    Promotions.deleteMany({}).then(result => {
        res.status(200)
        .json(result);
    }, err => next(err))
    .catch(err => next(err));
})

promoRouter.route('/:promoId')
.get((req, res, next) => {
    Promotions.findById(req.params.promoId).then(promo => {
        res.status(200)
        .json(promo);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /promotions/' + req.params.promoId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, { new: true }).then(promo => {
        res.status(200)
        .json(promo);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    //findByIdAndRemove is deprecated, which is why I have used findByIdAndDelete, which is equivalent
    Promotions.findByIdAndDelete(req.params.promoId).then(promo => {
        res.status(200)
        .json(promo);
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = promoRouter;