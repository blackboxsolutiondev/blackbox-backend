const nodemailer = require('nodemailer')
require('dotenv/config')

const User = require('../../models/User')
const Notification = require('../../models/Notification')
const {getUserFirstName} = require('../../models/User/utils')

// notificationType = 'email' | 'app'
const getUserAndChannelNotificationSettings = async (channelID, notificationType, userID) => {
    const filter = {_id: userID}
    const channelEnabledSettingField = `${channelID}Enabled`
    const channelEnabledSettingPath = `settings.${notificationType}Notifications.${settingField}`

    try {
        const user = await User.findById(filter)
            .lean()
            .select(`${channelEnabledSettingPath} displayName email`)

        if (user) {
            const channelEnabled = user['settings'][`${notificationType}Notifications`][channelEnabledSettingField]
            const {displayName, email} = user
            return {channelEnabled, displayName, email}
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// partialNotification : {channelID, message}
const postAppNotification = async (partialNotification, toUserWithID) => {
    const notification = new Notification({
        ...partialNotification,
        user: toUserWithID
    })
    try {
        await notification.save()
        return true
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// partialNotification : {channelID, message}
const postAppNotificationIfEnabled = async (
    partialNotification,
    toUserWithID,
    channelEnabled=false,
) => {
    try {
        if (channelEnabled) {
            return await postAppNotification(partialNotification, toUserWithID)
        } else {
            const {channelID} = partialNotification
            const {channelEnabled, displayName, email} = getUserAndChannelNotificationSettings(channelID, 'app', userID)
            if (channelEnabled) {
                return await postAppNotification(parialNotification, toUserWithID)
            } else {
                return false
            }
        }
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// returns : didSendNotififcation
const sendEmailNotification = async (notification, toUserWithDisplayName, toUserWithEmail) => {
    const {subject, message} = notification
    const userFirstName = getUserFirstName(toUserWithDisplayName)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NOTIFICATIONS_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.NOTIFICATIONS_EMAIL,
        to: toUserWithEmail,
        subject: subject,
        text: `
        Hi ${userFirstName},
        
        ${message}

        - The ${process.env.SITE_NAME} Team

        You can unsubscribe from these emails at ${process.env.DOMAIN_NAME}/settings/advanced.
        `
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return !!info
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// returns : didSendNotification
const sendEmailNotificationIfEnabled = async (
    notification,
    toUserWithID,
) => {
    try {
        const {channelID} = notification
        const {channelEnabled, displayName, email} = await getUserAndChannelNotificationSettings(
            channelID,
            'email',
            toUserWithID
        )
        if (channelEnabled) {
            return await sendEmailNotification(notification, displayName, email)
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        throw(error)
    }
    return null
}

const postAppNotificationToAdminUsers = async (partialNotification) => {
    try {
        const filter = {
            isAdmin: true
        }
        const adminUsers = await User.find(filter)
            .select('')
            .lean()

        for (let i = 0; i < adminUsers.length; i++) {
            const {_id} = adminUsers[i]
            try {
                await postAppNotification(partialNotification, _id)
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

const sendEmailNotificationToAdminUsers = async (notification) => {
    try {
        const filter = {
            isAdmin: true
        }
        const adminUsers = await User.find(filter)
            .select('displayName email')
            .lean()

        for (let i = 0; i < adminUsers.length; i++) {
            const {displayName, email} = adminUsers[i]
            
            try {
                await sendEmailNotification(notification, displayName, email)
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = {
    postAppNotification,
    sendEmailNotification,
    postAppNotificationIfEnabled,
    sendEmailNotificationIfEnabled,
    postAppNotificationToAdminUsers,
    sendEmailNotificationToAdminUsers
}