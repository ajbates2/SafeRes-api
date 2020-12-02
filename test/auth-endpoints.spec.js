const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Auth Endpoints', function () {
    let db

    const { testRestaurants } = helpers.makeSafeResFixtures()
    const testRestaurant = testRestaurants[0]

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

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert restaurants', () =>
            helpers.seedRestaurants(
                db,
                testRestaurants,
            )
        )

        const requiredFields = ['email', 'password']

        requiredFields.forEach(field => {
            const loginAttemptBody = {
                email: testRestaurant.email,
                password: testRestaurant.password
            }

            it(`responds with 400 required error when '${field} is missing`, () => {
                delete loginAttemptBody[field]

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })

        it(`responds 400 'invalid email or password' when bad email`, () => {
            const userInvalidUser = { email: 'user-not', password: 'existy' }
            return supertest(app)
                .post('/api/auth/login')
                .send(userInvalidUser)
                .expect(400, { error: `Incorrect email or password` })
        })

        it(`responds 400 'invalid email or password' when bad password`, () => {
            const userInvalidPass = { email: testRestaurant.email, password: 'incorrect' }
            return supertest(app)
                .post('/api/auth/login')
                .send(userInvalidPass)
                .expect(400, { error: `Incorrect email or password` })
        })
        it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
            const userValidCreds = {
                email: testRestaurant.email,
                password: testRestaurant.password,
            }
            const expectedToken = jwt.sign(
                {
                    restaurant_id: testRestaurant.id,
                    restaurant_name: testRestaurant.restaurant_name
                }, // payload
                process.env.JWT_SECRET,
                {
                    subject: testRestaurant.email,
                    algorithm: 'HS256',
                }
            )
            return supertest(app)
                .post('/api/auth/login')
                .send(userValidCreds)
                .expect(200, {
                    authToken: expectedToken,
                })
        })
    })

    describe(`POST /api/auth/refresh`, () => {
        beforeEach('insert restaurants', () =>
            helpers.seedRestaurants(
                db,
                testRestaurants,
            )
        )

        it(`responds 200 and JWT auth token using secret`, () => {
            const expectedToken = jwt.sign(
                { user_id: testRestaurant.id },
                process.env.JWT_SECRET,
                {
                    subject: testRestaurant.email,
                    algorithm: 'HS256',
                }
            )
            return supertest(app)
                .post('/api/auth/refresh')
                .set('Authorization', helpers.makeAuthHeader(testRestaurant))
                .expect(200, {
                    authToken: expectedToken,
                })
        })
    })
})