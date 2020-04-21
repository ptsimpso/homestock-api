const express = require('express')

const { User } = require('../models/User')
const requireLogin = require('../middleware/requireLogin')

const router = new express.Router()

// Sign up
router.post('/auth/signup', async (req, res) => {
  const user = new User(req.body)
  try {
    const obj = await user.save()
    const token = await obj.generateAuthToken()
    res.status(201).send({ user: obj, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

// Log in
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    console.log(e);
    res.status(400).send()
  }
})

// Log out
router.post('/auth/logout', requireLogin, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
    await req.user.save()
    res.send()
  } catch (e) {
    console.log(e);
    res.status(500).send()
  }
})

// Log out all clients
router.post('/auth/logout/all', requireLogin, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    console.log(e);
    res.status(500).send()
  }
})

// Fetch self
router.get('/auth/me', requireLogin, async (req, res) => {
  res.send(req.user)
})

// Update self
router.patch('/auth/me', requireLogin, async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if (!isValidOperation) return res.status(400).send('Invalid updates.')

  try {
    const { user } = req
    updates.forEach((update) => user[update] = req.body[update])
    await user.save()
    res.send(user)
  } catch (e) {
    console.log(e);
    res.status(500).send()
  }
})

// Delete self
router.delete('/auth/me', requireLogin, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router