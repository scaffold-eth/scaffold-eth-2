export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/` : "/";
  const imageUrl = `${baseUrl}${imageRelativePath}`;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
};
