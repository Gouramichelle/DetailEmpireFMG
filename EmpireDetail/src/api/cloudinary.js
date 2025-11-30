// src/api/cloudinary.js

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn("⚠️ Falta configurar VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET");
}

export async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);              // clave obligatoria: "file" :contentReference[oaicite:3]{index=3}
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Error subiendo a Cloudinary", await res.text());
    throw new Error("Error al subir imagen");
  }

  const data = await res.json();
  // data.secure_url contiene la URL pública segura de la imagen :contentReference[oaicite:4]{index=4}
  return data.secure_url;
}
