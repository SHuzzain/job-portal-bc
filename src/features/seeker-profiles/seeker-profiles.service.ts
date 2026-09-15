import * as seekerProfilesRepository from "./seeker-profiles.repository.ts";

export class SeekerProfileError extends Error {
  constructor(
    public status: 400 | 404,
    message: string
  ) {
    super(message);
    this.name = "SeekerProfileError";
  }
}

type ProfileRow = NonNullable<
  Awaited<ReturnType<typeof seekerProfilesRepository.findByUserId>>
>;

export function isProfileComplete(row: ProfileRow) {
  return Boolean(
    row.displayName &&
    row.icNumber &&
    row.dateOfBirth &&
    row.gender &&
    row.city &&
    row.highestEducation &&
    row.fieldOfStudy &&
    row.yearsOfExperience !== null &&
    row.skills &&
    row.preferredLocation &&
    row.preferredEmploymentType
  );
}

export function isWorkEligible(row: ProfileRow) {
  return row.isMalaysian || row.hasWorkPermit;
}

function toProfile(row: ProfileRow) {
  return {
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    icNumber: row.icNumber,
    dateOfBirth: row.dateOfBirth,
    gender: row.gender,
    city: row.city,
    highestEducation: row.highestEducation,
    fieldOfStudy: row.fieldOfStudy,
    yearsOfExperience: row.yearsOfExperience,
    skills: row.skills,
    preferredLocation: row.preferredLocation,
    preferredEmploymentType: row.preferredEmploymentType,
    isMalaysian: row.isMalaysian,
    hasWorkPermit: row.hasWorkPermit,
    complete: isProfileComplete(row),
  };
}

export async function getOrCreateMine(userId: string) {
  const existing = await seekerProfilesRepository.findByUserId(userId);
  if (existing) {
    return toProfile(existing);
  }

  const created = await seekerProfilesRepository.insertProfile(userId);
  if (!created) {
    throw new SeekerProfileError(400, "Could not create profile");
  }
  return toProfile(created);
}

export async function updateMine(
  userId: string,
  data: seekerProfilesRepository.UpdateSeekerProfileRecord
) {
  await getOrCreateMine(userId);
  const row = await seekerProfilesRepository.updateByUserId(userId, data);
  if (!row) {
    throw new SeekerProfileError(404, "Profile not found");
  }
  return toProfile(row);
}

export async function getRawMine(userId: string) {
  const existing = await seekerProfilesRepository.findByUserId(userId);
  if (!existing) {
    const created = await seekerProfilesRepository.insertProfile(userId);
    if (!created) {
      throw new SeekerProfileError(400, "Could not create profile");
    }
    return created;
  }
  return existing;
}
