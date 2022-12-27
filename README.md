# Pik - stickers widget

---

## How to use

Add widget to group with this command:

```
/addwidget https://stickers.sleroq.link
```

## How to test

Start server:

```shell
yarn preview
```

Add widget to you group chat:

```
/addwidget https://localhost:4173
```

This will only work with desktop app, to test in the browser you will need to host it somewhere or make tunnel with your server

## Project Structure

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). During development, the `dev` command will server-side render (SSR) the output.

```shell
yarn start
```

> Note: during dev mode, Vite may request a significant number of `.js` files. This does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, a production build of `src/entry.preview.tsx`, and run a local server. The preview server is only for convenience to locally preview a production build, and it should not be used as a production server.

```shell
yarn preview
```

## Production

The production build will generate client and server modules by running both client and server build commands. Additionally, the build command will use Typescript to run a type check on the source code.

```shell
yarn build
```

## Static Site Generator (Node.js)

```
yarn build.server
```
