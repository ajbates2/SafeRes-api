const { json } = require('express')
const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const DailyCountingService = require('./dailyCount-service')

const countsRouter = express.Router()
const jsonBodyParser = express.json()

countsRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const res_day = req.body
        const newDay = res_day

        DailyCountingService.hasDailyCount(
            req.app.get('db'),
            newDay
        )
            .then(hasDailyCount => {
                if (hasDailyCount)
                    return res.json({ message: 'daily count already exists' })

                return DailyCountingService.insertDailyCount(
                    req.app.get('db'),
                    newDay
                )
                    .then(day => {
                        res
                            .status(201)
                            .json(day)
                    })
            })
            .catch(next)
    })

countsRouter
    .route('/:res_day')
    .all(requireAuth)
    .get((req, res, next) => {
        console.log(req.params)
        DailyCountingService.getDailyCount(
            req.app.get('db'),
            req.params.res_day
        )
            .then(resData => {
                res.json(resData)
            })
            .catch(next)
    })

module.exports = countsRouter