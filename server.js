const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config() 

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(process.env.DATABASE_LINK, options)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.static('public'))
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order')
const cartRouter = require('./routes/cart')
const userRouter = require('./routes/user')

app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/order', orderRouter)
app.use('/cart', cartRouter)
app.use('/user', userRouter)

app.listen(8000, () => console.log('Server Started'))