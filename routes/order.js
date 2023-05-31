const {validationResult, check} = require('express-validator')
const {ObjectId} = require('mongodb')
const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const User = require('../models/User')
const Product = require('../models/product')
const cookieParser = require('cookie-parser')
const formatString = require('../formatString')
router.use(cookieParser())

router.post('/',

check(['address.name','address.country','address.secName','address.street','address.city','address.postalCode','address.email'])
.trim()
.escape()
.notEmpty().withMessage('This field cannot be empty'),

check('address.postalCode')
.matches(/^[0-9]{2}-[0-9]{3}$/).withMessage('Invalid postalcode'),

check('address.email')
.isEmail().withMessage('Invalid e-mail'),

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {userEmail, address} = req.body
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Login to place order'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(user.cartItems.length===0){
        return res.status(403).json({message: 'Your cart is empty'})
    }
    const cost = user.cartItems.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0)

    const order = new Order({
        userEmail,
        cost,
        products: user.cartItems,
        userID,
        address:{
            name: formatString(address.name),
            secName: formatString(address.secName),
            street: formatString(address.street),
            city: formatString(address.city),
            postalCode: address.postalCode,
            email: address.email,
            country: formatString(address.country)
        }
    })

    for (const item of user.cartItems){
        const product = await Product.findByIdAndUpdate(new ObjectId(item._id), {isSold:true})
        await product.save()
    }

    user.cartItems = []
    user.shipAddress = order.address
    await user.save()
    await order.save()
    res.status(200).json({message: 'Placed order'})
}
)

router.put('/cancel/:orderID',
check('orderID')
.notEmpty().withMessage('OrderID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id'),
async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({error: 'User with that id not found'})
    }
    const {orderID} = req.params
    const order = await Order.findOne({_id: new ObjectId(orderID)})
    if(!order){
        return res.status(404).json({error: 'Order with that id not found'})
    }

    if(user.role !== 'admin' && order.userID !== user._id.toString()){
        return res.status(403).json({message: 'You cannot cancel this order'})
    }

    if(order.status!=='W realizacji'){
        return res.status(403).json({error: 'This order cannot be cancelled'})
    }

    for(const product of order.products){
        const productVar = await Product.findByIdAndUpdate(product._id, {isSold: false})
        await productVar.save()
    }

    await Order.findByIdAndUpdate(new ObjectId(orderID), {status: 'Anulowane'})
    return res.status(200).json({message: 'Order cancelled'})
})

router.get('/',
check('orderID')
.trim()
.escape()
.notEmpty().withMessage('orderID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {orderID} = req.query
    const order = await Order.findById(new ObjectId(orderID))
    if(!order){
        return res.status(404).json({error: 'Order with that id not found'})
    }
    return res.status(200).json({order: order})
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
    const orders = await Order.find().sort({status: -1})
    if(!orders){
        return res.status(404).json({message: 'No orders in database'})
    }
    return res.status(200).json({orders: orders})
})

router.get('/userOrders',
check('userID')
.trim()
.escape()
.notEmpty().withMessage('userID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errros: errors.array()})
    }
    const {userID} = req.query
    const orders = await Order.find({userID}).sort({status: -1})
    if(orders.length===0){
        return res.status(200).json({message: 'No orders'})
    }
    return res.status(200).json({orders: orders})
    }
)

router.get('/isCancelled/:orderID',
check('orderID')
.notEmpty().withMessage('OrderID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id'),
async (req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errros: errors.array()})
    }
    const {orderID} = req.params
    const order = await Order.findById(new ObjectId(orderID))
    if(!order){
        return res.status(404).json({error: 'Order not found'})
    }
    const isCancelled = order.status==='Anulowane' ? true : false
    return res.status(200).json({isCancelled})
})

router.put('/complete/:orderID',
check('orderID')
.notEmpty().withMessage('OrderID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id'),
async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    const user = await User.findById(new ObjectId(userID))
    if(!user){
        return res.status(404).json({error: 'User with that id not found'})
    }
    const {orderID} = req.params
    const order = await Order.findOne({_id: new ObjectId(orderID)})
    if(!order){
        return res.status(404).json({error: 'Order with that id not found'})
    }

    if(user.role !== 'admin'){
        return res.status(403).json({message: 'You cannot complete order'})
    }

    if(order.status!=='W realizacji'){
        return res.status(403).json({error: 'This order cannot be completed'})
    }

    await Order.findByIdAndUpdate(new ObjectId(orderID), {status: 'Dostarczone'})
    return res.status(200).json({message: 'Order completed'})
})


module.exports = router
