const mongoose = require('mongoose')
const { Schema } = mongoose

const { itemSchema } = require('./Item')
const StatusError = require('../utils/StatusError')

// ******
// SCHEMA
// ******

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

// *******
// STATICS
// *******

homeSchema.statics.isCodeTaken = async (joinCode) => {
  const matchFound = await Home.findOne({ joinCode }).select({ _id: true }).lean()
  return matchFound
}

homeSchema.statics.createHome = (user, name, joinCode) => {
  return new Home({
    name,
    owner: user._id,
    joinCode,
    users: [user._id],
    items: []
  })
}

homeSchema.statics.fetchUserHomes = async (user) => {
  const homes = await Home.find({ users: user._id, deleted: false }).populate('users', '_id name')
  return homes
}

homeSchema.statics.fetchUserHomeById = async (id, user) => {
  try {
    const home = await Home.findOne({ _id: id, users: user._id, deleted: false }).populate('users', '_id name')
    return home
  } catch (error) {
    throw new StatusError(404, 'Home not found.')
  }
}

homeSchema.statics.fetchHomeByCode = async (joinCode) => {
  const home = await Home.findOne({ joinCode, deleted: false })
  return home
}

homeSchema.statics.fetchOwnerHomeById = async (id, user) => {
  try {
    const home = await Home.findOne({ _id: id, owner: user._id, deleted: false })
    return home
  } catch (error) {
    throw new StatusError(404, 'Home not found.')
  }
}

homeSchema.statics.deleteOwnerHome = async (id, user) => {
  try {
    const home = await Home.updateOne({ _id: id, owner: user._id }, { deleted: true })
    return home
  } catch (error) {
    throw new StatusError(404, 'Home not found.')
  }
}

homeSchema.statics.addItem = async (homeId, user, item) => {
  let home;
  try {
    home = await Home.fetchUserHomeById(homeId, user)
  } catch (error) {
    throw new StatusError(500, 'Something went wrong fetching your home. Please try again.')
  }
  if (!home) throw new StatusError(404, 'No home found.')

  home.items.unshift(item)
  const savedHome = await home.save()
  return savedHome
}

// *******
// METHODS
// *******

homeSchema.methods.saveAndPopulateUsers = async function () {
  const home = this
  const savedHome = await home.save()
  await savedHome.populateUsers()
  return savedHome
}

homeSchema.methods.populateUsers = async function () {
  const home = this
  await home.populate('users', '_id name').execPopulate()
}

homeSchema.methods.addUser = async function (user) {
  const home = this
  home.users.push(user)
  const savedHome = await home.saveAndPopulateUsers()
  return savedHome
}

// *******
// EXPORTS
// *******

const Home = mongoose.model('Home', homeSchema)

module.exports = { Home, homeSchema }