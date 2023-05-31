const {ENV} = require('../../../constants')

const TEST_PROJECT_INVOICE_IDS = {
    s: 'price_1N712pCRacSb9b39Lkq3uO5S',
    m: 'price_1N714zCRacSb9b39h17SQ0p9',
    l: 'price_1N715mCRacSb9b391qpR7PTt'
}

const LIVE_PROJECT_INVOICE_IDS = {
    s: 'price_1NDtMICRacSb9b39mJzAkxgY',
    m: 'price_1NDtLmCRacSb9b39iDNYqkQS',
    l: 'price_1NDtJaCRacSb9b39eJvgHEbF',
}

const PROJECT_INVOICE_IDS = ENV === 'dev' ? TEST_PROJECT_INVOICE_IDS : LIVE_PROJECT_INVOICE_IDS

module.exports = {
    PROJECT_INVOICE_IDS
}