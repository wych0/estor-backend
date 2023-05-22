const {validationResult, check} = require('express-validator')
const {ObjectId} = require('mongodb')
const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const User = require('../models/User')
const Product = require('../models/product')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.post('/create',
check('userEmail')
.escape()
.trim()
.notEmpty().withMessage('UserEmail field cannot be empty')
.custom(async (userEmail) => {
    const user = await User.findOne({email: userEmail})
    if(!user){
        return Promise.reject('User with that e-mail not found')
    }
}),

check('cost')
.escape()
.trim()
.notEmpty().withMessage('Cost field cannot be empty')
.isDecimal().withMessage('Cost field must be a number'),

check('products')
.escape()
.trim()
.custom(async (products) =>{
    if(!Array.isArray(products)){
        return Promise.reject('Products field must be an array')
    }
    if(products.length===0){
        return Promise.reject('Products array cannot be empty')
    }
    await Promise.all(products.map(async (productID) => {
        const product = await Product.findOne({_id: new ObjectId(productID)})
        if(!product){
            return Promise.reject('Product with at least one of these id not found')
        }
        if(product.isSold){
            return Promise.reject('At least one of the products has been sold')
        }
    }))
    for(let i=0; i<products.length; i++){
        if(products.indexOf(products[i]) !== i){
            return Promise.reject('There is a duplicate product')
        }
    }
}),

check(['address.name','address.country','address.secName','address.street','address.city','address.postalCode','address.email'])
.trim()
.escape()
.notEmpty().withMessage('This field cannot be empty'),

check('address.email')
.isEmail().withMessage('Invalid e-mail'),

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {cost, userEmail, products, address} = req.body
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Login to place order'})
    }
    const order = new Order({
        userEmail,
        cost,
        products,
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
    products.forEach(async(productID) => {
        await Product.findByIdAndUpdate(new ObjectId(productID), {isSold: true})
    })
    
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
    console.log(orders)
    if(orders.length===0){
        return res.status(200).json({message: 'No orders'})
    }
    return res.status(200).json({orders: orders})
    }
)

module.exports = router
