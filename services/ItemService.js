const StatusError = require('../utils/StatusError')
const { Item } = require('../models/Item')
const { Home } = require('../models/Home')
const ImageService = require('./ImageService')

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

  static saveItemImage = async (itemId, user, imgFile) => {
    if (!imgFile) throw new StatusError(422, 'You must include an image file.')

    try {
      const resizedImg = await ImageService.resize(imgFile.buffer, 250, 250)
      const imgUrl = await ImageService.saveImage(resizedImg)
      const item = await ItemService.updateItem(itemId, user, { imgUrl })
      return item
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Unable to save image. Please try again.')
    }
  }

  static updateItem = async (itemId, user, updateParams) => {
    await Home.updateItem(itemId, user, updateParams)
    const item = await ItemService.fetchItem(itemId, user)
    return item
  }

  static removeItem = async (itemId, user) => {
    await Home.removeItem(itemId, user)
  }
}

module.exports = ItemService