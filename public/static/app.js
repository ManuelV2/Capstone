const { useState, useEffect } = React;

// Component for individual worker card
function WorkerCard({ worker, onEdit, onDelete }) {
    const getStatusClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'activo': return 'status-active';
            case 'inactivo': return 'status-inactive';
            case 'suspendido': return 'status-suspended';
            default: return 'bg-secondary';
        }
    };

    return React.createElement('div', { className: 'col-md-6 col-lg-4 mb-3' },
        React.createElement('div', { className: 'card worker-card h-100' },
            React.createElement('div', { className: 'card-body' },
                React.createElement('div', { className: 'd-flex justify-content-between align-items-start mb-2' },
                    React.createElement('h5', { className: 'card-title mb-0' }, worker.nombre),
                    React.createElement('span', { 
                        className: `badge status-badge ${getStatusClass(worker.estado)}` 
                    }, worker.estado)
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
    );
}

// Modal component for adding/editing workers
function WorkerModal({ show, onHide, worker, onSave }) {
    const [formData, setFormData] = useState({
        nombre: '',
        cedula: '',
        cargo: '',
        turno: '',
        estado: 'Activo',
        telefono: ''
    });

    useEffect(() => {
        if (worker) {
            setFormData(worker);
        } else {
            setFormData({
                nombre: '',
                cedula: '',
                cargo: '',
                turno: '',
                estado: 'Activo',
                telefono: ''
            });
        }
    }, [worker, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!show) return null;

    return React.createElement('div', { 
        className: 'modal show d-block',
        style: { backgroundColor: 'rgba(0,0,0,0.5)' }
    },
        React.createElement('div', { className: 'modal-dialog' },
            React.createElement('div', { className: 'modal-content' },
                React.createElement('div', { className: 'modal-header' },
                    React.createElement('h5', { className: 'modal-title' },
                        worker ? 'Editar Trabajador' : 'Agregar Nuevo Trabajador'
                    ),
                    React.createElement('button', {
                        type: 'button',
                        className: 'btn-close btn-close-white',
                        onClick: onHide
                    })
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
                                        React.createElement('option', { value: 'Activo' }, 'Activo'),
                                        React.createElement('option', { value: 'Inactivo' }, 'Inactivo'),
                                        React.createElement('option', { value: 'Suspendido' }, 'Suspendido')
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
                            )
                        )
                    ),
                    React.createElement('div', { className: 'modal-footer' },
                        React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-secondary',
                            onClick: onHide
                        }, 'Cancelar'),
                        React.createElement('button', {
                            type: 'submit',
                            className: 'btn btn-primary'
                        }, worker ? 'Actualizar' : 'Guardar')
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

    // Fetch workers from API
    const fetchWorkers = async () => {
        try {
            const response = await fetch('/api/workers');
            const data = await response.json();
            setWorkers(data);
        } catch (error) {
            console.error('Error fetching workers:', error);
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
                const updatedWorker = await response.json();
                setWorkers(workers.map(w => w.id === editingWorker.id ? updatedWorker : w));
            } else {
                // Add new worker
                const response = await fetch('/api/workers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workerData)
                });
                const newWorker = await response.json();
                setWorkers([...workers, newWorker]);
            }
            setShowModal(false);
            setEditingWorker(null);
        } catch (error) {
            console.error('Error saving worker:', error);
        }
    };

    // Delete worker
    const handleDeleteWorker = async (id) => {
        if (confirm('¿Está seguro de que desea eliminar este trabajador?')) {
            try {
                await fetch(`/api/workers/${id}`, { method: 'DELETE' });
                setWorkers(workers.filter(w => w.id !== id));
            } catch (error) {
                console.error('Error deleting worker:', error);
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
        active: workers.filter(w => w.estado === 'Activo').length,
        inactive: workers.filter(w => w.estado === 'Inactivo').length,
        suspended: workers.filter(w => w.estado === 'Suspendido').length
    };

    if (loading) {
        return React.createElement('div', { className: 'loading-spinner' },
            React.createElement('div', { className: 'spinner-border text-primary', role: 'status' },
                React.createElement('span', { className: 'visually-hidden' }, 'Cargando...')
            )
        );
    }

    return React.createElement('div', { className: 'min-vh-100 bg-light' },
        // Header
        React.createElement('nav', { className: 'navbar navbar-expand-lg navbar-dark bg-primary' },
            React.createElement('div', { className: 'container' },
                React.createElement('a', { className: 'navbar-brand' },
                    React.createElement('i', { className: 'fas fa-shield-alt me-2' }),
                    'Sistema de Gestión de Trabajadores'
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
                            React.createElement('p', { className: 'mb-0' }, 'Activos')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card bg-warning text-dark text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.suspended),
                            React.createElement('p', { className: 'mb-0' }, 'Suspendidos')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-md-3 mb-3' },
                    React.createElement('div', { className: 'card bg-danger text-white text-center' },
                        React.createElement('div', { className: 'card-body' },
                            React.createElement('h4', null, stats.inactive),
                            React.createElement('p', { className: 'mb-0' }, 'Inactivos')
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
                            React.createElement('option', { value: 'Activo' }, 'Activo'),
                            React.createElement('option', { value: 'Inactivo' }, 'Inactivo'),
                            React.createElement('option', { value: 'Suspendido' }, 'Suspendido')
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
                    React.createElement('p', null, 'No hay trabajadores que coincidan con los criterios de búsqueda.')
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