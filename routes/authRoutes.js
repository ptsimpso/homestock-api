const express = require('express')

const UserService = require('../services/UserService')
const requireLogin = require('../middleware/requireLogin')

const router = new express.Router()

// *******
// Sign up
// *******
router.post('/auth/signup', async (req, res, next) => {
  const { body: userData } = req
  try {
    const savedUserData = await UserService.signUp(userData)
    res.status(201).send(savedUserData)
  } catch (error) { next(error) }
})

// ******
// Log in
// ******
router.post('/auth/login', async (req, res, next) => {
  const { email, password } = req.body

  try {
    const userData = await UserService.logIn(email, password)
    res.send(userData)
  } catch (error) { next(error) }
})

// *******
// Log out
// *******
router.post('/auth/logout', requireLogin, async (req, res, next) => {
  const { token: currentToken, user } = req
  try {
    await UserService.logOut(currentToken, user)
    res.send()
  } catch (error) { next(error) }
})

// *******************
// Log out all clients
// *******************
router.post('/auth/logout/all', requireLogin, async (req, res, next) => {
  const { user } = req
  try {
    await UserService.logOutAllClients(user)
    res.send()
  } catch (error) { next(error) }
})

// **********
// Fetch self
// **********
router.get('/auth/me', requireLogin, async (req, res) => {
  res.send(req.user)
})

// ***********
// Update self
// ***********
router.patch('/auth/me', requireLogin, async (req, res, next) => {
  const { user, body: updates } = req

  try {
    const updatedUser = await UserService.updateUser(updates, user)
    res.send(updatedUser)
  } catch (error) { next(error) }
})

// ***********
// Delete self
// ***********
router.delete('/auth/me', requireLogin, async (req, res, next) => {
  const { user } = req
  try {
    await UserService.deleteUser(user)
    res.send()
  } catch (error) { next(error) }
})

// **************
// Reset password
// **************
router.post('/auth/reset', async (req, res, next) => {
  const { email } = req.body

  try {
    await UserService.resetPassword(email)
    res.send()
  } catch (error) {
    console.log(error)
    res.send() // Send success even if the request failed for security.
  }
})

module.exports = router