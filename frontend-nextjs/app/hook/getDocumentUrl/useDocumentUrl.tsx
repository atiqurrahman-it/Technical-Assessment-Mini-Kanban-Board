// import { useAuth } from "@/hook/useContext"; // adjust path
// import axios from "axios";
// import { useEffect, useState } from "react";

// export const useDocumentUrl = (photoJson: string | null | undefined) => {
//   const [blobUrl, setBlobUrl] = useState<string | undefined>();
//   const { accessToken } = useAuth();

//   useEffect(() => {
//     if (!photoJson || !accessToken) return;

//     // Parse the JSON to get the path
//     let path: string | null = null;
//     try {
//       const parsed = JSON.parse(photoJson);
//       path = parsed.path;
//     } catch {
//       // If it's not JSON, assume it's already a path
//       path = photoJson;
//     }

//     if (!path) return;

//     // Remove leading slash if present (your base URL might already have it)
//     const cleanPath = path.startsWith("/") ? path.slice(1) : path;
//     const url = `${process.env.NEXT_PUBLIC_API_URL}student-portal/${cleanPath}`;

//     const fetchImage = async () => {
//       try {
//         const response = await axios.get(url, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//           responseType: "blob",
//         });
//         const objectUrl = URL.createObjectURL(response.data);
//         setBlobUrl(objectUrl);
//       } catch (error) {
//         console.error("Failed to load image:", error);
//         setBlobUrl(undefined);
//       }
//     };

//     fetchImage();

//     // Cleanup: revoke blob URL when component unmounts or dependencies change
//     return () => {
//       if (blobUrl) URL.revokeObjectURL(blobUrl);
//     };
//   }, [photoJson, accessToken]); // Re-run if photoJson or token changes

//   return blobUrl;
// };
