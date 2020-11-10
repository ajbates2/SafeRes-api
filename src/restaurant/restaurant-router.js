const express = require('express')
const path = require('path')
const RestaurantService = require('./restaurant-service')
const { requireAuth } = require('../middleware/jwt-auth')

const restaurantRouter = express.Router()

restaurantRouter
    .route('/:restaurant_id')
    .all(requireAuth)
    .get((req, res, next) => {
        RestaurantService.getByRestaurantId(
            req.app.get('db'),
            req.params.restaurant_id
        )
            .then(reservations => {
                res.json(reservations)
            })
            .catch(next)
    })

module.exports = restaurantRouter