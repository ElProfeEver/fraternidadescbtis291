import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Search,
  Menu,
  X
} from 'lucide-react';

/**
 * Aplicación de Gestión de Citas Médicas / Servicios
 * Esta versión incluye todos los estilos necesarios internamente para evitar errores de carga.
 */
const App = () => {
  // Estado para las citas
  const [citas, setCitas] = useState(() => {
    const guardadas = localStorage.getItem('citas_data');
    return guardadas ? JSON.parse(guardadas) : [];
  });

  // Estado para el formulario
  const [nuevaCita, setNuevaCita] = useState({
    paciente: '',
    fecha: '',
    hora: '',
    telefono: '',
    sintomas: ''
  });

  const [filtro, setFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Guardar en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem('citas_data', JSON.stringify(citas));
  }, [citas]);

  const manejarCambio = (e) => {
    setNuevaCita({
      ...nuevaCita,
      [e.target.name]: e.target.value
    });
  };

  const agregarCita = (e) => {
    e.preventDefault();
    if (Object.values(nuevaCita).some(val => val === '')) {
      return; // Evitar campos vacíos
    }
    
    const citaConId = { ...nuevaCita, id: Date.now(), completada: false };
    setCitas([...citas, citaConId]);
    setNuevaCita({ paciente: '', fecha: '', hora: '', telefono: '', sintomas: '' });
    setMostrarFormulario(false);
  };

  const eliminarCita = (id) => {
    setCitas(citas.filter(cita => cita.id !== id));
  };

  const toggleCompletada = (id) => {
    setCitas(citas.map(cita => 
      cita.id === id ? { ...cita, completada: !cita.completada } : cita
    ));
  };

  const citasFiltradas = citas.filter(cita => 
    cita.paciente.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calendar size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">CitaMed Pro</h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
             >
              {mostrarFormulario ? <X size={18} /> : <Plus size={18} />}
              <span className="hidden sm:inline">{mostrarFormulario ? 'Cerrar' : 'Nueva Cita'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Sección de Bienvenida y Buscador */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Panel de Control</h2>
            <p className="text-slate-500 mt-1">Gestiona tus pacientes y horarios eficientemente.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario (Columna Lateral o Modal) */}
          <section className={`${mostrarFormulario ? 'block' : 'hidden'} lg:block col-span-1`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Registrar Cita
              </h3>
              <form onSubmit={agregarCita} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre del Paciente</label>
                  <input 
                    name="paciente" 
                    value={nuevaCita.paciente} 
                    onChange={manejarCambio}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white transition-colors outline-none" 
                    placeholder="Ej. Juan Pérez" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha</label>
                    <input 
                      type="date" 
                      name="fecha" 
                      value={nuevaCita.fecha} 
                      onChange={manejarCambio}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hora</label>
                    <input 
                      type="time" 
                      name="hora" 
                      value={nuevaCita.hora} 
                      onChange={manejarCambio}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    value={nuevaCita.telefono} 
                    onChange={manejarCambio}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" 
                    placeholder="000-000-000" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Síntomas / Notas</label>
                  <textarea 
                    name="sintomas" 
                    value={nuevaCita.sintomas} 
                    onChange={manejarCambio}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none h-24 resize-none" 
                    placeholder="Describa el motivo..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Confirmar Registro
                </button>
              </form>
            </div>
          </section>

          {/* Listado de Citas */}
          <section className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <Clock className="text-blue-600" size={20} />
                Próximas Citas ({citasFiltradas.length})
              </h3>
            </div>

            {citasFiltradas.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-16 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={48} strokeWidth={1} className="mb-4" />
                <p className="text-lg font-medium">No hay citas programadas</p>
                <p className="text-sm">Las citas que agregues aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {citasFiltradas.map(cita => (
                  <div 
                    key={cita.id} 
                    className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group ${cita.completada ? 'opacity-60 border-green-100' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${cita.completada ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {cita.paciente.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`font-bold text-slate-900 ${cita.completada ? 'line-through text-slate-400' : ''}`}>
                            {cita.paciente}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <Calendar size={12} /> {cita.fecha}
                            </span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {cita.hora}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => toggleCompletada(cita.id)}
                          className={`p-2 rounded-lg transition-colors ${cita.completada ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:bg-slate-100 hover:text-green-600'}`}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => eliminarCita(cita.id)}
                          className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{cita.telefono}</span>
                      </div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                        "{cita.sintomas}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;