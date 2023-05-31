const {CHANNEL_IDS} = require('../../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    revisionsPeriodBegan: project => ({
        channelID: CHANNEL_IDS.general,
        message: `The 10 day revision period for your project "${project.projectName}" has begun. You can visit the revisions tab of your project to note which aspects of the project you want revised.`
    }),
}

const EMAIL_NOTIFICATIONS = {
    revisionsPeriodBegan: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Revision Period Began',
        message: `The 10 day revision period for your project "${project.projectName}" has begun. You can visit the revisions tab of your project to note which aspects of the project you want revised.`
    }),
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}