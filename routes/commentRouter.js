const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Comments = require('../models/comments');

const commentRouter = express.Router();

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query).populate('author').then(comments => {
        res.status(200)
        .json(comments);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body) {
        req.body.author = req.user._id;
        Comments.create(req.body)
        .then(comment => Comments.findById(comment.id).populate('author'))
        .then(saved => { res.status(200).json(saved); })
        .catch(err => next(err));
    }
    else {
        let err = new Error('Comment not founf in request body!');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.deleteMany({}).then(result => { res.status(200).json(result); })
    .catch(err => next(err));
});

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId).populate('author').then(comment => { res.status(200).json(comment); })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId).then(comment => {
        if (comment != null){
            if (!comment.author.equals(req.user._id)) {
                let err = new Error('You are not authorized to edit this comment!');
                err.status = 403;
                return next(err); 
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(req.params.commentId, {
                $set: req.body
            }, { new: true })
            .then(updated => Comments.findById(updated.id).populate('author'))
            .then(queried => { res.status(200).json(queried); })
            .catch(err => next(err));
        }
        else {
            err = new Error('Comment  ' + req.params.commentId + ' not found');
            err.status(404);
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId).then(comment => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                let err = new Error('You are not authorized to delete this comment!');
                err.status = 403;
                return next(err);
            }
            Comments.findByIdAndDelete(req.params.commentId)
            .then(comment => { res.status(200).json(comment); })
            .catch(err => next(err));
        }
        else {
            err = new Error('Comment  ' + req.params.commentId + ' not found');
            err.status(404);
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = commentRouter;