const sgMail = require('@sendgrid/mail');

const StatusError = require('../utils/StatusError')
const { User } = require('../models/User')
const { SENDGRID_API_KEY } = require('../config/keys')
const forgotPassTemplate = require('../utils/email-templates/ForgotPassTemplate')

class UserService {
  static signUp = async (userData) => {
    const { name, email, password } = userData;
    if (!name || !email || !password) throw new StatusError(422, 'Please provide a name, email, and password.')

    const newUserData = await User.createUser(name, email, password)
    return newUserData
  }

  static logIn = async (email, password) => {
    try {
      const user = await User.findByCredentials(email, password)
      const token = await user.generateAuthToken()
      return { user, token }
    } catch (error) {
      console.log(error);
      throw new StatusError(404, 'Credentials invalid.')
    }
  }

  static logOut = async (currentToken, user) => {
    try {
      await user.removeAuthToken(currentToken)
    } catch (error) {
      throw new StatusError(500, 'Failed to log out.')
    }
  }

  static logOutAllClients = async (user) => {
    try {
      await user.removeAllAuthTokens()
    } catch (error) {
      throw new StatusError(500, 'Failed to log out.')
    }
  }

  static updateUser = async (updates, user) => {
    const updateKeys = Object.keys(updates)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updateKeys.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) throw new StatusError(422, 'Invalid updates.')

    updateKeys.forEach(update => user[update] = updates[update])

    try {
      await user.save()
      return user
    } catch (error) {
      console.log(error)
      throw new StatusError(500, 'Something went wrong updating your profile. Please try again.')
    }
  }

  static deleteUser = async (user) => {
    await user.remove()
  }

  static resetPassword = async (email) => {
    const user = await User.findByEmail(email)
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase();
    await UserService.updateUser({ password: tempPassword }, user)

    sgMail.setApiKey(SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: 'homestockapp@gmail.com',
      subject: 'Password reset request',
      html: forgotPassTemplate(tempPassword),
    };
    await sgMail.send(msg);
  }

}

module.exports = UserService