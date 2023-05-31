import React from "react";
import Head from "next/head";

interface MetaHeaderProps {
  title?: string;
  description?: string;
  image?: string;
  twitterCard?: string;
}

export const MetaHeader = ({
  // default values are set in case user does not provide them as props when using MetaHeader component.
  title = "Scaffold-ETH 2 App",
  description = "Built with 🏗 scaffold-eth-2",
  image = "thumbnail.png",
  twitterCard = "summary_large_image",
}: MetaHeaderProps) => {
  // Build the absolute path for the image, must be an absolute path to work properly on Twitter and OG
  const absoluteImagePath = typeof window !== "undefined" ? `${window.location.origin}/${image}` : undefined;

  return (
    <Head>
      {title ? <title>{title}</title> : null}
      {description && <meta name="description" content={description} />}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {absoluteImagePath && <meta property="og:image" content={image} />}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {absoluteImagePath && <meta name="twitter:image" content={absoluteImagePath} />}
    </Head>
  );
};
