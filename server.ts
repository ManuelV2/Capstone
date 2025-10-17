import { Application, Router } from "@oak/oak";
import { createClient } from "@supabase/supabase-js";

const app = new Application();
const router = new Router();

// Supabase configuration
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please set SUPABASE_URL and SUPABASE_ANON_KEY");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Connected to Supabase");

// Middleware para CORS
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
  } else {
    await next();
  }
});

// API Routes
router.get("/api/workers", async (ctx) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    ctx.response.body = data || [];
  } catch (error) {
    console.error("Error fetching workers:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener los trabajadores" };
  }
});

router.get("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trabajador no encontrado" };
        return;
      }
      throw error;
    }
    
    ctx.response.body = data;
  } catch (error) {
    console.error("Error fetching worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener el trabajador" };
  }
});

router.post("/api/workers", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    
    console.log("📥 Datos recibidos:", body); // Log para debug
    
    const workerData = {
      nombre: body.nombre,
      cedula: body.cedula,
      cargo: body.cargo,
      turno: body.turno,
      estado: body.estado || 'Activo',
      telefono: body.telefono,
      documentos: body.documentos || [] // Usar 'documentos' en lugar de 'documento_url'
    };
    
    console.log("📝 Datos a insertar:", workerData); // Log para debug
    
    const { data, error } = await supabase
      .from('workers')
      .insert([workerData])
      .select()
      .single();
    
    if (error) {
      console.error("❌ Error de Supabase:", error);
      throw error;
    }
    
    console.log("✅ Trabajador creado:", data);
    ctx.response.status = 201;
    ctx.response.body = data;
  } catch (error) {
    console.error("❌ Error creating worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al crear el trabajador", 
      details: error.message,
      hint: error.hint || "Verifica que la tabla 'workers' tenga la columna 'documentos' (JSONB)"
    };
  }
});

router.put("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const body = await ctx.request.body().value;
    
    // Remove id from update data
    const { id: _, ...updateData } = body;
    
    const { data, error } = await supabase
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trabajador no encontrado" };
        return;
      }
      throw error;
    }
    
    ctx.response.body = data;
  } catch (error) {
    console.error("Error updating worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al actualizar el trabajador" };
  }
});

router.delete("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    ctx.response.status = 204;
  } catch (error) {
    console.error("Error deleting worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar el trabajador" };
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

// Inicia el servidor
console.log("🚀 Servidor corriendo en http://0.0.0.0:8000");
await app.listen({ port: 8000 });