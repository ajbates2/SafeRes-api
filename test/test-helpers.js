const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

function makeRestaurantArray() {
    return [
        {
            id: 1,
            restaurant_name: "Bar 1",
            email: "foo@bar.com",
            password: "Password",
            date_added: new Date(),
        },
        {
            id: 2,
            restaurant_name: "Bar 2",
            email: "bar@foo.com",
            password: "Password",
            date_added: new Date(),
        },
    ]
}

function makeGuestArray(restaurant) {
    return [
        {
            id: 1,
            guest_name: 'Jeff 1',
            phone_number: '612-123-4567',
            date_added: new Date(),
            times_visited: 0,
            no_shows: 0,
            cancellations: 0,
            last_visit: null,
            restaurant_id: restaurant[0].id
        },
        {
            id: 2,
            guest_name: 'Jeff 2',
            phone_number: '612-456-7890',
            date_added: new Date(),
            times_visited: 1,
            no_shows: 0,
            cancellations: 0,
            last_visit: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id
        },
        {
            id: 3,
            guest_name: 'Jeff 3',
            phone_number: '612-987-6543',
            date_added: new Date(),
            times_visited: 0,
            no_shows: 0,
            cancellations: 0,
            last_visit: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id
        },
        {
            id: 4,
            guest_name: 'Jeff 4',
            phone_number: '612-654-3210',
            date_added: new Date(),
            times_visited: 2,
            no_shows: 0,
            cancellations: 0,
            last_visit: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id
        }
    ]
}

function makeDailyCountArray(restaurant) {
    const testDay = moment().format('DDDDYYYY')
    const testWeek = moment(testDay, 'DDDDYYYY').format('WWYYYY')
    const testMonth = moment(testDay, 'DDDDYYYY').format('MMYYYY')
    const testYear = moment(testDay, 'DDDDYYYY').year()
    const testWeekday = moment(testDay, 'DDDDYYYY').format('E')
    return [
        {
            id: 1,
            restaurant_id: restaurant[0].id,
            res_day: testDay,
            res_week: testWeek,
            res_month: testMonth,
            res_year: testYear,
            res_weekday: testWeekday,
            unique_parties: 0,
            walk_ins: 0,
            no_shows: 0,
            cancellations: 0,
            head_count: 0
        }
    ]
}

function makeResiArray(restaurant) {
    return [
        {
            id: 1,
            guest_name: 'Jeff 1',
            phone_number: '612-123-4567',
            res_date: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id,
            res_time: '16:00',
            party_size: 2,
            walk_in: false,
            no_show: false,
            arrived: false,
            cancelled: false,
            notified: false,
            waiting: false,
            notes: 'bar'
        },
        {
            id: 2,
            guest_name: 'Jeff 2',
            phone_number: '612-456-7890',
            res_date: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id,
            res_time: '16:00',
            party_size: 2,
            walk_in: true,
            no_show: false,
            arrived: false,
            cancelled: false,
            notified: false,
            waiting: false,
            notes: 'bar'
        },
        {
            id: 3,
            guest_name: 'Jeff 3',
            phone_number: '612-987-6543',
            res_date: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id,
            res_time: '17:00',
            party_size: 2,
            walk_in: false,
            no_show: true,
            arrived: false,
            cancelled: false,
            notified: false,
            waiting: false,
            notes: ''
        },
        {
            id: 4,
            guest_name: 'Jeff 4',
            phone_number: '612-654-3210',
            res_date: moment().format('DDDDYYYY'),
            restaurant_id: restaurant[0].id,
            res_time: '17:00',
            party_size: 2,
            walk_in: true,
            no_show: false,
            arrived: false,
            cancelled: true,
            notified: false,
            waiting: false,
            notes: ''
        },
    ]
}



function makeSafeResFixtures() {
    const testRestaurants = makeRestaurantArray()
    const testGuests = makeGuestArray(testRestaurants)
    const testResis = makeResiArray(testRestaurants)
    const testDailyCount = makeDailyCountArray(testRestaurants)
    return { testRestaurants, testGuests, testResis, testDailyCount }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                saferes_restaurant,
                saferes_res,
                saferes_guest,
                saferes_daily_counts
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE saferes_restaurant_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE saferes_res_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE saferes_guest_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE saferes_daily_counts_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('saferes_restaurant_id_seq', 0)`),
                    trx.raw(`SELECT setval('saferes_res_id_seq', 0)`),
                    trx.raw(`SELECT setval('saferes_guest_id_seq', 0)`),
                    trx.raw(`SELECT setval('saferes_daily_counts_id_seq', 0)`)
                ])
            )
    )
}

function seedRestaurants(db, restaurants) {
    const preppedRestaurants = restaurants.map(bar => ({
        ...bar,
        password: bcrypt.hashSync(bar.password, 1)
    }))
    return db.into('saferes_restaurant').insert(preppedRestaurants)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('saferes_restaurant_id_seq', ?)`,
                [restaurants[restaurants.length - 1].id],
            )
        )
}

function seedSafeResTables(db, bars, resi = [], guest = [], count = []) {
    return db.transaction(async trx => {
        await seedRestaurants(trx, bars)
        if (resi.length) {
            await trx.into('saferes_res').insert(resi)
            await trx.raw(
                `SELECT setval('saferes_res_id_seq', ?)`,
                [resi[resi.length - 1].id]
            )
        }
        if (guest.length) {
            await trx.into('saferes_guest').insert(guest)
            await trx.raw(
                `SELECT setval('saferes_guest_id_seq', ?)`,
                [guest[guest.length - 1].id]
            )
        }
        if (count.length) {
            await trx.into('saferes_daily_counts').insert(count)
            await trx.raw(
                `SELECT setval('saferes_daily_counts_id_seq', ?)`,
                [count[count.length - 1].id]
            )
        }
    })
}

function makeAuthHeader(restaurant, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ restaurant_id: restaurant.id }, secret, {
        subject: restaurant.email,
        algorithm: 'HS256'
    })
    return `Bearer ${token}`
}

module.exports = {
    makeGuestArray,
    makeResiArray,
    makeRestaurantArray,

    makeSafeResFixtures,
    seedRestaurants,
    cleanTables,
    makeAuthHeader,
    seedSafeResTables,
}