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

`node index.js word1 word2 ... word24 [workchain] [address]`

example:

```
node index.js tattoo during ... adjust
node index.js tattoo during ... adjust -1
node index.js tattoo during ... adjust 0
node index.js tattoo during ... adjust -1 EQBd-6iUaNY5VnHHYap5lZnzmpzG-UWwBafvIqQ7LQYc9eso
node index.js tattoo during ... adjust 0 EQBd-6iUaNY5VnHHYap5lZnzmpzG-UWwBafvIqQ7LQYc9eso
```

To print to screen rather than saving to files, use `-v` flag:

```
node index.js -v tattoo during ...
```
