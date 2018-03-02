const AWS = require('aws-sdk')

module.exports = class {
  constructor (region, tableName) {
    this.tableName = tableName
    AWS.config.update({ region: region })
    this.dynamodb = new AWS.DynamoDB.DocumentClient()
  }

  save (obj) {
    if (!obj.email) throw new Error('Missing user email.')
    obj.created = new Date().toISOString()
    const params = {
      TableName: this.tableName,
      Item: obj
    }
    return new Promise((resolve, reject) => {
      this.dynamodb.put(params, (err, data) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
