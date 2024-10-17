# mnemonic2key

Simple CLI utility to convert TON mnemonic words to private key

# Install

Install NodeJS 16 and NPM

then

```
git clone https://github.com/ton-blockchain/mnemonic2key.git

cd mnemonic2key

npm install
```

# Usage

```
$ node index.js -h

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
```

The address can be in one of these forms:
- bouncable

  e.g. `Ef91wPRo1YEwUwz5SA9MdV-RvSDK_qcXYMQI366mrmPPtRlJ`

- unbouncable

  e.g. `Uf91wPRo1YEwUwz5SA9MdV-RvSDK_qcXYMQI366mrmPPtUSM`

- raw, i.e. `1byte tag + 1byte workchain + 32 bytes hash + 2 byte crc`

  e.g. `-1:75c0f468d58130530cf9480f4c755f91bd20cafea71760c408dfaea6ae63cfb5`

