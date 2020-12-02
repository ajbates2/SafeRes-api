# SafeRes API

API server for 'SafeRes project

<a href='https://github.com/ajbates2/SafeRes-client' target='_blank'>SafeRes Client Repo</a>

<a href='https://safe-res-client.vercel.app/' target='_blank'>Live App</a>

Demo account: { email: 'foo@bar.com' password: 'password' }

# Endpoints

 ## `/res`

Only a POST request is handled at this endpoint, but a single post requests handles multiple tasks.

1. Checks if there is daily count for the day, if not it creates one.
2. Then, checks if the guest exists in our database, if not it creates one.
3. Then it inserts the new res
    * If res is a walk in, it updates the daily head count, walk in total, and updates the guest data's visit count and updates last visit
    * If res is not a walk in, an sms is sent to the future guest

    ### `/res/all`

    Gets all remaining reservations for the day

    ### `/res/:res_id`

    Mainly used as patch request if info is inserted incorrectly or guest calls back and changes res time or party size

    ### `/res/<arrived || no_show || cancel || no_show>/:res_id`

    4 different patch requests that updates the requested boolean field

## `/counts/day/:res_day`

GET request for the daily res counts, it first checks if the day exists
    
* if it doesn't exist, inserts new daily count
* then sends daily data

## `/sms/notify/:phone_number`
    
1. First patches the notified boolean field on the reservation to true
2. Then, sends guest sms notification that table is ready

## `/auth`

Posts login requests, passes restaurant id and name to local storage

# Set up

Major dependencies for this repo include Postgres, Node, and Twilio

To get set up locally do the following
1. Clone this repo to your machine, cd into the dir and run npm install
2. Create the dev and test DB's `createdb -U <DB-USER> -d SafeRes` and `createdb -U <DB-USER> -d SafeRes-test`
3. create an .env file in root project with the following
4. Twilio has a free tier that allows you to send texts to a single phone number

````
NODE_ENV=development
PORT=8000
API_TOKEN=3bbc6278-af64-11ea-b3de-0242ac130004
DATABASE_URL="postgresql://<DB-USER>:<PASSWORD>@localhost/saferes"
TEST_DATABASE_URL="postgresql://<DB-USER>:<PASSWORD>@localhost/saferes-test"
JWT_SECRET="its-corona-time"
TZ="America/Chicago"
TWILIO_ACCOUNT_SID=<YOUR_ACCOUNT_ID>
TWILIO_AUTH_TOKEN=<YOUR_AUTH_TOKEN>
TWILIO_NUMBER=<YOUR_TWILIO_NUMBER>
````

4. Run migrations for dev and test `npm run migrate` and `npm run migrate:test`
5. Seed the database for dev `psql -U <DB-USER> -d tips -f ./seeds/seed.safeRes.sql`
6. `npm t` runs tests
7. `npm run dev` starts app in dev mode

# Technology Used

## Back End

* Node and Express
  * Authentication via JWT
  * RESTful Api
  * Twilio SMS
* Testing
  * Supertest (integration)
  * Mocha and Chai (unit)
* Database
  * Postgres
  * Knex.js - SQL wrapper

## Production

Deployed via Heroku