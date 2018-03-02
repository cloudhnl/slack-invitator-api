# How to deploy this application?

In order to deploy and configure this API you will need to follow these steps:

## Configure your Lambda Function
1. Clone this repository and CD into the folder
    ```
    git clone https://github.com/awshonolulu/slack-invitator-api.git
    cd slack-invitator-api
    ```
1. Install the NPM packages that this api depends on. The API itself if very lightweight and only depends on `request` and `request-promise-native` npm packages to remove the burden of having to do manual HTTP POSTs.
    ```
    npm install
    ```
1. Bundle the application by creating a `.zip` file.
1. Now we need to create the lambda function in AWS and upload our code along with the dependencies (`node_modules`). Login into AWS, go to Lambda, and select Create a Function.
    ![create-function-step](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/1-create-function.PNG)
1. Give your function a name like `slack-invite-lambda` and create a new Role with the name `slack-invite-lambda-role` with `Simple Microservices Permissions` template. This role will let the lambda function write logs to CloudWatch service and interact with DynamoDB.
    ![create-function-step](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/2-create-function.PNG)
1. Scroll down to the `Function Code` section and in `Code entry type` choose `Upload .ZIP file`. Select the `.zip` file that we created before and click `Save` at the top right corner of the screen.
    ![upload-zip-file](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/3-upload-zip.PNG)
1. This function relies on 4 ENV variables, so lets configure them to ensure the function will work. Scroll down to the Environment variable section and configure the following variables:
    - `DYNAMODB_TABLE`: `YOUR_DYNAMODB_NAME` (ie. `members`)
    - `REGION`: `YOUR_REGION` (ie. `us-east-1`, or the region where you created your dynamodb table and lambda function)
    - `SLACK_ACCOUNT`: `NAME_OF_YOUR_SLACK_GROUP` (the name of tour slack group, in our case `awshonolulu`)
    - `SLACK_TOKEN`: `ADMIN_SLACK_TOKEN` (you can obtain this token from https://api.slack.com/custom-integrations/legacy-tokens)

## Configure a DynamoDB table

Now lets create the DynamoDB table where we are gonna store our registered users. Go to DynamoDB service and select `Create table`. Name your table `members` and for `Primary key` select `email`.
    ![create-table](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/4-create-table.PNG)

## Configure API Gateway to call your lambda function

1. Go to API Gateway and create a New Api.
1. Name your API `slack-invite-api`.
1. In `Actions` select `Create Resource` option and name your resource `invite`. At this point we have created a Route in our api `OUR_API/invite`.
    ![api-create-resource](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/5-api-create-resource.PNG)
    ![api-create-resource](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/6-api-resource-name.PNG)
1. Now lets add an HTTP method to our Api. In Actions select `Create Method` and make it of type `POST`.
    ![api-create-method](https://github.com/awshonolulu/slack-invitator-api/blob/master/deployment_tutorial/7-api-create-method.PNG)
1. Configure the integration to be a Lambda Function, choose the region where you created the lambda function and type the function's name(`slack-invite-lambda`).
1. At this point we have our API configured and ready to call the lambda function every time someone makes an HTTP POST request to `OUR_API/invite`. You can test the integration by clicking on the TEST button.
1. Now we need to deploy the Api so that AWS gives us an actual URL to call. In `Actions` select `Deploy Api` option. Choose `prod` and stage and take note of the URL assigned to the API.
