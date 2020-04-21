const mongoose = require('mongoose')
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
  }
}, {
  timestamps: true
})

const Item = mongoose.model('Item', itemSchema)

module.exports = { Item, itemSchema }