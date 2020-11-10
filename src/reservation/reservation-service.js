const xss = require('xss')

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
                'res.notes'
            )
            .where('res.id', res_id)
    },
    insertNewRes(db, resInfo) {
        return db
            .insert(resInfo)
            .into('saferes_res')
            .returning('*')
            .then(([resData]) => resData)
            .then(resData =>
                ResService.getByRestaurantId(db, resData.restaurant_id)
            )
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
    },
    updateResNoShow(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                no_show: true
            })
            .where('res.id', res_id)
    },
    updateResCancelled(db, res_id) {
        return db
            .from('saferes_res as res')
            .update({
                cancelled: true
            })
            .where('res.id', res_id)
    },
}

module.exports = ResService