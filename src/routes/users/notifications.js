const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    welcomeToSite: {
        channelID: CHANNEL_IDS.general,
        message: `Welcome to ${process.env.SITE_NAME}`,
    }
}

const EMAIL_NOTIFICATIONS = {
    welcomeToSite: {
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME} account created`,
        message: `Welcome to ${process.env.SITE_NAME}`,
    },
    temporaryPassword: password => ({
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME}: Temporary Password`,
        message: `Your temporary password is:\n\n\t${password}`
    }),
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}