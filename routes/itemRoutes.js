const express = require('express')

const ItemService = require('../services/ItemService')
const ImageService = require('../services/ImageService')
const requireLogin = require('../middleware/requireLogin')
const upload = ImageService.createUploadMiddleware()

const router = new express.Router()

// ***********
// Create item
// ***********
router.post('/items', requireLogin, async (req, res, next) => {
  const { user } = req
  const { homeId, name, quantity, restockThreshold } = req.body

  try {
    const { item } = await ItemService.createItem(homeId, user, name, quantity, restockThreshold)
    res.send(item)
  } catch (error) { next(error) }
});


// **********
// Fetch item
// **********
router.get('/items/:id', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params

  try {
    const item = await ItemService.fetchItem(id, user)
    res.send(item)
  } catch (error) { next(error) }
})

// **************
// Add item image
// **************
router.post('/items/:id/image', requireLogin, upload.single('img'), async (req, res, next) => {
  const { user, file } = req
  const { id: itemId } = req.params

  try {
    const item = await ItemService.saveItemImage(itemId, user, file)
    res.send(item)
  } catch (error) { next(error) }
});

// ***********
// Update item
// ***********
router.patch('/items/:id', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params
  const { name, quantity, restockThreshold } = req.body

  try {
    const item = await ItemService.updateItem(id, user, { name, quantity, restockThreshold })
    res.send(item)
  } catch (error) { next(error) }
})

// ***********
// Delete item
// ***********
router.delete('/items/:id', requireLogin, async (req, res, next) => {
  const { user } = req
  const { id } = req.params

  try {
    await ItemService.removeItem(id, user)
    res.send()
  } catch (error) { next(error) }  
})


module.exports = router