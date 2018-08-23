// JavaScript source code

var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var fs = require('fs');
var request = require('request');
var url = require('url');

// Setup connection to Azure CosmosDB

var documentDbOptions = {
    host: 'https://cog-srchbot.documents.azure.com:443/',
    masterKey: '2JKJUGVMsdFG8TVjfzOD1j3PYi9dOWaUAhbIGlZ2N2YIRyaRJxyHsyxqnXcsTekYb0EC8PFGLMVvZCyYRBo9zQ==',
    database: 'botdocs',
    collection: 'botdata'
};

var docDbClient = new azure.DocumentDbClient(documentDbOptions);

var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session) {
    var msg = session.message;
    if (msg.attachments && msg.attachments.length > 0) {
        // Echo back attachment and convert speech to text if audio attachment is added
        var attachment = msg.attachments[0];
        session.send({
            text: "You sent:",
            attachments: [
                {
                    contentType: attachment.contentType,
                    contentUrl: attachment.contentUrl,
                    name: attachment.name
                }
            ]
        });
        
    } else {
        // Echo back users text
        session.send("You said: %s", session.message.text);
       
    }

})  .set('storage', cosmosStorage);


