import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../services/firebase';

export async function uploadPdf(numAviso: string, blob: Blob): Promise<string> {
  const filePath = `/pdfs/${numAviso}.pdf`;
  const storageRef = ref(storage, filePath);
  const task = uploadBytesResumable(storageRef, blob);
  await task;
  return getDownloadURL(storageRef);
}

export async function deletePdf(numAviso: string) {
  const filePath = `/pdfs/${numAviso}.pdf`;
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
  } catch {
    // File may not exist
  }
}
