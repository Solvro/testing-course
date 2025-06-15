/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const StudentsController = () => import('#controllers/students_controller')
const CourseGroupsController = () => import('#controllers/course_groups_controller')
const RegistrationsController = () => import('#controllers/registrations_controller')

router.group(() => {
  router.resource('students', StudentsController)
    .only(['index', 'show', 'store', 'destroy'])

  router.resource('course-groups', CourseGroupsController)
    .only(['index', 'show', 'store', 'destroy'])

  router.resource('registrations', RegistrationsController)
    .only(['index', 'show', 'store', 'destroy'])
}).prefix('/api/v1')
