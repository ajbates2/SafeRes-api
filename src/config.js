module.exports = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://master:1@localhost/SafeRes',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://master:1@localhost/SafeRes-test',
    JWT_SECRET: process.env.JWT_SECRET || 'its-corona-time',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER: process.env.TWILIO_NUMBER
}