const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.get(authenticate.verifyUser, cors.cors, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).populate('user').populate('dishes').then(doc => {
        res.status(200)
        .json(doc);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(async favdoc => {
        if (favdoc) {
            for (const givenDish of req.body) {
                await Dishes.findOne({ _id: givenDish._id }).then(dish => {
                    if (dish) {
                        if(favdoc.dishes.indexOf(dish._id) === -1) {
                            favdoc.dishes.push(dish._id);
                        }
                    //     else {
                    //         res.write('Dish ' + dish._id + ' already exists in favorites\n');
                    //     }
                    // }
                    // else {
                    //     res.write('Dish ' + givenDish._id + ' does not exist.\n');
                    }
                }, err => next(err));
            };
            favdoc.save().then(savedDish => {
                res.status(200)
                .json(savedDish);
            }, err => next(err));
        }
        else {
            Favorites.create({ user: req.user._id }).then(async favorites => {
                for (const givenDish of req.body) {
                    await Dishes.findOne({ _id: givenDish._id }).then(dish => {
                        if (dish) {
                            if(favorites.dishes.indexOf(dish._id) === -1) {
                                favorites.dishes.push(dish._id);
                            }
                            // else {
                            //     res.write('Dish ' + dish._id + ' already exists in favorites\n');
                            // }
                        }
                        // else {
                        //     res.write('Dish ' + givenDish._id + ' does not exist.\n');
                        // }
                    }, err => next(err));  
                };
                favorites.save().then(doc => {
                    res.status(200)
                    .json(doc);
                }, err => next(err));
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
.delete(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(doc => {
        if (doc) {
            Favorites.deleteOne({ _id: doc.id }).then(doc => {
                res.status(200)
                .json(doc);
            }, err => next(err));
        }
        else {
            res.status(200)
            .contentType('text/plain')
            .send('Favorites not yet added.')
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:dishId')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favdoc => {
        if (favdoc) {
             if (favdoc.dishes.indexOf(req.params.dishId) == -1) {
                res.status(200)
                .json({ exists: false, favorites: favdoc });
             }
             else {
                 res.status(200)
                 .json({ exists: true, favorites: favdoc });
             }
        }
        else {
            res.status(200)
            .json({ exists: false, favorites: favdoc });
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(doc => {
        if (doc) {
            Dishes.findOne({ _id: req.params.dishId }).then(dish => {
                if (dish) {
                    if (doc.dishes.indexOf(dish._id) === -1) {
                        doc.dishes.push(dish._id);
                        doc.save().then(saved => { res.status(200).json(saved); }
                        , err => next(err));
                    }
                    else {
                        res.status(200)
                        .contentType('text/plain')
                        .send('This dish already exists in favorites.');
                    }
                }
                else {
                    res.status(200)
                    .contentType('text/plain')
                    .send('Invalid dishId.');
                }
            }, err => next(err));
        }
        else {
            Dishes.findOne({ _id: req.params.dishId }).then(dish => {
                if (dish) {
                    Favorites.create({ user: req.user._id }).then(favdoc => {
                        favdoc.dishes.push(dish._id);
                        return favdoc.save();
                    })
                    .then(doc => { res.status(200).json(doc); })
                    .catch(err => next(err));
                }
                else {
                    res.status(200)
                    .contentType('text/plain')
                    .send('Invalid dishId.');
                }
            }, err => next(err));
        }
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(doc => {
        if (doc) {
            if (doc.dishes.indexOf(req.params.dishId) !== -1) {
                doc.dishes.splice(doc.dishes.indexOf(req.params.dishId), 1);
                doc.save().then(doc => { res.status(200).json(doc); })
            }
            else {
                res.status(200)
                .contentType('text/plain')
                .send('This dish does not exist in favorites.');
            }
        }
        else {
            res.status(200)
            .contentType('text/plain')
            .send('Favorites not yet added');
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;