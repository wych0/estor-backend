const {validationResult, check} = require('express-validator')
const {ObjectId} = require('mongodb')
const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const User = require('../models/User')
const Product = require('../models/product')
const cookieParser = require('cookie-parser')
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
            name: address.name,
            secName: address.secName,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            email: address.email,
            country: address.country
        }
    })

    for (const item of user.cartItems){
        const product = await Product.findByIdAndUpdate(new ObjectId(item._id), {isSold:true})
        await product.save()
    }

    user.cartItems = []
    await user.save()
    await order.save()
    res.status(200).json({message: 'Placed order'})
}
)

router.post('/cancel',
check('orderID')
.notEmpty().withMessage('OrderID field cannot be empty')
.trim()
.escape()
.isMongoId().withMessage('Invalid id')
.custom(async(orderID)=>{
    const order = await Order.findOne({_id: new ObjectId(orderID)})
    if(!order){
        return Promise.reject('Cant find order with that id')
    }
    if(order.status!=='W realizacji'){
        return Promise.reject('Cant cancel this order')
    }
}),

async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    const user = await User.findById(new ObjectId(userID))
    const {orderID} = req.body
    const order = await Order.findOne({_id: new ObjectId(orderID)})

    if(user.role !== 'admin' && order.userID !== user._id.toString()){
        return res.status(403).json({message: 'You cannot cancel this order'})
    }

    order.products.forEach(async(product)=>{
        await Product.findByIdAndUpdate(new ObjectId(product), {isSold: false})
    })
    await Order.findByIdAndUpdate(new ObjectId(orderID), {status: 'Anulowane'})
    res.status(200).json({message: 'Order cancelled'})
}
)

router.get('/all',
async(req, res)=>{
    const orders = await Order.find()
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
    const orders = await Order.find({userID})
    if(orders.length===0){
        return res.status(200).json({message: 'No orders'})
    }
    return res.status(200).json({orders: orders})
    }
)

module.exports = router
