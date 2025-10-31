import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

// Cargar variables de entorno desde .env
const env = await load();

// Establecer en Deno.env
for (const [key, value] of Object.entries(env)) {
  Deno.env.set(key, value);
}

console.log("✅ Variables de entorno cargadas desde .env");
