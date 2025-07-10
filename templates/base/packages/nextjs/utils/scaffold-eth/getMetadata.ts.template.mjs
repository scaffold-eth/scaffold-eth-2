import { deepMerge, stringify, withDefaults } from '../../../../../utils.js'

const defaultMetadata = {
  metadataBase: '$$new URL(baseUrl)$$',
  title: {
    default: '$$title$$',
    template: '$$titleTemplate$$',
  },
  description: '$$description$$',
  openGraph: {
    title: {
      default: '$$title$$',
      template: '$$titleTemplate$$',
    },
    description: '$$description$$',
    images: [
      {
        url: '$$imageUrl$$',
      },
    ],
  },
  twitter: {
    title: {
      default: '$$title$$',
      template: '$$titleTemplate$$',
    },
    description: '$$description$$',
    images: ['$$imageUrl$$'],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
}


const contents = ({ titleTemplate, thumbnailPath, preContent, metadataOverrides }) =>  {
  
  const finalMetadata = deepMerge(defaultMetadata, metadataOverrides[0] || {})
  
  return `
import type { Metadata } from "next";
${preContent[0] || ''}

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

  return ${stringify(finalMetadata)};
}`
}

export default withDefaults(contents, {
  metadataOverrides: {},
  titleTemplate: "%s | Scaffold-ETH 2",
  thumbnailPath: "/thumbnail.jpg",
  preContent: '',
})
