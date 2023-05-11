const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/User')

router.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            secName: req.body.secName,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save()
        res.status(200).json("Success")
    } catch {

    }
    
})

module.exports = router
