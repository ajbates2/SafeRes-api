const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
            last_visit: new Date(),
            restaurant_id: restaurant[0].id
        },
        {
            id: 2,
            guest_name: 'Jeff 2',
            phone_number: '612-456-7890',
            date_added: new Date(),
            times_visited: 1,
            last_visit: new Date(),
            restaurant_id: restaurant[0].id
        },
        {
            id: 3,
            guest_name: 'Jeff 3',
            phone_number: '612-987-6543',
            date_added: new Date(),
            times_visited: 0,
            last_visit: new Date(),
            restaurant_id: restaurant[0].id
        },
        {
            id: 4,
            guest_name: 'Jeff 4',
            phone_number: '612-654-3210',
            date_added: new Date(),
            times_visited: 2,
            last_visit: new Date(),
            restaurant_id: restaurant[0].id
        }
    ]
}

function makeResiArray(restaurant) {
    return [
        {
            id: 1,
            guest_name: 'Jeff 1',
            phone_number: '612-123-4567',
            res_date: new Date(),
            restaurant_id: restaurant[0].id,
            res_time: '16:00',
            party_size: 2,
            walk_in: false,
            no_show: false,
            arrived: false,
            notes: 'bar'
        },
        {
            id: 2,
            guest_name: 'Jeff 2',
            phone_number: '612-456-7890',
            res_date: new Date(),
            restaurant_id: restaurant[0].id,
            res_time: '16:00',
            party_size: 2,
            walk_in: false,
            no_show: false,
            arrived: false,
            notes: 'bar'
        },
        {
            id: 3,
            guest_name: 'Jeff 3',
            phone_number: '612-987-6543',
            res_date: new Date(),
            restaurant_id: restaurant[0].id,
            res_time: '17:00',
            party_size: 2,
            walk_in: false,
            no_show: false,
            arrived: false,
            notes: ''
        },
        {
            id: 4,
            guest_name: 'Jeff 4',
            phone_number: '612-654-3210',
            res_date: new Date(),
            restaurant_id: restaurant[0].id,
            res_time: '17:00',
            party_size: 2,
            walk_in: true,
            no_show: false,
            arrived: false,
            notes: ''
        },
    ]
}



function makeSafeResFixtures() {
    const testRestaurants = makeRestaurantArray()
    const testGuests = makeGuestArray(testRestaurants)
    const testResis = makeResiArray(testRestaurants)
    return { testRestaurants, testGuests, testResis }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                saferes_restaurant,
                saferes_res,
                saferes_guest
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE saferes_restaurant_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE saferes_res_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE saferes_guest_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('saferes_restaurant_id_seq', 0)`),
                    trx.raw(`SELECT setval('saferes_res_id_seq', 0)`),
                    trx.raw(`SELECT setval('saferes_guest_id_seq', 0)`)
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

function seedSafeResTables(db, bars, resi = [], guest = []) {
    return db.transaction(async trx => {
        await seedRestaurants(trx, bars)
        if (resi.length) {
            await trx.into('saferes_res').insert(res)
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