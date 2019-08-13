'use strict';
module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'partner', 'partnerUser'),
        defaultValue: 'partner',
      },
      email: {
        type: DataTypes.STRING,
      },
      partnerId: {
        type: DataTypes.INTEGER,
      },
      partnerUserId: {
        type: DataTypes.UUID,
      },
      password: {
        type: DataTypes.STRING,
      },
      resetPasswordToken: DataTypes.STRING,
      resetPasswordExpires: DataTypes.DATE,
      quotaRequests: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5000,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  down: (queryInterface, DataTypes) => {
    return queryInterface.dropTable('users');
  },
};
('use strict');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('productFilters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      filterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'filtersType',
          key: 'id',
        },
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('productFilters');
  },
};
