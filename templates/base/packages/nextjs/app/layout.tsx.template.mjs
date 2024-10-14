import { withDefaults } from "../../../../utils.js";

const contents = ({ imports, metadata }) => {
  return `
${imports.filter(Boolean).join("\n")}
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata(${JSON.stringify(metadata[0])});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
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
  imports: "",
  metadata: {
    title: "Scaffold-ETH 2 App",
    description: "Built with 🏗 Scaffold-ETH 2"
  }
});
