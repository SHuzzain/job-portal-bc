import * as usersRepository from "./users.repository.ts"

export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string | null },
) {
  const existing = await usersRepository.findUserById(userId)
  if (!existing) {
    return null
  }

  return usersRepository.updateUserById(userId, data)
}

export async function updatePhone(userId: string, phoneNumber: string) {
  const existing = await usersRepository.findUserById(userId)
  if (!existing) {
    return null
  }

  return usersRepository.updateUserById(userId, { phoneNumber })
}
