const Sequelize = require('sequelize');

module.exports = (db) => {
  return db.define('vote', {
    value: {
      type: Sequelize.INTEGER,
      validation: {
        min: -1,
        max: 1,
      },
    },
    owner: {
      type: Sequelize.STRING,
    },
    pollId: {
      type: Sequelize.UUID, // FK to Poll
    },
  }, {
    indexes: [{
      unique: true,
      fields: ['owner', 'pollId'], // unique together
    }],
  });
};
