const Sequelize = require('sequelize');

const log = require('../lib/logger');

const db = new Sequelize({
  storage: 'voter.sqlite',
  dialect: 'sqlite',
  logging: log.debug,
});

db.authenticate().then(() => {
  log.info('db connection opened');
}).catch(err => {
  log.error('unable to connect to db');
  log.error(err);
});


const Poll = require('./models/poll')(db);
const Vote = require('./models/vote')(db);

db.models = {
  Poll,
  Vote,
};

db.models.Vote.belongsTo(db.models.Poll);
db.models.Poll.hasMany(db.models.Vote);

Object.keys(db.models).forEach(key => {
  const model = db.models[key];
  model.sync().then(() => {
    log.debug(`model ${key} synced`);
  });
});

module.exports = db;
