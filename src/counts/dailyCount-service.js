const moment = require("moment")

const DailyCountingService = {
    hasDailyCount(db, date) {
        return db('saferes_daily_counts')
            .where({ res_day: date })
            .first()
            .then(day => !!day)
    },
    insertDailyCount(db, date, restaurant_id) {
        const week = moment(date, 'DDDDYYYY').format('WWYYYY')
        const month = moment(date, 'DDDDYYYY').format('MMYYYY')
        const year = moment(date, 'DDDDYYYY').year()
        const weekday = moment(date, 'DDDDYYYY').format('E')
        return db
            .insert({
                restaurant_id: restaurant_id,
                res_day: date,
                res_week: week,
                res_month: month,
                res_year: year,
                res_weekday: weekday
            })
            .into('saferes_daily_counts as daily')
            .returning('*')
            .whereNot('daily.res_day', date)
            .then(data => data)
    },
    getDailyCount(db, date, restaurant_id) {
        return db
            .from('saferes_daily_counts as daily')
            .select(
                'daily.res_day',
                'daily.unique_parties',
                'daily.walk_ins',
                'daily.no_shows',
                'daily.cancellations',
                'daily.head_count'
            )
            .where({
                res_day: date,
                restaurant_id: restaurant_id
            })
    },
    getWeeklyCount(db, week, restaurant_id) {
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
            .where({
                res_week: week,
                restaurant_id: restaurant_id
            })
    },
    updateHeadCount(db, date, party_size, restaurant_id) {
        return db
            .from('saferes_daily_counts as daily')
            .where({
                res_day: date,
                restaurant_id: restaurant_id
            })
            .increment({ head_count: party_size })
    },
    incrementWalkIn(db, date, party_size, restaurant_id) {
        return db
            .from('saferes_daily_counts as daily')
            .where({
                res_day: date,
                restaurant_id: restaurant_id
            })
            .increment({
                walk_ins: 1,
                head_count: party_size
            })
    },
    incrementNoShow(db, date, restaurant_id) {
        return db
            .from('saferes_daily_counts as daily')
            .where({
                res_day: date,
                restaurant_id: restaurant_id
            })
            .increment({ no_shows: 1 })
            .returning('*')
    },
    incrementCancellations(db, date, restaurant_id) {
        return db
            .from('saferes_daily_counts as daily')
            .where({
                res_day: date,
                restaurant_id: restaurant_id
            })
            .increment({ cancellations: 1 })
    },
    incrementUnique(db, date, last_visit, restaurant_id) {
        if (last_visit === null) {
            return db
                .from('saferes_daily_counts as daily')
                .where({
                    res_day: date,
                    restaurant_id: restaurant_id
                })
                .increment({ unique_parties: 1 })
        }
    }
}

module.exports = DailyCountingService