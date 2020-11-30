const xss = require('xss')
const DailyCountingService = require('../counts/dailyCount-service')
const GuestService = require('../guest/guest-service')
const { patch } = require('./reservation-router')

const ResService = {

    getByRestaurantId(db, restaurant_id) {
        return db
            .from('saferes_res AS res')
            .select(
                'res.id',
                'res.guest_name',
                'res.phone_number',
                'res.party_size',
                'res.res_time',
                'res.notes',
                db.raw(`
                    json_build_object(
                        'id', guest.id,
                        'visited', guest.times_visited,
                        'no_shows', guest.no_shows,
                        'cancellations', guest.cancellations,
                        'last_visit', guest.last_visit
                    ) AS "guest_info"`
                ),
                'res.waiting',
                'res.notified'
            )
            .where('res.restaurant_id', restaurant_id)
            .join(
                'saferes_guest as guest',
                'res.phone_number',
                'guest.phone_number'
            )
            .whereNot({
                walk_in: true,
                no_show: true,
                arrived: true,
                cancelled: true
            })
            .orderBy('res.res_time', 'ASC')
    },
    getByResId(db, res_id) {
        return db
            .from('saferes_res as res')
            .select(
                'res.id',
                'res.guest_name',
                'res.phone_number',
                'res.party_size',
                'res.res_time',
                'res.notes',
                db.raw(`
                    json_build_object(
                        'id', guest.id,
                        'visited', guest.times_visited,
                        'no_shows', guest.no_shows,
                        'cancellations', guest.cancellations,
                        'last_visit', guest.last_visit
                    ) AS "guest_info"`
                ),
                'res.waiting',
                'res.notified',
                'res.res_date'
            )
            .join(
                'saferes_guest as guest',
                'res.phone_number',
                'guest.phone_number'
            )
            .where('res.id', res_id)
            .first()
            .then(data => data)
    },
    insertNewRes(db, resInfo) {
        return db
            .insert(resInfo)
            .into('saferes_res')
            .returning('*')
            .then(([resData]) => {
                if (resData.walk_in === true) {
                    return DailyCountingService.incrementWalkIn(db, resData.res_date, resData.party_size, resData.restaurant_id)
                        .then(() => { return this.getByResId(db, resData.id) })
                }
                else return this.getByResId(db, resData.id)
            })
    },
    updateRes(db, patchedRes) {
        const oldRes = this.getByResId(db, patchedRes.id)
        console.log(oldRes.phone_number)
        return db
            .from('saferes_res as res')
            .update({
                guest_name: patchedRes.guest_name,
                phone_number: patchedRes.phone_number,
                party_size: patchedRes.party_size,
                res_time: patchedRes.res_time,
                notes: patchedRes.notes
            })
            .where('res.id', patchedRes.id)
            .then(() => { return this.getByResId(db, patchedRes.id) })
    },
    updateResArrived(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                arrived: true
            })
            .select('res.guest_name')
            .where('res.id', res_id)
            .then(resData => { return this.getByResId(db, res_id) })
    },
    updateResNoShow(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                no_show: true
            })
            .where('res.id', res_id)
            .returning('*')
            .then(() => { return this.getByResId(db, res_id) })
    },
    updateResCancelled(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                cancelled: true
            })
            .where('res.id', res_id)
            .then(() => { return this.getByResId(db, res_id) })
    },
    updateResWaiting(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                waiting: true
            })
            .where('res.id', res_id)
            .then(() => { return this.getByResId(db, res_id) })
    },
    getAllByDate(db, date) {
        return db
            .from('saferes_res as res')
            .select('*')
            .where({ res_date: date })
            .whereNot({
                no_show: true,
                cancelled: true
            })
            .orderBy('res.res_time', 'ASC')
    }
}

module.exports = ResService