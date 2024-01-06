import { ref, uploadBytes } from "firebase/storage";
import storage from "./firebaseConfig.js";
import generateUniqueFileName from "./generateUniqueImageFileName.js";

async function uploadFile(file) {
  const storageRef = ref(storage, generateUniqueFileName(file));
  const metadata = {
    contentType: "image/jpeg",
  };
  const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
  const url = `https://firebasestorage.googleapis.com/v0/b/${
    snapshot.ref.bucket
  }/o/${encodeURIComponent(snapshot.ref.fullPath)}?alt=media`;

  return {
    url,
    filename: snapshot.ref.fullPath,
  };
}

export default uploadFile;
