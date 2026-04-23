import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
<<<<<<< HEAD
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
=======
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  ShieldCheck, 
  LogOut, 
  Calendar as CalendarIcon,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
// Estos valores conectan tu App con la base de datos que mostraste en las capturas
>>>>>>> d533311 (Done)
const firebaseConfig = {
  apiKey: "AIzaSyBXkSECRq9cQWCbDtkG2IgRVAMEP-T4Ruw",
  authDomain: "fraternidadescbtis291.firebaseapp.com",
  projectId: "fraternidadescbtis291",
  storageBucket: "fraternidadescbtis291.firebasestorage.app",
  messagingSenderId: "989256081963",
  appId: "1:989256081963:web:9d05e75754b9b71e94406e"
};

<<<<<<< HEAD
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
=======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'sistema-asistencia-cbtis';

// --- ROLES Y FRATERNIDADES ---
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'fuego': { pass: 'fire', frat: 'fire', name: 'Comando Fuego' },
  'agua': { pass: 'water', frat: 'water', name: 'Comando Agua' },
  'tierra': { pass: 'earth', frat: 'earth', name: 'Comando Tierra' },
  'aire': { pass: 'air', frat: 'air', name: 'Comando Aire' }
};

const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-orange-600', border: 'border-orange-600', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-600', border: 'border-blue-600', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-emerald-700', border: 'border-emerald-700', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-sky-400', border: 'border-sky-400', icon: <Wind size={20} /> }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [error, setError] = useState('');
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Autenticación inicial
  useEffect(() => {
    const start = async () => {
      await signInAnonymously(auth);
    };
    start();
    onAuthStateChanged(auth, setUser);
    
    const saved = localStorage.getItem('cbtis_session');
    if (saved) setSession(JSON.parse(saved));
  }, []);

  // Escucha de datos en tiempo real
  useEffect(() => {
    if (!user || !session) return;

    // Alumnos
    const unsubStudents = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'students'),
      (snap) => {
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    // Asistencia del día
    const unsubAttendance = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'attendance'),
      (snap) => {
        const map = {};
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.date === date) map[data.studentId] = true;
        });
        setAttendance(map);
      }
    );

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [user, session, date]);
>>>>>>> d533311 (Done)

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
<<<<<<< HEAD
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
=======
    const found = USERS_DB[loginForm.user.toLowerCase()];
    if (found && found.pass === loginForm.pass) {
      const userSession = { id: loginForm.user.toLowerCase(), ...found };
      setSession(userSession);
      localStorage.setItem('cbtis_session', JSON.stringify(userSession));
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  const toggleAttendance = async (studentId) => {
    const docId = `${date}_${studentId}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'attendance', docId);
    
    if (attendance[studentId]) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { studentId, date, timestamp: new Date().toISOString() });
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('cbtis_session');
  };

  // Filtrado de alumnos por fraternidad
  const filteredStudents = useMemo(() => {
    if (!session) return [];
    if (session.frat === 'all') return students;
    return students.filter(s => s.fraternity === session.frat);
  }, [students, session]);

  // Pantalla de Login
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg">
              <Users size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-800 mb-2">CBTIS 291</h1>
          <p className="text-center text-slate-500 font-medium mb-8">Sistema de Fraternidades</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase ml-1 mb-1">Usuario</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={loginForm.user}
                onChange={e => setLoginForm({...loginForm, user: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase ml-1 mb-1">Contraseña</label>
              <input 
                type="password" 
                className="w-full p-4 bg-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={loginForm.pass}
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              />
            </div>
            {error && <p className="text-red-500 text-center text-xs font-bold uppercase">{error}</p>}
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
              Entrar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Interfaz Principal
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="font-black text-sm uppercase leading-none">{session.name}</h2>
              <span className="text-[10px] font-bold text-slate-400">Panel de Control</span>
            </div>
>>>>>>> d533311 (Done)
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
<<<<<<< HEAD
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
=======
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Controles */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="text-indigo-600" />
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-xl font-black bg-transparent outline-none cursor-pointer"
            />
          </div>
          <div className="flex gap-4">
             <div className="text-center px-6 border-r border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Alumnos</p>
                <p className="text-2xl font-black">{filteredStudents.length}</p>
             </div>
             <div className="text-center px-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase">Presentes</p>
                <p className="text-2xl font-black text-indigo-600">{Object.keys(attendance).length}</p>
             </div>
          </div>
        </div>

        {/* Rejilla de Fraternidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FRATERNITIES.filter(f => session.frat === 'all' || f.id === session.frat).map(frat => (
            <div key={frat.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col min-h-[500px] overflow-hidden">
              <div className={`${frat.color} p-5 text-white flex items-center justify-between`}>
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm">
                  {frat.icon} {frat.name}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">
                  {filteredStudents.filter(s => s.fraternity === frat.id).length}
                </div>
              </div>
              
              <div className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[600px] bg-slate-50/50">
                {filteredStudents.filter(s => s.fraternity === frat.id).length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-slate-300 text-xs italic">
                    Sin alumnos registrados
                  </div>
                ) : (
                  filteredStudents
                    .filter(s => s.fraternity === frat.id)
                    .sort((a,b) => a.name.localeCompare(b.name))
                    .map(student => {
                      const present = attendance[student.id];
                      return (
                        <button
                          key={student.id}
                          onClick={() => toggleAttendance(student.id)}
                          className={`w-full group relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                            present 
                              ? `${frat.border} bg-white shadow-md translate-y-[-2px]` 
                              : 'border-transparent bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            present ? frat.color : 'bg-slate-100'
                          }`}>
                            {present ? <UserCheck className="text-white" size={20}/> : <span className="text-slate-400 font-bold">{student.name[0]}</span>}
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-xs font-black uppercase truncate ${present ? 'text-slate-900' : 'text-slate-400'}`}>
                              {student.name}
                            </p>
                            <p className="text-[9px] font-bold text-slate-300">CBTIS 291 • ID: {student.id.slice(0,5)}</p>
                          </div>
                          {present ? (
                            <CheckCircle2 className="text-indigo-500" size={18} />
                          ) : (
                            <XCircle className="text-slate-200 opacity-0 group-hover:opacity-100" size={18} />
                          )}
                        </button>
                      );
                    })
                )}
              </div>
>>>>>>> d533311 (Done)
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