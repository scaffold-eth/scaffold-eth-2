import React from "react";
import Head from "next/head";

interface MetaHeaderProps {
  title?: string;
  description?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterImage?: string;
}

export const MetaHeader = ({
  // default values are set in case user does not provide them as props when using MetaHeader component.
  title = "Scaffold-ETH 2 App",
  description = "Built with 🏗 scaffold-eth-2",
  ogImage = "thumbnail.png",
  twitterCard = "summary_large_image",
  twitterImage,
}: MetaHeaderProps) => {
  // Set default twitterImage if not provided, must be an absolute path to work properly on Twitter
  twitterImage =
    twitterImage || (typeof window !== "undefined" ? `${window.location.origin}/thumbnail.jpg` : undefined);

  return (
    <Head>
      {title ? <title>{title}</title> : null}
      {description && <meta name="description" content={description} />}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Head>
  );
};
