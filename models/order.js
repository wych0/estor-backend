const mongoose = require('mongoose')
const moment = require('moment-timezone')
const { Schema } = mongoose

const addressSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    secName:{
        type: String,
        required: true
    },
    street:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    postalCode:{
        type: String,
        required: true
    },
    email:{
        type: String,
        rquired: true
    },
    country:{
        type: String,
        required: true
    }
})

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