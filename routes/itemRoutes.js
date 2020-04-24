// TODO: When updating an item, make sure the user is a part of the home that the item belongs to
// Use item.parent() to get ref to the parent

const express = require('express')

const ItemService = require('../services/ItemService')
const requireLogin = require('../middleware/requireLogin')

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
  } catch (error) {
    next(error)
  }
});

// ***********
// Fetch items
// ***********

// **********
// Fetch item
// **********

// ***********
// Update item
// ***********

// ***********
// Delete item
// ***********


module.exports = router