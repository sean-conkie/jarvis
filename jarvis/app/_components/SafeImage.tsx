// components/SafeImage.tsx
import { allowedHosts } from "@/config/image";
import Image, { ImageProps } from "next/image";

const ALLOWED_HOSTS = allowedHosts.map((pattern) => pattern.hostname);
const placeholderImage = "/static/img/placeholder.jpg";

export default function SafeImage({ src, alt, ...props }: ImageProps) {
  let safeSrc = src as string;

  try {
    const url = new URL(safeSrc);
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      // Host not on allow-list → use placeholder
      console.warn(
        `Image source ${safeSrc} is not allowed. Falling back to placeholder image.`
      );
      safeSrc = placeholderImage;
    }
  } catch {
    // Invalid URL string → fallback to placeholder
    safeSrc = placeholderImage;
  }

  return <Image src={safeSrc} alt={alt || ""} {...props} />;
}