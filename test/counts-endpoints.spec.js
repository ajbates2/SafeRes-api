const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const moment = require('moment')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Count Endpoints', () => {
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

    describe(`GET /api/counts/day/:res_day`, () => {
        beforeEach('insert reservations', () =>
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
            )
        )

        it('creates a new daily count if it does not exist, responds with 200 and new daily count', () => {
            const testBar = testRestaurants[0]
            const testDay = moment().format('DDDDYYYY')
            const testWeek = moment(testDay, 'DDDDYYYY').format('WWYYYY')
            const testMonth = moment(testDay, 'DDDDYYYY').format('MMYYYY')
            const testYear = moment(testDay, 'DDDDYYYY').format('YYYY')
            const testWeekday = moment(testDay, 'DDDDYYYY').format('E')

            return supertest(app)
                .get(`/api/counts/day/${testDay}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect(res.body.cancellations).to.eql(0)
                    expect(res.body.head_count).to.eql(0)
                    expect(res.body.no_shows).to.eql(0)
                    expect(res.body.unique_parties).to.eql(0)
                    expect(res.body.walk_ins).to.eql(0)
                    expect(res.body.res_day).to.eql(testDay)
                    expect(res.body.res_week).to.eql(testWeek)
                    expect(res.body.res_month).to.eql(testMonth)
                    expect(res.body.res_year).to.eql(testYear)
                    expect(res.body.res_weekday).to.eql(testWeekday)
                })
        })
        it('gets daily count and responds with 200', () => {
            helpers.seedSafeResTables(
                db,
                testRestaurants,
                testResis,
                testGuests,
                testDailyCount
            )
            const testBar = testRestaurants[0]
            const testDay = testDailyCount[0]

            return supertest(app)
                .get(`/api/counts/day/${testDay.res_day}`)
                .set('Authorization', helpers.makeAuthHeader(testBar))
                .expect(200)
                .expect(res => {
                    expect(res.body.cancellations).to.eql(testDay.cancellations)
                    expect(res.body.head_count).to.eql(testDay.head_count)
                    expect(res.body.no_shows).to.eql(testDay.no_shows)
                    expect(res.body.unique_parties).to.eql(testDay.unique_parties)
                    expect(res.body.walk_ins).to.eql(testDay.walk_ins)
                    expect(res.body.res_day).to.eql(testDay.res_day)
                })
        })
    })
})