import vine from '@vinejs/vine'

export const createCourseGroupValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    capacity: vine.number().positive(),
  })
)
