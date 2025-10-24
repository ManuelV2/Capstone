const { useState, useEffect } = React;

// Configuración del cliente de Supabase para el frontend
const SUPABASE_URL = 'https://zeuuzbdanuthppkyqoxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldXV6YmRhbnV0aHBwa3lxb3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMTksImV4cCI6MjA3NTkzOTIxOX0.7Ko4XqG6Zk0gjGdGEKyKfLY0bLFGW_7OATdhatklKGc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones de formateo
const formatCedula = (value) => {
    // Permitir números y la letra K
    const cleaned = value.toUpperCase().replace(/[^0-9K]/g, '');
    
    // Separar números y letra K
    const numbers = cleaned.replace(/K/g, '');
    const hasK = cleaned.includes('K');
    
    // Limitar a 8 dígitos principales + 1 verificador (número o K)
    const mainDigits = numbers.slice(0, 8);
    const lastDigit = numbers.slice(8, 9);
    
    // Si no hay dígitos, retornar vacío
    if (mainDigits.length === 0) return '';
    
    // Aplicar formato XX.XXX.XXX
    if (mainDigits.length <= 2) {
        return mainDigits;
    }
    if (mainDigits.length <= 5) {
        return `${mainDigits.slice(0, 2)}.${mainDigits.slice(2)}`;
    }
    if (mainDigits.length <= 8) {
        const formatted = `${mainDigits.slice(0, 2)}.${mainDigits.slice(2, 5)}.${mainDigits.slice(5)}`;
        
        // Si tiene exactamente 8 dígitos y hay K o un dígito verificador
        if (mainDigits.length === 8 && (hasK || lastDigit)) {
            if (hasK) {
                return `${formatted}-K`;
            } else if (lastDigit) {
                return `${formatted}-${lastDigit}`;
            }
        }
        
        return formatted;
    }
    
    return mainDigits;
};

const formatTelefono = (value) => {
    // Eliminar todo lo que no sea número
    const numbers = value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    const limited = numbers.slice(0, 10);
    
    // Aplicar formato X XXXX XXXX
    if (limited.length <= 1) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 1)} ${limited.slice(1)}`;
    return `${limited.slice(0, 1)} ${limited.slice(1, 5)} ${limited.slice(5)}`;
};

// Component for individual worker card
function WorkerCard({ worker, onEdit, onDelete }) {
    const [showDocuments, setShowDocuments] = useState(false);

    const getStatusClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'activo':
            case 'disponible': return 'status-active';
            case 'inactivo':
            case 'de vacaciones': return 'status-inactive';
            case 'suspendido':
            case 'con licencia médica': return 'status-suspended';
            default: return 'bg-secondary';
        }
    };

    // Mapear estados antiguos a nuevos para retrocompatibilidad
    const getDisplayStatus = (estado) => {
        const statusMap = {
            'activo': 'Disponible',
            'inactivo': 'De Vacaciones',
            'suspendido': 'Con Licencia Médica'
        };
        return statusMap[estado.toLowerCase()] || estado;
    };

    const documentos = Array.isArray(worker.documentos) ? worker.documentos : [];

    return React.createElement('div', { className: 'col-md-6 col-lg-4 mb-3' },
        React.createElement('div', { className: 'card worker-card h-100' },
            React.createElement('div', { className: 'card-body d-flex flex-column' },
                React.createElement('div', { className: 'd-flex justify-content-between align-items-start mb-2' },
                    React.createElement('h5', { className: 'card-title mb-0' }, worker.nombre),
                    React.createElement('span', { 
                        className: `badge status-badge ${getStatusClass(worker.estado)}` 
                    }, getDisplayStatus(worker.estado))
                ),
                React.createElement('p', { className: 'card-text text-muted mb-2' },
                    React.createElement('i', { className: 'fas fa-id-card me-2' }),
                    `Cédula: ${worker.cedula}`
                ),
                React.createElement('p', { className: 'card-text text-muted mb-2' },
                    React.createElement('i', { className: 'fas fa-briefcase me-2' }),
                    `Cargo: ${worker.cargo}`
                ),
                React.createElement('p', { className: 'card-text text-muted mb-2' },
                    React.createElement('i', { className: 'fas fa-clock me-2' }),
                    `Turno: ${worker.turno}`
                ),
                React.createElement('p', { className: 'card-text text-muted mb-3' },
                    React.createElement('i', { className: 'fas fa-phone me-2' }),
                    worker.telefono
                ),
                React.createElement('div', { className: 'mt-auto' },
                    documentos.length > 0 && React.createElement('div', { className: 'mb-3' },
                        React.createElement('button', {
                            className: 'btn btn-outline-secondary btn-sm w-100',
                            onClick: () => setShowDocuments(!showDocuments)
                        },
                            React.createElement('i', { className: 'fas fa-file-alt me-2' }),
                            `Ver Documentos (${documentos.length})`,
                            React.createElement('i', { className: `fas fa-chevron-${showDocuments ? 'up' : 'down'} ms-2` })
                        ),
                        showDocuments && React.createElement('div', { className: 'list-group mt-2' },
                            documentos.map((doc, index) => 
                                React.createElement('a', {
                                    key: index,
                                    href: doc.url,
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                    className: 'list-group-item list-group-item-action d-flex justify-content-between align-items-center'
                                },
                                    React.createElement('span', { className: 'text-truncate' },
                                        React.createElement('i', { className: 'fas fa-file-pdf me-2 text-danger' }),
                                        doc.nombre
                                    ),
                                    doc.fecha && React.createElement('small', { className: 'text-muted' }, new Date(doc.fecha).toLocaleDateString())
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'd-flex gap-2' },
                        React.createElement('button', {
                            className: 'btn btn-outline-primary btn-sm flex-fill',
                            onClick: () => onEdit(worker)
                        },
                            React.createElement('i', { className: 'fas fa-edit me-1' }),
                            'Editar'
                        ),
                        React.createElement('button', {
                            className: 'btn btn-outline-danger btn-sm',
                            onClick: () => onDelete(worker.id)
                        },
                            React.createElement('i', { className: 'fas fa-trash' })
                        )
                    )
                )
            )
        )
    );
}

// Modal component for adding/editing workers
function WorkerModal({ show, onHide, worker, onSave }) {
    const [formData, setFormData] = useState({
        nombre: '',
        cedula: '',
        cargo: '',
        turno: '',
        estado: 'Disponible',
        telefono: '',
        documentos: []
    });
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (worker) {
            // Mapear estados antiguos a nuevos
            const normalizeStatus = (estado) => {
                const statusMap = {
                    'activo': 'Disponible',
                    'inactivo': 'De Vacaciones',
                    'suspendido': 'Con Licencia Médica'
                };
                return statusMap[estado.toLowerCase()] || estado;
            };

            setFormData({
                nombre: worker.nombre || '',
                cedula: formatCedula(worker.cedula || ''),
                cargo: worker.cargo || '',
                turno: worker.turno || '',
                estado: normalizeStatus(worker.estado || 'Disponible'),
                telefono: formatTelefono(worker.telefono || ''),
                documentos: Array.isArray(worker.documentos) ? worker.documentos : []
            });
        } else {
            setFormData({
                nombre: '',
                cedula: '',
                cargo: '',
                turno: '',
                estado: 'Disponible',
                telefono: '',
                documentos: []
            });
        }
        setFiles([]);
        setIsUploading(false);
    }, [worker, show]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveDocument = (indexToRemove) => {
        if (confirm('¿Está seguro de que desea eliminar este documento? La eliminación será permanente al guardar.')) {
            setFormData(prev => ({
                ...prev,
                documentos: prev.documentos.filter((_, index) => index !== indexToRemove)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        let finalWorkerData = { ...formData };

        if (files.length > 0) {
            try {
                const uploadedDocs = [];
                for (const file of files) {
                    const sanitizedCedula = (formData.cedula || 'sin-cedula').replace(/[^a-zA-Z0-9.-]/g, '_');
                    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `${sanitizedCedula}_${Date.now()}_${sanitizedFileName}`;
                    
                    const { data: uploadData, error: uploadError } = await supabaseClient
                        .storage
                        .from('documentos_trabajadores')
                        .upload(fileName, file, { upsert: true, contentType: file.type });

                    if (uploadError) {
                        alert(`Error al subir ${file.name}: ${uploadError.message}`);
                        continue;
                    }

                    const { data: urlData } = supabaseClient.storage.from('documentos_trabajadores').getPublicUrl(uploadData.path);
                    
                    uploadedDocs.push({
                        url: urlData.publicUrl,
                        nombre: file.name,
                        fecha: new Date().toISOString()
                    });
                }
                finalWorkerData.documentos = [...(finalWorkerData.documentos || []), ...uploadedDocs];
            } catch (error) {
                console.error('Excepción al subir archivos:', error);
                alert('Error inesperado al subir los documentos.');
                setIsUploading(false);
                return;
            }
        }

        await onSave(finalWorkerData);
        setIsUploading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        
        // Aplicar formato según el campo
        if (name === 'cedula') {
            // Permitir borrar el guion
            // Si el usuario está borrando y el último carácter es '-', quitarlo
            if (value.endsWith('-') && value.length < formData.cedula.length) {
                formattedValue = value.slice(0, -1);
            } else {
                formattedValue = formatCedula(value);
            }
        } else if (name === 'telefono') {
            formattedValue = formatTelefono(value);
        }
        
        setFormData({
            ...formData,
            [name]: formattedValue
        });
    };

    if (!show) return null;

    return React.createElement('div', { 
        className: 'modal show d-block',
        style: { backgroundColor: 'rgba(0,0,0,0.5)' }
    },
        React.createElement('div', { className: 'modal-dialog modal-lg' },
            React.createElement('div', { className: 'modal-content' },
                React.createElement('div', { className: 'modal-header' },
                    React.createElement('h5', { className: 'modal-title' },
                        worker ? 'Editar Trabajador' : 'Agregar Nuevo Trabajador'
                    ),
                    React.createElement('button', { type: 'button', className: 'btn-close btn-close-white', onClick: onHide })
                ),
                React.createElement('form', { onSubmit: handleSubmit },
                    React.createElement('div', { className: 'modal-body' },
                        React.createElement('div', { className: 'row' },
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control',
                                        id: 'nombre',
                                        name: 'nombre',
                                        value: formData.nombre,
                                        onChange: handleChange,
                                        required: true,
                                        placeholder: 'Nombre completo'
                                    }),
                                    React.createElement('label', { htmlFor: 'nombre' }, 'Nombre Completo')
                                )
                            ),
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control',
                                        id: 'cedula',
                                        name: 'cedula',
                                        value: formData.cedula,
                                        onChange: handleChange,
                                        required: true,
                                        placeholder: 'Cédula'
                                        // Removido maxLength para permitir la K
                                    }),
                                    React.createElement('label', { htmlFor: 'cedula' }, 'Cédula (XX.XXX.XXX-X o XX.XXX.XXX-K)')
                                )
                            ),
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('select', {
                                        className: 'form-select',
                                        id: 'cargo',
                                        name: 'cargo',
                                        value: formData.cargo,
                                        onChange: handleChange,
                                        required: true
                                    },
                                        React.createElement('option', { value: '' }, 'Seleccionar cargo'),
                                        React.createElement('option', { value: 'Supervisor' }, 'Supervisor'),
                                        React.createElement('option', { value: 'Guardia' }, 'Guardia'),
                                        React.createElement('option', { value: 'Coordinador' }, 'Coordinador'),
                                        React.createElement('option', { value: 'Vigilante' }, 'Vigilante')
                                    ),
                                    React.createElement('label', { htmlFor: 'cargo' }, 'Cargo')
                                )
                            ),
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('select', {
                                        className: 'form-select',
                                        id: 'turno',
                                        name: 'turno',
                                        value: formData.turno,
                                        onChange: handleChange,
                                        required: true
                                    },
                                        React.createElement('option', { value: '' }, 'Seleccionar turno'),
                                        React.createElement('option', { value: 'Diurno' }, 'Diurno'),
                                        React.createElement('option', { value: 'Nocturno' }, 'Nocturno'),
                                        React.createElement('option', { value: 'Mixto' }, 'Mixto')
                                    ),
                                    React.createElement('label', { htmlFor: 'turno' }, 'Turno')
                                )
                            ),
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('select', {
                                        className: 'form-select',
                                        id: 'estado',
                                        name: 'estado',
                                        value: formData.estado,
                                        onChange: handleChange,
                                        required: true
                                    },
                                        React.createElement('option', { value: 'Disponible' }, 'Disponible'),
                                        React.createElement('option', { value: 'De Vacaciones' }, 'De Vacaciones'),
                                        React.createElement('option', { value: 'Con Licencia Médica' }, 'Con Licencia Médica')
                                    ),
                                    React.createElement('label', { htmlFor: 'estado' }, 'Estado')
                                )
                            ),
                            React.createElement('div', { className: 'col-md-6 mb-3' },
                                React.createElement('div', { className: 'form-floating' },
                                    React.createElement('input', {
                                        type: 'tel',
                                        className: 'form-control',
                                        id: 'telefono',
                                        name: 'telefono',
                                        value: formData.telefono,
                                        onChange: handleChange,
                                        required: true,
                                        placeholder: 'Teléfono',
                                        maxLength: 11 // X XXXX XXXX = 11 caracteres
                                    }),
                                    React.createElement('label', { htmlFor: 'telefono' }, 'Teléfono (X XXXX XXXX)')
                                )
                            ),
                            React.createElement('div', { className: 'col-12 mb-3' },
                                React.createElement('label', { htmlFor: 'documento', className: 'form-label' }, 'Subir Nuevos Documentos (PDF)'),
                                React.createElement('input', {
                                    type: 'file',
                                    className: 'form-control',
                                    id: 'documento',
                                    accept: '.pdf',
                                    multiple: true,
                                    onChange: handleFileChange
                                }),
                                files.length > 0 && React.createElement('small', { className: 'd-block mt-2 text-success' }, `${files.length} archivo(s) nuevo(s) para subir.`)
                            ),
                            formData.documentos.length > 0 && React.createElement('div', { className: 'col-12 mb-3' },
                                React.createElement('label', { className: 'form-label' }, 'Documentos Actuales'),
                                React.createElement('ul', { className: 'list-group' },
                                    formData.documentos.map((doc, index) => React.createElement('li', { key: index, className: 'list-group-item d-flex justify-content-between align-items-center' },
                                        React.createElement('a', { href: doc.url, target: '_blank', rel: 'noopener noreferrer' }, doc.nombre),
                                        React.createElement('button', { type: 'button', className: 'btn btn-sm btn-outline-danger', onClick: () => handleRemoveDocument(index) },
                                            React.createElement('i', { className: 'fas fa-trash' })
                                        )
                                    ))
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'modal-footer' },
                        React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: onHide, disabled: isUploading }, 'Cancelar'),
                        React.createElement('button', { type: 'submit', className: 'btn btn-primary', disabled: isUploading }, isUploading ? 'Guardando...' : (worker ? 'Actualizar' : 'Guardar'))
                    )
                )
            )
        )
    );
}

// Main App component
function App() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [error, setError] = useState(null);

    // Fetch workers from API
    const fetchWorkers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/workers');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Workers fetched:', data); // Debug log
            setWorkers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching workers:', error);
            setError('Error al cargar los trabajadores. Por favor, intente de nuevo.');
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    // Add or update worker
    const handleSaveWorker = async (workerData) => {
        try {
            if (editingWorker) {
                // Update existing worker
                const response = await fetch(`/api/workers/${editingWorker.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workerData)
                });
                
                if (!response.ok) {
                    throw new Error('Error al actualizar el trabajador');
                }
                
                const updatedWorker = await response.json();
                setWorkers(workers.map(w => w.id === editingWorker.id ? updatedWorker : w));
            } else {
                // Add new worker
                const response = await fetch('/api/workers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workerData)
                });
                
                if (!response.ok) {
                    throw new Error('Error al crear el trabajador');
                }
                
                const newWorker = await response.json();
                setWorkers([...workers, newWorker]);
            }
            setShowModal(false);
            setEditingWorker(null);
        } catch (error) {
            console.error('Error saving worker:', error);
            alert('Error al guardar el trabajador. Por favor, intente de nuevo.');
        }
    };

    // Delete worker
    const handleDeleteWorker = async (id) => {
        if (confirm('¿Está seguro de que desea eliminar este trabajador?')) {
            try {
                const response = await fetch(`/api/workers/${id}`, { method: 'DELETE' });
                
                if (!response.ok) {
                    throw new Error('Error al eliminar el trabajador');
                }
                
                setWorkers(workers.filter(w => w.id !== id));
            } catch (error) {
                console.error('Error deleting worker:', error);
                alert('Error al eliminar el trabajador. Por favor, intente de nuevo.');
            }
        }
    };

    // Edit worker
    const handleEditWorker = (worker) => {
        setEditingWorker(worker);
        setShowModal(true);
    };

    // Filter workers based on search and status
    const filteredWorkers = workers.filter(worker => {
        const matchesSearch = worker.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            worker.cedula.includes(searchTerm) ||
                            worker.cargo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || worker.estado === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: workers.length,
        active: workers.filter(w => 
            w.estado === 'Disponible' || w.estado.toLowerCase() === 'activo'
        ).length,
        inactive: workers.filter(w => 
            w.estado === 'De Vacaciones' || w.estado.toLowerCase() === 'inactivo'
        ).length,
        suspended: workers.filter(w => 
            w.estado === 'Con Licencia Médica' || w.estado.toLowerCase() === 'suspendido'
        ).length
    };

    if (loading) {
        return React.createElement('div', { className: 'loading-spinner' },
            React.createElement('div', { className: 'spinner-border text-primary', role: 'status' },
                React.createElement('span', { className: 'visually-hidden' }, 'Cargando...')
            )
        );
    }

    if (error) {
        return React.createElement('div', { className: 'container mt-5' },
            React.createElement('div', { className: 'alert alert-danger' },
                React.createElement('h4', { className: 'alert-heading' }, 'Error'),
                React.createElement('p', null, error),
                React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: fetchWorkers
                }, 'Reintentar')
            )
        );
    }

    return React.createElement('div', { className: 'min-vh-100 bg-light' },
        // Header
        React.createElement('nav', { className: 'navbar navbar-expand-lg navbar-dark bg-primary' },
            React.createElement('div', { className: 'container' },
                React.createElement('a', { className: 'navbar-brand' },
                    React.createElement('i', { className: 'fas fa-shield-alt me-2' }),
                    'Sistema de Gestión de Trabajadores JC & Villagran'
                )
            )
        ),

        // Main content
        React.createElement('div', { className: 'container mt-4' },
            // Stats cards
            React.createElement('div', { className: 'row mb-4' },
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card stats-card text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.total),
                            React.createElement('p', { className: 'mb-0' }, 'Total Trabajadores')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card bg-success text-white text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.active),
                            React.createElement('p', { className: 'mb-0' }, 'Disponibles')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card bg-warning text-dark text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.suspended),
                            React.createElement('p', { className: 'mb-0' }, 'Con Licencia Médica')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card bg-danger text-white text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.inactive),
                            React.createElement('p', { className: 'mb-0' }, 'De Vacaciones')
                        )
                    )
                )
            ),

            // Search and filters
            React.createElement('div', { className: 'search-container' },
                React.createElement('div', { className: 'row align-items-end' },
                    React.createElement('div', { className: 'col-md-4 mb-3' },
                        React.createElement('label', { className: 'form-label' }, 'Buscar trabajador'),
                        React.createElement('input', {
                            type: 'text',
                            className: 'form-control',
                            placeholder: 'Nombre, cédula o cargo...',
                            value: searchTerm,
                            onChange: (e) => setSearchTerm(e.target.value)
                        })
                    ),
                    React.createElement('div', { className: 'col-md-3 mb-3' },
                        React.createElement('label', { className: 'form-label' }, 'Filtrar por estado'),
                        React.createElement('select', {
                            className: 'form-select',
                            value: filterStatus,
                            onChange: (e) => setFilterStatus(e.target.value)
                        },
                            React.createElement('option', { value: '' }, 'Todos'),
                            React.createElement('option', { value: 'Disponible' }, 'Disponible'),
                            React.createElement('option', { value: 'De Vacaciones' }, 'De Vacaciones'),
                            React.createElement('option', { value: 'Con Licencia Médica' }, 'Con Licencia Médica')
                        )
                    ),
                    React.createElement('div', { className: 'col-md-5 mb-3 text-end' },
                        React.createElement('button', {
                            className: 'btn btn-primary',
                            onClick: () => setShowModal(true)
                        },
                            React.createElement('i', { className: 'fas fa-plus me-2' }),
                            'Agregar Trabajador'
                        )
                    )
                )
            ),

            // Workers grid
            filteredWorkers.length === 0 ? (
                React.createElement('div', { className: 'empty-state' },
                    React.createElement('i', { className: 'fas fa-users fa-3x mb-3' }),
                    React.createElement('h4', null, 'No se encontraron trabajadores'),
                    React.createElement('p', null, 
                        workers.length === 0 
                            ? 'Agregue su primer trabajador haciendo clic en "Agregar Trabajador".'
                            : 'No hay trabajadores que coincidan con los criterios de búsqueda.'
                    )
                )
            ) : (
                React.createElement('div', { className: 'row' },
                    filteredWorkers.map(worker =>
                        React.createElement(WorkerCard, {
                            key: worker.id,
                            worker: worker,
                            onEdit: handleEditWorker,
                            onDelete: handleDeleteWorker
                        })
                    )
                )
            )
        ),

        // Modal
        React.createElement(WorkerModal, {
            show: showModal,
            onHide: () => {
                setShowModal(false);
                setEditingWorker(null);
            },
            worker: editingWorker,
            onSave: handleSaveWorker
        })
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));