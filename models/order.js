const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new mongoose.Schema({
    date:{
        type: Date,
        required: true,
        default: Date.now
    }, 
    price:{
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
        required: true
    },
    products:{
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('Order', orderSchema)