import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'registrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('student_id')
        .unsigned()
        .notNullable()
        .references('students.id')
        .onDelete('CASCADE')

      table
        .integer('group_id')
        .unsigned()
        .notNullable()
        .references('course_groups.id')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
