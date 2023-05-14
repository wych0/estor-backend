const {validationResult, check} = require('express-validator')
const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const User = require('../models/User')

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
    await order.save()
    res.status(200).json({message: "Placed order"})
}
)

module.exports = router
