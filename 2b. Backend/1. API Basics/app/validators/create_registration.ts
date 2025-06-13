import vine from '@vinejs/vine'

export const createRegistrationValidator = vine.compile(
  vine.object({
    studentId: vine.number().positive(),
    groupId: vine.number().positive(),
  })
)
