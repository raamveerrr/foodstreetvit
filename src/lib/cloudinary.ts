/**
 * Cloudinary delivery + unsigned upload.
 *
 * Only the cloud name and a folder-restricted unsigned preset live in the
 * browser — never an API key or secret. Signed uploads and asset deletion are
 * performed by Cloud Functions (see functions/src/cloudinary.ts).
 */

export const CLOUDINARY_CLOUD_NAME = "b3k1ibns";
export const CLOUDINARY_UPLOAD_PRESET = "digitalfoodstreet_images";

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const DELIVERY_PREFIX = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
}

export const cloudinaryFolders = {
  shopLogo: (shopId: string) => `digitalfoodstreet/shops/${shopId}/logo`,
  shopCover: (shopId: string) => `digitalfoodstreet/shops/${shopId}/cover`,
  menuItem: (shopId: string, itemId: string) => `digitalfoodstreet/menu/${shopId}/${itemId}`,
  category: (shopId: string) => `digitalfoodstreet/categories/${shopId}`,
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Uploads one image through the restricted unsigned preset. */
export async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is too large. Please choose one under 8 MB.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  body.append("folder", folder);

  const res = await fetch(UPLOAD_URL, { method: "POST", body });
  if (!res.ok) throw new Error("We couldn't upload that image. Please try again.");

  const json = (await res.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    bytes?: number;
  };
  if (!json.secure_url || !json.public_id) {
    throw new Error("We couldn't upload that image. Please try again.");
  }

  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width ?? 0,
    height: json.height ?? 0,
    bytes: json.bytes ?? file.size,
  };
}

type Variant = "thumb" | "card" | "cover" | "hero" | "avatar";

/**
 * A deliberately small set of transformation variants — one per real display
 * size in the app. `f_auto,q_auto` lets Cloudinary pick AVIF/WebP and a quality
 * level per image, which turns a 3 MB upload into roughly 40–200 KB.
 */
const VARIANTS: Record<Variant, string> = {
  avatar: "f_auto,q_auto,c_fill,g_auto,w_96,h_96,dpr_2.0",
  thumb: "f_auto,q_auto,c_fill,g_auto,w_160,h_160,dpr_2.0",
  card: "f_auto,q_auto,c_fill,g_auto,w_320,h_240,dpr_2.0",
  cover: "f_auto,q_auto,c_fill,g_auto,w_480,h_270,dpr_2.0",
  hero: "f_auto,q_auto,c_fill,g_auto,w_720,h_405,dpr_2.0",
};

const isCloudinary = (url: string) => url.startsWith(DELIVERY_PREFIX);

/**
 * Returns an optimised CDN URL for a stored image.
 * Non-Cloudinary URLs (bundled demo assets) are returned untouched.
 */
export function cldUrl(url: string | null | undefined, variant: Variant = "card"): string {
  if (!url) return "";
  if (!isCloudinary(url)) return url;
  const rest = url.slice(DELIVERY_PREFIX.length);
  // Strip any transformation already present so variants never stack.
  const withoutTransform = /^v\d+\//.test(rest) ? rest : rest.replace(/^[^/]+\//, "");
  return `${DELIVERY_PREFIX}${VARIANTS[variant]}/${withoutTransform}`;
}

/** Builds a Cloudinary delivery URL straight from a stored public id. */
export const cldUrlFromPublicId = (publicId: string, variant: Variant = "card") =>
  `${DELIVERY_PREFIX}${VARIANTS[variant]}/${publicId}`;
