const express = require('express');
//Parser not necessary as index.js (express app) already uses body parser
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');
const { verify } = require('jsonwebtoken');

const dishRouter = express.Router();

//dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req, res, next) => {
    Dishes.find({}).populate('comments.author').then(dishes => {
        res.status(200)
        .json(dishes);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish created: ', dish);
        res.status(200)
        .json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin,  (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.deleteMany({}).then(resp => {
        res.status(200)
        .json(resp);
    }, err => next(err))
    .catch(err => next(err));
});

dishRouter.route('/:dishId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author').then(dish => {
        res.status(200)
        .json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /dishes/' + req.params.dishId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true }).then(dish => {
        res.status(200)
        .json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndDelete(req.params.dishId).then(resp => {
        res.status(200)
        .json(resp);
    }, err => next(err))
    .catch(err => next(err));
});

dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author').then(dish => {
        if(dish != null) {
            res.status(200)
            .json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(dish => {
                return Dishes.findById(dish.id).populate('comments.author');
            })
            .then(dish => {
                res.status(200)
                .json(dish);
            }).catch(err => next(err));
        }
        else {
            let err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
        if(dish != null){
            dish.comments.splice(0);
            dish.save().then(dish => {
                res.status(200)
                .json(dish);
            }, err => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author').then(dish => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.status(200)
            .json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
        else {
            err = new Error('Comment  ' + req.params.commentId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
        if (dish != null && dish.comments.id(req.params.commentId) != null){
            if ((req.user._id).equals(dish.comments.id(req.params.commentId).author)) {
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save().then(dish => {
                    return Dishes.findById(dish.id).populate('comments.author');
                })
                .then(dish => {
                    res.status(200)
                    .json(dish);
                }).catch(err => next(err));
            }
            else {
                let err = new Error('You are not authorized to edit this comment!');
                err.status = 403;
                return next(err);
            }
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
        else {
            err = new Error('Comment  ' + req.params.commentId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if ((req.user._id).equals(dish.comments.id(req.params.commentId).author)) {
                dish.comments.id(req.params.commentId).remove();
                dish.save().then(dish => {
                    return Dishes.findById(dish.id).populate('comments.author');
                })
                .then(dish => {
                    res.status(200)
                    .json(dish);
                }).catch(err => next(err));
            }
            else {
                let err = new Error('You are not authorized to delete this comment!');
                err.status = 403;
                return next(err);
            }
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status(404);
            return next(err);
        }
        else {
            err = new Error('Comment  ' + req.params.commentId + ' not found');
            err.status(404);
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = dishRouter;