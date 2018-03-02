'use strict'
console.log('Loading function')

if (!process.env.SLACK_ACCOUNT) throw new Error(`Missing required 'SLACK_ACCOUNT' env variable.`)
if (!process.env.SLACK_TOKEN) throw new Error(`Missing required 'SLACK_TOKEN' env variable.`)
if (!process.env.DYNAMODB_TABLE) throw new Error(`Missing required 'DYNAMODB_TABLE' env variable.`)
if (!process.env.REGION) throw new Error(`Missing required 'REGION' env variable.`)

const SLACK_ACCOUNT = process.env.SLACK_ACCOUNT
const SLACK_TOKEN = process.env.SLACK_TOKEN
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE
const REGION = process.env.REGION

const Helpers = require('./helpers')
const SlackHelper = new Helpers.SlackHelper(SLACK_ACCOUNT, SLACK_TOKEN)
const DynamoDbHelper = new Helpers.DynamoDbHelper(REGION, DYNAMODB_TABLE)

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 */
exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const done = (err, res) => {
    callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? JSON.stringify({ success: false, message: err.message }) : JSON.stringify(res),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  parseRequest(event).then(user => {
    return Promise.all([
      DynamoDbHelper.save(user), // save user in DB
      SlackHelper.invite(user.email) // send slack invite
    ])
  }).then(([dynamoResponse, slackResponse]) => {
    let message = 'You should have an email on your inbox with our Slack invite.'
    if (slackResponse.error === 'already_invited' || slackResponse.error === 'already_in_team') {
      message = 'Looks like you were already invited before. Please check your email or contact us at contact@awshonolulu.com'
    } else if (slackResponse.error === 'invalid_email') {
      message = `The email you entered doesn't seem to be a valid email.`
    } else if (slackResponse.error === 'invalid_auth') {
      throw new Error('Slack is not properly configured. Token expired???')
    }
    done(null, { success: slackResponse.ok, message: message })
  }).catch(err => {
    console.log(err)
    done(new Error('There was somthing wrong trying to add you to slack. Please try again, otherwise contact us at contact@awshonolulu.com.'))
  })
}

function parseRequest (req) {
  return Promise.resolve().then(() => {
    // validate HTTP method
    switch (req.httpMethod) {
      case 'POST':
        // all good here
        break
      default:
        throw new Error(`Unsupported method "${req.httpMethod}"`)
    }

    // parse body
    let body
    try {
      body = JSON.parse(req.body)
    } catch (err) {
      throw new Error('Body must be application/json')
    }

    // Validate required parameters
    const user = body.user
    if (!user) {
      throw new Error(`Missing required 'user' field`)
    }
    const REQUIRED_FIELDS = ['email', 'name']
    REQUIRED_FIELDS.forEach(field => {
      if (!user[field]) {
        throw new Error(`Missing required '${field}' field`)
      }
    })

    return user
  })
}
