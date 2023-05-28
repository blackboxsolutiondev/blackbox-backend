const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    receivedInvoicePayment: project => ({
        channelID: CHANNEL_IDS.general,
        message: `Project ${project.projectName} paid their invoice.`
    })
}

const EMAIL_NOTIFICATIONS = {
    receivedInvoicePayment: project => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Received Invoice Payment',
        message: `Project ${project.projectName} paid their invoice.`
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}