const express = require('express')
const router = express.Router()

const User = require('../../../models/User')
const Notification = require('../../../models/Notification')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')
const {CHANNEL_IDS} = require('../../../utils/notifications/constants')
const {
    postAppNotification, sendEmailNotification
} = require('../../../utils/notifications')

// POST Routes

//  Create an app announcement for all users with app announcements enabled
//  Notification triggers
//      - general app notification for all admin users with that channel enabled
//      - general email notification for all admin users with that channel enabled
router.post('/appannouncement', async (req, res) => {
    const {message, creatorName} = req.body
    if (!message) {
        res.json({message: 'Announcement message cannot be blank.'})
        return
    }

    const usersWithAnnouncementsEnabledFilter = {
        [`settings.appNotifications.${CHANNEL_IDS.announcements}Enabled`]: true
    }

    let announcementsCreatedCount = 0

    try {
        // Create app announcement for all users with that channel enabled
        const filteredUsers = await User.find(usersWithAnnouncementsEnabledFilter)
            .lean()
            .select('_id')

        for (let i = 0; i < filteredUsers.length; i++) {
            try {
                const didCreateAnnouncement = await postAppNotification({
                    message,
                    channelID: CHANNEL_IDS.announcements
                }, filteredUsers[i]._id)
                didCreateAnnouncement && announcementsCreatedCount ++
            } catch (error) {
                console.log(error)
            }
        }

        // Create general app notification for all admin users with that channel enabled
        const adminsWithGeneralAppNotificationsEnabledFilter = {
            isAdmin: true,
            [`settings.appNotifications.${CHANNEL_IDS.general}Enabled`]: true
        }
        try {
            const filteredAdmins = await User.find(adminsWithGeneralAppNotificationsEnabledFilter)
                .lean()
                .select('_id')

            const notification = APP_NOTIFICATIONS.appAnnouncementCreated(
                creatorName,
                message,
                announcementsCreatedCount,
            )

            for (let i = 0; i < filteredAdmins.length; i++) {
                try {
                    await postAppNotification(notification, filteredAdmins[i]._id)
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }

        // Create general email notification for all admin users with that channel enabled
        const adminsWithGeneralEmailNotificationsEnabledFilter = {
            isAdmin: true,
            [`settings.emailNotifications.${CHANNEL_IDS.general}Enabled`]: true
        }
        try {
            const filteredAdmins = await User.find(adminsWithGeneralEmailNotificationsEnabledFilter)
                .lean()
                .select('displayName email')

            const notification = EMAIL_NOTIFICATIONS.appAnnouncementCreated(
                creatorName,
                message,
                announcementsCreatedCount
            )

            for (let i = 0; i < filteredAdmins.length; i++) {
                const {displayName, email} = filteredAdmins[i]
                try {
                    await sendEmailNotification(notification, displayName, email)
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }

        res.json({message: 'Successfully created App Announcement.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

//  Create an email announcement for all users with email announcements enabled
//  Notification triggers
//      - general app notification for all admin users with that channel enabled
//      - general email notification for all admin users with that channel enabled
router.post('/emailannouncement', async (req, res) => {
    const {subject, message, creatorName} = req.body
    if (!message) {
        res.json({message: 'Announcement message cannot be blank.'})
        return
    } else if (!subject) {
        res.json({message: 'Announcement subject cannot be blank.'})
        return
    }

    const usersWithAnnouncementsEnabledFilter = {
        [`settings.emailNotifications.${CHANNEL_IDS.announcements}Enabled`]: true
    }

    let announcementsSentCount = 0

    try {
        // Create email announcement for all users with that channel enabled
        const filteredUsers = await User.find(usersWithAnnouncementsEnabledFilter)
            .lean()
            .select('_id displayName email')

        for (let i = 0; i < filteredUsers.length; i++) {
            const {displayName, email} = filteredUsers[i]
            try {
                const didSendAnnouncement = await sendEmailNotification({
                    subject,
                    message
                }, displayName, email)
                didSendAnnouncement && announcementsSentCount ++
            } catch (error) {
                console.log(error)
            }
        }

        // Create general app notification for all admin users with that channel enabled
        const adminsWithGeneralAppNotificationsEnabledFilter = {
            isAdmin: true,
            [`settings.appNotifications.${CHANNEL_IDS.general}Enabled`]: true
        }
        try {
            const filteredAdmins = await User.find(adminsWithGeneralAppNotificationsEnabledFilter)
                .lean()
                .select('_id')

            const notification = APP_NOTIFICATIONS.emailAnnouncementCreated(
                creatorName,
                subject,
                message,
                announcementsSentCount
            )

            for (let i = 0; i < filteredAdmins.length; i++) {
                try {
                    await postAppNotification(notification, filteredAdmins[i]._id)
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }

        // Create general email notification for all admin users with that channel enabled
        const adminsWithGeneralEmailNotificationsEnabledFilter = {
            isAdmin: true,
            [`settings.emailNotifications.${CHANNEL_IDS.general}Enabled`]: true
        }
        try {
            const filteredAdmins = await User.find(adminsWithGeneralEmailNotificationsEnabledFilter)
                .lean()
                .select('displayName email')

            const notification = EMAIL_NOTIFICATIONS.emailAnnouncementCreated(
                creatorName,
                subject,
                message,
                announcementsSentCount
            )

            for (let i = 0; i < filteredAdmins.length; i++) {
                const {displayName, email} = filteredAdmins[i]
                try {
                    await sendEmailNotification(notification, displayName, email)
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }

        res.json({message: 'Successfully created App Announcement.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router