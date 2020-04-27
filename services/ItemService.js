const StatusError = require('../utils/StatusError')
const { Item } = require('../models/Item')
const { Home } = require('../models/Home')

class ItemService {
  
  static createItem = async (homeId, user, name, quantity, restockThreshold) => {
    if (!homeId || !name || name === "") {
      throw new StatusError(422, 'You must provide a name and quantity for your item.')
    }

    const item = Item.createItem(user, name, quantity, restockThreshold)
    const updatedHome = await Home.addItem(homeId, user, item)
    return { home: updatedHome, item }
  }

  static fetchItem = async (itemId, user) => {
    const item = await Home.fetchItem(itemId, user)
    return item
  }

  static updateItem = async (itemId, user, name, quantity, restockThreshold) => {
    await Home.updateItem(itemId, user, name, quantity, restockThreshold)
    const item = await ItemService.fetchItem(itemId, user)
    return item
  }

  static removeItem = async (itemId, user) => {
    await Home.removeItem(itemId, user)
  }
}

module.exports = ItemService