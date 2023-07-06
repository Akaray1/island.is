'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          'application',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
            },
            national_id: {
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
            program_id: {
              type: Sequelize.UUID,
              references: {
                model: 'program',
                key: 'id',
              },
              allowNull: false,
            },
            application_status: {
              type: Sequelize.ENUM(
                'IN_REVIEW',
                'IN_PROGRESS',
                'ACCEPTED_BY_UNIVERSITY',
                'ACCEPTED_BY_UNIVERSITY_AND_STUDENT',
                'REJECTED_BY_STUDENT_REASON_CANCELLED',
                'REJECTED_BY_STUDENT_REASON_OTHER_ACCEPTED',
                'REJECTED_BY_UNIVERSITY_REASON_INSUFFICIENT',
                'REJECTED_BY_UNIVERSITY_REASON_NO_AVAILABILITY',
                'CANCELLED_BY_STUDENT',
                'PAYMENT_COMPLETE'
              ),
              allowNull: false,
            },
            mode_of_delivery_id: {
              type: Sequelize.ENUM('ON_SITE', 'ONLINE', 'ONLINE_WITH_SESSION'),
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
        queryInterface.dropTable('application', { transaction: t }),
      ])
    })
  },
}
