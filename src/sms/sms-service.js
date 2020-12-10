const phone = require("phone");
const config = require("../config")
const moment = require("moment")

const accountSid = config.TWILIO_ACCOUNT_SID
const authToken = config.TWILIO_AUTH_TOKEN
const twilioPhone = config.TWILIO_NUMBER
const client = require('twilio')(accountSid, authToken);


const SmsService = {
    notifyGuest(guestNumber, guest_name) {
        return client.messages
            .create({
                body: `Hi ${guest_name}, you're table is ready at DEMO RESTAURANT`,
                from: twilioPhone,
                to: guestNumber,
                opts: { to: '+16127433196', from: twilioPhone, body: 'Invalid number' }
            })
            .then((msg) => {
                console.log(msg)
                return {
                    message: `${guest_name} was notified at ${msg.to}`,
                    status: 201
                }
            })
            .catch((err) => {
                return {
                    message: 'that number does not exist',
                    code: err.code,
                    status: err.status,
                }
            })
    },
    updateNotifyState(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                notified: true
            })
            .where('res.id', res_id)
    },
    emergencyNotify(numbersToMessage, message) {
        numbersToMessage.forEach(num => {
            let sms = client.messages.create({
                body: message,
                from: twilioPhone,
                to: num,
            })
                .then(sms => sms)
                .done()
        })
    }
}

module.exports = SmsService