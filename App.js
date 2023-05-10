const express = require('express')

const loginroute = require('./routes/login.js')

const app = express()
const PORT = 3000

app.use("/auth", loginroute)
app.listen(PORT, () =>{
    console.log("Server running " + PORT)
})