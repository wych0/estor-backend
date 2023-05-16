const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/User')
const {validationResult, check} = require('express-validator')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.post('/register', 
check('email')
.escape()
.trim()
.notEmpty().withMessage('E-mail field cannot be empty')
.isEmail().withMessage('Invalid e-mail')
.custom(async (email) => {
    const user = await User.findOne({email: email})
    if(user){
        return Promise.reject('This e-mail is already used')
    }
}),

check('password')
.notEmpty().withMessage('Password field cannot be empty')
.escape()
.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/).withMessage('Weak password'),

check(['name', 'secName'])
.notEmpty().withMessage('This field cannot be empty')
.escape()
.trim()
.matches(/^[A-Za-z\s]+$/).withMessage('This field have to contain letters only'),

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    } 
    userID = req.cookies.userID
    if(userID){
        return res.status(403).json({error: 'Logout before register'})
    }
    const {name, secName, email, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
        name,
        secName,
        email,
        password: hashedPassword
    })
    await user.save()
    res.cookie('userID', user._id.toString())
    res.status(200).json({message: "Created user"})
})


router.post('/login',
check('email')
.escape()
.trim()
.notEmpty().withMessage('E-mail field cannot be empty')
.isEmail().withMessage('Invalid e-mail'),

check('password')
.notEmpty().withMessage('Password field cannot be empty')
.escape(),

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    if(req.cookies.userID){
        return res.status(403).json({message: "You are already logged in"})
    }
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({message: 'User with that e-mail not found'})
    }
    bcrypt.compare(password, user.password, (err, isMatch) =>{
        if(err){
            return res.status(500).json({message: 'Error occured'})
        }
        if(!isMatch){
            return res.status(403).json({message: 'Invalid password'})
        }
        res.cookie('userID', user._id.toString())
        res.status(200).json({message: "Logged in"})
    })
})

router.post('/logout',
async (req, res) =>{
    if(!req.cookies.userID){
        return res.status(403).json({message: "You cannot logout"})
    }
    res.clearCookie('userID')
    res.status(200).json({message: "Logged out"})
})

module.exports = router
