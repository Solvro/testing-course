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

router.post('/api/v1/students', [StudentsController, 'store'])
router.get('/api/v1/students', [StudentsController, 'index'])
router.get('/api/v1/students/:id', [StudentsController, 'show'])
router.delete('/api/v1/students/:id', [StudentsController, 'destroy'])

router.post('/api/v1/course-groups', [CourseGroupsController, 'store'])
router.get('/api/v1/course-groups', [CourseGroupsController, 'index'])
router.get('/api/v1/course-groups/:id', [CourseGroupsController, 'show'])
router.delete('/api/v1/course-groups/:id', [CourseGroupsController, 'destroy'])

router.post('/api/v1/registrations', [RegistrationsController, 'store'])
router.get('/api/v1/registrations', [RegistrationsController, 'index'])
router.get('/api/v1/registrations/:id', [RegistrationsController, 'show'])
router.delete('/api/v1/registrations/:id', [RegistrationsController, 'destroy'])

