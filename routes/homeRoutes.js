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

  const matchFound = await Home.isCodeTaken(joinCode)
  if (matchFound) {
    res.status(422).send({ error: 'The join code you provided is taken.' })
    return
  }

  try {
    const home = await Home.createHome(user, name, joinCode)
    res.send(home)
  } catch (error) {
    res.status(500).send(error)
  }

});

// Read all homes
router.get('/homes', requireLogin, async (req, res) => {
  const { user } = req

  try {
    const homes = await Home.fetchUserHomes(user)
    res.send(homes)
  } catch (error) {
    res.status(500).send(error)
  }
});

// Read a home
router.get('/homes/:id', requireLogin, async (req, res) => {
  const { user } = req
  const { id } = req.params

  try {
    const home = await Home.fetchUserHomeById(id, user)
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
    const home = await Home.fetchHomeByCode(joinCode)
    if (!home) return res.status(404).send({ error: 'No home found.' })

    if (home.users.includes(user._id)) {
      return res.status(422).send({ error: 'You have already joined this home.' })
    }

    const updatedHome = await home.addUser(user)
    res.send(updatedHome)
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
  const { user } = req

  try {
    const home = await Home.fetchOwnerHomeById(id, user)
    if (!home) return res.status(404).send({ error: 'No home found or you are not the owner.' })

    updates.forEach((update) => home[update] = req.body[update])
    const updatedHome = await home.saveAndPopulateUsers()
    res.send(updatedHome)
  } catch (e) {
    res.status(500).send()
  }

})

// Delete a home
router.delete('/homes/:id', requireLogin, async (req, res) => {
  const { user } = req
  const { id } = req.params
  try {
    await Home.deleteHome(id, user)
    res.send()
  } catch (error) {
    res.status(400).send({ error: 'Home not found.' })
  }
});


module.exports = router