export const getMetaData = ({ title, description }: { title: string; description: string }) => {
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
    },
    twitter: {
      title: title,
      description: description,
    },
  };
};
