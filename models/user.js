const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    secName: {
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
    role: {
        type: String,
        default: 'klient' 
    }
})

module.exports = mongoose.model('User', userSchema)