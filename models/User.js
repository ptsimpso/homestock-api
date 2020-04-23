const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/keys')
const StatusError = require('../utils/StatusError')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value === '') {
        throw new StatusError(422, 'Name is invalid.')
      }
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new StatusError(422, 'Email is invalid.')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
}, {
  timestamps: true
})

// *******
// STATICS - use statics to add class funcs to User class
// *******

userSchema.statics.createUser = async (name, email, password) => {
  const user = new User({ name, email, password })
  const obj = await user.save()
  const token = await obj.generateAuthToken()
  return { user: obj, token }
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) throw new StatusError(422, 'Unable to login.')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new StatusError(422, 'Unable to login.')

  return user
}

// *******
// METHODS - use methods do add instance methods User instances
// *******

userSchema.methods.generateAuthToken = async function () {
  const user = this // Need to use standard function here to get 'this' binding
  const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET)
  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.methods.removeAuthToken = async function (tokenToRemove) {
  const user = this
  user.tokens = user.tokens.filter(token => token.token !== tokenToRemove)
  await user.save()
}

userSchema.methods.removeAllAuthTokens = async function () {
  const user = this
  user.tokens = []
  await user.save()
}

userSchema.methods.toJSON = function () { // toJSON is a pre-defined method that will be called when a class is converted to JSON.
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.__v

  return userObject
}

// *********
// LIFECYCLE
// *********

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8) // Hash the plain text password
  }
  next() // Need to call this to say we are ready to finalize the save
})

const User = mongoose.model('User', userSchema)

module.exports = { User, userSchema }