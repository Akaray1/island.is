'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          'program_extra_application_field',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
            },
            program_id: {
              type: Sequelize.UUID,
              references: {
                model: 'program',
                key: 'id',
              },
              allowNull: false,
            },
            field_type: {
              type: Sequelize.ENUM('UPLOAD', 'CHECKBOX', 'TEXT_INPUT', 'TEXT_AREA'),
              allowNull: false,
            },
            name_is: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            name_en: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            description_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            description_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            required: {
              type: Sequelize.BOOLEAN,
              allowNull: true,
            },
            upload_accepted_file_type: {
              type: Sequelize.STRING,
              allowNull: true,
            },
          },
          { transaction: t },
        ),
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable('program_extra_application_field', {
          transaction: t,
        }),
      ])
    })
  },
}
