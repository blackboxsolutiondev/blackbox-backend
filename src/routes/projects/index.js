const express = require('express')
const router = express.Router()

const AccessCode = require('../../models/AccessCode')
const Project = require('../../models/Project')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')
const {postAppNotificationToAdminUsers, sendEmailNotificationToAdminUsers} = require('../../utils/notifications')

// GET Routes

//  get a user's projects
//  required query fields
//      - page
//      - sortby
//  optional query fields
//      - pagesize
router.get('/search', async (req, res) => {
    const {
        page,
        sortby,
        pagesize = PAGE_SIZES.projects,
        creator,
        archived,
        status=null,
        projectName=null,
        receivedPayment=null,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)
    const filter = {
        creator,
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
            .populate('creator', 'displayName')
            .lean()
            
        res.json({
            thisUserProjects: projects,
            canLoadMore: projects.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/:projectID', async (req, res) => {
    const {projectID} = req.params

    try {
        const project = await Project.findById(projectID)
            .populate('creator', 'displayName photoURL email')
            .lean()

        if (!project.creator) {
            project.creator = {
                displayName: 'User Deleted',
                email: 'User Deleted',
            }
        }

        if (project) {
            res.json(project)
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const project = new Project(req.body)

    try {
        let receivedPayment = false
        if (req.body.accessCode) {
            const filter = {
                code: req.body.accessCode,
                claimed: false
            }
            
            const accessCode = await AccessCode.find(filter)

            if (accessCode) {
                receivedPayment = true
                project.receivedPayment = true

                await AccessCode.findOneAndUpdate(filter, {claimed: true})
            } else {
                throw Error('Access code is invalid.')
            }
        }

        await project.save()

        res.json({
            message: 'Project created.',
            projectID: project._id
        })

        const appNotification = APP_NOTIFICATIONS.projectCreatedAdmin(project)
        const emailNotification = EMAIL_NOTIFICATIONS.projectCreatedAdmin(project)

        await postAppNotificationToAdminUsers(appNotification)
        await sendEmailNotificationToAdminUsers(emailNotification)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/:projectID', async (req, res) => {
    const {projectID} = req.params
    const updatedFields = req.body
    const filter = {_id: projectID}

    delete updatedFields.status
    delete updatedFields.accessCode
    delete updatedFields.receivedPayment
    delete updatedFields.archived
    delete updatedFields.refundIssued
    delete updatedFields.invoiceSent
    delete updatedFields.editingLocked
    delete updatedFields.revisionsLocked

    try {
        const project = await Project.findOneAndUpdate(filter, updatedFields)
            .lean()

        if (project) {
            res.json({message: 'Successfully updated Project.'})
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/:projectID', async (req, res) => {
    const {projectID} = req.params
    const {userID} = req.query
    const filter = {_id: projectID}

    try {
        let project = await Project.findById(projectID)
            .lean()
            
        if (project.creator.valueOf() !== userID) {
            throw Error('You are not authorized to delete this project.')
        }
        
        project = await Project.findOneAndDelete(filter)
            .lean()

        if (project) {
            res.json({message: 'Project deleted.'})
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router