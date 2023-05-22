const express = require('express')
const router = express.Router()
require('dotenv/config')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const AccessCode = require('../../../models/AccessCode')
const {PROJECT_INVOICE_IDS} = require('./constants')
const Project = require('../../../models/Project')
const User = require('../../../models/User')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')

// GET Routes

//  get all admin projects
//  required query fields
//      - page
//      - sortby
//  optional query fields
//      - pagesize
//      - projectName
router.get('/search', async (req, res) => {
    const {
        page,
        sortby,
        pagesize = PAGE_SIZES.projects,
        archived,
        status=null,
        projectName=null,
        receivedPayment=null,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)
    const filter = {
        archived,
        ...(!!status ? {status} : {}),
        ...(!!projectName ? {
            $text: {
                $search: projectName
            }
        }: {}),
        ...(receivedPayment !== null ? {receivedPayment} : {}),
    }

    try {
        const count = await Project.countDocuments(filter)
        const projects = await Project.find(filter)
            .sort(sortby)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()

        res.json({
            adminProjects: projects,
            canLoadMore: projects.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/', async (req, res) => {
    const {projectIDs, updatedFields} = req.body
    const filter = {
        _id: {
            $in: projectIDs
        }
    }

    try {
        if (updatedFields.accessCode) {
            const filter = {
                code: updatedFields.accessCode,
                claimed: false
            }
            
            const accessCode = await AccessCode.find(filter)

            if (accessCode) {
                updatedFields.receivedPayment = true

                await AccessCode.findOneAndUpdate(filter, {claimed: true})
            } else {
                throw Error('Access code is invalid.')
            }
        }

        await Project.updateMany(filter, {
            $set: updatedFields
        })

        res.json({message: projectIDs.length > 1 ? 
            'Successfully updated Projects.'
            : 'Successfully updated Project.'
        })
    } catch (error) {
        console.log('error')
        res.status(500).json({message: error.message})
    }
})

router.patch('/sendinvoice', async (req, res) => {
    const {projectType, projectID, userEmail, userID} = req.body

    try {
        let stripeCustomerID = null
        const user = await User.findById(userID)

        if (!user.stripeID) {
            // create stripe customer
            const customer = await stripe.customers.create({
                email: userEmail,
                description: `User with ID: ${userID}`
            })
            stripeCustomerID = customer.id
        } else {
            stripeCustomerID = user.stripeID
        }

        // Create an Invoice
        const invoice = await stripe.invoices.create({
            customer: stripeCustomerID,
            collection_method: 'send_invoice',
            days_until_due: 7,
        })

        // Create an Invoice Item
        const invoiceItem = await stripe.invoiceItems.create({ 
            customer: stripeCustomerID,
            price: PROJECT_INVOICE_IDS[projectType],
            invoice: invoice.id
        })

        // Send the Invoice
        await stripe.invoices.sendInvoice(invoice.id)

        // Update Project
        const updatedProject = await Project.findByIdAndUpdate(projectID, {
            invoiceType: projectType,
            invoiceSent: true,
            invoiceID: invoice.id
        })

        if (updatedProject) {
            res.json({message: 'Invoice sent.'})
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        console.log('error')
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/', async (req, res) => {
    let {projectIDs} = req.query
    projectIDs = projectIDs.split('-')

    const filter = {
        _id: {
            $in: projectIDs
        }
    }

    try {
        await Project.deleteMany(filter)

        res.json({message: projectIDs.length > 1 ?
            'Successfully deleted Projects.'
            : 'Successfully deleted Project.'
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})


module.exports = router