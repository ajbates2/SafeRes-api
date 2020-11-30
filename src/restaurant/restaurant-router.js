const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const GuestService = require('../guest/guest-service')

const restaurantRouter = express.Router()
const jsonBodyParser = express.json()

restaurantRouter
    .route('/:phone_number')
    .all(requireAuth)
    .get((req, res, next) => {
        GuestService.getGuestData(
            req.app.get('db'),
            req.params.phone_number
        )
            .then(guestData => {
                return res
                    .json(guestData)
                    .status(200)
            })
            .catch(next)
    })

module.exports = restaurantRouter