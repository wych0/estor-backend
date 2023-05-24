const mongoose = require('mongoose')
const addressSchema = require('./addressSchema')
const { Schema } = mongoose

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    secName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        default: 'klient' 
    },
    accountStatus:{
        type: String,
        default: 'Aktywne'
    },
    cartItems:{
        type: Array,
        default: []
    },
    shipAddress:{
        type: addressSchema
    }
})

module.exports = mongoose.model('User', userSchema)