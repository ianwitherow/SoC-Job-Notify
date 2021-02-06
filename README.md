## State of Colorado Job Notifier
Get notified when a particular job position becomes available within the State of Colorado!  
I'm using HomeAssistant for notifications here, but feel free to fork and make it your own.


![Example](https://browskers.com/files/soc-notify-screenshot.png)

## Install
This project is written with NodeJS. To install, clone the repo then run `yarn` or `npm install`
Modify the variables at the top of app.js with your preferred values. You'll need to set `jobTitleRegex`, `jobListingUrl` and populate `homeAssistantSettings`. If you don't have a HomeAssistant server, you'll need another notification method. You could look into WhatsApp, Telegram, or even just send an email to your mobile number to receive a text message.

## Run the app
`node app.js`
This will check once every hour. You can change this in the setInterval call at the bottom of `app.js`.

Good luck!
