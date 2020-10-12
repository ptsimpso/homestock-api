const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const compression = require('compression')

// Load mongo models
require('./models/User')
require('./models/Home')
require('./models/Item')

const authRoutes = require('./routes/authRoutes')
const homeRoutes = require('./routes/homeRoutes')
const itemRoutes = require('./routes/itemRoutes')
const { MONGO_URI, ROLLBAR_ACCESS_TOKEN } = require('./config/keys')

// App monitoring
const Rollbar = require("rollbar");
const rollbar = new Rollbar({
  accessToken: ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

const app = express()

app.use(bodyParser.json())
app.use(compression())

app.get('/', (req, res) => {
  res.send('Welcome. Contact homestockapp@gmail.com for support.')
})

app.use(authRoutes)
app.use(homeRoutes)
app.use(itemRoutes)

// Error handler. This must be last.
app.use((err, req, res, next) => {
  res.status(err.statusCode || 400).send({ error: err.message }) // err is of type StatusError
})

const PORT = process.env.PORT || 5000
app.listen(PORT)