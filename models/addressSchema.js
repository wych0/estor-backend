const mongoose = require('mongoose')

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

module.exports = addressSchema