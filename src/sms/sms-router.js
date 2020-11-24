const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth');
const SmsService = require('./sms-service');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const smsRouter = express.Router()
const jsonBodyParser = express.json()

smsRouter
    .route('/notify/:phone_number')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { guest_name, res_id } = req.body
        SmsService.updateNotifyState(
            req.app.get('db'),
            res_id
        )
            .then(() => {
                SmsService.notifyGuest(
                    req.params.phone_number,
                    guest_name
                )
                    .then(message => {
                        res
                            .json({
                                status: `Message to ${guest_name} at ${message.to} was successful`
                            })
                            .status(201)
                    })
                    .catch(next)
            })
    })

module.exports = smsRouter