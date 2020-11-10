const express = require('express')
const path = require('path')
const ResService = require('./reservation-service')
const { requireAuth } = require('../middleware/jwt-auth')

const resRouter = express.Router()
const jsonBodyParser = express.json()

resRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { guest_name, phone_number, party_size, res_time, walk_in, notes } = req.body
        const newRes = { guest_name, phone_number, party_size, res_time, walk_in, notes }

        for (const [key, value] of Object.entries(newRes))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        newRes.restaurant_id = req.user.id

        ResService.insertNewRes(
            req.app.get('db'),
            newRes
        )
            .then(resInfo => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${resInfo.id}`))
                    .json(resInfo)
            })
            .catch(next)
    })

resRouter
    .route('/all/:restaurant_id')
    .all(requireAuth)
    .get((req, res, next) => {
        ResService.getByRestaurantId(
            req.app.get('db'),
            req.params.restaurant_id
        )
            .then(reservations => {
                res.json(reservations)
            })
            .catch(next)
    })

resRouter
    .route('/:res_id')
    .all(requireAuth)
    .get((req, res, next) => {
        ResService.getByResId(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                res.json({
                    ...resi[0]
                })
            })
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { guest_name, phone_number, party_size, res_time, notes } = req.body
        const resToUpdate = { guest_name, phone_number, party_size, res_time, notes }

        for (const [key, value] of Object.entries(resToUpdate))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        ResService.updateRes(
            req.app.get('db'),
            req.params.res_id,
            resToUpdate
        )
            .then(updatedRes => {
                res.status(204).end()
            })
            .catch(next)
    })

resRouter
    .route('/:res_id/arrived')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResArrived(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                res.json({
                    status: `checked off guest with id of ${resi}`
                })
            })
            .catch(next)
    })

resRouter
    .route('/:res_id/no_show')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResNoShow(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                console.log(resi)
                res.json({
                    status: `guest with id of ${resi} did not show up`
                })
            })
            .catch(next)
    })
resRouter
    .route('/:res_id/cancel')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResCancelled(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                console.log(resi)
                res.json({
                    status: `guest with id of ${resi} cancelled`
                })
            })
            .catch(next)
    })

module.exports = resRouter