import type { Metadata } from "next";

const productionUrl = (process.env.NEXT_PUBLIC_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL)
  ?.trim()
  .replace(/\/+$/, "");
const baseUrl = !productionUrl
  ? `http://localhost:${process.env.PORT || 3000}`
  : /^https?:\/\//i.test(productionUrl)
    ? productionUrl
    : `https://${productionUrl}`;
const titleTemplate = "%s | Scaffold-ETH 2";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
    },
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    },
  };
};
