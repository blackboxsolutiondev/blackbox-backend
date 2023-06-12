require('dotenv/config')

const MAX_PAGE_SIZE = 50

const PAGE_SIZES = {
    notifications: 10,
    channelNotifications: 20,
    userSearch: 10,
    bugReports: 10,
    faqs: 10,
    accessCodes: 10,
    projects: 10
}

// 'dev' | 'prod'
const ENV = 'dev'

const STRIPE_SECRET_KEY = ENV === 'dev' ? process.env.TEST_STRIPE_SECRET_KEY : process.env.LIVE_STRIPE_SECRET_KEY

module.exports = {
    MAX_PAGE_SIZE,
    PAGE_SIZES,
    ENV,
    STRIPE_SECRET_KEY
}