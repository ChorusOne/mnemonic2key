const TonWeb = require("tonweb");
const mnemonic = require("tonweb-mnemonic");
const fs = require("fs");
const ton = require('@ton/ton');
const { mnemonicNew } = require('@ton/crypto');

const { WalletContractV5R1, WalletContractV4, WalletContractV3R2 } = ton;

// Function to display help message
const displayHelp = () => {
    console.log(`
Usage: node index.js [OPTIONS]

Options:
  -h              Display this help message
  -m "WORDS"      Provide a 24-word mnemonic phrase (in quotes)
  -w VALUE        Set the workchain value (0 or -1, default is -1)
  -a ADDRESS      Specify an address

If -m is not provided, a new mnemonic will be generated automatically.

Examples:
  node index.js -h
  node index.js -m "word1 word2 ... word24" -w 0 -a "some_address_here"
  node index.js -w 0
  node index.js
    `);
    process.exit(0);
};

// Check for help flag
if (process.argv.includes('-h')) {
    displayHelp();
}

// Default values
let words = [];
let workchainValue = -1;
let addressString = '';

// Parse command-line arguments
for (let i = 2; i < process.argv.length; i += 2) {
    const flag = process.argv[i];
    const value = process.argv[i + 1];

    if (flag === '-h') continue; // Skip, as it's handled above

    if (!value && flag !== '-h') {
        console.error(`Missing value for argument ${flag}`);
        displayHelp();
    }

    switch (flag) {
        case '-m':
            words = value.split(' ');
            break;
        case '-w':
            const parsedWorkchain = parseInt(value);
            if (parsedWorkchain !== 0 && parsedWorkchain !== -1) {
                console.error('Invalid workchain value. Must be either 0 or -1.');
                displayHelp();
            }
            workchainValue = parsedWorkchain;
            break;
        case '-a':
            addressString = value;
            break;
        default:
            console.error(`Unknown argument: ${flag}`);
            displayHelp();
    }
}

const toHexString = (byteArray) => Array.from(byteArray, byte => `0${(byte & 0xFF).toString(16)}`.slice(-2)).join('');

const createAndOutputWallet = async (ContractType, keyPair, workchainValue, addressString) => {
    const contract = ContractType.create({
        workchain: workchainValue,
        publicKey: Buffer.from(keyPair.publicKey) // Convert the public key to a Buffer
    });

    const address = contract.address;
    const friendlyAddress = address.toString({urlSafe: true, bounceable: true, testOnly: false}); // set this to `true` if testnet
    const friendlyAddressNonBounceable = address.toString({urlSafe: true, bounceable: false, testOnly: false});
    const rawAddress = address.toRawString();
    const hashAddress = address.hash.toString('hex'); // this is just `rawAddress` without "<workchain>:" prepended

    if (!addressString) {
        addressString = rawAddress;
    }

    console.log(`
${ContractType.name} Wallet:
Bounceable address: ${friendlyAddress}
Non-bounceable address: ${friendlyAddressNonBounceable}
Raw address: ${rawAddress}
Hash address: ${hashAddress}
Wallet ID: ${contract.walletId}
Workchain: ${contract.workchain}
AddressString: ${addressString}
    `);

    const tonWebAddress = new TonWeb.utils.Address(addressString);
    const addressBytes = new Uint8Array(36);
    addressBytes.set(tonWebAddress.hashPart, 0);
    for (let i = 32; i < 36; i++) {
        addressBytes[i] = tonWebAddress.wc === -1 ? 0xff : 0x00;
    }

    fs.writeFileSync(`${ContractType.name}.addr`, addressBytes);
    fs.writeFileSync(`${ContractType.name}.addr.b64`, Buffer.from(addressBytes).toString('base64'));
};

const init = async () => {
    if (words.length === 0) {
        console.log('No mnemonic provided. Generating a new one...');
        words = await mnemonicNew(24);
        console.log('Generated mnemonic:', words.join(' '));
    }

    if (!(await mnemonic.validateMnemonic(words))) {
        console.error('Invalid mnemonic but proceeding anyway!!!');
        // process.exit(1);
    } else {
        console.log("Valid TON mnemonic!!!")
    }

    const seed = await mnemonic.mnemonicToSeed(words);
    const keyPair = await mnemonic.mnemonicToKeyPair(words);
    const { publicKey, secretKey } = keyPair;

    console.log(`
HEX: ${TonWeb.utils.bytesToHex(seed)}
Base64: ${TonWeb.utils.bytesToBase64(seed)}
Mnemonics: ${words.join(' ')}
Key Pair:
  publicKey: ${toHexString(publicKey)}
  secretKey: ${toHexString(secretKey)}
Workchain Value: ${workchainValue}
    `);

    fs.writeFileSync('wallet.pk', seed);
    fs.writeFileSync('wallet.pk.b64', Buffer.from(seed).toString('base64'));

    for (const ContractType of [WalletContractV3R2, WalletContractV4, WalletContractV5R1]) {
        await createAndOutputWallet(ContractType, keyPair, workchainValue, addressString);
    }
};

init().catch(console.error);
