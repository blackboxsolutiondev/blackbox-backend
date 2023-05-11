const express = require('express')
const router = express.Router()
const moment = require('moment')
require('dotenv/config')

const User = require('../../models/User')
const Notification = require('../../models/Notification')
const {MAX_PAGE_SIZE, PAGE_SIZES, ENV} = require('../../constants')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')
const {
    postAppNotification,
    sendEmailNotification
} = require('../../utis/notifications')

// GET Routes

// get a user on login by firebase uid
router.get('/uid/:uid', async (req, res) => {
    const {uid} = req.params

    try {
        const user = await User.findOne({uid})
            .lean()
            
        res.json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// get a user by _id
router.get('/_id/:_id', async (req, res) => {
    const {_id} = req.params

    try {
        const user = await User.findById(_id)
            .lean()
        if (user) {
            res.json(user)
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// search for a user
/*
    - required query fields:
        - page
        - displayName
    - optional query fields:
        - pagesize
*/
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.userSearch,
        page,
        displayName
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        $text: {
            $search : displayName
        }
    }

    try {
        const count = await User.countDocuments(filter)
        const users = await User.find(filter)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('displayName photoURL')
            .lean()

        res.json({
            users,
            canLoadMore: users.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

// create a new user
// Notification Triggers
//    - general app notification
//    - general email notification
router.post('/', async (req, res) => {
    const user = ENV === 'dev' ?
        new User({
            ...req.body,
            isAdmin: true,
            adminKey: process.env.ADMIN_KEY,
        })
        : new User(req.body)

    try {
        await user.save()
        res.json({message: `Welcome to ${process.env.SITE_NAME}.`, userID: user._id})

        try {
            await postAppNotification(APP_NOTIFICATIONS.welcomeToSite, user._id)
        } catch (error) {
            console.log(error)
        }

        try {
            await sendEmailNotification(EMAIL_NOTIFICATIONS.welcomeToSite, user.displayName, user.email)
        } catch (error) {
            console.log(error)
        }
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.post('/temporarypasswordemail', async (req, res) => {
    const {password, displayName, email} = req.body

    try {
        await sendEmailNotification(EMAIL_NOTIFICATIONS.temporaryPassword(password), displayName, email)
        res.json({message: 'Check your email for a temporary password.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

// update a user
router.patch('/:_id', async (req, res) => {
    const {_id} = req.params
    const updatedFields = req.body
    
    try {
        const user = await User.findByIdAndUpdate(_id, {
            $set: updatedFields
        })
        if (user) {
            res.json({message: 'Changes saved.'})
        } else {
            throw Error('No users matched those filters.')
        }

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.patch('/settings/:userID', async (req, res) => {
    const {userID} = req.params
    const {path, value} = req.body

    const fieldPath = 'settings.' + path

    try {
        const user = await User.findByIdAndUpdate(userID, {
            $set: {
                [fieldPath]: value,
            }
        })

        if (user) {
            res.json({message: 'Changes saved.'})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

// delete a user
router.delete('/', async (req, res) => {
    const {uid, userID} = req.query
    const filter = {
        uid,
        _id: userID
    }

    try {
        const user = await User.findOneAndDelete(filter)

        if (user) {
            res.json({message: 'User deleted.'})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router