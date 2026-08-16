import { ref, uploadBytes, getDownloadURL, type StorageReference } from 'firebase/storage'
import { getClientStorage } from './client'

export function teamPhotoRef(uid: string): StorageReference {
  return ref(getClientStorage(), `team-photos/${uid}`)
}

export async function uploadTeamPhoto(uid: string, file: File): Promise<string> {
  const storageRef = teamPhotoRef(uid)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
