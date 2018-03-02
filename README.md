# Serverless Slack Invitator API

AWS Lambda Function that receives a request with User Name and Email and invites the user to a given slack account.
This function is exposed through AWS API Gateway so that your website can make simple POST requests to the API and have the lambda function processing it. Being a serverless function reduces drastically the costs since you do not need to have a server running with just an API hosted.
