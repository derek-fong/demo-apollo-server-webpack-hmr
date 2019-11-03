# How to build an Apollo GraphQL server with TypeScript and Webpack Hot Module Replacement

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/derek-fong/demo-apollo-server-webpack-hmr/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> Reference repository for Medium story "*[How to build an Apollo GraphQL server with TypeScript and Webpack Hot Module Replacement](https://medium.com/free-code-camp/build-an-apollo-graphql-server-with-typescript-and-webpack-hot-module-replacement-hmr-3c339d05184f)*".
>
> **[Live Demo](https://codesandbox.io/s/github/derek-fong/demo-apollo-server-webpack-hmr)**

---

*Let’s build an Apollo GraphQL Server with TypeScript and Webpack HMR!*

## Prerequisites 🕺

* [Node.js with NPM](https://nodejs.org/) installed on your computer. At the time of writing, [Node.js version 6 or above](https://github.com/apollographql/apollo-server/blob/master/package.json) is required by Apollo Server.
* *Preferably* basic understanding of the fundamental GraphQL principles.
* *Preferably* general knowledge with [TypeScript](https://www.typescriptlang.org/). That being said, general JavaScript knowledge should be sufficient to understand the topics covered in this post. I will try my best to explain when it comes to TypeScript-specific concepts.

## Ready to Build Something? 🔨

### First Things First ☝🏻

Create a new folder for the project and create a `package.json` file by running [`npm-init`](https://docs.npmjs.com/cli/init) with default options:

```bash
$ mkdir apollo-server-demo && cd apollo-server-demo
$ npm init --yes
```

### Install TypeScript 📝

#### 1. Add TypeScript to our project’s NPM devDependencies:

```bash
$ npm install --save-dev typescript
```

> 💡 **Note:** `package-lock.json` is automatically generated when you install any NPM package for the first time. This is a feature introduced since [NPM version 5](https://github.com/npm/npm/pull/16441) and you **SHOULD** commit `package-lock.json` along with `package.json` if you are using source control like [Git](https://git-scm.com/). [James Quigley](https://medium.com/@Quigley_Ja) has written a [post](https://medium.com/coinmonks/everything-you-wanted-to-know-about-package-lock-json-b81911aa8ab8) explaining what `package-lock.json` is, and why it is needed.

#### 2. Initialize TypeScript configuration with a few key options:

```bash
$ npx tsc --init --rootDir src --outDir dist --lib dom,es6 --module commonjs --removeComments
```

> 💡 **Note:** [`npx`](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner) is a tool (bundled with NPM version 5.2 or above) for running NPM packages that are installed in local `node_modules` folder. [This post](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) covers npx usage in detail.

This will create a `tsconfig.json` file in your project’s root directory. Add `include` and `exclude` options to `tsconfig.json`. Your `tsconfig.json` should look like this (comments omitted).

📄 File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "lib": [ "dom","es6" ],
    "outDir": "dist",
    "rootDir": "src",
    "removeComments": true
  },
  "exclude": [ "node_modules" ],
  "include": [ "src/**/*.ts" ]
}
```

#### 3️. Verify TypeScript is setup correctly:

Create new a folder named `src` and create a new file `main.ts` in the folder:

📄 File: `src/main.ts`

```typescript
console.log('Hello World!');
```

Now try to compile TypeScript codes:

```bash
$ npx tsc
```

Once compiled, you will notice a new `dist` folder is created. TypeScript Compiler knows where to find the input TypeScript files and where to output the compiled file(s) because we have specified the options in `tsconfig.json` from Step 2.

Now try to run the compiled JavaScript file:

```bash
$ node dist/main
```

And you should see the output:

```bash
> Hello World!
```

Now, let’s say we want to modify `main.ts` to display a message other than `Hello World`:

📄 File: `src/main.ts`

```typescript
// console.log('Hello World!');
console.log('foo bar');
```

In order to see the changes in action, we will need to re-compile the TypeScript codes, and re-run the compiled JavaScript file:

```bash
$ npx tsc && node dist/main
```

```bash
> foo bar
```

As you can see, compile-and-run soon became a tedious task, especially during the development phase. We need to find a way to automate this process.

### Introducing Webpack (with HMR) 📦

> [Webpack](https://webpack.js.org/) is a JavaScript module bundler. It is also capable of transforming, bundling, or packaging just about any resource or asset.

We are going to use Webpack to transform and bundle codes written in TypeScript to JavaScript. Also, we are going to create Webpack configuration files targeting specific environments (namely `development` and `production`). Moreover, we are going to enable Webpack’s [Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/) to speed up development.

#### 1️. Install Webapck NPM packages and plugins:

```bash
$ npm install --save-dev @types/webpack-env clean-webpack-plugin ts-loader webpack webpack-cli webpack-merge webpack-node-externals
```

📦 [@types/webpack-env](https://www.npmjs.com/package/@types/webpack-env): [TypeScript type definitions](https://definitelytyped.org/) for Webpack.

📦 [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin): We use this plugin to clean up our output `dist` folder every time before Webpack builds our code.

📦 [ts-loader](https://github.com/TypeStrong/ts-loader): TypeScript loader for Webpack.

📦 [webpack](https://github.com/webpack/webpack) and [webpack-cli](https://github.com/webpack/webpack-cli): Webpack essentials.

📦 [webpack-merge](https://github.com/survivejs/webpack-merge): We use this plugin to manage our environment-specific configuration files (`development`, `production`, etc. ).

📦 [webpack-node-externals](https://github.com/liady/webpack-node-externals): Exclude Node modules that should not be bundled.

Up to this point, `package.json` should look similar to this:

```json
{
  "name": "apollo-server-demo",
  "private": true,
  "devDependencies": {
    "@types/webpack-env": "^1.14.1",
    "clean-webpack-plugin": "^3.0.0",
    "ts-loader": "^6.2.1",
    "typescript": "^3.6.4",
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-merge": "^4.2.2",
    "webpack-node-externals": "^1.7.2"
  }
}
```

#### 2. Add Webpack configuration files to the project’s root directory:

We are going to create [3 Webpack configuration files](https://webpack.js.org/configuration):

🔧 `webpack.development.js`: Development-specific Webpack configurations. For example, enable [`watch`](https://webpack.js.org/configuration/watch) option, [Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement), etc.

🔧 `webpack.production.js`: Production-specific Webpack configurations. For example, enable Webpack’s [production mode](https://webpack.js.org/concepts/mode/#mode-production).

🔧`webpack.common.js`: Webpack configurations which apply to all environments. Both `webpack.development.js` and `webpack.production.js` “inherits” common configurations using the [webpack-merge](https://github.com/survivejs/webpack-merge) plugin.

>💡 **Note:** You may refer to [this guide from Webpack](https://webpack.js.org/guides/production) for more detailed setup.

📄 File: `webpack.common.js`

```javascript
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node'
};
```

📄 File: `webpack.development.js`

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const common = require('./webpack.common.js');

module.exports = merge.smart(common, {
  devtool: 'inline-source-map',
  entry: ['webpack/hot/poll?1000', path.join(__dirname, 'src/main.ts')],
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000']
    })
  ],
  mode: 'development',
  plugins: [new CleanWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
  watch: true
});
```

📄 File: `webpack.production.js`

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'source-map',
  entry: [path.join(__dirname, 'src/main.ts')],
  externals: [nodeExternals({})],
  mode: 'production',
  plugins: [new CleanWebpackPlugin()]
});
```

#### 3️. Enable Webpack Hot Module Replacement in the source code:

File: `src/main.ts`

```typescript
console.log('Hello World!');

// Hot Module Replacement
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('Module disposed. '));
}
```

#### 4️. Add NPM `build` and `start` scripts:

In *Step 2*, we have decided to name Webpack configuration files as `webpack.development.ts` and `webpack.production.js` for a reason: `development` and `prodcution` are actually referring to the value of [`NODE_ENV`](https://dzone.com/articles/what-you-should-know-about-node-env) environment variable. By utilizing the value specified in `NODE_ENV`, we can easily switch between different environment configurations with [NPM scripts](https://docs.npmjs.com/misc/scripts) defined in `package.json`. This approach is especially useful if you are setting up deployment strategies later on with [Docker](https://www.docker.com/), [Heroku](https://www.heroku.com/), etc

*(TODO: I am going to write a separate post to cover various application deployment strategies in detail. )*

📄 File: `package.json`

```json
{
  "name": "apollo-server-demo",
  "private": true,
  "scripts": {
    "build": "webpack --config webpack.$NODE_ENV.js",
    "start": "node dist/server"
  },
  "devDependencies": {
    "@types/webpack-env": "^1.14.1",
    "clean-webpack-plugin": "^3.0.0",
    "ts-loader": "^6.2.1",
    "typescript": "^3.6.4",
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-merge": "^4.2.2",
    "webpack-node-externals": "^1.7.2"
  }
}
```

For example, if we want to build with Webpack’s production configurations, we could simply run:

```bash
$ NODE_ENV=production npm run build
```

And you will see a compiled `server.js` file in the `dist` folder.

5️. Verify Webpack HMR is Setup Correctly:

Run NPM build with `development` configurations:

```bash
$ NODE_ENV=development npm run build
```

which should display an output similar to:

```plain
webpack is watching the files…
Hash: 23976326d5ac19cc44e4
Version: webpack 4.28.3
Time: 1191ms
Built at: 01/01/2019 10:23:34 PM
  Asset      Size  Chunks             Chunk Names
main.js  76.3 KiB    main  [emitted]  main
Entrypoint main = main.js
[0] multi webpack/hot/poll?1000 ./src/main.ts 40 bytes {main} [built]
[./node_modules/webpack/hot/log-apply-result.js] (webpack)/hot/log-apply-result.js 1.27 KiB {main} [built]
[./node_modules/webpack/hot/log.js] (webpack)/hot/log.js 1.11 KiB {main} [built]
[./node_modules/webpack/hot/poll.js?1000] (webpack)/hot/poll.js?1000 1.15 KiB {main} [built]
[./src/main.ts] 172 bytes {main} [built]
```

Now, open a new Terminal and run the compiled code:

```bash
$ npm start
```

Which should display output:

```bash
> Hello World!
```

To test Webpack’s HMR, try to modify `src/main.ts` to output a message other than `"Hello World"`.

📄 File: `main.ts`

```typescript
// console.log('Hello World!');
console.log('foo bar');

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('Module disposed. '));
}
```

Once you’ve saved the changes, you will see the following output:

```plain
Module disposed.
foo bar
[HMR] Updated modules:
[HMR]  - ./src/main.ts
[HMR] Update applied.
```

Now we confirmed Webpack HMR is working with TypeScript! You may press `ctrl`+ `c` on the keyboard to stop the `build` and `run` processes on both Terminals.

### Setup Apollo Server 🚀

We have built the foundation with **TypeScript** and **Webpack**. It’s time to introduce Apollo Server!

#### 🤔 What is Apollo Server?

[Apollo Server](https://www.apollographql.com/docs/apollo-server) is actually part of the [Apollo GraphQL Platform](https://www.apollographql.com/platform). It is an open-sourced library from the [Meteor Development Group](https://www.apollographql.com/careers/team) ([MeteorJS](https://www.meteor.com/), anyone?), which provides a suite of tools to create GraphQL server embracing best practices for the industry.

In its simplest form, a GraphQL server is made up of three core components:

* GraphQL server library, such as Apollo Server
* [Schemas](https://graphql.org/learn/schema): **What** types of data are available
* [Resolvers](https://graphql.org/learn/execution): **How** to fetch the data required
*
To demonstrate how easy it is to set up an Apollo Server, we are going to create a minimal server which contains only one [Query](https://graphql.org/learn/queries).

#### 1️. Install Apollo Server and dependencies:

```bash
$ npm install --save apollo-server graphql
```

📦 [apollo-server](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server): The Apollo Server library.

📦 [graphql](https://github.com/graphql/graphql-js): The library used to build and execute [GraphQL schemas](https://graphql.org/learn/schema).

#### 2️. Create `type-defs.ts`

📄 File: `src/type-defs.ts`

```typescript
import { gql } from 'apollo-server';

export default gql`
  type Query {
    """
    Test Message.
    """
    testMessage: String!
  }
`;
```

This file uses the [Schema Definition Language (DSL)](https://www.howtographql.com/basics/2-core-concepts) to define **what** type(s) of data is available from the server. In this case, we have defined a `testMessage` query is available, which returns a string.

You may also notice the triple-double quotes “”” in the code. These are [markdown](https://en.wikipedia.org/wiki/Markdown)-enabled comments within the schema supported by GraphQL. It helps data consumers to discover and understand the types of data provided by the server from tools like [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground).

#### 3️. Create `resolvers.ts`

📄 File: `src/resolvers.ts`

```typescript
export default {
  Query: {
    testMessage: (): string => 'Hello World!',
  },
};
```

Resolvers are simply pure functions defining **how** data are fetched when requested.
In general, every resolver in a GraphQL schema [accepts four positional arguments](https://www.apollographql.com/docs/graphql-tools/resolvers.html#Resolver-function-signature):

```javascript
fieldName(obj, args, context, info) { result }
```

That being said, in our example, since our `testMessage` query always return a constant `Hello World!` string, we do not need to worry about the arguments passing into the resolver function for now.

💡 **Note:** As your project grows, your **Schemas** and **Resolvers** will get more complex and will be difficult to maintain in one single file. Apollo has provided [suggestions to modularize](https://www.apollographql.com/docs/apollo-server/federation/introduction) your code. Alternatively, the [merge-graphql-schemas](https://github.com/urigo/merge-graphql-schemas) NPM package is another good option to consider when modularizing your GraphQL code.

> **UPDATE**: Checkout [GraphQL Modules](https://graphql-modules.com/), which provides toolset of libraries which helps to build modularized code that scales!

#### 4️. Create Apollo Server in `main.ts`

📄 File: `src/main.ts`

```typescript

import { ApolloServer } from 'apollo-server';

import resolvers from './resolvers';
import typeDefs from './type-defs';

const server = new ApolloServer({ resolvers, typeDefs });

server.listen()
  .then(({ url }) => console.log(`Server ready at ${url}. `));

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.stop());
}
```

We have created our first Apollo Server with the **schema** and **resolver** defined in *Step 2* and *Step 3*.

We have fired up our Apollo Server with default options, which will be accessible via [http://localhost:4000](http://localhost:4000).

Finally, we have added the code to stop the server running when HMR kicks in, and re-start the server after when HMR completes.

#### 5️. It’s time to test our server! 🕑

Open a new Terminal to build the server in `development` mode:

```bash
$ NODE_ENV=development npm run build
```

Open another Terminal to start the server:

```bash
$ npm start
```

Open a Web browser and navigate to [http://localhost:4000](http://localhost:4000), which should bring you to the Server’s [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground).

Now if you try to input query and click the “Play” ▶️ button:

```plain
query {
  testMessage
}
```

It should output the result:

```json
{
  "data": {
    "testMessage": "Hello World!"
  }
}
```

You can also read the schema’s documentation by clicking the **DOCS** tag on the right-hand side of the screen.

Great! We have built our first Apollo Server! 👏🏻

### 🧐 But there is one problem…

Our Apollo server is now up and running which is great…but our server is running with default options. When building a real-world production app, chances are you will need to provide custom options when setting up your Apollo Server, especially when the Apollo Server API comes with a [whole list of configuration options](https://www.apollographql.com/docs/apollo-server/api/apollo-server) available for tweaking.

For example, you might want to use a port other than `4000` when running the server in production. Or for any reason, you might want to enable GraphQL Playground in production (GraphQL Playground is disabled when `NODE_ENV` is set to `production` by default).

We want our server to be flexible enough to handle various environment-specific configurations. How do we achieve this?

### Environment Variables come to the rescue 💪🏻

If you have experience in building Javascript applications, you probably already know you can access environment variables via the [`process.env`](https://nodejs.org/api/process.html#process_process_env) object in your JavaScript apps:

```plain
# Set environment variable `FOO` in Terminal
$ export FOO=bar

# Or in Windows Command Line
$ set FOO=bar

// your-app.js
console.log(provess.env.FOO);  // OUTPUT: bar
```

This works fine…until you need to switch between projects with a list of environment variables with different values.

Luckily, there is an NPM package called [dotenv](https://github.com/motdotla/dotenv#readme) which aims to address this issue.

The [concept](https://github.com/motdotla/dotenv#readme) is pretty simple:

* Define all your environment-specific variables in a single plain text file.

* Reference the environment variables with the `process.env` object throughout your code.

* Run the code with `--require dotenv/config` option.

#### 1️. Install dotenv as devDependencies:

```bash
$ npm install --save-dev dotenv
```

#### 2️. Add a .env file in the project root:

📄 File: `.env`

```plain
PORT=4001
APOLLO_INTROSPECTION=true
APOLLO_PLAYGROUND=true
```

💡**Note:** [You **SHOULD NOT** commit `.env`](https://github.com/motdotla/dotenv#should-i-commit-my-env-file) if you are using any source control. For example, add `.env` to [`.gitignore`](https://git-scm.com/docs/gitignore) if you are using [Git](https://git-scm.com/).

#### 3️. Create `environment.ts`

While you could access environment variables directly with `process.env`, I encourage you to create a file to hold all your environment variables. This will be much easier if you need to make any changes to the variables or refactoring down the track.

📄 File: `src/environment.ts`

```typescript

const defaultPort = 4000;

interface Environment {
  apollo: {
    introspection: boolean,
    playground: boolean
  },
  port: number|string;
}

export const environment: Environment = {
  apollo: {
    introspection: process.env.APOLLO_INTROSPECTION === 'true',
    playground: process.env.APOLLO_PLAYGROUND === 'true'
  },
  port: process.env.PORT || defaultPort
};
```

#### 4️. Add Apollo Server options

We’ve added [introspection and playground options](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#parameters) to be controlled by environment variables. We’ve also asked our server to run on the port specified on the environment’s `PORT` variable.

📄 File: `main.ts`

```typescript
import { ApolloServer } from 'apollo-server';

import { environment } from './environment';
import resolvers from './resolvers';
import typeDefs from './schemas';

const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: environment.apollo.introspection,
  playground: environment.apollo.playground
});

server.listen(environment.port)
  .then(({ url }) => console.log(`Server ready at ${url}. `));

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.stop());
}
```

#### 5️. Add `start:env` NPM script to `package.json`

📄 File: `package.json`

```json
{
  "name": "apollo-server-demo",
  "private": true,
  "scripts": {
    "build": "webpack --config webpack.$NODE_ENV.js",
    "start": "node dist/server",
    "start:env": "node --require dotenv/config dist/server",
  },
  "dependencies": {
    "apollo-server": "^2.9.7",
    "graphql": "^14.5.8"
  },
  "devDependencies": {
    "@types/webpack-env": "^1.14.1",
    "clean-webpack-plugin": "^3.0.0",
    "dotenv": "^8.2.0",
    "ts-loader": "^6.2.1",
    "typescript": "^3.6.4",
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-merge": "^4.2.2",
    "webpack-node-externals": "^1.7.2"
  }
}
```

#### 6️. Test-Run the Server with Environment Variables

Open a new Terminal to build the server in `development` mode:

```bash
$ NODE_ENV=development npm run build
```

Open another Terminal to start the server with `dotenv`:

```bash
$ npm run start:env
```

Your Apollo Server should be accessible via [http://localhost:4001](http://localhost:4001).

You can also try to change the `APOLLO_PLAYGROUND` value in `.env` to false, re-run your `build` and `start:env` NPM scripts and confirm GraphQL Playground is no longer accessible via [http://localhost:4001](http://localhost:4001) on the web browser.

## Wrapping up

In this post, we have covered how to build an Apollo GraphQL Server with TypeScript and Webpack HMR enabled with minimal setup.

I believe GraphQL is the next generation of API, and the [Apollo GraphQL toolsets](https://github.com/apollographql) sound very promising. Therefore, I think it is worth to invest time and effort to learn this technology.

We are only scratching the surface here for GraphQL and the Apollo Platform. In fact, there are a lot more to be covered. Below are some of the topics that I am thinking of to be covered next. Please leave comments and let me know which ones you’re interested in 😉

🍃 Apollo Server: Connect to MongoDB with Mongoose
🔐 Apollo Server: Authentication and Authorization with JWT
✅ Apollo Server: Test schema and resolvers
🐳 Apollo Server: Deploy dockerized Apollo Server on Heroku
🌚 CircleCI: Test-build-deploy with CircleCI 2.1 Orbs
🏎Apollo Engine: Production-ready
🎨Apollo Client: Angular + NativeScript or React + ReactNative
