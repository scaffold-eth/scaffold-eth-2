import { readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync, spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function selectKeystore() {
  const keystorePath = join(process.env.HOME, '.foundry', 'keystores');
  
  try {
    const keystores = readdirSync(keystorePath).filter(keystore => keystore !== 'scaffold-eth-default');
    
    if (keystores.length === 0) {
      console.error('\n❌ No keystores found in ~/.foundry/keystores');
      process.exit(1);
    }

    console.log('\n🔑 Available keystores:');
    console.log('0. Create new keystore');
    
    keystores.map((keystore, index) => {
      console.log(`${index + 1}. ${keystore}`);
      
      return { keystore };
    });

    const answer = await new Promise(resolve => {
      rl.question('\nSelect a keystore or create new (enter number): ', resolve);
    });

    const selection = parseInt(answer);

    if (selection === 0) {
      const newWalletResult = spawnSync('cast', ['wallet', 'new'], {
        encoding: 'utf-8'
      });

      if (newWalletResult.error || newWalletResult.status !== 0) {
        console.error('\n❌ Error generating new wallet:', newWalletResult.stderr || newWalletResult.error);
        process.exit(1);
      }

      const privateKey = newWalletResult.stdout
        .split('\n')
        .find(line => line.includes('Private key:'))
        ?.split(':')[1]
        ?.trim();

      if (!privateKey) {
        console.error('\n❌ Could not extract private key from output');
        process.exit(1);
      }

      const keystoreName = await new Promise(resolve => {
        rl.question('\nEnter name for new keystore: ', resolve);
      });

      return new Promise((resolve, reject) => {
        const importProcess = spawn('cast', ['wallet', 'import', keystoreName, '--private-key', privateKey], {
          stdio: 'inherit'
        });

        importProcess.on('close', (code) => {
          if (code === 0) {
            console.log('\n✅ New keystore created successfully!');
            console.log('\n🔑 Created new keystore:', keystoreName);
            console.log('\n💻 Please re-run the script to select the keystore!');
            process.exit(0);
          } else {
            console.error('\n❌ Error importing keystore');
            reject(new Error('Import failed'));
          }
        });
      });
    }

    if (isNaN(selection) || selection < 1 || selection > keystores.length) {
      console.error('\n❌ Invalid selection');
      process.exit(1);
    }

    const selectedKeystore = keystores[selection - 1];
    
    return selectedKeystore;

  } catch (error) {
    console.error('\n❌ Error reading keystores:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the selection if this script is called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  selectKeystore()
    .then(keystore => {
      console.log('\n🔑 Selected keystore:', keystore);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { selectKeystore };
