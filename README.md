# Voter

Conduct anonymous polls in realtime!


## Installation and setup

### Dependencies
- Node > 6.0.0
- [Redis](https://redis.io) (session persistence)

### Configure Google Auth
Voting's anonymous, but we need to prevent double-votes, so we require users to login with Google Oauth2. Auth is done with [Passport](https://passportjs.org) so you could easily switch Google for another strategy, but if you want to stick with it, you'll need to [Configure a Google app for OAuth](https://developers.google.com/identity/protocols/OAuth2).

### Set up a DB (optional)
The app uses [Sequelize](https://sequelizejs.com) as an ORM, and by default uses sqlite and stores the db in `voter.sqlite` in the root folder. It's pretty easy to switch it out for mySQL or PostgreSQL.

### Install
Clone the repo, install and go.

```
npm install
cp config.js.example config.js
# make your changes to config.js
npm run start
```


## Issues, known problems

The npm `sqlite3` package seems to randomly break and I have NFI why. Occasionally you can fix it by running `npm rebuild`. If anybody knows why I'd love to hear it.
