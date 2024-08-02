const TonWeb = require("tonweb");
const mnemonic = require("tonweb-mnemonic");
const fs = require("fs");
const ton = require('@ton/ton');

const {
    WalletContractV4,
    WalletContractV3R2
} = ton;

const len = process.argv.length;
const isVerbose = process.argv[2] === '-v';
const offset = 2 + (isVerbose ? 1 : 0);

if (len !== offset + 24 && len !== offset + 25 && len !== offset + 26) {
    console.error('Usage: node index.js word1 word2 ... word24 [workchain] [address]');
    return;
}

const words = process.argv.slice(offset, offset + 24);
let workchainValue, addressString;
if (process.argv.length > offset + 25) {
  workchainValue = parseInt(process.argv[offset + 24]) ?? -1;
  addressString = process.argv[offset + 25];

  if (isVerbose) {
    console.log("Use provided workchain and address")
  }
} else if (process.argv.length > offset + 24) {
  workchainValue = parseInt(process.argv[offset + 24]) ?? -1;

  if (isVerbose) {
    console.log("Use provided workchain and generated address")
  }
} else {
  workchainValue = -1;

  if (isVerbose) {
    console.log("Use default workchain value of -1 and generated address")
  }
}

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

const init = async () => {
    if (!(await mnemonic.validateMnemonic(words))) {
        console.error('invalid mnemonic')
        return;
    }

    const seed = await mnemonic.mnemonicToSeed(words);
    const keyPair = await mnemonic.mnemonicToKeyPair(words);
    pubKey = toHexString(keyPair.publicKey);
    privKey = toHexString(keyPair.secretKey);

    // const contract = WalletContractV4.create({
    const contract = WalletContractV3R2.create({
        workchain: workchainValue,
        publicKey: Buffer.from(pubKey, 'hex') // Convert the public key to a Buffer
    });

    const friendlyEqAddress = contract.address.toString();
    const friendlyUqAddress = contract.address.toString({
        // set this to `true` if testnet
        testOnly: false,
        bounceable: false
    });
    const rawAddress = contract.address.toRawString();
    const hashAddress = contract.address.hash.toString('hex');

    if (!addressString) {
        addressString = rawAddress;
    }

    if (isVerbose) {
        console.log('HEX: ' + TonWeb.utils.bytesToHex(seed));
        console.log('base64: ' + TonWeb.utils.bytesToBase64(seed));
        console.log(`Mnemonics: ${words.join(' ')}`);
        console.log(`Key Pair: {
            publicKey: ${pubKey},
            secretKey: ${privKey}
        }`);
        console.log(`workchainValue: ${workchainValue}`)
        console.log(`v3R2 wallet bouncable address: ${friendlyEqAddress}`);
        console.log(`v3R2 wallet unbouncable address: ${friendlyUqAddress}`);
        console.log(`v3R2 wallet Address Raw: ${rawAddress}`);
        console.log(`v3R2 wallet Address hash: ${hashAddress}`); // this is just `rawAddress` without "<workchain>:" prepended
        console.log('v3R2 wallet ID:', contract.walletId);
        console.log('v3R2 wallet workchain:', contract.workchain);
        console.log('addressString: ' + addressString);
    } else {
        fs.writeFileSync('wallet.pk', seed);
        fs.writeFileSync('wallet.pk.b64', Buffer.from(seed).toString('base64'));

        const address = new TonWeb.utils.Address(addressString);
        const addressBytes = new Uint8Array( 32 + 4);
        addressBytes.set(address.hashPart, 0);
        for (let i = 32; i < 32 + 4; i++) {
            addressBytes[i] = address.wc === -1 ? 0xff : 0x00;
        }
        fs.writeFileSync('wallet.addr', addressBytes);
        fs.writeFileSync('wallet.addr.b64', Buffer.from(addressBytes).toString('base64'));
    }
}

init();
