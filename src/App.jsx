<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
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
  AlertCircle,
  Calendar as CalendarIcon,
  Search,
  UserCheck
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
// IMPORTANTE: Sustituye estos valores con los de tu consola de Firebase (Proyecto -> Configuración)
const firebaseConfig = {
  apiKey: "TU_API_KEY", 
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Validación para mostrar aviso si no se han configurado las llaves
const isConfigValid = firebaseConfig.apiKey !== "TU_API_KEY";

let app, auth, db;
if (isConfigValid) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const APP_DATA_ID = 'sistema-elemental-v1';

// Base de datos de acceso local (Roles)
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'fuego': { pass: 'fire', frat: 'fire', name: 'Comando Fuego' },
  'agua': { pass: 'water', frat: 'water', name: 'Comando Agua' },
  'tierra': { pass: 'earth', frat: 'earth', name: 'Comando Tierra' },
  'aire': { pass: 'air', frat: 'air', name: 'Comando Aire' }
};

// Colores: Agua(Azul), Fuego(Rojo), Aire(Amarillo), Tierra(Verde)
const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-red-600', border: 'border-red-600', text: 'text-red-700', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-green-600', border: 'border-green-600', text: 'text-green-700', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-700', icon: <Wind size={20} /> }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Manejo de Autenticación de Firebase
  useEffect(() => {
    if (!isConfigValid) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const savedUser = localStorage.getItem('elemental_user_id');
    if (savedUser && USERS_DB[savedUser]) {
      setCurrentUserData({ id: savedUser, ...USERS_DB[savedUser] });
    }
    return () => unsubAuth();
  }, []);

  // Sincronización en Tiempo Real con Firestore
  useEffect(() => {
    if (!isConfigValid || !user || !currentUserData) return;
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
        }, (err) => console.error(err));
    });
    return () => unsubs.forEach(u => u());
  }, [user, currentUserData]);

  const handleLogin = (e) => {
    e.preventDefault();
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
    if (!isConfigValid) return;
    const recordId = `${selectedDate}_${studentId}`;
    try {
      if (attendanceRecords[recordId]) {
        await deleteDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId));
      } else {
        await setDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId), {
          studentId, date: selectedDate, timestamp: new Date().toISOString()
        });
      }
    } catch (err) { console.error(err); }
  };

  const filteredStudents = useMemo(() => {
    if (!currentUserData) return [];
    if (currentUserData.frat === 'all') return students;
    return students.filter(s => s.fraternity === currentUserData.frat);
  }, [students, currentUserData]);

  // Interfaz de error si no hay llaves de Firebase
  if (!isConfigValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-slate-800 p-10 rounded-3xl border border-red-500 shadow-2xl">
          <AlertCircle size={64} className="mx-auto mb-6 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Configuración Pendiente</h2>
          <p className="text-slate-400 text-sm mb-6">Faltan las credenciales de Firebase. Edita la variable <code className="bg-slate-700 px-2 py-1 rounded">firebaseConfig</code> en <code className="text-indigo-400">App.jsx</code>.</p>
        </div>
      </div>
    );
  }

  // Interfaz de Inicio de Sesión
  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
          <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter uppercase">Sistema Elemental</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={loginForm.user} onChange={(e) => setLoginForm({...loginForm, user: e.target.value})} />
            <input type="password" placeholder="Contraseña" className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={loginForm.pass} onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})} />
            {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Credenciales no válidas</p>}
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl"><ShieldCheck size={32} /></div>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">{currentUserData.name}</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Conexión Segura</p>
          </div>
        </div>
        <button onClick={() => {setCurrentUserData(null); localStorage.removeItem('elemental_user_id');}} className="p-4 bg-white text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-slate-100"><LogOut size={20} /></button>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Selector de Fecha y Estadísticas rápidas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><CalendarIcon size={24}/></div>
            <input type="date" className="text-2xl font-black outline-none bg-transparent cursor-pointer text-slate-800" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presentes</p>
              <p className="text-3xl font-black text-indigo-600">{filteredStudents.filter(s => attendanceRecords[`${selectedDate}_${s.id}`]).length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Grupo</p>
              <p className="text-3xl font-black text-slate-800">{filteredStudents.length}</p>
            </div>
          </div>
        </div>

        {/* Rejilla de Fraternidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FRATERNITIES.filter(f => currentUserData.frat === 'all' || f.id === currentUserData.frat).map(frat => (
            <div key={frat.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
              <div className={`${frat.color} p-6 text-white flex items-center gap-3 font-black uppercase text-sm tracking-widest shadow-inner`}>
                {frat.icon} {frat.name}
              </div>
              <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-slate-50/30">
                {filteredStudents.filter(s => s.fraternity === frat.id).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-slate-400">
                    <Search size={48} />
                    <p className="text-[10px] font-black uppercase mt-2">Sin Alumnos</p>
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
                            isPresent ? `${frat.border} bg-white shadow-md scale-[1.02]` : 'border-transparent bg-white shadow-sm hover:border-slate-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black transition-all shadow-sm ${isPresent ? frat.color : 'bg-slate-100 text-slate-300'}`}>
                            {isPresent ? <UserCheck size={20}/> : student.name[0]}
                          </div>
                          <span className={`text-xs font-black text-left flex-1 truncate ${isPresent ? 'text-slate-900' : 'text-slate-400'}`}>
                            {student.name}
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
=======
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
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
  AlertCircle,
  Calendar as CalendarIcon,
  Search,
  UserCheck
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
// IMPORTANTE: Sustituye estos valores con los de tu consola de Firebase (Proyecto -> Configuración)
const firebaseConfig = {
  apiKey: "TU_API_KEY", 
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Validación para mostrar aviso si no se han configurado las llaves
const isConfigValid = firebaseConfig.apiKey !== "TU_API_KEY";

let app, auth, db;
if (isConfigValid) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const APP_DATA_ID = 'sistema-elemental-v1';

// Base de datos de acceso local (Roles)
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'fuego': { pass: 'fire', frat: 'fire', name: 'Comando Fuego' },
  'agua': { pass: 'water', frat: 'water', name: 'Comando Agua' },
  'tierra': { pass: 'earth', frat: 'earth', name: 'Comando Tierra' },
  'aire': { pass: 'air', frat: 'air', name: 'Comando Aire' }
};

// Colores: Agua(Azul), Fuego(Rojo), Aire(Amarillo), Tierra(Verde)
const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-red-600', border: 'border-red-600', text: 'text-red-700', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-green-600', border: 'border-green-600', text: 'text-green-700', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-700', icon: <Wind size={20} /> }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Manejo de Autenticación de Firebase
  useEffect(() => {
    if (!isConfigValid) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const savedUser = localStorage.getItem('elemental_user_id');
    if (savedUser && USERS_DB[savedUser]) {
      setCurrentUserData({ id: savedUser, ...USERS_DB[savedUser] });
    }
    return () => unsubAuth();
  }, []);

  // Sincronización en Tiempo Real con Firestore
  useEffect(() => {
    if (!isConfigValid || !user || !currentUserData) return;
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
        }, (err) => console.error(err));
    });
    return () => unsubs.forEach(u => u());
  }, [user, currentUserData]);

  const handleLogin = (e) => {
    e.preventDefault();
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
    if (!isConfigValid) return;
    const recordId = `${selectedDate}_${studentId}`;
    try {
      if (attendanceRecords[recordId]) {
        await deleteDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId));
      } else {
        await setDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId), {
          studentId, date: selectedDate, timestamp: new Date().toISOString()
        });
      }
    } catch (err) { console.error(err); }
  };

  const filteredStudents = useMemo(() => {
    if (!currentUserData) return [];
    if (currentUserData.frat === 'all') return students;
    return students.filter(s => s.fraternity === currentUserData.frat);
  }, [students, currentUserData]);

  // Interfaz de error si no hay llaves de Firebase
  if (!isConfigValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-slate-800 p-10 rounded-3xl border border-red-500 shadow-2xl">
          <AlertCircle size={64} className="mx-auto mb-6 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Configuración Pendiente</h2>
          <p className="text-slate-400 text-sm mb-6">Faltan las credenciales de Firebase. Edita la variable <code className="bg-slate-700 px-2 py-1 rounded">firebaseConfig</code> en <code className="text-indigo-400">App.jsx</code>.</p>
        </div>
      </div>
    );
  }

  // Interfaz de Inicio de Sesión
  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
          <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter uppercase">Sistema Elemental</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={loginForm.user} onChange={(e) => setLoginForm({...loginForm, user: e.target.value})} />
            <input type="password" placeholder="Contraseña" className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={loginForm.pass} onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})} />
            {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Credenciales no válidas</p>}
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl"><ShieldCheck size={32} /></div>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">{currentUserData.name}</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Conexión Segura</p>
          </div>
        </div>
        <button onClick={() => {setCurrentUserData(null); localStorage.removeItem('elemental_user_id');}} className="p-4 bg-white text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-slate-100"><LogOut size={20} /></button>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Selector de Fecha y Estadísticas rápidas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><CalendarIcon size={24}/></div>
            <input type="date" className="text-2xl font-black outline-none bg-transparent cursor-pointer text-slate-800" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presentes</p>
              <p className="text-3xl font-black text-indigo-600">{filteredStudents.filter(s => attendanceRecords[`${selectedDate}_${s.id}`]).length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Grupo</p>
              <p className="text-3xl font-black text-slate-800">{filteredStudents.length}</p>
            </div>
          </div>
        </div>

        {/* Rejilla de Fraternidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FRATERNITIES.filter(f => currentUserData.frat === 'all' || f.id === currentUserData.frat).map(frat => (
            <div key={frat.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
              <div className={`${frat.color} p-6 text-white flex items-center gap-3 font-black uppercase text-sm tracking-widest shadow-inner`}>
                {frat.icon} {frat.name}
              </div>
              <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-slate-50/30">
                {filteredStudents.filter(s => s.fraternity === frat.id).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-slate-400">
                    <Search size={48} />
                    <p className="text-[10px] font-black uppercase mt-2">Sin Alumnos</p>
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
                            isPresent ? `${frat.border} bg-white shadow-md scale-[1.02]` : 'border-transparent bg-white shadow-sm hover:border-slate-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black transition-all shadow-sm ${isPresent ? frat.color : 'bg-slate-100 text-slate-300'}`}>
                            {isPresent ? <UserCheck size={20}/> : student.name[0]}
                          </div>
                          <span className={`text-xs font-black text-left flex-1 truncate ${isPresent ? 'text-slate-900' : 'text-slate-400'}`}>
                            {student.name}
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
>>>>>>> b67b464 (Initial commit: Sistema asistencia fraternidades)
}