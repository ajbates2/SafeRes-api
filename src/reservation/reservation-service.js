const xss = require('xss')
const DailyCountingService = require('../counts/dailyCount-service')

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
                'res.waiting',
                'res.notified'
            )
            .where('res.restaurant_id', restaurant_id)
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
                'res.res_date'
            )
            .where('res.id', res_id)
            .first()
    },
    insertNewRes(db, resInfo) {
        return db
            .insert(resInfo)
            .into('saferes_res')
            .returning('*')
            .then(([resData]) => resData)
            .then(resData => {
                if (resData.walk_in === true) {
                    return DailyCountingService.incrementWalkIn(db, resData.res_date, resData.party_size)
                }
            })
    },
    updateRes(db, res_id, newResInfo) {
        return db
            .from('saferes_res as res')
            .where('res.id', res_id)
            .update(newResInfo)
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
            .then(resData => {
                return (
                    DailyCountingService.incrementNoShow(
                        db,
                        resData.res_date)
                )
            })
            .then(() => { return this.getByResId(db, res_id) })
    },
    updateResCancelled(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                cancelled: true
            })
            .where('res.id', res_id)
            .then(resData => {
                return (
                    DailyCountingService.incrementCancelled(
                        db,
                        resData.res_date
                    )
                )
            })
            .then(() => { return this.getByResId(db, res_id) })
    }
}

module.exports = ResService