const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// Load mongo models
require('./models/User')
require('./models/Home')
require('./models/Item')

const authRoutes = require('./routes/authRoutes')
const homeRoutes = require('./routes/homeRoutes')
const { MONGO_URI } = require('./config/keys')

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to the HomeStock API')
})

app.use(authRoutes)
app.use(homeRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT)