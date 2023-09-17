import { Metadata } from "next";

export function generateMetadata({ title, description }: { title: string; description: string }): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/` : "/";
  const image = "thumbnail.jpg";
  const imageUrl = baseUrl + image;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: "description",
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
      title: title,
      description: description,
    },
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    },
  };
}
