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
                to: guestNumber
            })
            .then(message => message)
    },
    updateNotifyState(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                notified: true
            })
            .where('res.id', res_id)
    },
    reservationSms(resData) {
        return client.messages
            .create({
                body: `Hi ${resData.guest_name}!, we are excited to see you at ${moment(resData.res_time, 'HH:mm:SS').format('hh:mm a')}, don't forget to bring your mask!`,
                from: twilioPhone,
                to: phone(resData.phone_number)[0]
            })
    }
}

module.exports = SmsService