const express = require('express')
const ResService = require('./reservation-service')
const { requireAuth } = require('../middleware/jwt-auth')
const DailyCountingService = require('../counts/dailyCount-service')
const GuestService = require('../guest/guest-service')
const SmsService = require('../sms/sms-service')

const resRouter = express.Router()
const jsonBodyParser = express.json()

resRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { guest_name, phone_number, party_size, res_time, walk_in, notes, res_date } = req.body
        const newRes = { guest_name, phone_number, party_size, res_time, walk_in, notes, res_date }

        for (const [key, value] of Object.entries(newRes))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        newRes.restaurant_id = req.user.id

        GuestService.checkIfGuestExists(
            req.app.get('db'),
            newRes.phone_number
        )
            .then(guestExists => {
                if (!guestExists)
                    GuestService.insertNewGuest(
                        req.app.get('db'),
                        newRes,
                        newRes.restaurant_id
                    )
            })
            .then(() => {
                ResService.insertNewRes(
                    req.app.get('db'),
                    newRes
                )
                    .then(resInfo => {
                        resInfo.walk_in
                            ? GuestService.incrementVisits(
                                req.app.get('db'),
                                resInfo.phone_number,
                                resInfo.res_date,
                                newRes.restaurant_id
                            )
                                .then(resInfo => res.status(201)
                                    .json(resInfo))
                            : res
                                .status(201)
                                .json(resInfo)
                    })
                    .catch(next)
            })
    })

resRouter
    .route('/all')
    .all(requireAuth)
    .get((req, res, next) => {
        ResService.getByRestaurantId(
            req.app.get('db'),
            req.user.id
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

        resToUpdate.id = Number(req.params.res_id)

        GuestService.checkIfGuestExists(
            req.app.get('db'),
            resToUpdate.phone_number
        )
            .then(guestExists => {
                if (!guestExists)
                    GuestService.insertNewGuest(
                        req.app.get('db'),
                        resToUpdate,
                        req.user.id
                    )
            })
            .then(() => {
                ResService.updateRes(
                    req.app.get('db'),
                    resToUpdate
                )
                    .then(updatedRes => {
                        res
                            .json({ message: `${updatedRes.guest_name} was updated` })
                            .status(200)
                    })
                    .catch(next)
            })
    })

resRouter
    .route('/arrived/:res_id')
    .all(requireAuth)
    .patch((req, res, next) => {
        const restaurant_id = req.user.id
        ResService.updateResArrived(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                Promise.all([
                    DailyCountingService.updateHeadCount(
                        req.app.get('db'),
                        resi.res_date,
                        resi.party_size,
                        restaurant_id
                    ),
                    DailyCountingService.incrementUnique(
                        req.app.get('db'),
                        resi.res_date,
                        resi.guest_info.last_visit,
                        restaurant_id
                    ),
                    GuestService.incrementVisits(
                        req.app.get('db'),
                        resi.phone_number,
                        resi.res_date,
                    )
                ])
                res.json({
                    message: `${resi.guest_name} was checked off`
                })
            })
            .catch(next)
    })

resRouter
    .route('/no_show/:res_id')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResNoShow(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                Promise.all([
                    DailyCountingService.incrementNoShow(
                        req.app.get('db'),
                        resi.res_date,
                        req.user.id
                    ),
                    GuestService.incrementNoShows(
                        req.app.get('db'),
                        resi.phone_number
                    )])
                res.json({
                    message: `${resi.guest_name} was a no show`
                })
            })
            .catch(next)
    })

resRouter
    .route('/cancel/:res_id')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResCancelled(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                Promise.all([
                    DailyCountingService.incrementCancellations(
                        req.app.get('db'),
                        resi.res_date,
                        req.user.id
                    ),
                    GuestService.incrementCancellations(
                        req.app.get('db'),
                        resi.phone_number
                    )])
                res.json({
                    message: `${resi.guest_name} cancelled`
                })
            })
            .catch(next)
    })

resRouter
    .route('/waiting/:res_id')
    .all(requireAuth)
    .patch((req, res, next) => {
        ResService.updateResWaiting(
            req.app.get('db'),
            req.params.res_id
        )
            .then(resi => {
                res.json({
                    message: `${resi.guest_name} is waiting`
                })
            })
            .catch(next)
    })

resRouter
    .route('/day/:res_date')
    .all(requireAuth)
    .get((req, res, next) => {
        ResService.getAllByDate(
            req.app.get('db'),
            req.params.res_date
        )
            .then(resData => {
                res.json(resData)
            })
            .catch(next)
    })

module.exports = resRouter