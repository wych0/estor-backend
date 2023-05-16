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

module.exports = router
