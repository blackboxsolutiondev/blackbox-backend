const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    // required
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        default: null,
        unique: true,
        index: true
    },

    // optional
    displayName: {
        type: String,
        required: false,
    },
    photoURL: {
        type: String,
        required: false,
    },

    // default
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    adminKey: {
        type: String,
        default: undefined
    },
    superAdminKey: {
        type: String,
        default: undefined
    },
    settings: {
        theme: {
            themeColor: {
                type: Number,
                default: 0
            },
            tintColor: {
                type: Number,
                default: 0
            }
        },
        appNotifications: {
            generalEnabled: {
                type: Boolean,
                default: true
            },
            announcementsEnabled: {
                type: Boolean,
                default: true
            },
            socialEnabled: {
                type: Boolean,
                default: true
            }
        },
        emailNotifications: {
            generalEnabled: {
                type: Boolean,
                default: true
            },
            announcementsEnabled: {
                type: Boolean,
                default: false
            },
            socialEnabled: {
                type: Boolean,
                default: false
            }
        }
    },
    stripeID: {
        type: String,
        required: false,
        default: null,
    }
}, {timestamps: true})

UserSchema.index(
    {
        displayName: 'text',
    },
    {
        weights: {
            displayName: 1,
        }
    }
)

module.exports = mongoose.model('User', UserSchema)