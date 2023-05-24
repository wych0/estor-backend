const mongoose = require('mongoose')
const moment = require('moment-timezone')
const addressSchema = require('./addressSchema')
const { Schema } = mongoose

const orderSchema = new mongoose.Schema({
    date:{
        type: String,
        required: true,
        default: moment.tz('Europe/Warsaw').format(('DD-MM-YYYY'))
    }, 
    cost:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: "W realizacji"
    },
    userID:{
        type: String,
        required: true,
    },
    products:{
        type: Array,
        required: true
    },
    address:{
        type: addressSchema,
        required: true
    }
})

module.exports = mongoose.model('Order', orderSchema)