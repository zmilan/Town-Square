⛲ Town Square
========

[![npm](https://img.shields.io/npm/v/town-square.svg)](https://www.npmjs.com/package/town-square)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/WillWhiteneck/Town-Square)

#### A fully decentralized discussion platform built with Ethereum and IPFS  ####

The aim of the project is to provide an embeddable discussion platform that's owned by everybody.

* An Ethereum smart contract is used to keep track of the comments and verify identities.

* IPFS is used to store the content of the comments.

Town Square is a project for the community. There is no token. The only costs are gas fees to the Ethereum network. 

Town Square exists amorphously. It doesn't have a central homepage. It is built to be embedded. Each Town Square has all of the necessary tools to make more Town Squares.

### Live Demos ###
* [Blog Demo](https://dino-blog.neocities.org/)
* [Reddit Demo](https://gateway.ipfs.io/ipfs/QmYkt7vDgSQaKKzzZZcJfsYVQas4oVxnJ6gDuSKNQYQiVr/#/thread/4)


### Start a new Thread ###
Click on "🌳 Start a new thread" in the footer of [any Town Square](https://gateway.ipfs.io/ipfs/QmbeWHQan8JcL8Qbsix8q3ZzgvrVZFL1rpedURJVooHGLq/#/thread/1) to make your own thread. 

![🌳 Start a new thread](https://i.imgur.com/GY5pScm.png)

Once you click "submit" you'll get a unique thread id. Use the following snippet to embed Town Square on your site. 

```html
<!-- the container div -->
<div id="town-square"></div>
<!-- include the css file somewhere in your source code -->
<link href="https://gitcdn.xyz/repo/WillWhiteneck/Town-Square/master/dist/town-square.css" rel="stylesheet">
<!-- include the script file, this needs to be below the div -->
<script
  src="https://gitcdn.xyz/repo/WillWhiteneck/Town-Square/master/dist/town-square.js"
  data-thread-id="<YOUR_THREAD_ID>">
</script>
```

If you'd rather not use a cdn, you can install Town Square with npm:
```
npm install town-square
```
Then reference the sources in node_modules
```html
<div id="town-square"></div>
<link href="./node_modules/town-square/dist/town-square.css" rel="stylesheet">
<script
  src="./node_modules/town-square/dist/town-square.js"
  data-thread-id="<YOUR_THREAD_ID>">
</script>
```

#### Advanced Usage ####

Customize Town Square to suit your needs.

```html
<script
  src="https://gitcdn.xyz/repo/WillWhiteneck/Town-Square/master/dist/town-square.js"* data-container-id="town-square"
  data-depth-limit="Infinity"
  data-editor-placeholder-reply="What are your thoughts?"
  data-editor-placeholder-top="What are your thoughts?"
  data-ethereum-url="https://mainnet.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51"
  data-ipfs-hash="QmbeWHQan8JcL8Qbsix8q3ZzgvrVZFL1rpedURJVooHGLq"
  data-ipfs-url="https://ipfs.infura.io:5001"
  data-max-text-bytes="100000"
  data-thread-id="2"></script>
```

* data-container-id - references the id of the town-square container. If you want to use multiple embedded threads you will need to use a new script tag for each thread. (default: 'town-square')
* data-depth-limit - How deep comments can recurse before a new page is started. This should usually be 'Infinity' since the address bar will be modified otherwise. (default for embedded script: 'Infinity', default for standalone: 1)
* data-editor-placeholder-reply - The placeholder text in the comment reply editor. (default: 'What are your thoughts?')
* data-editor-placeholder-top - The placeholder text in the thread reply editor. (default: 'What are your thoughts?')
* data-ethereum-url - The default ethereum node URL. This gets overriden if the user has MetaMask. (default: https://mainnet.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51)
* data-ipfs-hash - The IPFS hash for the standalone Town Square reader. (default: <most_recent_release>)
* data-ipfs-url - The default ipfs gateway URL. the gateway must have no CORS restrictions and ideally will be nice enough to pin the incoming content. (default: https://ipfs.infura.io:5001)
* data-max-text-bytes - The maximum file size (in bytes) that Town Square will pull from IPFS. Somebody chould potentially cause problems if they upload a massive file as the comment content. Make sure this field is set small enough to prevent problems like that. (default: 100000 /* 100 kB */) x
* data-thread-id - The id of your thread. Make sure you set this if you are embedding Town Square on your website. (default: 0)

### Development ###
Contributions are welcome. There is a lot of room for improvement, for example:
- [ ] Display a person's comment history
- [ ] Configurable css themes
- [ ] Use an Ethereum identity service to optionally show names instead of addresses.
- [ ] Bug fixes

#### Quickstart ####
Clone the repo
```
git clone https://github.com/WillWhiteneck/Town-Square.git
cd town-square
```

Run the app in development mode:
```
npm run dev
```
Note: development mode will automatically use the 'Rinkeby' network.

After you've made changes compile the files in the 'dist' folder:
```
npm run build
```