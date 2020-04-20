const jwt = require('jsonwebtoken')
const User = require('../models/user')

const { JWT_SECRET } = require('../config/keys')

const requireLogin = async (req, res, next) => {

  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      throw new Error()
    }

    req.token = token
    req.user = user // Can store any vars from middleware you want on request object like this to pass to router
    next() // Must call next() to move on from middleware to router
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }

}

module.exports = requireLogin