-- Script para migrar estados antiguos a nuevos nombres
-- Ejecuta esto SOLO si tienes datos existentes con los estados antiguos

UPDATE public.workers
SET estado = CASE estado
    WHEN 'Activo' THEN 'Disponible'
    WHEN 'Inactivo' THEN 'De Vacaciones'
    WHEN 'Suspendido' THEN 'Con Licencia Médica'
    ELSE estado
END
WHERE estado IN ('Activo', 'Inactivo', 'Suspendido');

-- Verificar los cambios
SELECT estado, COUNT(*) as cantidad
FROM public.workers
GROUP BY estado;
