const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    notificationID: {
        channelID: '',
        message: ''
    }
}

const EMAIL_NOTIFICATIONS = {
    notificationID: {
        channelID: '',
        subject: '',
        message: ''
    }
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}