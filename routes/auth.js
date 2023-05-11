const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/User')
const {validationResult, check} = require('express-validator')

router.post('/register', 
check('email')
.notEmpty().withMessage('E-mail field cannot be empty')
.isEmail().withMessage('Invalid e-mail')
.custom(async (email) => {
    const user = await User.findOne({email: email})
    if(user){
        return Promise.reject('This e-mail is already used')
    }
}),

check('password').notEmpty().withMessage('Password field cannot be empty'),
async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            secName: req.body.secName,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save()
        res.status(200).json({message: "OK"})
    }
})


router.post('/login',
async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(404).json({message: 'User with that e-mail not found'})
    }
    bcrypt.compare(req.body.password, user.password, (err, isMatch) =>{
        if(err){
            return res.status(500).json({message: 'Error occured'})
        }
        if(!isMatch){
            return res.status(401).json({message: 'Invalid password'})
        }
        res.status(200).json({message: "OK"})
    })
})

module.exports = router
