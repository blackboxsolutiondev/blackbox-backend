const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    receivedInvoicePayment: project => ({
        channelID: CHANNEL_IDS.general,
        message: `Project "${project.projectName}" paid their invoice.`
    }),
    revisionsPeriodEnded: project => ({
        channelID: CHANNEL_IDS.general,
        message: `The 10 day revision period for your project "${project.projectName}" has ended.`
    }),
    revisionsPeriodEndedAdmin: project => ({
        channelID: CHANNEL_IDS.general,
        message: `The 10 day revision period for project "${project.projectName}" has ended.`
    })
}

const EMAIL_NOTIFICATIONS = {
    receivedInvoicePayment: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Received Invoice Payment',
        message: `Project "${project.projectName}" paid their invoice.`
    }),
    revisionsPeriodEnded: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Revision Period Ended',
        message: `The 10 day revision period for your project "${project.projectName}" has ended.`
    }),
    revisionsPeriodEndedAdmin: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Revision Period Ended',
        message: `The 10 day revision period for project "${project.projectName}" has ended.`
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}