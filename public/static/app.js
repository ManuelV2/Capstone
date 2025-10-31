const { useState, useEffect } = React;

// Configuración del cliente de Supabase para el frontend
const SUPABASE_URL = 'https://zeuuzbdanuthppkyqoxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldXV6YmRhbnV0aHBwa3lxb3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMTksImV4cCI6MjA3NTkzOTIxOX0.7Ko4XqG6Zk0gjGdGEKyKfLY0bLFGW_7OATdhatklKGc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones de formateo
const formatCedula = (value) => {
    // Limpiar: solo números y K
    const cleaned = value.toUpperCase().replace(/[^0-9K]/g, '');
    
    // Separar números del verificador (K o último dígito)
    const numbers = cleaned.replace(/K/g, '');
    const hasK = cleaned.includes('K');
    
    if (numbers.length === 0) return '';
    
    // Determinar verificador
    let mainDigits;
    let verificador;
    
    if (hasK) {
        // Si tiene K, todos los números son dígitos principales
        mainDigits = numbers;
        verificador = 'K';
    } else if (numbers.length > 7) {
        // Si tiene más de 7 dígitos, el último es el verificador
        mainDigits = numbers.slice(0, -1);
        verificador = numbers.slice(-1);
    } else {
        // Aún no hay verificador completo
        mainDigits = numbers;
        verificador = '';
    }
    
    const length = mainDigits.length;
    
    // Formatear según cantidad de dígitos principales
    let formatted;
    
    if (length <= 1) {
        formatted = mainDigits;
    } else if (length === 2) {
        formatted = mainDigits; // 12
    } else if (length === 3) {
        formatted = mainDigits; // 123
    } else if (length === 4) {
        formatted = `${mainDigits.slice(0, 1)}.${mainDigits.slice(1)}`; // 1.234
    } else if (length === 5) {
        formatted = `${mainDigits.slice(0, 2)}.${mainDigits.slice(2)}`; // 12.345
    } else if (length === 6) {
        formatted = `${mainDigits.slice(0, 3)}.${mainDigits.slice(3)}`; // 123.456
    } else if (length === 7) {
        // 7 dígitos: X.XXX.XXX (ejemplo: 9.101.850)
        formatted = `${mainDigits.slice(0, 1)}.${mainDigits.slice(1, 4)}.${mainDigits.slice(4)}`;
    } else if (length >= 8) {
        // 8 dígitos: XX.XXX.XXX (ejemplo: 21.522.019)
        formatted = `${mainDigits.slice(0, 2)}.${mainDigits.slice(2, 5)}.${mainDigits.slice(5, 8)}`;
    }
    
    // Agregar verificador si existe
    if (verificador) {
        return `${formatted}-${verificador}`;
    }
    
    return formatted;
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

// ============ COMPONENTES DE AUTENTICACIÓN ============

// Componente de Login (VERSIÓN CORRECTA - USA LA API)
function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guardar sesión
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            
            onLoginSuccess(data.user);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'min-vh-100 d-flex align-items-center justify-content-center bg-light' },
        React.createElement('div', { className: 'login-container' },
            React.createElement('div', { className: 'card shadow-lg' },
                React.createElement('div', { className: 'card-body p-5' },
                    React.createElement('div', { className: 'text-center mb-4' },
                        React.createElement('i', { className: 'fas fa-shield-alt fa-3x text-primary mb-3' }),
                        React.createElement('h3', null, 'JC & Villagran'),
                        React.createElement('p', { className: 'text-muted' }, 'Sistema de Gestión de Trabajadores')
                    ),
                    error && React.createElement('div', { className: 'alert alert-danger' }, error),
                    React.createElement('form', { onSubmit: handleSubmit },
                        React.createElement('div', { className: 'mb-3' },
                            React.createElement('label', { className: 'form-label' }, 'Correo Electrónico'),
                            React.createElement('input', {
                                type: 'email',
                                className: 'form-control',
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                required: true,
                                disabled: loading,
                                placeholder: 'admin@jcvillagran.cl'
                            })
                        ),
                        React.createElement('div', { className: 'mb-4' },
                            React.createElement('label', { className: 'form-label' }, 'Contraseña'),
                            React.createElement('input', {
                                type: 'password',
                                className: 'form-control',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                required: true,
                                disabled: loading,
                                placeholder: '••••••••'
                            })
                        ),
                        React.createElement('button', {
                            type: 'submit',
                            className: 'btn btn-primary w-100',
                            disabled: loading
                        }, loading ? 'Iniciando sesión...' : 'Iniciar Sesión')
                    ),
                    React.createElement('div', { className: 'text-center mt-3' },
                        React.createElement('small', { className: 'text-muted' }, 
                            'Usuario por defecto: admin@jcvillagran.cl / admin123'
                        )
                    )
                )
            )
        )
    );
}

// Componente de Gestión de Whitelist
function WhitelistPanel({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        rol: 'admin',
        activo: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/auth/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingUser 
                ? `/api/auth/users/${editingUser.id}`
                : '/api/auth/users';
            
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar');
            }

            await fetchUsers();
            setShowModal(false);
            resetForm();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
            await fetchUsers();
        } catch (error) {
            alert('Error al eliminar usuario');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            nombre: user.nombre,
            rol: user.rol,
            activo: user.activo
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            nombre: '',
            rol: 'admin',
            activo: true
        });
        setEditingUser(null);
    };

    return React.createElement('div', { className: 'container mt-4' },
        React.createElement('div', { className: 'd-flex justify-content-between align-items-center mb-4' },
            React.createElement('h3', null, 
                React.createElement('i', { className: 'fas fa-users-cog me-2' }),
                'Gestión de Accesos (Whitelist)'
            ),
            React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: onClose
            }, 
                React.createElement('i', { className: 'fas fa-arrow-left me-2' }),
                'Volver al Sistema'
            )
        ),

        React.createElement('div', { className: 'mb-3' },
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => {
                    resetForm();
                    setShowModal(true);
                }
            },
                React.createElement('i', { className: 'fas fa-plus me-2' }),
                'Agregar Usuario'
            )
        ),

        loading ? React.createElement('div', { className: 'text-center' }, 'Cargando...') :
        React.createElement('div', { className: 'table-responsive' },
            React.createElement('table', { className: 'table table-striped' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Email'),
                        React.createElement('th', null, 'Nombre'),
                        React.createElement('th', null, 'Rol'),
                        React.createElement('th', null, 'Estado'),
                        React.createElement('th', null, 'Acciones')
                    )
                ),
                React.createElement('tbody', null,
                    users.map(user => React.createElement('tr', { key: user.id },
                        React.createElement('td', null, user.email),
                        React.createElement('td', null, user.nombre),
                        React.createElement('td', null, user.rol),
                        React.createElement('td', null,
                            React.createElement('span', { 
                                className: `badge ${user.activo ? 'bg-success' : 'bg-danger'}` 
                            }, user.activo ? 'Activo' : 'Inactivo')
                        ),
                        React.createElement('td', null,
                            React.createElement('button', {
                                className: 'btn btn-sm btn-outline-primary me-2',
                                onClick: () => handleEdit(user)
                            }, React.createElement('i', { className: 'fas fa-edit' })),
                            React.createElement('button', {
                                className: 'btn btn-sm btn-outline-danger',
                                onClick: () => handleDelete(user.id)
                            }, React.createElement('i', { className: 'fas fa-trash' }))
                        )
                    ))
                )
            )
        ),

        // Modal
        showModal && React.createElement('div', { 
            className: 'modal show d-block',
            style: { backgroundColor: 'rgba(0,0,0,0.5)' }
        },
            React.createElement('div', { className: 'modal-dialog' },
                React.createElement('div', { className: 'modal-content' },
                    React.createElement('div', { className: 'modal-header' },
                        React.createElement('h5', { className: 'modal-title' },
                            editingUser ? 'Editar Usuario' : 'Nuevo Usuario'
                        ),
                        React.createElement('button', { 
                            type: 'button', 
                            className: 'btn-close',
                            onClick: () => {
                                setShowModal(false);
                                resetForm();
                            }
                        })
                    ),
                    React.createElement('form', { onSubmit: handleSave },
                        React.createElement('div', { className: 'modal-body' },
                            React.createElement('div', { className: 'mb-3' },
                                React.createElement('label', { className: 'form-label' }, 'Email'),
                                React.createElement('input', {
                                    type: 'email',
                                    className: 'form-control',
                                    value: formData.email,
                                    onChange: (e) => setFormData({...formData, email: e.target.value}),
                                    required: true
                                })
                            ),
                            React.createElement('div', { className: 'mb-3' },
                                React.createElement('label', { className: 'form-label' }, 
                                    editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'
                                ),
                                React.createElement('input', {
                                    type: 'password',
                                    className: 'form-control',
                                    value: formData.password,
                                    onChange: (e) => setFormData({...formData, password: e.target.value}),
                                    required: !editingUser
                                })
                            ),
                            React.createElement('div', { className: 'mb-3' },
                                React.createElement('label', { className: 'form-label' }, 'Nombre'),
                                React.createElement('input', {
                                    type: 'text',
                                    className: 'form-control',
                                    value: formData.nombre,
                                    onChange: (e) => setFormData({...formData, nombre: e.target.value}),
                                    required: true
                                })
                            ),
                            React.createElement('div', { className: 'mb-3' },
                                React.createElement('label', { className: 'form-label' }, 'Rol'),
                                React.createElement('select', {
                                    className: 'form-select',
                                    value: formData.rol,
                                    onChange: (e) => setFormData({...formData, rol: e.target.value})
                                },
                                    React.createElement('option', { value: 'admin' }, 'Administrador'),
                                    React.createElement('option', { value: 'user' }, 'Usuario')
                                )
                            ),
                            React.createElement('div', { className: 'form-check' },
                                React.createElement('input', {
                                    type: 'checkbox',
                                    className: 'form-check-input',
                                    checked: formData.activo,
                                    onChange: (e) => setFormData({...formData, activo: e.target.checked})
                                }),
                                React.createElement('label', { className: 'form-check-label' }, 'Usuario Activo')
                            )
                        ),
                        React.createElement('div', { className: 'modal-footer' },
                            React.createElement('button', { 
                                type: 'button', 
                                className: 'btn btn-secondary',
                                onClick: () => {
                                    setShowModal(false);
                                    resetForm();
                                }
                            }, 'Cancelar'),
                            React.createElement('button', { 
                                type: 'submit', 
                                className: 'btn btn-primary'
                            }, 'Guardar')
                        )
                    )
                )
            )
        )
    );
}

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
                                React.createElement('div', {
                                    key: index,
                                    className: 'list-group-item'
                                },
                                    React.createElement('div', { className: 'd-flex justify-content-between align-items-start' },
                                        React.createElement('div', { className: 'flex-grow-1' },
                                            React.createElement('a', {
                                                href: doc.url,
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                                className: 'd-flex align-items-center text-decoration-none mb-1'
                                            },
                                                React.createElement('i', { className: 'fas fa-file-pdf text-danger me-2' }),
                                                React.createElement('span', { className: 'fw-bold' }, doc.nombre)
                                            ),
                                            doc.fecha && React.createElement('small', { className: 'text-muted d-block' }, 
                                                `Subido: ${new Date(doc.fecha).toLocaleDateString('es-CL')}`
                                            ),
                                            // NUEVO: Mostrar recordatorio si existe
                                            doc.recordatorio && React.createElement('div', { className: 'alert alert-warning py-1 px-2 mt-2 mb-0' },
                                                React.createElement('small', { className: 'd-flex align-items-center' },
                                                    React.createElement('i', { className: 'fas fa-bell me-2' }),
                                                    React.createElement('span', null,
                                                        React.createElement('strong', null, 'Recordatorio: '),
                                                        new Date(doc.recordatorio.fechaHora).toLocaleDateString('es-CL', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    )
                                                ),
                                                doc.recordatorio.mensaje && React.createElement('small', { className: 'd-block mt-1 ms-4' },
                                                    doc.recordatorio.mensaje
                                                )
                                            )
                                        )
                                    )
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
    const [editingReminder, setEditingReminder] = useState(null); // Nuevo: índice del doc editando recordatorio

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
                cedula: worker.cedula || '', // Sin formatear al cargar
                cargo: worker.cargo || '',
                turno: worker.turno || '',
                estado: normalizeStatus(worker.estado || 'Disponible'),
                telefono: worker.telefono || '', // Sin formatear al cargar
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
            const selectedFiles = Array.from(e.target.files);
            
            // Validar que todos sean PDFs
            const invalidFiles = selectedFiles.filter(file => !file.type.includes('pdf'));
            
            if (invalidFiles.length > 0) {
                alert(`Los siguientes archivos no son PDFs y serán ignorados:\n${invalidFiles.map(f => f.name).join('\n')}`);
                
                // Filtrar solo archivos PDF válidos
                const validFiles = selectedFiles.filter(file => file.type.includes('pdf'));
                setFiles(validFiles);
            } else {
                setFiles(selectedFiles);
            }
            
            console.log(`📎 ${selectedFiles.length} archivo(s) PDF seleccionado(s) para subir`);
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

    // Función para establecer/editar recordatorio
    const handleSetReminder = (docIndex, reminderData) => {
        console.log('📝 Estableciendo recordatorio para doc index:', docIndex);
        console.log('📋 Datos del recordatorio:', reminderData);
        
        setFormData(prev => {
            const newDocuments = prev.documentos.map((doc, index) => {
                if (index === docIndex) {
                    const updatedDoc = {
                        ...doc,
                        recordatorio: reminderData
                    };
                    console.log('✅ Documento actualizado:', updatedDoc);
                    return updatedDoc;
                }
                return doc;
            });
            
            console.log('📄 Todos los documentos después de agregar recordatorio:', newDocuments);
            
            return {
                ...prev,
                documentos: newDocuments
            };
        });
        setEditingReminder(null);
    };

    // Función para eliminar recordatorio
    const handleRemoveReminder = (docIndex) => {
        console.log('🗑️ Eliminando recordatorio del doc index:', docIndex);
        
        setFormData(prev => {
            const newDocuments = prev.documentos.map((doc, index) => {
                if (index === docIndex) {
                    const { recordatorio, ...docWithoutReminder } = doc;
                    console.log('✅ Documento sin recordatorio:', docWithoutReminder);
                    return docWithoutReminder;
                }
                return doc;
            });
            
            return {
                ...prev,
                documentos: newDocuments
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        console.log('🚀 INICIANDO SUBMIT');
        console.log('📋 Estado actual de formData.documentos:', formData.documentos);

        setFormData(currentFormData => {
            console.log('📄 Documentos existentes:', currentFormData.documentos.length);
            console.log('📤 Archivos nuevos para subir:', files.length);
            console.log('🔔 Documentos con recordatorio:', 
                currentFormData.documentos.filter(d => d.recordatorio).length
            );

            const finalData = {
                nombre: currentFormData.nombre,
                cedula: formatCedula(currentFormData.cedula),
                cargo: currentFormData.cargo,
                turno: currentFormData.turno,
                estado: currentFormData.estado,
                telefono: formatTelefono(currentFormData.telefono),
                documentos: currentFormData.documentos
            };

            console.log('💾 Datos finales ANTES de subir archivos:', finalData);

            (async () => {
                let allDocuments = [...currentFormData.documentos];

                // Subir TODOS los archivos nuevos
                if (files.length > 0) {
                    console.log(`\n📤 ========================================`);
                    console.log(`📤 Subiendo ${files.length} archivo(s) PDF...`);
                    console.log(`📤 ========================================\n`);
                    
                    try {
                        const uploadPromises = files.map(async (file, index) => {
                            const fileNumber = index + 1;
                            console.log(`📄 [${fileNumber}/${files.length}] Procesando: ${file.name}`);
                            
                            const sanitizedCedula = finalData.cedula.replace(/[^a-zA-Z0-9.-]/g, '_');
                            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                            const timestamp = Date.now();
                            const fileName = `${sanitizedCedula}_${timestamp}_${index}_${sanitizedFileName}`;
                            
                            console.log(`   ⏳ Subiendo a Storage: ${fileName}`);
                            
                            const { data: uploadData, error: uploadError } = await supabaseClient
                                .storage
                                .from('documentos_trabajadores')
                                .upload(fileName, file, { 
                                    upsert: true, 
                                    contentType: file.type 
                                });

                            if (uploadError) {
                                console.error(`   ❌ Error al subir ${file.name}:`, uploadError);
                                throw new Error(`Error al subir ${file.name}: ${uploadError.message}`);
                            }

                            const { data: urlData } = supabaseClient.storage
                                .from('documentos_trabajadores')
                                .getPublicUrl(uploadData.path);
                            

                            console.log(`   ✅ [${fileNumber}/${files.length}] Subido exitosamente: ${file.name}`);
                            
                            return {
                                url: urlData.publicUrl,
                                nombre: file.name,
                                fecha: new Date().toISOString()
                            };
                        });

                        // Esperar a que TODOS los archivos se suban
                        console.log('\n⏳ Esperando a que se completen todas las subidas...\n');
                        const uploadedDocs = await Promise.all(uploadPromises);
                        
                        console.log(`\n✅ ========================================`);
                        console.log(`✅ ${uploadedDocs.length} archivo(s) subido(s) exitosamente`);
                        console.log(`✅ ========================================\n`);
                        
                        // Agregar todos los documentos nuevos a la lista
                        allDocuments = [...allDocuments, ...uploadedDocs];
                        
                    } catch (error) {
                        console.error('\n❌ Error durante la subida de archivos:', error);
                        alert(`Error al subir documentos: ${error.message}\n\nPor favor, intente de nuevo.`);
                        setIsUploading(false);
                        return;
                    }
                }

                // Actualizar con todos los documentos (existentes + nuevos)
                finalData.documentos = allDocuments;

                console.log('\n💾 ========================================');
                console.log('💾 RESUMEN FINAL:');
                console.log(`📋 Total documentos: ${finalData.documentos.length}`);
                console.log(`🔔 Documentos con recordatorio: ${finalData.documentos.filter(d => d.recordatorio).length}`);
                console.log('💾 ========================================\n');

                console.log('📤 Enviando datos al servidor...');

                // Enviar al servidor
                await onSave(finalData);
                setIsUploading(false);
                
                // Limpiar archivos seleccionados después de guardar exitosamente
                setFiles([]);
            })();

            return currentFormData;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        
        // Aplicar formato SOLO al teléfono en tiempo real
        if (name === 'telefono') {
            formattedValue = formatTelefono(value);
        }
        // La cédula NO se formatea en tiempo real, solo al guardar
        
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
        React.createElement('div', { className: 'modal-dialog modal-xl' },
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
                                    }),
                                    React.createElement('label', { htmlFor: 'cedula' }, 'Cédula')
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
                                        placeholder: 'Teléfono'
                                    }),
                                    React.createElement('label', { htmlFor: 'telefono' }, 'Teléfono')
                                )
                            ),
                            React.createElement('div', { className: 'col-12 mb-3' },
                                React.createElement('label', { htmlFor: 'documento', className: 'form-label fw-bold' }, 
                                    React.createElement('i', { className: 'fas fa-cloud-upload-alt me-2' }),
                                    'Subir Documentos (PDF)'
                                ),
                                React.createElement('input', {
                                    type: 'file',
                                    className: 'form-control',
                                    id: 'documento',
                                    accept: '.pdf,application/pdf',
                                    multiple: true,
                                    onChange: handleFileChange
                                }),
                                React.createElement('small', { className: 'text-muted d-block mt-1' },
                                    React.createElement('i', { className: 'fas fa-info-circle me-1' }),
                                    'Puedes seleccionar múltiples archivos PDF a la vez (Ctrl/Cmd + Click)'
                                ),
                                files.length > 0 && React.createElement('div', { className: 'alert alert-success mt-2 mb-0 py-2' },
                                    React.createElement('strong', null,
                                        React.createElement('i', { className: 'fas fa-check-circle me-2' }),
                                        `${files.length} archivo(s) seleccionado(s) para subir:`
                                    ),
                                    React.createElement('ul', { className: 'mb-0 mt-2 ps-4' },
                                        files.map((file, index) => 
                                            React.createElement('li', { key: index },
                                                React.createElement('i', { className: 'fas fa-file-pdf text-danger me-2' }),
                                                file.name,
                                                React.createElement('small', { className: 'text-muted ms-2' },
                                                    `(${(file.size / 1024).toFixed(2)} KB)`
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            
                            // NUEVO: Lista de documentos con recordatorios
                            formData.documentos.length > 0 && React.createElement('div', { className: 'col-12 mb-3' },
                                React.createElement('label', { className: 'form-label fw-bold' }, 
                                    React.createElement('i', { className: 'fas fa-file-alt me-2' }),
                                    'Documentos Actuales'
                                ),
                                React.createElement('div', { className: 'list-group' },
                                    formData.documentos.map((doc, index) => React.createElement('div', { 
                                        key: index, 
                                        className: 'list-group-item' 
                                    },
                                        React.createElement('div', { className: 'd-flex justify-content-between align-items-start' },
                                            React.createElement('div', { className: 'flex-grow-1' },
                                                React.createElement('div', { className: 'd-flex align-items-center mb-2' },
                                                    React.createElement('i', { className: 'fas fa-file-pdf text-danger me-2' }),
                                                    React.createElement('a', { 
                                                        href: doc.url, 
                                                        target: '_blank', 
                                                        rel: 'noopener noreferrer',
                                                        className: 'fw-bold text-decoration-none'
                                                    }, doc.nombre),
                                                    doc.fecha && React.createElement('small', { className: 'text-muted ms-2' }, 
                                                        `Subido: ${new Date(doc.fecha).toLocaleDateString()}`
                                                    )
                                                ),
                                                
                                                // Mostrar recordatorio si existe
                                                doc.recordatorio && React.createElement('div', { className: 'alert alert-info mb-2 py-2' },
                                                    React.createElement('div', { className: 'd-flex justify-content-between align-items-center' },
                                                        React.createElement('div', null,
                                                            React.createElement('i', { className: 'fas fa-bell me-2' }),
                                                            React.createElement('strong', null, 'Recordatorio: '),
                                                            new Date(doc.recordatorio.fechaHora).toLocaleString('es-CL'),
                                                            doc.recordatorio.mensaje && React.createElement('div', { className: 'ms-4 small' },
                                                                React.createElement('i', { className: 'fas fa-comment-dots me-1' }),
                                                                doc.recordatorio.mensaje
                                                            )
                                                        ),
                                                        React.createElement('button', {
                                                            type: 'button',
                                                            className: 'btn btn-sm btn-outline-danger',
                                                            onClick: () => handleRemoveReminder(index),
                                                            title: 'Eliminar recordatorio'
                                                        }, React.createElement('i', { className: 'fas fa-times' }))
                                                    )
                                                ),

                                                // Formulario para editar/agregar recordatorio
                                                editingReminder === index && React.createElement(ReminderForm, {
                                                    docIndex: index,
                                                    docName: doc.nombre,
                                                    existingReminder: doc.recordatorio,
                                                    onSave: handleSetReminder,
                                                    onCancel: () => setEditingReminder(null)
                                                })
                                            ),
                                            
                                            React.createElement('div', { className: 'btn-group' },
                                                React.createElement('button', {
                                                    type: 'button',
                                                    className: `btn btn-sm ${doc.recordatorio ? 'btn-warning' : 'btn-outline-primary'}`,
                                                    onClick: () => setEditingReminder(index),
                                                    title: doc.recordatorio ? 'Editar recordatorio' : 'Agregar recordatorio'
                                                }, React.createElement('i', { className: 'fas fa-bell' })),
                                                React.createElement('button', {
                                                    type: 'button',
                                                    className: 'btn btn-sm btn-outline-danger',
                                                    onClick: () => handleRemoveDocument(index),
                                                    title: 'Eliminar documento'
                                                }, React.createElement('i', { className: 'fas fa-trash' }))
                                            )
                                        )
                                    ))
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'modal-footer' },
                        React.createElement('button', { 
                            type: 'button', 
                            className: 'btn btn-secondary', 
                            onClick: onHide, 
                            disabled: isUploading 
                        }, 'Cancelar'),
                        React.createElement('button', { 
                            type: 'submit', 
                            className: 'btn btn-primary', 
                            disabled: isUploading 
                        }, 
                            isUploading ? (
                                React.createElement('span', null,
                                    React.createElement('span', { 
                                        className: 'spinner-border spinner-border-sm me-2',
                                        role: 'status',
                                        'aria-hidden': 'true'
                                    }),
                                    files.length > 0 ? `Subiendo ${files.length} archivo(s)...` : 'Guardando...'
                                )
                            ) : (worker ? 'Actualizar' : 'Guardar')
                        )
                    )
                )
            )
        )
    );
}

// NUEVO: Componente para formulario de recordatorio
function ReminderForm({ docIndex, docName, existingReminder, onSave, onCancel }) {
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [reminderMessage, setReminderMessage] = useState('');

    useEffect(() => {
        if (existingReminder) {
            const dt = new Date(existingReminder.fechaHora);
            setReminderDate(dt.toISOString().split('T')[0]);
            setReminderTime(dt.toTimeString().slice(0, 5));
            setReminderMessage(existingReminder.mensaje || '');
        } else {
            // Valores por defecto: 1 semana desde hoy a las 9:00 AM
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            setReminderDate(defaultDate.toISOString().split('T')[0]);
            setReminderTime('09:00');
            setReminderMessage(`Renovar: ${docName}`);
        }
    }, [existingReminder, docName]);

    const handleSaveClick = () => {
        // Validar que fecha y hora estén completas
        if (!reminderDate || !reminderTime) {
            alert('Por favor, selecciona fecha y hora para el recordatorio');
            return;
        }

        const fechaHora = new Date(`${reminderDate}T${reminderTime}`);
        
        onSave(docIndex, {
            activo: true,
            fechaHora: fechaHora.toISOString(),
            mensaje: reminderMessage.trim()
        });
    };

    return React.createElement('div', { className: 'card mt-2 bg-light' },
        React.createElement('div', { className: 'card-body' },
            React.createElement('h6', { className: 'card-title' },
                React.createElement('i', { className: 'fas fa-bell me-2' }),
                existingReminder ? 'Editar Recordatorio' : 'Agregar Recordatorio'
            ),
            React.createElement('div', { className: 'row g-2' },
                React.createElement('div', { className: 'col-md-4' },
                    React.createElement('label', { className: 'form-label small' }, 'Fecha'),
                    React.createElement('input', {
                        type: 'date',
                        className: 'form-control form-control-sm',
                        value: reminderDate,
                        onChange: (e) => setReminderDate(e.target.value),
                        required: true,
                        min: new Date().toISOString().split('T')[0]
                    })
                ),
                React.createElement('div', { className: 'col-md-3' },
                    React.createElement('label', { className: 'form-label small' }, 'Hora'),
                    React.createElement('input', {
                        type: 'time',
                        className: 'form-control form-control-sm',
                        value: reminderTime,
                        onChange: (e) => setReminderTime(e.target.value),
                        required: true
                    })
                ),
                React.createElement('div', { className: 'col-md-5' },
                    React.createElement('label', { className: 'form-label small' }, 'Mensaje (opcional)'),
                    React.createElement('input', {
                        type: 'text',
                        className: 'form-control form-control-sm',
                        value: reminderMessage,
                        onChange: (e) => setReminderMessage(e.target.value),
                        placeholder: 'Ej: Renovar certificado'
                    })
                )
            ),
            React.createElement('div', { className: 'mt-2 d-flex gap-2' },
                React.createElement('button', {
                    type: 'button',
                    className: 'btn btn-sm btn-success',
                    onClick: handleSaveClick
                }, 
                    React.createElement('i', { className: 'fas fa-check me-1' }),
                    'Guardar Recordatorio'
                ),
                React.createElement('button', {
                    type: 'button',
                    className: 'btn btn-sm btn-secondary',
                    onClick: onCancel
                }, 'Cancelar')
            )
        )
    );
}

// Main App component
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showWhitelist, setShowWhitelist] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [error, setError] = useState(null);

    // Verificar autenticación al cargar
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            try {
                setCurrentUser(JSON.parse(userData));
                setIsAuthenticated(true);
            } catch (error) {
                handleLogout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    // Cargar workers solo si está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            fetchWorkers();
        }
    }, [isAuthenticated]);

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

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowWhitelist(false);
    };

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

    // Si está cargando la autenticación inicial
    if (loading && !isAuthenticated) {
        return React.createElement('div', { className: 'loading-spinner' },
            React.createElement('div', { className: 'spinner-border text-primary', role: 'status' },
                React.createElement('span', { className: 'visually-hidden' }, 'Cargando...')
            )
        );
    }

    // Si no está autenticado, mostrar login
    if (!isAuthenticated) {
        return React.createElement(LoginPage, { onLoginSuccess: handleLoginSuccess });
    }

    // Si está en panel de whitelist
    if (showWhitelist) {
        return React.createElement(WhitelistPanel, { 
            onClose: () => setShowWhitelist(false) 
        });
    }

    // Si está cargando workers
    if (loading) {
        return React.createElement('div', { className: 'loading-spinner' },
            React.createElement('div', { className: 'spinner-border text-primary', role: 'status' },
                React.createElement('span', { className: 'visually-hidden' }, 'Cargando trabajadores...')
            )
        );
    }

    return React.createElement('div', { className: 'min-vh-100 bg-light' },
        // Header (modificado con opción de logout y whitelist)
        React.createElement('nav', { className: 'navbar navbar-expand-lg navbar-dark bg-primary' },
            React.createElement('div', { className: 'container' },
                React.createElement('a', { className: 'navbar-brand' },
                    React.createElement('i', { className: 'fas fa-shield-alt me-2' }),
                    'Sistema de Gestión de Trabajadores JC & Villagran'
                ),
                React.createElement('div', { className: 'd-flex gap-2' },
                    React.createElement('span', { className: 'navbar-text text-white me-3' },
                        React.createElement('i', { className: 'fas fa-user me-2' }),
                        currentUser?.nombre
                    ),
                    React.createElement('button', {
                        className: 'btn btn-outline-light btn-sm me-2',
                        onClick: () => setShowWhitelist(true)
                    },
                        React.createElement('i', { className: 'fas fa-users-cog me-2' }),
                        'Whitelist'
                    ),
                    React.createElement('button', {
                        className: 'btn btn-outline-light btn-sm',
                        onClick: handleLogout
                    },
                        React.createElement('i', { className: 'fas fa-sign-out-alt me-2' }),
                        'Salir'
                    )
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