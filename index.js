const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to the HomeStock API')
})

const PORT = process.env.PORT || 5000
app.listen(PORT)