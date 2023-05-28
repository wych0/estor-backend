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

router.get('/all',
async(req, res)=>{
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({error: 'You have to be logged in'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(user.role!=='admin'){
        return res.status(403).json({error: 'You cannot perform this action'})
    }
    const users = await User.find({role: 'klient'})
    return res.status(200).json({users})
})

router.put('/block/:userID',
check('userID')
.notEmpty().withMessage('UserID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id'),
async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {userID} = req.params
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({error: 'User not found'})
    }
    if(user.role==='admin'){
        return res.status(403).json({error: 'You cant perform this action'})
    }
    if(user.accountStatus==='Zablokowane'){
        return res.status(200).json({message: 'Account blocked'})
    }
    await User.findByIdAndUpdate(new ObjectId(userID), {accountStatus: 'Zablokowane'})
    return res.status(200).json({message: 'Account blocked'})
})

router.put('/unblock/:userID',
check('userID')
.notEmpty().withMessage('UserID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id'),
async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {userID} = req.params
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({error: 'User not found'})
    }
    if(user.role==='admin'){
        return res.status(403).json({error: 'You cant perform this action'})
    }
    if(user.accountStatus==='Aktywne'){
        return res.status(200).json({error: 'Account activated'})
    }
    await User.findByIdAndUpdate(new ObjectId(userID), {accountStatus: 'Aktywne'})
    return res.status(200).json({message: 'Account activated'})
})


module.exports = router