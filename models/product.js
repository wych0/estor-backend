const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    brand:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    isSold:{
        type: Boolean,
        default: false 
    },
    image:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Product', productSchema)