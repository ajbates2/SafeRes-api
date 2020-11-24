const config = require("../config")

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
    }
}

module.exports = SmsService