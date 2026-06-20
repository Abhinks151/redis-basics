import express, { response } from "express";
import { Redis } from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const URL = "https://pokeapi.co/api/v2/pokemon/";
const app = express();
app.use(express.json());
app.get("/", async (req, res) => {
  await redis.set("name", "Abhin", "EX", 60);

  const value = await redis.get("name");

  res.json({
    value,
  });
});

app.post("/generate", async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  await redis.set(`otp:${email}`, otp, "EX", 60);
  res.json({ otp });
});

app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP is required" });
  }

  const originalOTP = await redis.get(`otp:${email}`);

  if (!originalOTP) {
    return res.status(400).json({
      error: "OTP expired or not found",
    });
  }

  if (originalOTP != String(otp)) {
    return res.status(400).json({ error: "OTP is wrong" });
  }

  await redis.del(`otp:${email}`);

  return res.json({
    message: "OTP verified",
    email,
  });
});

app.get("/pokemon/:name", async (req, res) => {
  try {
    const name = req.params.name;

    // No need to do this without name the api wont work
    // if (!name) {
    //   return res.status(400).json({ error: "Name is required" });
    // }

    const pokemonCache = await redis.get(`pokemon:${name}`);
    if (pokemonCache) {
      console.log("Found on cache");
      const pokemon = JSON.parse(pokemonCache);

      return res.json({ message: "From cache", pokemon });
    }

    console.log("Not found on cache");
    const response = await fetch(`${URL}${name}`);
    if (!response.ok) {
      return res.status(404).json({
        error: "Pokemon not found",
      });
    }

    const pokemon = await response.json();

    await redis.set(`pokemon:${name}`, JSON.stringify(pokemon), "EX", 30);

    res.json({ pokemon });
  } catch (error) {
    console.log("somethis went wrong", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
