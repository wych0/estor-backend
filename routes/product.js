const express = require('express')
const router = express.Router()
const Product = require('../models/product')

router.post('/create',

async (req, res) => {
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
