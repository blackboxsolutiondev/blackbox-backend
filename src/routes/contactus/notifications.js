const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    notificationID: {
        channelID: '',
        message: ''
    }
}

const EMAIL_NOTIFICATIONS = {
    contactUsMessage: (userEmail, message) => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Contact Us Message',
        message: `Message from user with email: ${userEmail} \n\n Message: ${message}`
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}