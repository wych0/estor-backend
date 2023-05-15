const express = require('express')
const {validationResult, check} = require('express-validator')
const router = express.Router()
const Product = require('../models/product')

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
