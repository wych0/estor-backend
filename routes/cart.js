const express = require('express')
const {ObjectId} = require('mongodb')
const router = express.Router()
const User = require('../models/User')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.get('/',
async(req, res)=>{
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Log in to get cart items'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({message: 'User not found'})
    }
    return res.status(200).json({cartItems: user.cartItems})
})

module.exports = router