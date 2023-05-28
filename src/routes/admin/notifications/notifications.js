const {getUserFirstName} = require('../../../models/User/utils')
const {CHANNEL_IDS} = require('../../../utils/notifications/constants')

const APP_NOTIFICATIONS = {
    appAnnouncementCreated: (creatorName, announcementMessage, numberAnnouncementsCreated) => ({
        channelID: CHANNEL_IDS.general,
        message: `Admin user ${creatorName} created the following app announcement for ${numberAnnouncementsCreated} users. \n\n ---------- \n ${announcementMessage} \n ---------- `
    }),
    emailAnnouncementCreated: (creatorName, announcementSubject, announcementMessage, numberAnnouncementsSent) => ({
        channelID: CHANNEL_IDS.general,
        message: `Admin user ${creatorName} sent the following email announcement to ${numberAnnouncementsSent} users. \n\n ----------\n Subject: ${announcementSubject} \n Message: \n ${announcementMessage} \n ----------`
    })
}

const EMAIL_NOTIFICATIONS = {
    appAnnouncementCreated: (creatorName, announcementMessage, numberAnnouncementsCreated) => ({
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME} Admin : App Announcement Created`,
        message: `Admin user ${creatorName} created the following app announcement for ${numberAnnouncementsCreated} users. \n\n ---------- \n ${announcementMessage} \n ---------- `
    }),
    emailAnnouncementCreated: (creatorName, announcementSubject, announcementMessage, numberAnnouncementsSent) => ({
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME} Admin : Email Announcement Created`,
        message: `Admin user ${creatorName} sent the following email announcement to ${numberAnnouncementsSent} users. \n\n ----------\n Subject: ${announcementSubject} \n Message: \n ${announcementMessage} \n ----------`
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}