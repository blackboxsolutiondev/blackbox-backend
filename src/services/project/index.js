const moment = require('moment')

const Project = require('../../models/Project')
const {STRIPE_SECRET_KEY} = require('../../../constants')
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const {
    postAppNotification,
    sendEmailNotification,
    postAppNotificationToAdminUsers,
    sendEmailNotificationToAdminUsers
} = require('../../utils/notifications')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')
const {PROJECT_STATUSES} = require('../../models/Project/constants')

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
            
            if (status === 'paid') {
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

const revisionsEndedService = async () => {
    const filter = {
        status: PROJECT_STATUSES.inReview,
        revisionsLocked: false
    }

    try {
        const projects = await Project.find(filter)
            .select('projectName revisionsUnlockedAt creator')
            .populate('creator', 'email displayName _id')
            .lean()

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i]
            const revisionsStartDate = moment(project.revisionsUnlockedAt)
            const revisionsEndDate = revisionsStartDate.clone().add(10, 'days').endOf('day')
            const currentDate = moment()

            if (currentDate.isAfter(revisionsEndDate)) {
                await Project.findByIdAndUpdate(project._id, {
                    revisionsLocked: true
                })

                const adminAppNotification = APP_NOTIFICATIONS.revisionsPeriodEndedAdmin(project)
                const adminEmailNotification = EMAIL_NOTIFICATIONS.revisionsPeriodEndedAdmin(project)
                const userAppNotification = APP_NOTIFICATIONS.revisionsPeriodEnded(project)
                const userEmailNotification = EMAIL_NOTIFICATIONS.revisionsPeriodEnded(project)

                await postAppNotificationToAdminUsers(adminAppNotification)
                await sendEmailNotificationToAdminUsers(adminEmailNotification)
                await postAppNotification(userAppNotification, project.creator._id)
                await sendEmailNotification(userEmailNotification, project.creator.displayName, project.creator.email)
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const scheduleRevisionsEndedService = () => {
    setInterval(revisionsEndedService, 60*60*1000)
}
module.exports = {
    scheduleInvoicePaidService,
    scheduleRevisionsEndedService
}