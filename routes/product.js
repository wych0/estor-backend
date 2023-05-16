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
    if(!user || user.role!=='admin'){
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

module.exports = router
