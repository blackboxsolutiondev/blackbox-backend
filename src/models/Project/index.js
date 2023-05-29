const mongoose = require('mongoose')

const {PROJECT_STATUSES} = require('./constants')

const ProjectSchema = mongoose.Schema({
    // required
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorPhoneNumber: {
        type: String,
        required: true,
    },
    projectName: {
        type: String,
        required: true
    },
    projectType: {
        type: String, // 's' | 'm' | 'l'
        required: true, 
    },
    logoImageURLs: {
        type: [String],
        required: false
    },
    domainProviderURL: {
        type: String,
        required: true
    },
    domainProviderUsername: {
        type: String,
        required: true
    },
    domainProviderPassword: {
        type: String,
        required: true
    },
    heroTitle: {
        type: String,
        required: true
    },
    heroMessage: {
        type: String,
        required: true
    },
    selectedThemes: {
        type: [Number],
        required: true,
    },
    defaultTheme: {
        type: Number,
        required: true,
    },
    selectedTintColors: {
        type: [Number],
        required: true,
    },
    defaultTintColor: {
        type: Number,
        required: true,
    },
    borderRadius: {
        type: String, // 'square' | 'rounded' | 'pill'
        required: true,
    },
    buttonBorderRadius: {
        type: String, // 'square' | 'rounded' | 'pill'
        required: true,
    },
    pagesText: {
        type: [String],
        required: true
    },
    pagesImageURLs: {
        type: [[String]],
        required: true
    },
    hasSubscriptions: {
        type: Boolean,
        required: true,
    },
    subscriptionTiers: {
        type: [{
            name: String,
            pricePerMonth: String,
            features: String
        }],
        required: true,
    },
    // optional
    customTintColor: {
        type: String,
        required: false,
        default: null
    },
    accessCode: {
        type: String,
        required: false,
        default: null
    },
    receivedPayment: {
        type: Boolean,
        required: false,
        default: false
    },
    linkedInURL: {
        type: String,
        required: false,
        default: null
    },
    facebookURL: {
        type: String,
        required: false,
        default: null
    },
    instagramURL: {
        type: String,
        required: false,
        default: null
    },
    twitterURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    status: {
        type: String,
        required: false,
        default: PROJECT_STATUSES.pendingApproval
    },
    archived: {
        type: Boolean,
        required: false,
        default: false
    },
    refundIssued: {
        type: Boolean,
        required: false,
        default: false
    },
    invoiceSent: {
        type: Boolean,
        required: false,
        default: false,
    },
    editingLocked: {
        type: Boolean,
        required: false,
        default: false,
    },
    revisionsLocked: {
        type: Boolean,
        required: false,
        default: true,
    },
    revisionNotes: {
        type: String,
        required: false,
        default: '',
    },
    invoiceType: {
        type: String,
        required: false,
        default: null,
    },
    invoiceID: {
        type: String,
        required: false,
        default: null,
    }
}, {timestamps: true})

ProjectSchema.index(
    {
        projectName: 'text'
    },
    {
        weights: {
            projectName: 1
        }
    }
)

module.exports = mongoose.model('Project', ProjectSchema)