const express = require('express')

const { Home } = require('../models/Home')
const requireLogin = require('../middleware/requireLogin')

const router = new express.Router()

// Create home
router.post('/homes', requireLogin, async (req, res) => {
  const { user } = req
  const { name, joinCode } = req.body

  if (!name || !joinCode || name === "" || joinCode === "") {
    res.status(422).send({ error: 'You must provide a name and join code.' })
    return
  }

  const match = await Home.findOne({ joinCode }).select({ _id: true }).lean()
  if (match) {
    res.status(422).send({ error: 'The join code you provided is taken.' })
    return
  }

  const home = new Home({
    name,
    owner: user._id,
    joinCode,
    users: [user._id],
    items: []
  })

  try {
    const savedHome = await home.save()
    const populatedHome = await savedHome.populate('users', '_id name').execPopulate()
    res.send(populatedHome)
  } catch (error) {
    res.status(500).send(error)
  }

});

// Read all homes
router.get('/homes', requireLogin, async (req, res) => {
  const { user } = req

  try {
    const homes = await Home.find({
      users: user._id,
      deleted: false
    }).populate('users', '_id name').lean()

    res.send(homes)
  } catch (error) {
    res.status(500).send(error)
  }
});

// Read a home
router.get('/homes/:id', requireLogin, async (req, res) => {
  try {
    const home = await Home.findOne({ _id: req.params.id, users: req.user._id }).populate('users', '_id name').lean()
    if (!home) return res.status(404).send({ error: 'No home found.' })

    res.send(home)
  } catch (error) {
    res.status(500).send(error)
  }
});

// Join a home
router.post('/homes/join', requireLogin, async (req, res) => {
  
  const { user } = req
  const { joinCode } = req.body

  if (!joinCode || joinCode === "") {
    res.status(400).send({ error: 'Please provide a code.' })
    return
  }

  try {
    const home = await Home.findOne({ joinCode, deleted: false })
    if (!home) return res.status(404).send({ error: 'No home found.' })

    if (home.users.includes(user._id)) {
      return res.status(422).send({ error: 'You have already joined this home.' })
    }

    home.users.push(user)
    const updatedHome = await home.save()
    const populatedHome = await updatedHome.populate('users', '_id name').execPopulate()
    res.send(populatedHome)

  } catch (error) {
    res.status(500).send(error)
  }

});

// Update a home
router.patch('/homes/:id', requireLogin, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'joinCode']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if (!isValidOperation) return res.status(400).send('Invalid updates.')

  const { id } = req.params

  try {
    const home = await Home.findOne({ _id: id, owner: req.user._id })
    if (!home) return res.status(404).send({ error: 'No home found or you are not the owner.' })

    updates.forEach((update) => home[update] = req.body[update])
    await home.save()

    res.send(home)
  } catch (e) {
    res.status(500).send()
  }

})

// Delete a home
router.delete('/homes/:id', requireLogin, async (req, res) => {
  try {
    await Home.updateOne({ _id: req.params.id, owner: req.user._id }, { deleted: true })
    res.send()
  } catch (error) {
    res.status(400).send({ error: 'Home not found.' })
  }
});


module.exports = router