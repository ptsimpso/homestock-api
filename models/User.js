const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/keys')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
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

// use methods do add instance methods User instances
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET)
  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.methods.toJSON = function () { // toJSON is a pre-defined method that will be called when a class is converted to JSON.
  const user = this // Need to use standard function here to get 'this' binding
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.__v

  return userObject
}


// use statics to add class methods to User class
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) throw new Error('Unable to login')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Unable to login')

  return user
}

// Hash the plain text password
userSchema.pre('save', async function (next) {
  const user = this // Need to use standard function here to get 'this' binding
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next() // Need to call this to say we are ready to finalize the save
})

const User = mongoose.model('User', userSchema)

module.exports = User