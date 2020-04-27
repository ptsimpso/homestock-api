const StatusError = require('../utils/StatusError')
const { Home } = require('../models/Home')

class HomeService {
  
  static createHome = async (user, name, joinCode) => {
    if (!name || !joinCode || name === "" || joinCode === "") {
      throw new StatusError(422, 'You must provide a name and join code.')
    }

    const matchFound = await Home.isCodeTaken(joinCode)
    if (matchFound) {
      throw new StatusError(422, 'The join code you provided is taken.')
    }

    const home = Home.createHome(user, name, joinCode)

    try {
      const savedHome = await home.saveAndPopulateUsers()
      return savedHome
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Something went wrong creating your home. Please try again.')
    }
  }

  static fetchHomes = async (user) => {
    try {
      const homes = await Home.fetchUserHomes(user)
      return homes
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Something went wrong fetching your homes. Please try again.')
    }
  }

  static fetchHomeById = async (id, user) => {
    let home;
    try {
      home = await Home.fetchUserHomeById(id, user)
    } catch (error) {
      throw new StatusError(500, 'Something went wrong fetching your home. Please try again.')
    }
    if (!home) throw new StatusError(404, 'No home found.')
    return home
  }

  static joinHome = async (joinCode, user) => {
    if (!joinCode || joinCode === "") {
      throw new StatusError(422, 'Please provide a code.')
    }

    const home = await Home.fetchHomeByCode(joinCode)
    if (!home) throw new StatusError(404, 'No home found.')

    if (home.users.includes(user._id)) {
      throw new StatusError(422, 'You have already joined this home.')
    }

    try {
      const updatedHome = await home.addUser(user)
      return updatedHome
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Something went wrong joining your home. Please try again.')
    }
  }

  static leaveHome = async (id, user) => {
    const home = await HomeService.fetchHomeById(id, user)
    try {
      await home.removeUser(user)
    } catch (error) {
      throw new StatusError(500, 'Something went wrong leaving this home.')
    }
  }

  static updateHome = async (id, updates, user) => {
    const updateKeys = Object.keys(updates)
    const allowedUpdates = ['name', 'joinCode']
    const isValidOperation = updateKeys.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) throw new StatusError(422, 'Invalid updates.')

    const home = await Home.fetchOwnerHomeById(id, user)
    if (!home) throw new StatusError(404, 'No home found or you are not the owner.')

    updateKeys.forEach(update => home[update] = updates[update])

    try {
      const updatedHome = await home.saveAndPopulateUsers()
      return updatedHome
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Something went wrong updating your home. Please try again.')
    }
  }

  static deleteHome = async (id, user) => {
    await Home.deleteOwnerHome(id, user)
  }

  static fetchItems = async (homeId, user) => {
    const home = await HomeService.fetchHomeById(homeId, user)
    return home.items
  }

}

module.exports = HomeService