import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { Unbounded } from "next/font/google";

export const metadata = getMetadata({
  title: "Scaffold-DOT App",
  description: "Built with 🏗 Scaffold-DOT",
});

const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unbounded',
  weight: [
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900'
  ]
})

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={unbounded.className}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
