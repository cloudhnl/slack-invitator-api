const rp = require('request-promise-native')

module.exports = class {
  constructor (slackAccount, token) {
    this.slackAccount = slackAccount
    this.apiUrl = `https://${this.slackAccount}.slack.com/api`
    this.token = token
  }

  invite (user) {
    const options = {
      method: 'POST',
      url: `${this.apiUrl}/users.admin.invite`,
      formData: {
        email: user,
        set_active: 'true',
        token: this.token
      },
      json: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'User-Agent': 'serverless-slack-invitator'
      }
    }
    console.log(options)
    return rp(options).catch(err => {
      console.log(JSON.stringify(err, null, 2))
      throw new Error(`There was an error trying to invite the user. ERR: ${err.message}`)
    })
  }
}
