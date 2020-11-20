const moment = require("moment")

const GuestService = {
    checkIfGuestExists(db, number) {
        return db('saferes_guest')
            .where({ phone_number: number })
            .first()
            .then(day => !!day)
    },
    getGuestData(db, number) {
        return db('saferes_guest')
            .where({ phone_number: number })
            .first()
            .returning('*')
    },
    insertNewGuest(db, data, restaurant_id) {
        return db
            .insert({
                phone_number: data.phone_number,
                guest_name: data.guest_name,
                restaurant_id: restaurant_id
            })
            .into('saferes_guest')
            .returning('*')
            .then(([guestData]) => {
                return GuestService.getGuestData(db, guestData.phone_number)
            })
    },
    incrementVisits(db, number, date) {
        return db
            .from('saferes_guest as guest')
            .where('guest.phone_number', number)
            .first()
            .increment({
                times_visited: 1
            })
            .update({
                last_visit: date
            })
    },
    incrementNoShows(db, number) {
        return db
            .from('saferes_guest as guest')
            .where('guest.phone_number', number)
            .first()
            .increment({
                no_shows: 1
            })
            .returning('*')
    },
    incrementCancellations(db, number) {
        return db
            .from('saferes_guest as guest')
            .where('guest.phone_number', number)
            .first()
            .increment({
                cancellations: 1
            })
    },
}

module.exports = GuestService