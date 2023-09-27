export const getMetaData = ({ title, description }: { title: string; description: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/` : "/";
  const imageUrl = `${baseUrl}/thumbnail.jpg`;
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
