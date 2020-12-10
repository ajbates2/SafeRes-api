const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth');
const SmsService = require('./sms-service');

const smsRouter = express.Router()
const jsonBodyParser = express.json()

smsRouter
    .route('/notify/:phone_number')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { guest_name, res_id } = req.body
        SmsService.notifyGuest(
            req.params.phone_number,
            guest_name
        )
            .then(msg => {
                res
                    .json({
                        message: msg.message
                    })
                    .status(msg.status)
            })
            .then(() => {
                SmsService.updateNotifyState(
                    req.app.get('db'),
                    res_id
                )
            })
    })

module.exports = smsRouter