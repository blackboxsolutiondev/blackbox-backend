const Project = require('../../models/Project')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {postAppNotificationToAdminUsers, sendEmailNotificationToAdminUsers} = require('../../utils/notifications')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')

const invoicePaidService = async () => {
    try {
        const filter = {
            receivedPayment: false,
            invoiceSent: true
        }

        const projects = await Project.find(filter)
            .select('invoiceID projectName')
            .lean()

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i]
            const {invoiceID} = project
            const projectID = project._id
            const {status} = await stripe.invoices.retrieve(invoiceID)
            
            if (status === 'paid' || true) {
                await Project.findByIdAndUpdate(projectID, {
                    receivedPayment: true
                })
                const appNotification = APP_NOTIFICATIONS.receivedInvoicePayment(project)
                const emailNotification = EMAIL_NOTIFICATIONS.receivedInvoicePayment(project)
                try {
                    await postAppNotificationToAdminUsers(appNotification)
                } catch (error) {
                    console.log(error)
                }
                try {
                    await sendEmailNotificationToAdminUsers(emailNotification)
                } catch (error) {
                    console.log(error)
                }
            }
        }

    } catch (error) {
        console.log(error)
    }
}

const scheduleInvoicePaidService = () => {
    setInterval(invoicePaidService, 60*1000)
}

module.exports = {
    scheduleInvoicePaidService
}