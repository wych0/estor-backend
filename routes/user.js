const {validationResult, check} = require('express-validator')
const {ObjectId} = require('mongodb')
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.get('/role',
async (req, res) =>{
    if(!req.cookies.userID){
        return res.status(200).json({role: 'none'})
    }
    const user = await User.findById(new ObjectId(req.cookies.userID))
    if(!user){
        return res.status(404).json({message: 'User not found'})
    }
    return res.status(200).json({role: user.role})
})

router.get('/address',
async(req, res)=>{
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({error: 'Login to get address'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({error: 'User not found'})
    }
    if(!user.shipAddress){
        return res.status(200).json({shipAddress: null})
    }
    return res.status(200).json({shipAddress: user.shipAddress})
})

router.get('/isAuth',
async(req, res)=>{
    if(!req.cookies.userID){
        return res.status(200).json({isAuth: false})
    }
    const user = await User.findById(new ObjectId(req.cookies.userID))
    if(!user){
        return res.status(404).json({error: 'User not found'})
    }
    return res.status(200).json({isAuth: true})
})

module.exports = router