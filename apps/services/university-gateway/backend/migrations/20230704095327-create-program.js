'use strict'

//TODOx breyta textasvæðum þannig það leyfi meira en varchar(255)
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          'program',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4,
              allowNull: false,
            },
            external_id: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            active: {
              type: Sequelize.BOOLEAN,
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
            university_id: {
              type: Sequelize.UUID,
              references: {
                model: 'university',
                key: 'id',
              },
              allowNull: false,
            },
            department_name_is: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            department_name_en: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            starting_semester_year: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            starting_semester_season: {
              type: Sequelize.ENUM('FALL', 'SPRING', 'SUMMER'),
              allowNull: false,
            },
            application_start_date: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            application_end_date: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            degree_type: {
              type: Sequelize.ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL'),
              allowNull: false,
            },
            degree_abbreviation: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            credits: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            description_is: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            description_en: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            duration_in_years: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            cost_per_year: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            isced_code: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            search_keywords: {
              type: Sequelize.ARRAY(Sequelize.STRING),
              defaultValue: [],
              allowNull: false,
            },
            external_url_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            external_url_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            admission_requirements_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            admission_requirements_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            study_requirements_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            study_requirements_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            cost_information_is: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            cost_information_en: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            created: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            modified: {
              type: Sequelize.DATE,
              allowNull: false,
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
        queryInterface.dropTable('program', { transaction: t }),
      ])
    })
  },
}
