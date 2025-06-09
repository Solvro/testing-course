import vine from '@vinejs/vine'

export const createStudentValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    surname: vine.string().trim(),
    email: vine.string().email(),
    indexNumber: vine.string().trim().minLength(3),
  })
)
