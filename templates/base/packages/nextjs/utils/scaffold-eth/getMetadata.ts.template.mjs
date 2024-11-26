import { withDefaults } from '../../../../../utils.js'

const contents = ({ titleTemplate, thumbnailPath }) =>
`import type { Metadata } from "next";

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? \`https://\${process.env.VERCEL_PROJECT_PRODUCTION_URL}\`
  : \`http://localhost:\${process.env.PORT || 3000}\`;
const titleTemplate = "${titleTemplate}";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "${thumbnailPath}",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = \`\${baseUrl}\${imageRelativePath}\`;

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
`

export default withDefaults(contents, {
  titleTemplate: "%s | Scaffold-ETH 2",
  thumbnailPath: "/thumbnail.jpg",
})
