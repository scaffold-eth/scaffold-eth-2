import type { Metadata } from "next";

const productionHost = (
  process.env.NEXT_PUBLIC_PRODUCTION_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL
)?.replace(/^https?:\/\//i, "");
const baseUrl = productionHost ? `https://${productionHost}` : `http://localhost:${process.env.PORT || 3000}`;
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
          url: imageRelativePath,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageRelativePath],
    },
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    },
  };
};
