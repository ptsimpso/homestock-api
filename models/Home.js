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

// *******
// STATICS
// *******

homeSchema.statics.isCodeTaken = async (joinCode) => {
  const matchFound = await Home.findOne({ joinCode }).select({ _id: true }).lean()
  return matchFound
}

homeSchema.statics.createHome = async (user, name, joinCode) => {
  const home = new Home({
    name,
    owner: user._id,
    joinCode,
    users: [user._id],
    items: []
  })

  const savedHome = await home.saveAndPopulateUsers()
  return savedHome
}

homeSchema.statics.fetchUserHomes = async (user) => {
  const homes = await Home.find({ users: user._id, deleted: false }).populate('users', '_id name')
  return homes
}

homeSchema.statics.fetchUserHomeById = async (id, user) => {
  const home = await Home.findOne({ _id: id, users: user._id, deleted: false }).populate('users', '_id name')
  return home
}

homeSchema.statics.fetchHomeByCode = async (joinCode) => {
  const home = await Home.findOne({ joinCode, deleted: false })
  return home
}

homeSchema.statics.fetchOwnerHomeById = async (id, user) => {
  const home = await Home.findOne({ _id: id, owner: user._id, deleted: false })
  return home
}

homeSchema.statics.deleteHome = async (id, user) => {
  const home = await Home.updateOne({ _id: id, owner: user._id }, { deleted: true })
  return home
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

const Home = mongoose.model('Home', homeSchema)

module.exports = { Home, homeSchema }