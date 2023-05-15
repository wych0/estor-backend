const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config() 

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(process.env.DATABASE_LINK, options)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())

const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order')

app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/order', orderRouter)

app.listen(3000, () => console.log('Server Started'))