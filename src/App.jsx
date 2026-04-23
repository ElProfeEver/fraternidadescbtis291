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
  query
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
  Search,
  UserCheck
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
// Estos valores conectan tu App con la base de datos que mostraste en las capturas
const firebaseConfig = {
  apiKey: "AIzaSyBXkSECRq9cQWCbDtkG2IgRVAMEP-T4Ruw",
  authDomain: "fraternidadescbtis291.firebaseapp.com",
  projectId: "fraternidadescbtis291",
  storageBucket: "fraternidadescbtis291.firebasestorage.app",
  messagingSenderId: "989256081963",
  appId: "1:989256081963:web:9d05e75754b9b71e94406e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID único para agrupar los datos en Firestore
const APP_DATA_ID = 'sistema-elemental-v1';

// Base de datos de usuarios locales (Roles)
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'fuego': { pass: 'fire', frat: 'fire', name: 'Comando Fuego' },
  'agua': { pass: 'water', frat: 'water', name: 'Comando Agua' },
  'tierra': { pass: 'earth', frat: 'earth', name: 'Comando Tierra' },
  'aire': { pass: 'air', frat: 'air', name: 'Comando Aire' }
};

// Definición visual de las fraternidades
const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-red-600', border: 'border-red-600', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-600', border: 'border-blue-600', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-green-600', border: 'border-green-600', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-yellow-400', border: 'border-yellow-400', icon: <Wind size={20} /> }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Manejo de la sesión anónima de Firebase
  useEffect(() => {
    const initAuth = async () => {
      try { 
        await signInAnonymously(auth); 
      } catch (err) { 
        console.error("Error de autenticación:", err); 
      }
    };
    initAuth();
    
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const savedUser = localStorage.getItem('elemental_user_id');
    if (savedUser && USERS_DB[savedUser]) {
      setCurrentUserData({ id: savedUser, ...USERS_DB[savedUser] });
    }
    return () => unsubAuth();
  }, []);

  // Sincronización de datos con Firestore
  useEffect(() => {
    if (!user || !currentUserData) return;

    const collectionsList = [
      { name: 'students', setter: setStudents },
      { name: 'attendance', setter: (data) => {
        const records = {};
        data.forEach(item => records[item.id] = item);
        setAttendanceRecords(records);
      }}
    ];

    const unsubs = collectionsList.map(col => {
      const q = query(collection(db, 'artifacts', APP_DATA_ID, 'public', 'data', col.name));
      return onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          col.setter(data);
        }, (err) => {
          console.error(`Error en la colección ${col.name}:`, err);
        });
    });

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [user, session, date]);

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
      setCurrentUserData({ id: loginForm.user.toLowerCase(), ...found });
      localStorage.setItem('elemental_user_id', loginForm.user.toLowerCase());
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const toggleAttendance = async (studentId) => {
    const recordId = `${selectedDate}_${studentId}`;
    try {
      if (attendanceRecords[recordId]) {
        await deleteDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId));
      } else {
        await setDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId), {
          studentId, 
          date: selectedDate, 
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) { 
      console.error("Error al guardar asistencia:", err); 
    }
  };

  const filteredStudents = useMemo(() => {
    if (!currentUserData) return [];
    if (currentUserData.frat === 'all') return students;
    return students.filter(s => s.fraternity === currentUserData.frat);
  }, [students, currentUserData]);

  // Pantalla de Login
  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
          <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase">Sistema Elemental</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Usuario" 
              className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" 
              value={loginForm.user} 
              onChange={(e) => setLoginForm({...loginForm, user: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" 
              value={loginForm.pass} 
              onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})} 
            />
            {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Credenciales Incorrectas</p>}
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Entrar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  // Panel Principal
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {/* Selector de fecha y contador */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <CalendarIcon size={24}/>
            </div>
            <input 
              type="date" 
              className="text-2xl font-black outline-none bg-transparent cursor-pointer" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen del Día</p>
            <p className="text-3xl font-black text-indigo-600">
              {filteredStudents.filter(s => attendanceRecords[`${selectedDate}_${s.id}`]).length} / {filteredStudents.length}
            </p>
          </div>
        </div>

        {/* Rejilla de Fraternidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FRATERNITIES.filter(f => currentUserData.frat === 'all' || f.id === currentUserData.frat).map(frat => (
            <div key={frat.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className={`${frat.color} p-6 text-white flex items-center gap-3 font-black uppercase text-sm tracking-widest`}>
                {frat.icon} {frat.name}
              </div>
              <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-slate-50/30">
                {filteredStudents.filter(s => s.fraternity === frat.id).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                    <Search size={40} className="text-slate-400" />
                    <p className="text-[10px] font-black uppercase mt-2">Sin registros</p>
                  </div>
                ) : (
                  filteredStudents
                    .filter(s => s.fraternity === frat.id)
                    .sort((a,b) => a.name.localeCompare(b.name))
                    .map(student => {
                      const isPresent = attendanceRecords[`${selectedDate}_${student.id}`];
                      return (
                        <button 
                          key={student.id} 
                          onClick={() => toggleAttendance(student.id)} 
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            isPresent ? `${frat.border} bg-white shadow-md scale-[1.02]` : 'border-transparent bg-white shadow-sm'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm ${
                            isPresent ? frat.color : 'bg-slate-100 text-slate-300'
                          }`}>
                            {isPresent ? <UserCheck size={20}/> : student.name[0]}
                          </div>
                          <span className={`text-xs font-black text-left flex-1 truncate ${
                            isPresent ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {student.name}
                          </span>
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