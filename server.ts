import { Application, Router } from "@oak/oak";

const app = new Application();
const router = new Router();

// Simulated database for workers
let workers = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "12345678",
    cargo: "Supervisor",
    turno: "Diurno",
    estado: "Activo",
    telefono: "555-0123",
    fechaIngreso: "2023-01-15"
  },
  {
    id: 2,
    nombre: "María González",
    cedula: "87654321",
    cargo: "Guardia",
    turno: "Nocturno",
    estado: "Activo",
    telefono: "555-0124",
    fechaIngreso: "2023-02-10"
  }
];

// API Routes
router.get("/api/workers", (ctx) => {
  ctx.response.body = workers;
});

router.get("/api/workers/:id", (ctx) => {
  const id = parseInt(ctx.params.id);
  const worker = workers.find(w => w.id === id);
  if (worker) {
    ctx.response.body = worker;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Trabajador no encontrado" };
  }
});

router.post("/api/workers", async (ctx) => {
  const body = await ctx.request.body().value;
  const newWorker = {
    id: workers.length + 1,
    ...body,
    fechaIngreso: new Date().toISOString().split('T')[0]
  };
  workers.push(newWorker);
  ctx.response.status = 201;
  ctx.response.body = newWorker;
});

router.put("/api/workers/:id", async (ctx) => {
  const id = parseInt(ctx.params.id);
  const body = await ctx.request.body().value;
  const index = workers.findIndex(w => w.id === id);
  
  if (index !== -1) {
    workers[index] = { ...workers[index], ...body };
    ctx.response.body = workers[index];
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Trabajador no encontrado" };
  }
});

router.delete("/api/workers/:id", (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = workers.findIndex(w => w.id === id);
  
  if (index !== -1) {
    workers.splice(index, 1);
    ctx.response.status = 204;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Trabajador no encontrado" };
  }
});

// Serve static files
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/") {
    try {
      const html = await Deno.readTextFile("./public/index.html");
      ctx.response.type = "text/html";
      ctx.response.body = html;
    } catch {
      ctx.response.status = 404;
    }
  } else if (ctx.request.url.pathname.startsWith("/static/")) {
    try {
      const filePath = `./public${ctx.request.url.pathname}`;
      const file = await Deno.readFile(filePath);
      
      if (ctx.request.url.pathname.endsWith(".js")) {
        ctx.response.type = "application/javascript";
      } else if (ctx.request.url.pathname.endsWith(".css")) {
        ctx.response.type = "text/css";
      }
      
      ctx.response.body = file;
    } catch {
      ctx.response.status = 404;
    }
  } else {
    await next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Servidor corriendo en http://localhost:8000");
await app.listen({ port: 8000 });