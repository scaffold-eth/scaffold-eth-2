import React from "react";
// import Head from "next/head";
import { Metadata } from "next";

type MetaHeaderProps = {
  title?: string;
  description?: string;
  image?: string;
  twitterCard?: string;
  children?: React.ReactNode;
};
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/` : "/";

const image='thumbnail.jpg'
const imageUrl = baseUrl + image;
export const metadata:Metadata = {

   
  title: 'Scaffold-ETH 2 App',
  description: 'Built with 🏗 Scaffold-ETH 2',
  openGraph: {
    title:"Scaffold-ETH 2 App",
    description: 'Built with 🏗 Scaffold-ETH 2',
    images: [
      {
        url: imageUrl,
      },
    ],

  },
  twitter: {
    card: 'summary_large_image',
    images: [imageUrl],
    title: 'Scaffold-ETH 2 App',
    description: 'Built with 🏗 Scaffold-ETH 2',
  },
 
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
  },

}

// Images must have an absolute path to work properly on Twitter.
// We try to get it dynamically from Vercel, but we default to relative path.

export const MetaHeader = ({
  title = "Scaffold-ETH 2 App",
  description = "Built with 🏗 Scaffold-ETH 2",
  image = "thumbnail.jpg",
  twitterCard = "summary_large_image",
  children,
}: MetaHeaderProps) => {


  return (
    
    <>
      {/* {title && (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta name="twitter:title" content={title} />
        </>
      )}
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
      {image && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta name="twitter:image" content={imageUrl} />
        </>
      )}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      {children} */}
    </>
  );
};
