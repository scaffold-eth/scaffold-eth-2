import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Scaffod-eth App</title>
        <meta
          name="description"
          content="Created with 🏗 scaffold-eth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/scaffold-eth/scaffold-eth" target="_blank">scaffold-eth</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>packages/frontend/pages/index.tsx</code>
        </p>
      </main>
    </div>
  );
};

export default Home;
