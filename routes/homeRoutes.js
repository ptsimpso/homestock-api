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
    owner: user.id,
    joinCode,
    users: [user.id],
    items: []
  })

  try {
    const savedHome = await home.save()
    res.send(savedHome)
  } catch (error) {
    res.status(422).send(error)
  }

});

// Read a home that is not deleted

// Read homes attached to user that are not deleted
router.get('/homes', requireLogin, async (req, res) => {
  const { user } = req

  try {
    const homes = await Home.find({
      users: user.id,
      deleted: false
    }).lean()

    res.send(homes)
  } catch (error) {
    res.status(500).send(error)
  }
});

// Update a home

// Join a home. Return the home.

// Delete a home

module.exports = router