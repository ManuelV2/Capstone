-- Agregar columna para almacenar recordatorios en los documentos
-- Los documentos ya se guardan como JSONB, así que actualizaremos la estructura

-- Ejemplo de estructura de documento con recordatorio:
-- {
--   "url": "https://...",
--   "nombre": "Certificado.pdf",
--   "fecha": "2024-01-15T10:30:00Z",
--   "recordatorio": {
--     "activo": true,
--     "fechaHora": "2024-01-20T09:00:00Z",
--     "mensaje": "Renovar certificado de Juan Pérez"
--   }
-- }

-- No necesitamos modificar la tabla, solo actualizamos cómo guardamos los datos
SELECT '✅ La estructura JSONB de documentos ya soporta recordatorios' as status;
