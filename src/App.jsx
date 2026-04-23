import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Plus, 
  Trash2, 
  ShieldCheck,
  UserCheck,
  BarChart3,
  LogOut,
  Calendar as CalendarIcon
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAs8Nl1-I_I0X2M6hQ1m1v4-M_y_k4M_Y",
  authDomain: "elemental-pro-41b9e.firebaseapp.com",
  projectId: "elemental-pro-41b9e",
  storageBucket: "elemental-pro-41b9e.firebasestorage.app",
  messagingSenderId: "305106606822",
  appId: "1:305106606822:web:7f6d8d9b1a5e4c3d2b1a0"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'elemental-pro-v1';

// --- USUARIOS Y CONTRASEÑAS ORIGINALES ---
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'FUEGO': { pass: 'fuego123', frat: 'fire', name: 'Comando Fuego' },
  'AGUA': { pass: 'agua123', frat: 'water', name: 'Comando Agua' },
  'TIERRA': { pass: 'tierra123', frat: 'earth', name: 'Comando Tierra' },
  'AIRE': { pass: 'aire123', frat: 'air', name: 'Comando Aire' }
};

const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-red-500', border: 'border-red-500', text: 'text-red-600', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-emerald-600', border: 'border-emerald-600', text: 'text-emerald-700', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-slate-400', border: 'border-slate-400', text: 'text-slate-600', icon: <Wind size={20} /> }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkInput, setBulkInput] = useState('');

  // 1. Manejo de Autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Error de autenticación:", err);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // 2. Escucha de datos en tiempo real
  useEffect(() => {
    if (!user) return;

    const qStudents = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Error Firestore Alumnos:", err));

    const qAttendance = collection(db, 'artifacts', appId, 'public', 'data', 'attendance');
    const unsubAttendance = onSnapshot(qAttendance, (snap) => {
      const records = {};
      snap.docs.forEach(doc => { records[doc.id] = doc.data(); });
      setAttendanceRecords(records);
    }, (err) => console.error("Error Firestore Asistencia:", err));

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const inputUser = loginForm.user.toUpperCase();
    const found = USERS_DB[inputUser] || USERS_DB[loginForm.user.toLowerCase()];
    if (found && found.pass === loginForm.pass) {
      setCurrentUserData(found);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const toggleAttendance = async (studentId) => {
    if (!user) return;
    const recordId = `${selectedDate}_${studentId}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId);
    
    if (attendanceRecords[recordId]) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        studentId,
        date: selectedDate,
        timestamp: Date.now(),
        markedBy: currentUserData.name
      });
    }
  };

  const addStudentsBulk = async () => {
    if (!bulkInput.trim() || !user) return;
    const names = bulkInput.split('\n').filter(n => n.trim() !== '');
    
    for (const name of names) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), {
        name: name.trim(),
        fraternity: currentUserData.frat === 'all' ? 'fire' : currentUserData.frat,
        createdAt: Date.now()
      });
    }
    setBulkInput('');
    setMessage(`Se registraron ${names.length} alumnos`);
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteStudent = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', id));
  };

  const filteredStudents = useMemo(() => {
    if (!currentUserData) return [];
    if (currentUserData.frat === 'all') return students;
    return students.filter(s => s.fraternity === currentUserData.frat);
  }, [students, currentUserData]);

  const stats = useMemo(() => {
    const presentCount = students.filter(s => attendanceRecords[`${selectedDate}_${s.id}`]).length;
    const fratStats = FRATERNITIES.map(f => {
      const total = students.filter(s => s.fraternity === f.id).length;
      const present = students.filter(s => s.fraternity === f.id && attendanceRecords[`${selectedDate}_${s.id}`]).length;
      return { ...f, total, present, perc: total > 0 ? Math.round((present / total) * 100) : 0 };
    });
    return { presentCount, fratStats };
  }, [students, attendanceRecords, selectedDate]);

  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border-t-8 border-indigo-500">
          <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Portal Elemental</h1>
          <p className="text-slate-400 mb-8 font-medium">Control de Acceso</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="USUARIO"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black outline-none focus:border-indigo-500 uppercase"
              value={loginForm.user}
              onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
            />
            <input 
              type="password" placeholder="CONTRASEÑA"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black outline-none focus:border-indigo-500 uppercase"
              value={loginForm.pass}
              onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
            />
            {loginError && <p className="text-red-500 text-xs font-bold">CREDENCIALES INCORRECTAS</p>}
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
              Entrar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 lg:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{currentUserData.name}</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">
              Conexión Establecida
            </p>
          </div>
        </div>

        <nav className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100 w-full md:w-auto">
          <button onClick={() => setActiveTab('attendance')} className={`flex-1 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase ${activeTab === 'attendance' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
            <ClipboardCheck size={18}/> <span>Lista</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
            <BarChart3 size={18}/> <span>Estadísticas</span>
          </button>
          {currentUserData.frat === 'all' && (
            <button onClick={() => setActiveTab('admin')} className={`flex-1 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase ${activeTab === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
              <UserPlus size={18}/> <span>Alumnos</span>
            </button>
          )}
          <button onClick={() => setCurrentUserData(null)} className="px-4 py-3 rounded-2xl text-red-400 hover:bg-red-50 ml-2 transition-colors">
            <LogOut size={20} />
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><CalendarIcon size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Fecha Seleccionada</p>
                  <input type="date" className="text-xl font-black text-slate-800 outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Presentes</p>
                  <p className="text-3xl font-black text-indigo-600">{stats.presentCount}</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                  <p className="text-3xl font-black text-slate-800">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FRATERNITIES.filter(f => currentUserData.frat === 'all' || f.id === currentUserData.frat).map(frat => (
                <div key={frat.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                  <div className={`${frat.color} p-5 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-2 font-black uppercase text-xs tracking-wider">{frat.icon} {frat.name}</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
                    {students.filter(s => s.fraternity === frat.id).map(student => {
                      const isPresent = attendanceRecords[`${selectedDate}_${student.id}`];
                      return (
                        <button key={student.id} onClick={() => toggleAttendance(student.id)} 
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${isPresent ? `${frat.border} bg-white shadow-md scale-[1.02]` : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${isPresent ? frat.color : 'bg-slate-200 text-slate-500'}`}>
                            {isPresent ? <UserCheck size={16}/> : student.name[0].toUpperCase()}
                          </div>
                          <span className={`font-bold text-[11px] uppercase truncate ${isPresent ? 'text-slate-900' : 'text-slate-400'}`}>{student.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Gestión de Base de Datos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase">Carga Masiva (Nombres uno por línea)</p>
                <textarea 
                  className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 font-bold text-sm uppercase"
                  placeholder="JUAN PEREZ&#10;MARIA LOPEZ..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
                <button onClick={addStudentsBulk} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors">
                  <Plus size={20} /> Registrar Alumnos
                </button>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 max-h-[500px] overflow-y-auto border border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-xs mb-4 flex justify-between items-center">
                  <span>Alumnos Registrados</span>
                  <span className="bg-white px-3 py-1 rounded-full border border-slate-200">{students.length}</span>
                </h3>
                {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                  <div key={s.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 mb-2 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${FRATERNITIES.find(f => f.id === s.fraternity)?.color || 'bg-slate-300'}`} />
                      <span className="text-[11px] font-black text-slate-700 uppercase">{s.name}</span>
                    </div>
                    <button onClick={() => deleteStudent(s.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-500">
            {stats.fratStats.map(f => (
              <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-8 opacity-10 ${f.text}`}>{f.icon}</div>
                <div className={`${f.text} mb-4`}>{f.icon}</div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.name}</h4>
                <p className="text-4xl font-black text-slate-900 mb-2">{f.perc}%</p>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className={`${f.color} h-full transition-all duration-1000`} style={{ width: `${f.perc}%` }} />
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">{f.present} presentes de {f.total} totales</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {message && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl z-50 animate-bounce border border-slate-700">
          <span className="font-black text-xs uppercase tracking-widest">{message}</span>
        </div>
      )}
    </div>
  );
}