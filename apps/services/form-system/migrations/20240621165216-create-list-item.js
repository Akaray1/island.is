'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) =>
      queryInterface.createTable(
        'list_items',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
          },
          created: {
            type: 'TIMESTAMP WITH TIME ZONE',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
          modified: {
            type: 'TIMESTAMP WITH TIME ZONE',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
          label: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          description: {
            type: Sequelize.JSON,
            allowNull: true,
          },
          value: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: '',
          },
          is_selected: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          display_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          input_settings_id: {
            type: Sequelize.UUID,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
              model: 'input_settings',
              key: 'id',
            },
          },
        },
        { transaction: t },
      ),
    )
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) =>
      queryInterface.dropTable('list_items', { transaction: t }),
    )
  },
}
