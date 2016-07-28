const Sequelize = require('sequelize');
const uuid = require('uuid');

module.exports = (db) => (
  db.define('poll', {
    title: Sequelize.TEXT,
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuid.v4(),
    },
    owner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hidden: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  })
);
