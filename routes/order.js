const {validationResult, check} = require('express-validator')
const {ObjectId} = require('mongodb')
const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const User = require('../models/User')
const Product = require('../models/product')

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

async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {cost, userEmail, products} = req.body
    const order = new Order({
        userEmail,
        cost,
        products
    })
    products.forEach(async(productID) => {
        await Product.findOneAndUpdate({_id: new ObjectId(productID)}, {isSold: true})
    })
    
    await order.save()
    res.status(200).json({message: "Placed order"})
}
)

module.exports = router
