const express = require('express')
const {ObjectId} = require('mongodb')
const {validationResult, check} = require('express-validator')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/User')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.get('/',
async(req, res)=>{
    const userID = req.cookies.userID
    if(!userID){
        res.status(403).json({message: 'Log in to get cart items'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        res.status(404).json({message: 'User not found'})
    }
    res.status(200).json({cartItems: user.cartItems})
})

module.exports = router