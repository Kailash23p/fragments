# Fragments

Fragments back-end API built with Node.js and Express.

## Requirements

- Node.js 22 or newer
- npm
- curl
- jq

## Setup

Install dependencies:

```sh
npm install
```

## Scripts

Run ESLint against the source files:

```sh
npm run lint
```

Start the server normally:

```sh
npm start
```

Start the server in watch mode with debug-level logging:

```sh
npm run dev
```

Start the server in watch mode with the Node inspector available on port `9229`:

```sh
npm run debug
```

## Testing the Server

The API listens on port `8080` by default. Open <http://localhost:8080> in a browser or use curl:

```sh
curl http://localhost:8080
```

Pretty-print the health check response with jq:

```sh
curl -s http://localhost:8080 | jq
```

Inspect the response headers:

```sh
curl -i http://localhost:8080
```

The health check returns JSON with the service status, author, GitHub URL, version, and timestamp.

## Debugging

Use the included VSCode launch configuration named `Debug via npm run debug`. Set a breakpoint in `src/app.js`, start the debugger, and request <http://localhost:8080> to hit the breakpoint.
