const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .populate('dishes')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, err => next(err))
        .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then(favorites => {
            // Favorite document exists for User
            if(favorites !== null) {
                // Dish added to favorites
                req.body.forEach(dish => {
                    if (favorites.dishes.indexOf(dish._id) === -1) {
                        favorites.dishes.push(dish._id);
                    }
                });
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    console.log('Favortie added to your list of favorites!');
                    res.json(favorites);
                }).catch(err => next(err))
            }
                else {
                    favorite = new Favorites({user: req.user._id});
                    favorite.dishes = [];
                    req.body.forEach(dish => {
                        favorite.dishes.push(dish._id);
                    });
                    favorite.save()
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        console.log('Favorite document added for user');
                        res.json(favorites);
                    }).catch(err => next(err))
                }  
        }, err => next(err))
        .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then(favorites => {
            console.log(favorites);
            // User has favorites document
            if(favorites !== null) {
                Favorites.remove({user: req.user._id})
                .then(resp => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    console.log('Your favorites have been removed from profile')
                    res.json(resp);
                })
            }
            // User does not have favorite document to delete
            else {
                err = new Error('Your profile does not contain any favorites to delete');
                err.status = 404;
                return next(err);
            }
        }, err => next(err))
        .catch(err => next(err));
    });

    favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser,  (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .populate('dishes')
        .then(favorite => {
            const favoriteDish = favorite.dishes.find(dish => {
                console.log(dish._id);
                console.log(req.params.dishId);
                return dish._id.equals(req.params.dishId);
            })
            console.log(favoriteDish);
            if (favoriteDish) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favoriteDish);
            }
            else {
                err = new Error(`Favorite dish ${req.params.dishId} not found`);
                err.status = 404;
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err));
    })
    
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then(favorites => {
            if(favorites !== null) {
                // Dish added to favorites
                if(favorites.dishes.indexOf(req.params.dishId) === -1) {
                    favorites.dishes.push(req.params.dishId)
                }
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    console.log('Favortie added to your list of favorites!');
                    res.json(favorites);
                }).catch(err => next(err))
            }
                else {
                    favorite = new Favorites({user: req.user._id});
                    favorite.dishes = [req.params.dishId];
                    favorite.save()
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        console.log('Favorite added for user');
                        res.json(favorites);
                    }).catch(err => next(err))
                }  
        }, err => next(err))
        .catch(err => next(err));
    })
    
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .populate('dishes')
        .then(favorites => {
            if(favorites) {
                favorites.dishes.filter(dish => {
                    dish._id !== req.params.dishId
                });
                favorites.save()
                .then (favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.send();
                })  
            }
            else {
                err = new Error(`Favorite dish ${req.params.dishId} not found`);
                err.status = 404;
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
    });


    module.exports = favoriteRouter;