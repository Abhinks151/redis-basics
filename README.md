# Redis Practice

A simple Express.js application demonstrating Redis for caching and OTP storage.

## Tech Stack

* Node.js
* Express.js
* Redis
* ioredis

## Features

* Generate and verify OTPs with expiration
* Cache Pokémon API responses
* Store and retrieve data from Redis
* Automatic cache expiration using TTL

## Run the Project

```bash
npm install
npm run dev
```

Make sure Redis is running on `localhost:6379` before starting the server.

## What I Learned

* Connecting to Redis using `ioredis`
* Storing and retrieving key-value pairs
* Using expiration (`EX`) for temporary data
* Building an OTP system with Redis
* Implementing API response caching
* Deleting data after successful verification
