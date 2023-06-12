const express = require('express')
const router = express.Router()

const {sendEmailNotificationToAdminUsers} = require('../../utils/notifications')
const {EMAIL_NOTIFICATIONS} = require('./notifications')

// POST Routes

router.post('/send-contact-email', async (req, res) => {
    const {userEmail, message} = req.body

    try {
        const notification = EMAIL_NOTIFICATIONS.contactUsMessage(userEmail, message)

        await sendEmailNotificationToAdminUsers(notification)

        res.json({message: "Successfully sent message. We'll respond to you shortly."})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router