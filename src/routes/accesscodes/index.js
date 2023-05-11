const express = require('express')
const router = express.Router()

const AccessCode = require('../../models/AccessCode')

// GET Routes  

router.get('/isvalid', async (req, res) => {
    const {
        code
    } = req.query
    const filter = {
        code,
        claimed: false
    }

    try {
        const accessCode = await AccessCode.findOne(filter)
            .lean()

        console.log(JSON.stringify(
            {accessCode}
        , null, 4))
            
        res.json({
            isValid: !!accessCode
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router