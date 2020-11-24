const { json } = require('express')
const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const DailyCountingService = require('./dailyCount-service')

const countsRouter = express.Router()

countsRouter
    .route('/day/:res_day')
    .all(requireAuth)
    .get((req, res, next) => {
        DailyCountingService.getDailyCount(
            req.app.get('db'),
            req.params.res_day
        )
            .then(resData => {
                if (!resData.length) {
                    return DailyCountingService.insertDailyCount(
                        req.app.get('db'),
                        req.params.res_day
                    )
                        .then(resData => {
                            res.json(resData[0]).status(201)
                        })
                }
                else {
                    res.json(resData[0]).status(200)
                }
            })
            .catch(next)
    })

countsRouter
    .route('/week/:res_week')
    .all(requireAuth)
    .get((req, res, next) => {
        DailyCountingService.getWeeklyCount(
            req.app.get('db'),
            req.params.res_week
        )
            .then(resData => {
                if (!resData.length) {
                    return res
                        .json({ message: `that week hasn't happened yet` })
                        .status(204)
                }
                else {
                    res.json(resData).status(200)
                }
            })

            .catch(next)
    })

module.exports = countsRouter