import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  UserCheck, 
  Users, 
  ClipboardList, 
  GraduationCap, 
  Search,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// --- CONFIGURACIÓN DE TU FIREBASE (Extraída de tu imagen) ---
const firebaseConfig = {
  apiKey: "AIzaSyBXkSECRq9cQWCbDtkG2IgRVAMEP-T4Ruw",
  authDomain: "fraternidadescbtis291.firebaseapp.com",
  projectId: "fraternidadescbtis291",
  storageBucket: "fraternidadescbtis291.firebasestorage.app",
  messagingSenderId: "989256081963",
  appId: "1:989256081963:web:9d05e75754b9b71e94406e"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "fraternidadescbtis291";

export default function App() {
  const [user, setUser] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // 1. Autenticación Anónima (Regla 3)
  useEffect(() => {
    const login = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error de Auth:", error);
      }
    };
    login();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuchar datos en tiempo real (Regla 1 y 2)
  useEffect(() => {
    if (!user) return;

    // Usamos la ruta estricta para datos públicos según tus reglas
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'asistencias');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenamos en memoria para cumplir la Regla 2 (No queries complejas)
      const ordenados = docs.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds);
      setAsistencias(ordenados);
    }, (error) => {
      console.error("Error en Snapshot:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Función para registrar asistencia
  const registrarAsistencia = async (e) => {
    e.preventDefault();
    if (!nombre || !grupo) {
      setMensaje({ tipo: 'error', texto: 'Por favor llena todos los campos' });
      return;
    }

    setCargando(true);
    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'asistencias');
      await addDoc(colRef, {
        nombre,
        grupo,
        fecha: serverTimestamp(),
        userId: user.uid
      });
      
      setNombre('');
      setGrupo('');
      setMensaje({ tipo: 'exito', texto: '¡Asistencia registrada correctamente!' });
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar en Firebase' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap size={32} />
            <div>
              <h1 className="text-xl font-bold">CBTIS No. 291</h1>
              <p className="text-blue-100 text-sm">Sistema de Pase de Lista</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs opacity-80">ID de Sesión:</p>
            <p className="text-xs font-mono">{user?.uid || 'Iniciando...'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8">
        
        {/* Formulario de Registro */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-blue-700">
            <UserCheck size={24} />
            <h2 className="text-lg font-semibold">Registrar mi Entrada</h2>
          </div>

          <form onSubmit={registrarAsistencia} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ej. Juan Pérez López"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Grupo y Especialidad</label>
              <input 
                type="text" 
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ej. 4A - Programación"
              />
            </div>

            {mensaje.texto && (
              <div className={`p-4 rounded-xl flex items-center gap-2 ${
                mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {mensaje.tipo === 'exito' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-medium">{mensaje.texto}</span>
              </div>
            )}

            <button 
              disabled={cargando}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
                cargando ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {cargando ? 'Guardando...' : 'Confirmar Asistencia'}
            </button>
          </form>
        </section>

        {/* Listado de Asistencias */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-slate-700 px-2">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardList size={20} />
              <span>Registros de hoy</span>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
              {asistencias.length} Total
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {asistencias.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                <Users size={48} className="mx-auto mb-2 opacity-20" />
                <p>Aún no hay registros de asistencia</p>
              </div>
            ) : (
              asistencias.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{item.nombre}</h3>
                      <p className="text-xs text-slate-500">{item.grupo}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Clock size={12} />
                      {item.fecha?.seconds ? new Date(item.fecha.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="p-8 text-center text-slate-400 text-xs mt-auto">
        <p>© 2024 Proyecto Fraternidades CBTIS 291 - Desarrollado para Control Escolar</p>
      </footer>
    </div>
  );
}