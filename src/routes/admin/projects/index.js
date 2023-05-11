const express = require('express')
const router = express.Router()

const Project = require('../../../models/Project')
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
        await Project.updateMany(filter, {
            $set: updatedFields
        })

        res.json({message: projectIDs.length > 1 ? 
            'Successfully updated Projects.'
            : 'Successfully updated Project.'
        })
    } catch (error) {
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