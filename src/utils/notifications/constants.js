require('dotenv/config')

const {getUserFirstName} = require('../../models/User/utils')

const CHANNEL_IDS = {
    general: 'general',
    announcements: 'announcements',
    social: 'social',
}

const NOTIFICATIONS_EMAIL = 'liammccluskey2@gmail.com'

module.exports = {
    CHANNEL_IDS,
    NOTIFICATIONS_EMAIL
}