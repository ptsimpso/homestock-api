const express = require('express')

const HomeService = require('../services/HomeService')
const requireLogin = require('../middleware/requireLogin')

const router = new express.Router()

// ***********
// Create home
// ***********
router.post('/homes', requireLogin, async (req, res, next) => {
  const { user } = req
  const { name, joinCode } = req.body

  try {
    const newHome = await HomeService.createHome(user, name, joinCode)
    res.send(newHome)
  } catch (error) { next(error) }
});

// **************
// Read all homes
// **************
router.get('/homes', requireLogin, async (req, res, next) => {
  const { user } = req

  try {
    const homes = await HomeService.fetchHomes(user)
    res.send(homes)
  } catch (error) { next(error) }
});

// ***********
// Read a home
// ***********
router.get('/homes/:id', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params

  try {
    const home = await HomeService.fetchHomeById(id, user)
    res.send(home)
  } catch (error) { next(error) }
});

// ***********
// Join a home
// ***********
router.post('/homes/join', requireLogin, async (req, res, next) => {
  const { user } = req
  const { joinCode } = req.body

  try {
    const home = await HomeService.joinHome(joinCode, user)
    res.send(home)
  } catch (error) { next(error) }
});

// ************
// Leave a home
// ************
router.post('/homes/:id/leave', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params

  try {
    await HomeService.leaveHome(id, user)
    res.send()
  } catch (error) { next(error) }
});

// *************
// Update a home
// *************
router.patch('/homes/:id', requireLogin, async (req, res, next) => {
  const { id } = req.params
  const { user, body: updates } = req

  try {
    const updatedHome = await HomeService.updateHome(id, updates, user)
    res.send(updatedHome)
  } catch (error) { next(error) }
})

// *************
// Delete a home
// *************
router.delete('/homes/:id', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params
  try {
    await HomeService.deleteHome(id, user)
    res.send()
  } catch (error) { next(error) }
});

// ****************
// Fetch home items
// ****************
router.get('/homes/:id/items', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params
  try {
    const items = await HomeService.fetchItems(id, user)
    res.send(items)
  } catch (error) { next(error) }
});


module.exports = router