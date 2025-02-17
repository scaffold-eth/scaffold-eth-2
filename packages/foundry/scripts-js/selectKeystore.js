import { readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function selectKeystore() {
  const keystorePath = join(process.env.HOME, '.foundry', 'keystores');
  
  try {
    // Get list of keystores
    const keystores = readdirSync(keystorePath);
    
    if (keystores.length === 0) {
      console.error('\n❌ No keystores found in ~/.foundry/keystores');
      process.exit(1);
    }

    // Display keystores with their associated addresses
    console.log('\n🔑 Available keystores:');
    const keystoreDetails = keystores.map((keystore, index) => {
      // Get address for each keystore using cast
      const result = spawnSync('cast', ['wallet', 'address', '--keystore', join(keystorePath, keystore)], {
        encoding: 'utf-8'
      });
      
      const address = result.stdout.trim();
      console.log(`${index + 1}. ${keystore} (${address})`);
      
      return { keystore, address };
    });

    // Prompt user for selection
    const answer = await new Promise(resolve => {
      rl.question('\nSelect a keystore (enter number): ', resolve);
    });

    const selection = parseInt(answer) - 1;

    if (isNaN(selection) || selection < 0 || selection >= keystores.length) {
      console.error('\n❌ Invalid selection');
      process.exit(1);
    }

    // Return selected keystore name
    return keystores[selection];

  } catch (error) {
    console.error('\n❌ Error reading keystores:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the selection if this script is called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  selectKeystore().then(keystore => {
    console.log(keystore); // Print selected keystore for capture by parent process
  });
}

export { selectKeystore };
