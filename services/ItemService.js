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

}

module.exports = ItemService