const express = require('express')
const {ObjectId} = require('mongodb')
const {validationResult, check} = require('express-validator')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/User')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const fs = require('fs')
router.use(cookieParser())
const formatString = require('../formatString')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/')
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
})

const upload = multer({storage: storage})

router.post('/create',
upload.single('image'),
check(['name', 'brand'])
.escape()
.trim()
.notEmpty().withMessage('This field cannot be empty'),
check('price')
.escape()
.trim()
.notEmpty().withMessage('Price field cannot be empty')
.isDecimal().withMessage('Price field must be a number'),
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
    const image = req.file
    if(!image){
        return res.status(403).json({message: 'Image file is required'})
    }
    const {name, brand, price} = req.body
    const product = new Product({
        name: formatString(name),
        brand: formatString(brand),
        price,
        image: image.filename
    })
    await product.save()
    res.status(200).json({message: "Created product"})
})

router.delete('/:productID',
check('productID')
.trim()
.escape()
.notEmpty().withMessage('ProductID field cannot be empty')
.isMongoId().withMessage('Invalid id'),
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
    const {productID} = req.params
    const product = await Product.findById(new ObjectId(productID))
    if(!product){
        return res.status(404).json({error: 'Product with that id not found'})
    }
    if(!product.isSold){
        fs.unlink(`public/images/${product.image}`, (error)=>{
            if(error){
                console.log(error)
            }
        })
    }
    await Product.deleteOne({_id: new ObjectId(productID)})
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

router.post('/deleteFromCart',
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
