const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const uri = process.env.DATABASE_LINK
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

mongoose.connect(uri, options).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch((error) => {
    console.log('Error connecting to MongoDB Atlas', error);
  });


const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.listen(3000, () => console.log('Server Started'))