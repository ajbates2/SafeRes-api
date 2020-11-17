const moment = require("moment")

const DailyCountingService = {
    hasDailyCount(db, date) {
        const dateId = moment(date).format('DDDDYYYY')
        return db('saferes_daily_counts')
            .where({ res_day: dateId })
            .first()
            .then(day => !!day)
    },
    insertDailyCount(db, date) {
        const day = moment(date).format('DDDDYYYY')
        const week = moment(date).format('WWYYYY')
        const month = moment(date).format('MMYYYY')
        const year = moment(date).year()
        return db
            .insert({
                res_day: day,
                res_week: week,
                res_month: month,
                res_year: year
            })
            .into('saferes_daily_counts as daily')
            .returning('*')
            .whereNot('daily.res_day', day)
            .then(data => data)
    },
    getDailyCount(db, date) {
        console.log(date)
        return db
            .from('saferes_daily_counts as daily')
            .select(
                'daily.res_day',
                'daily.unique_guests',
                'daily.walk_ins',
                'daily.no_shows',
                'daily.cancellations',
                'daily.head_count'
            )
            .where('daily.res_day', date)
    },
    updateHeadCount(db, date, party_size) {
        const day = moment(date).format('DDDDYYYY')
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', day)
            .increment({ head_count: party_size })
    },
    incrementWalkIn(db, date, party_size) {
        const day = moment(date).format('DDDDYYYY')
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', day)
            .increment({
                walk_ins: 1,
                head_count: party_size
            })
    },
    incrementNoShow(db, date) {
        const day = moment(date).format('DDDDYYYY')
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', day)
            .increment({ no_shows: 1 })
    },
    incrementCancelled(db, date) {
        const day = moment(date).format('DDDDYYYY')
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', day)
            .increment({ cancellations: 1 })
    }
}

module.exports = DailyCountingService