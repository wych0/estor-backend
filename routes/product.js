const express = require('express')
const {ObjectId} = require('mongodb')
const {validationResult, check} = require('express-validator')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/User')
const cookieParser = require('cookie-parser')
router.use(cookieParser())

router.post('/create',
check(['name', 'brand'])
.escape()
.trim()
.notEmpty().withMessage('This field cannot be empty'),

check('price')
.escape()
.trim()
.notEmpty().withMessage('Price field cannot be empty')
.isDecimal().withMessage('Price field must be a number'),

check('image')
.escape()
.trim()
.notEmpty().withMessage('Image field cannot be empty')
.matches(/[^\\s]+(.*?)\.(jpg|jpeg|png|)$/i).withMessage('Wrong file name, remember about extension'),

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'You have to be logged in'})
    }
    user = await User.findById(new ObjectId(userID))
    if(user.role!=='admin'){
        return res.status(403).json({message: 'You cant add product to database'})
    }
    const {name, brand, price, image} = req.body
    const product = new Product({
        name,
        brand,
        price,
        image
    })
    await product.save()
    res.status(200).json({message: "Created product"})
}
)

router.delete('/',
check('productID')
.trim()
.escape()
.notEmpty().withMessage('ProductID field cannot be empty')
.isMongoId().withMessage('Invalid id')
.custom(async(productID)=>{
    const product = await Product.findById(new ObjectId(productID))
    if(!product){
        return Promise.reject('Product with that id not found')
    }
    if(product.isSold===true){
        return Promise.reject('You cant delete sold product from database')
    }
}),
async (req, res) => { 
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Login to delete product'})
    }
    const user = await User.findById(new ObjectId(userID))
    if(user.role!=='admin'){
        return res.status(403).json({message: 'You cannot delete product from database'})
    }
    const {productID} = req.body
    const result = await Product.deleteOne({_id: new ObjectId(productID)})
    console.log(result)
    res.status(200).json({message: "Deleted product"})
}
)

router.post('/addToCart',
check('productID')
.trim()
.escape()
.notEmpty().withMessage('ProductID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Login to add product to cart'})
    }
    const {productID} = req.body
    const product = await Product.findById(new ObjectId(productID))
    if(!product){
        return res.status(404).json({message: 'Product with that id not found'})
    }
    if(product.isSold){
        return res.status(403).json({message: 'You cannot buy sold product'})
    }
    const user = await User.findById(new ObjectId(userID))
    for(let i=0; i<user.cartItems.length; i++){
        const userProduct = user.cartItems[i]
        if(userProduct._id.toString()===product._id.toString()){
            return res.status(403).json({message: 'Product with that id already added to cart'})
        }
    }
    user.cartItems.push(product)
    await user.save()
    return res.status(200).json({message: 'Product added to cart', product: product})
})

router.delete('/deleteFromCart',
check('productID')
.trim()
.escape()
.notEmpty().withMessage('ProductID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const userID = req.cookies.userID
    if(!userID){
        return res.status(403).json({message: 'Login to delete product from cart'})
    }
    const {productID} = req.body
    const product = await Product.findById(new ObjectId(productID))
    if(!product){
        return res.status(404).json({message: 'Product with that id not found'})
    }
    const user = await User.findById(new ObjectId(userID))
    const productIndex = user.cartItems.findIndex((userProduct) => userProduct._id.toString()===product._id.toString())
    if(productIndex === -1){
        return res.status(403).json({message: 'This product is not added to your cart'})
    }
    user.cartItems.splice(productIndex, 1)
    await user.save()
    return res.status(200).json({message: 'Product deleted from cart'})
})

router.get('/all',
async(req, res)=>{
    const products = await Product.find()
    if(!products){
        return res.status(404).json({message: 'No product in database'})
    }
    return res.status(200).json({products: products})
})

router.get('/',
check('productID')
.trim()
.escape()
.notEmpty().withMessage('ProductID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errros: errors.array()})
    }
    const {productID} = req.query
    const product = await Product.findById(new ObjectId(productID))
    if(!product){
        return res.status(404).json({message: 'Product with that id not found'})
    }
    return res.status(200).json({product: product})
})

module.exports = router
