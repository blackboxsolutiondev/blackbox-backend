const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

const {hasAdminPrivileges} = require('./src/routes/admin/utils')

// Middleware

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.originalUrl)
    next()
})

app.use((req, res, next) => {
    const {heroku_api_key} = req.headers

    if (heroku_api_key !== process.env.HEROKU_API_KEY) {
        res.status(500).send({message: 'Invalid api key.'})
    } else {
        next()
    }
})

app.use((req, res, next) => {
    const {originalUrl} = req

    if (originalUrl.split('/')[1] === 'admin') {
        if (hasAdminPrivileges(req)) {
            next()
        } else {
            res.status(500).json({message: 'This operation requires admin privileges to complete.'})
        }
    } else {
        next()
    }
})

// Routes

const usersRoute = require('./src/routes/users')
app.use('/users', usersRoute)

const notificationsRoute = require('./src/routes/notifications')
app.use('/notifications', notificationsRoute)

const bugReportsRoute = require('./src/routes/bugreports')
app.use('/bugreports', bugReportsRoute)

const faqRoute = require('./src/routes/faq')
app.use('/faq', faqRoute)

const adminUsersRoute = require('./src/routes/admin/users')
app.use('/admin/users/', adminUsersRoute)

const adminNotificationsRoute = require('./src/routes/admin/notifications')
app.use('/admin/notifications', adminNotificationsRoute)

const adminBugReportsRoute = require('./src/routes/admin/bugreports')
app.use('/admin/bugreports', adminBugReportsRoute)

const adminFAQRoute = require('./src/routes/admin/faq')
app.use('/admin/faq', adminFAQRoute)

const accessCodesRoute = require('./src/routes/accesscodes')
app.use('/accesscodes', accessCodesRoute)

const projectsRoute = require('./src/routes/projects')
app.use('/projects', projectsRoute)

const adminAccessCodesRoute = require('./src/routes/admin/accesscodes')
app.use('/admin/accesscodes', adminAccessCodesRoute)

const adminProjectsRoute = require('./src/routes/admin/projects')
app.use('/admin/projects', adminProjectsRoute)

mongoose.connect(
    process.env.MONGO_DB_CONNECTION,
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    },
)

const server = app.listen(process.env.PORT || 4015)