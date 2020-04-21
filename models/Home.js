const mongoose = require('mongoose')
const { Schema } = mongoose

const { itemSchema } = require('./Item')

const homeSchema = new Schema({
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
  joinCode: {
    type: String,
    required: true,
    trim: true,
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deleted: {
    type: Boolean,
    default: false,
  },
  items: [itemSchema]
}, {
  timestamps: true
})

const Home = mongoose.model('Home', homeSchema)

module.exports = { Home, homeSchema }