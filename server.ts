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

// Función helper para extraer el path del archivo desde la URL pública
function getFilePathFromUrl(url: string): string | null {
  try {
    // URL format: https://[project].supabase.co/storage/v1/object/public/documentos_trabajadores/[filepath]
    const match = url.match(/\/documentos_trabajadores\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Función helper para eliminar un archivo del Storage
async function deleteFilesFromStorage(documentos: any[]) {
  if (!Array.isArray(documentos) || documentos.length === 0) return;
  
  const filePaths = documentos
    .map(doc => getFilePathFromUrl(doc.url))
    .filter(path => path !== null) as string[];
  
  if (filePaths.length === 0) return;
  
  console.log('🗑️ Eliminando archivos del Storage:', filePaths);
  
  const { error } = await supabase
    .storage
    .from('documentos_trabajadores')
    .remove(filePaths);
  
  if (error) {
    console.error('❌ Error al eliminar archivos del Storage:', error);
  } else {
    console.log('✅ Archivos eliminados del Storage:', filePaths);
  }
}

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
    const workerData = {
      nombre: body.nombre,
      cedula: body.cedula,
      cargo: body.cargo,
      turno: body.turno,
      estado: body.estado || 'Activo',
      telefono: body.telefono,
      documentos: body.documentos || [] // Usar 'documentos'
    };
    
    const { data, error } = await supabase
      .from('workers')
      .insert([workerData])
      .select()
      .single();
    
    if (error) throw error;
    
    ctx.response.status = 201;
    ctx.response.body = data;
  } catch (error) {
    console.error("Error creating worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al crear el trabajador", details: error.message };
  }
});

router.put("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const body = await ctx.request.body().value;
    
    console.log('📝 Actualizando trabajador ID:', id);
    console.log('📄 Datos recibidos:', body);
    
    // Obtener el trabajador actual para verificar si cambió el documento
    const { data: currentWorker, error: fetchError } = await supabase
      .from('workers')
      .select('documentos') // Solo necesitamos los documentos
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('❌ Error al obtener trabajador actual:', fetchError);
      if (fetchError.code === 'PGRST116') {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trabajador no encontrado" };
        return;
      }
      throw fetchError;
    }
    
    // Identificar documentos que fueron eliminados
    const oldDocs = currentWorker.documentos || [];
    const newDocs = body.documentos || [];
    const deletedDocs = oldDocs.filter(
      (oldDoc: any) => !newDocs.some((newDoc: any) => newDoc.url === oldDoc.url)
    );

    if (deletedDocs.length > 0) {
      console.log('🔄 Documentos eliminados, limpiando Storage...');
      await deleteFilesFromStorage(deletedDocs);
    }
    
    // Remove id from update data
    const { id: _, ...updateData } = body;
    
    console.log('💾 Datos para actualizar:', updateData);
    
    const { data, error } = await supabase
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error de Supabase al actualizar:', error);
      throw error;
    }
    
    console.log('✅ Trabajador actualizado exitosamente:', data);
    ctx.response.body = data;
  } catch (error) {
    console.error("❌ Error updating worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al actualizar el trabajador",
      details: error.message 
    };
  }
});

router.delete("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    
    console.log('🗑️ Eliminando trabajador ID:', id);
    
    // Primero, obtener el trabajador para acceder a sus documentos
    const { data: worker, error: fetchError } = await supabase
      .from('workers')
      .select('documentos')
      .eq('id', id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Eliminar archivos del Storage si existen
    if (worker && worker.documentos) {
      console.log('📄 Trabajador tiene documentos, eliminándolos...');
      await deleteFilesFromStorage(worker.documentos);
    }
    
    // Ahora eliminar el registro de la base de datos
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ Trabajador eliminado exitosamente');
    ctx.response.status = 204;
  } catch (error) {
    console.error("❌ Error deleting worker:", error);
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