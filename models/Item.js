const mongoose = require('mongoose')
const StatusError = require('../utils/StatusError')
const { Schema } = mongoose

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  quantity: {
    type: Number,
    default: 0
  },
  restockThreshold: {
    type: Number,
    default: 0
  },
  img: String
}, {
  timestamps: true
})

// *******
// STATICS
// *******

itemSchema.statics.createItem = (user, name, quantity, restockThreshold) => {
  return new Item({
    name,
    owner: user._id,
    quantity: quantity || 0,
    restockThreshold: restockThreshold || 0,
  })
}

// *******
// METHODS
// *******

const Item = mongoose.model('Item', itemSchema)

module.exports = { Item, itemSchema }