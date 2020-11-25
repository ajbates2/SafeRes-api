const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const moment = require('moment')
const supertest = require('supertest')
const { expect } = require('chai')
const phone = require('phone')

describe('Res Endpoints', () => {
    let db

    const { testRestaurants, testGuests, testResis, testDailyCount } = helpers.makeSafeResFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    before('cleanup', () => helpers.cleanTables(db))
    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/res`, () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )

        it('creates a res, responds with 201 and new res', () => {
            const testBar = testRestaurants[0]
            const newRes = {
                guest_name: 'Test Name',
                phone_number: '612-235-3545',
                party_size: 2,
                res_time: '16:00:00',
                walk_in: false,
                notes: '',
                res_date: moment().format('DDDDYYYY')
            }
            return supertest(app)
                .post('/api/res')
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .send(newRes)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('notified')
                    expect(res.body).to.have.property('waiting')
                    expect(res.body.notes).to.eql(newRes.notes)
                    expect(res.body.party_size).to.eql(newRes.party_size)
                    expect(res.body.guest_name).to.eql(newRes.guest_name)
                    expect(res.body.res_time).to.eql(newRes.res_time)
                    expect(res.body.phone_number).to.eql(newRes.phone_number)
                    expect(res.body.res_date).to.eql(newRes.res_date)
                })
        })

        const requiredFields = [
            'guest_name',
            'phone_number',
            'party_size',
            'res_time',
            'walk_in',
            'res_date'
        ]

        requiredFields.forEach(field => {
            const testBar = testRestaurants[0]
            const newRes = {
                guest_name: 'Test Name',
                phone_number: '612-235-3545',
                party_size: 2,
                res_time: '16:00:00',
                walk_in: false,
                notes: '',
                res_date: moment().format('DDDDYYYY')
            }
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newRes[field]

                return supertest(app)
                    .post('/api/res')
                    .set('Authorization', helpers.makeAuthHeader(testBar))
                    .send(newRes)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })
    })
    describe('PATCH /api/res/:res_id', () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )
        const requiredFields = [
            'guest_name',
            'phone_number',
            'party_size',
            'res_time',
            'walk_in',
            'res_date'
        ]

        requiredFields.forEach(field => {
            const testBar = testRestaurants[0]
            const newRes = {
                guest_name: 'Test Name',
                phone_number: '612-235-3545',
                party_size: 2,
                res_time: '16:00:00',
                walk_in: false,
                notes: '',
                res_date: moment().format('DDDDYYYY')
            }
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newRes[field]

                return supertest(app)
                    .post('/api/res')
                    .set('Authorization', helpers.makeAuthHeader(testBar))
                    .send(newRes)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })
        it('responds 200 and guest_name was updated', () => {
            const testBar = testRestaurants[0]
            const testRes = testResis[0]
            const patchedRes = {
                guest_name: 'Jeff 1',
                phone_number: '612-123-4567',
                res_date: moment().format('DDDDYYYY'),
                res_time: '17:00',
                party_size: 2,
                notes: 'bar'
            }
            return supertest(app)
                .patch(`/api/res/${testRes.id}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .send(patchedRes)
                .expect(200)
                .expect(res => {
                    expect({ status: `${res.guest_name} was updated` })
                })
        })
    })
    describe('PATCH /api/res/arrived/:res_id', () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )
        it('responds 200 and guest was checked off', () => {
            const testBar = testRestaurants[0]
            const testRes = testResis[0]
            return supertest(app)
                .patch(`/api/res/arrived/${testRes.id}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect({ status: `${res.guest_name} was checked off` })
                })
        })
    })
    describe('PATCH /api/res/no_show/:res_id', () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )
        it('responds 200 and guest was checked off', () => {
            const testBar = testRestaurants[0]
            const testRes = testResis[0]
            return supertest(app)
                .patch(`/api/res/no_show/${testRes.id}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect({ status: `${res.guest_name} was a no show` })
                })
        })
    })
    describe('PATCH /api/res/cancel/:res_id', () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )
        it('responds 200 and guest was checked off', () => {
            const testBar = testRestaurants[0]
            const testRes = testResis[0]
            return supertest(app)
                .patch(`/api/res/cancel/${testRes.id}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect({ status: `${res.guest_name} cancelled` })
                })
        })
    })
    describe('PATCH /api/res/waiting/:res_id', () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
        )
        it('responds 200 and guest was checked off', () => {
            const testBar = testRestaurants[0]
            const testRes = testResis[0]
            return supertest(app)
                .patch(`/api/res/waiting/${testRes.id}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect({ status: `${res.guest_name} is waiting` })
                })
        })
    })
})