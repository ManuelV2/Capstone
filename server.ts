// Cargar .env al inicio (solo si no usas --env-file)
// import "./load_env.ts";

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

// Funciones helper para normalizar formatos
function normalizeCedula(cedula: string): string {
  // Limpiar: solo números y K
  const cleaned = cedula.toUpperCase().replace(/[^0-9K]/g, '');
  
  // Separar números del verificador
  const numbers = cleaned.replace(/K/g, '');
  const hasK = cleaned.includes('K');
  
  if (numbers.length === 0) return cedula;
  
  // Determinar verificador
  let mainDigits: string;
  let verificador: string;
  
  if (hasK) {
    mainDigits = numbers;
    verificador = 'K';
  } else if (numbers.length > 7) {
    mainDigits = numbers.slice(0, -1);
    verificador = numbers.slice(-1);
  } else {
    return cedula; // No tiene formato completo
  }
  
  const length = mainDigits.length;
  
  // Formatear según cantidad de dígitos principales
  let formatted: string;
  
  if (length === 7) {
    // 7 dígitos: X.XXX.XXX-V (ejemplo: 9.101.850-0)
    formatted = `${mainDigits.slice(0, 1)}.${mainDigits.slice(1, 4)}.${mainDigits.slice(4, 7)}`;
  } else if (length === 8) {
    // 8 dígitos: XX.XXX.XXX-V (ejemplo: 21.522.019-2)
    formatted = `${mainDigits.slice(0, 2)}.${mainDigits.slice(2, 5)}.${mainDigits.slice(5, 8)}`;
  } else {
    return cedula; // Formato no esperado
  }
  
  return `${formatted}-${verificador}`;
}

function normalizeTelefono(telefono: string): string {
  // Eliminar espacios, dejar solo números
  const numbers = telefono.replace(/\D/g, '');
  
  // Aplicar formato X XXXX XXXX
  if (numbers.length === 10) {
    return `${numbers.slice(0, 1)} ${numbers.slice(1, 5)} ${numbers.slice(5)}`;
  }
  
  return telefono; // Si no tiene 10 dígitos, devolver como está
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

// ============ NUEVOS ENDPOINTS DE AUTENTICACIÓN ============

// Login endpoint
router.post("/api/auth/login", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { email, password } = body;

    console.log('🔐 Intento de login:', { email }); // Debug

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Email y contraseña son requeridos" };
      return;
    }

    // Buscar usuario en whitelist
    const { data: user, error } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('activo', true)
      .single();

    console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No'); // Debug
    console.log('❌ Error de búsqueda:', error); // Debug

    if (error || !user) {
      console.error('❌ Usuario no encontrado o error:', error);
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenciales inválidas" };
      return;
    }

    console.log('🔑 Comparando contraseñas...'); // Debug
    console.log('   - Recibida:', password);
    console.log('   - En BD:', user.password_hash);

    // Verificar contraseña (simple comparación por ahora)
    if (password !== user.password_hash) {
      console.error('❌ Contraseña incorrecta');
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenciales inválidas" };
      return;
    }

    // Login exitoso
    const sessionData = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    };

    console.log('✅ Login exitoso para:', user.email);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      user: sessionData,
      token: btoa(JSON.stringify(sessionData))
    };

  } catch (error) {
    console.error("❌ Error en login:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error en el servidor" };
  }
});

// Obtener usuarios de whitelist
router.get("/api/auth/users", async (ctx) => {
  try {
    const { data, error } = await supabase
      .from('authorized_users')
      .select('id, email, nombre, rol, activo, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    ctx.response.body = data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener usuarios" };
  }
});

// Crear usuario en whitelist
router.post("/api/auth/users", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    
    const userData = {
      email: body.email.toLowerCase(),
      password_hash: body.password, // En producción, hashear con bcrypt
      nombre: body.nombre,
      rol: body.rol || 'admin',
      activo: body.activo !== false
    };

    const { data, error } = await supabase
      .from('authorized_users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Duplicate email
        ctx.response.status = 400;
        ctx.response.body = { error: "El email ya existe" };
        return;
      }
      throw error;
    }

    // No devolver password_hash
    const { password_hash, ...safeData } = data;
    ctx.response.status = 201;
    ctx.response.body = safeData;

  } catch (error) {
    console.error("❌ Error creating user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al crear usuario" };
  }
});

// Actualizar usuario en whitelist
router.put("/api/auth/users/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const body = await ctx.request.body().value;

    const updateData: any = {
      email: body.email?.toLowerCase(),
      nombre: body.nombre,
      rol: body.rol,
      activo: body.activo
    };

    // Solo actualizar password si se proporciona
    if (body.password && body.password.trim() !== '') {
      updateData.password_hash = body.password; // En producción, hashear
    }

    // Limpiar undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const { data, error } = await supabase
      .from('authorized_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { password_hash, ...safeData } = data;
    ctx.response.body = safeData;

  } catch (error) {
    console.error("❌ Error updating user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al actualizar usuario" };
  }
});

// Eliminar usuario de whitelist
router.delete("/api/auth/users/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);

    const { error } = await supabase
      .from('authorized_users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    ctx.response.status = 204;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar usuario" };
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
    
    console.log('📥 Datos recibidos para crear trabajador:', body);
    console.log('📄 Documentos recibidos:', body.documentos);
    console.log('🔔 Documentos con recordatorios:', 
      body.documentos?.filter((d: any) => d.recordatorio)
    );
    
    const workerData = {
      nombre: body.nombre,
      cedula: normalizeCedula(body.cedula),
      cargo: body.cargo,
      turno: body.turno,
      estado: body.estado || 'Disponible',
      telefono: normalizeTelefono(body.telefono),
      documentos: body.documentos || []
    };
    
    console.log('💾 Datos a insertar en DB:', workerData);
    
    const { data, error } = await supabase
      .from('workers')
      .insert([workerData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error de Supabase al crear:', error);
      throw error;
    }
    
    console.log('✅ Trabajador creado exitosamente:', data);
    console.log('📋 Documentos guardados:', data.documentos);
    
    ctx.response.status = 201;
    ctx.response.body = data;
  } catch (error) {
    console.error("❌ Error creating worker:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al crear el trabajador", 
      details: error.message 
    };
  }
});

router.put("/api/workers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const body = await ctx.request.body().value;
    
    console.log('\n========================================');
    console.log('📝 ACTUALIZANDO TRABAJADOR ID:', id);
    console.log('========================================');
    console.log('📦 Body recibido completo:');
    console.log(JSON.stringify(body, null, 2));
    console.log('\n📄 Documentos recibidos:', body.documentos?.length || 0);
    
    if (body.documentos && Array.isArray(body.documentos)) {
      body.documentos.forEach((doc: any, index: number) => {
        console.log(`\n📋 Documento ${index + 1}:`);
        console.log(`   - Nombre: ${doc.nombre}`);
        console.log(`   - URL: ${doc.url.substring(0, 50)}...`);
        console.log(`   - Tiene recordatorio: ${doc.recordatorio ? '✅ SÍ' : '❌ NO'}`);
        
        if (doc.recordatorio) {
          console.log(`   🔔 Recordatorio:`);
          console.log(`      - Fecha/Hora: ${doc.recordatorio.fechaHora}`);
          console.log(`      - Mensaje: ${doc.recordatorio.mensaje || '(sin mensaje)'}`);
          console.log(`      - Activo: ${doc.recordatorio.activo}`);
        }
      });
    }
    
    // Obtener el trabajador actual
    const { data: currentWorker, error: fetchError } = await supabase
      .from('workers')
      .select('documentos')
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
    
    // Identificar documentos eliminados
    const oldDocs = currentWorker.documentos || [];
    const newDocs = body.documentos || [];
    const deletedDocs = oldDocs.filter(
      (oldDoc: any) => !newDocs.some((newDoc: any) => newDoc.url === oldDoc.url)
    );

    if (deletedDocs.length > 0) {
      console.log('\n🗑️ Eliminando archivos del Storage...');
      await deleteFilesFromStorage(deletedDocs);
    }
    
    // Preparar datos para actualizar
    const { id: _, ...updateData } = body;
    
    // Normalizar formatos
    if (updateData.cedula) {
      updateData.cedula = normalizeCedula(updateData.cedula);
    }
    if (updateData.telefono) {
      updateData.telefono = normalizeTelefono(updateData.telefono);
    }
    
    console.log('\n💾 Datos a actualizar en la BD:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Actualizar en Supabase
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
    
    console.log('\n✅ TRABAJADOR ACTUALIZADO EXITOSAMENTE');
    console.log('📋 Documentos finales en BD:', data.documentos?.length || 0);
    
    const docsConRecordatorio = data.documentos?.filter((d: any) => d.recordatorio) || [];
    console.log(`🔔 Recordatorios guardados: ${docsConRecordatorio.length}`);
    
    if (docsConRecordatorio.length > 0) {
      console.log('\n🔔 RECORDATORIOS GUARDADOS:');
      docsConRecordatorio.forEach((doc: any, index: number) => {
        console.log(`   ${index + 1}. ${doc.nombre}`);
        console.log(`      - Fecha: ${doc.recordatorio.fechaHora}`);
        console.log(`      - Mensaje: ${doc.recordatorio.mensaje}`);
      });
    }
    
    console.log('========================================\n');
    
    ctx.response.body = data;
  } catch (error) {
    console.error("\n❌ ERROR UPDATING WORKER:", error);
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