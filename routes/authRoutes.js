const express = require('express')

const User = require('../models/user')
const requireLogin = require('../middleware/requireLogin')

const router = new express.Router()

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

router.get('/auth/me', requireLogin, async (req, res) => {
  res.send(req.user)
})

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

router.delete('/auth/me', requireLogin, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router