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

// Read homes attached to user that are not deleted
router.get('/homes', requireLogin, async (req, res) => {
  const { user } = req

  try {
    const homes = await Home.find({
      users: user.id,
      deleted: false
    }).lean()

    res.send(homes) // TODO: Send back home with populated users with only user id and names
  } catch (error) {
    res.status(500).send(error)
  }
});

// Read a home that is not deleted
router.get('/homes/fetch/:id', requireLogin, async (req, res) => {
  try {
    const home = await Home.findOne({ _id: req.params.id, users: req.user.id }).lean()

    res.send(home) // TODO: Send back home with populated users with only user id and names
  } catch (error) {
    res.status(400).send({ error: 'ID not found.' })
  }
});

// Join a home. Return the home.
router.post('/homes/join', requireLogin, async (req, res) => {
  
  const { user } = req
  const { joinCode } = req.body

  if (!joinCode || joinCode === "") {
    res.status(400).send({ error: 'Please provide a code.' })
    return
  }

  try {
    const home = await Home.findOne({ joinCode, deleted: false })

    if (!home) {
      return res.status(400).send({ error: 'No home found.' })
    }

    if (home.users.includes(user.id)) {
      return res.status(400).send({ error: 'You have already joined this home.' })
    }

    home.users.push(user)
    const updatedHome = await home.save()
    res.send(updatedHome) // TODO: Send back home with populated users with only user id and names

  } catch (error) {
    res.status(400).send(error)
  }

});

// Update a home



// Delete a home

module.exports = router