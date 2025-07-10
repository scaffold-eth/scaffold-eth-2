import { deepMerge, stringify, withDefaults } from "../../../../utils.js";

const defaultMetadata = {
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2"
}

const contents = ({ preContent, metadataOverrides, htmlClassNames }) => {
  const finalMetadata = deepMerge(defaultMetadata, metadataOverrides[0] || {});

  return `
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
${preContent[0] || ''}

export const metadata = getMetadata(${stringify(finalMetadata)});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning ${htmlClassNames ? `className={\`${htmlClassNames}\`}` : ''}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;`;
};

export default withDefaults(contents, {
  preContent: "",
  metadataOverrides: {},
  htmlClassNames: ""
});
