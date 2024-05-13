const express = require('express')
const app = express()
require('dotenv').config();

const bodyParser = require('body-parser')
app.use(bodyParser.json())  

const db= require('./db')
const port = 3000

const userRoutes = require('./routes/userRoutes');
app.use('/' , userRoutes);

const candidateRoutes = require('./routes/candidateRoute');
app.use('/candidate' , candidateRoutes);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })