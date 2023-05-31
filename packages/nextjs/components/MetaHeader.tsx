import React from "react";
import Head from "next/head";

interface MetaHeaderProps {
  title?: string;
  description?: string;
  favicon?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const MetaHeader: React.FC<MetaHeaderProps> = ({
  title,
  description,
  favicon,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
}) => {
  return (
    <Head>
      {title ? <title>{title}</title> : null}
      {description && <meta name="description" content={description} />}
      {favicon && <link rel="icon" type="image/png" sizes="32x32" href={favicon} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Head>
  );
};

export default MetaHeader;
