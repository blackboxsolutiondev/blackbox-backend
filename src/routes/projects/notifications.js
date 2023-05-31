const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    projectCreatedAdmin: project => ({
        channelID: CHANNEL_IDS.general,
        message: `Project "${project.projectName}" was just created.`
    }),
}

const EMAIL_NOTIFICATIONS = {
    projectCreatedAdmin: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Project Created',
        message: `Project "${project.projectName}" was just created.`
    }),
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}