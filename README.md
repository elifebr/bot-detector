# bot-detector

## About
This app analysis a twitter account and returns a _JSON_ in the following format: { level: 'suspeito', value: 0.48 }. This result can be obtained using the GET `http://localhost:8080/twitter/botcheck/:screen_name` route.

## Requirements

Before running the application, make sure you have these softwares in your machine:

* NodeJS (6.11.0 or greater)
* MongoDB (3.4 or greater)

## Running the app

1. Clone the application repository
    `git clone https://github.com/gabrielmla/bot-detector.git`
    
2. Install project dependencies
    `npm install`

3. Start MongoDB
    `mongod` or `sudo service mongod start`
  
4. Start the app
    `npm start`
    
