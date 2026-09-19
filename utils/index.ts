export const isConnectionError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"status" in error &&
	((error as { status?: unknown }).status === "FETCH_ERROR" ||
		(error as { status?: unknown }).status === "TIMEOUT_ERROR");

export const uploadToCloudinary = async (file: File): Promise<string> => {
	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

	if (!cloudName || !uploadPreset) {
		throw new Error("Cloudinary environment variables missing.");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", uploadPreset);

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
		{
			method: "POST",
			body: formData,
		},
	);

	if (!res.ok) {
		throw new Error("Failed to upload image to Cloudinary.");
	}

	const data = await res.json();
	return data.secure_url;
};
