const moment = require("moment")

const DailyCountingService = {
    hasDailyCount(db, date) {
        return db('saferes_daily_counts')
            .where({ res_day: date })
            .first()
            .then(day => !!day)
    },
    insertDailyCount(db, date) {
        const week = moment(date, 'DDDDYYYY').format('WWYYYY')
        const month = moment(date, 'DDDDYYYY').format('MMYYYY')
        const year = moment(date, 'DDDDYYYY').year()
        const weekday = moment(date, 'DDDDYYYY').format('E')
        return db
            .insert({
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
    getDailyCount(db, date) {
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
    getWeeklyCount(db, week) {
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
            .where('daily.res_week', week)
    },
    updateHeadCount(db, date, party_size) {
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', date)
            .increment({ head_count: party_size })
    },
    incrementWalkIn(db, date, party_size) {
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', date)
            .increment({
                walk_ins: 1,
                head_count: party_size
            })
    },
    incrementNoShow(db, date) {
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', date)
            .increment({ no_shows: 1 })
            .returning('*')
    },
    incrementCancellations(db, date) {
        return db
            .from('saferes_daily_counts as daily')
            .where('daily.res_day', date)
            .increment({ cancellations: 1 })
    },
    incrementUnique(db, date, last_visit) {
        if (!last_visit) {
            return db
                .from('saferes_daily_counts as daily')
                .where('daily.res_day', date)
                .increment({ unique_parties: 1 })
        }
    }
}

module.exports = DailyCountingService