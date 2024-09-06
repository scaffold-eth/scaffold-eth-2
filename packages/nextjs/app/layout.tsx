import "@rainbow-me/rainbowkit/styles.css";
import { Sora } from 'next/font/google'
import { ScaffoldEthAppWithProviders } from '~~/components/ScaffoldEthAppWithProviders'
import { ThemeProvider } from '~~/components/ThemeProvider'
import '~~/styles/globals.css'
import { getMetadata } from '~~/utils/scaffold-eth/getMetadata'

const sora = Sora({
  subsets: ['latin'],
})

export const metadata = getMetadata({
  title: 'Worldwork',
  description: 'Welcome to Worldwork platform',
})

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={sora.className}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default ScaffoldEthApp
