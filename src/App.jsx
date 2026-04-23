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
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
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
  Star,
  UsersRound,
  Settings,
  UserCheck,
  BarChart3,
  LogOut,
  Lock,
  AlertCircle,
  Calendar as CalendarIcon,
  Search,
  ChevronRight,
  TrendingUp,
  Filter
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
// Asegúrate de usar tus credenciales reales aquí
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID para agrupar datos en el ambiente compartido
const APP_DATA_ID = 'sistema-elemental-v1';

// Base de datos local de roles (Simulando autenticación de usuarios)
const USERS_DB = {
  'admin': { pass: 'admin123', frat: 'all', name: 'Administrador Maestro' },
  'fuego': { pass: 'fire', frat: 'fire', name: 'Comando Fuego' },
  'agua': { pass: 'water', frat: 'water', name: 'Comando Agua' },
  'tierra': { pass: 'earth', frat: 'earth', name: 'Comando Tierra' },
  'aire': { pass: 'air', frat: 'air', name: 'Comando Aire' }
};

const FRATERNITIES = [
  { id: 'fire', name: 'Fuego', color: 'bg-red-500', border: 'border-red-500', text: 'text-red-600', icon: <Flame size={20} /> },
  { id: 'water', name: 'Agua', color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', icon: <Droplets size={20} /> },
  { id: 'earth', name: 'Tierra', color: 'bg-emerald-600', border: 'border-emerald-600', text: 'text-emerald-700', icon: <Mountain size={20} /> },
  { id: 'air', name: 'Aire', color: 'bg-slate-400', border: 'border-slate-400', text: 'text-slate-600', icon: <Wind size={20} /> }
];

const STAFF_ROLES = ['Líder', 'Auxiliar 1', 'Auxiliar 2', 'Soporte 1', 'Soporte 2'];

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados de formularios
  const [bulkInput, setBulkInput] = useState('');
  const [newTeacher, setNewTeacher] = useState({ name: '', role: 'Líder', fraternity: 'fire' });

  // 1. Inicialización de Autenticación Anónima
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Error Auth:", err);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 2. Escucha de datos en tiempo real (Firestore)
  useEffect(() => {
    if (!user) return;

    // Escuchar Alumnos
    const qStudents = collection(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'students');
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Error Students:", err));

    // Escuchar Staff (Teachers)
    const qStaff = collection(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'staff');
    const unsubStaff = onSnapshot(qStaff, (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Error Staff:", err));

    // Escuchar Asistencia
    const qAttendance = collection(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance');
    const unsubAttendance = onSnapshot(qAttendance, (snap) => {
      const records = {};
      snap.docs.forEach(doc => {
        records[doc.id] = doc.data();
      });
      setAttendanceRecords(records);
    }, (err) => console.error("Error Attendance:", err));

    return () => {
      unsubStudents();
      unsubStaff();
      unsubAttendance();
    };
  }, [user]);

  // --- LÓGICA DE NEGOCIO ---

  const handleLogin = (e) => {
    e.preventDefault();
    const found = USERS_DB[loginForm.user.toLowerCase()];
    if (found && found.pass === loginForm.pass) {
      setCurrentUserData(found);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setCurrentUserData(null);
    setLoginForm({ user: '', pass: '' });
  };

  const toggleAttendance = async (studentId) => {
    if (!user) return;
    const recordId = `${selectedDate}_${studentId}`;
    const docRef = doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'attendance', recordId);
    
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
    if (!bulkInput.trim()) return;
    const names = bulkInput.split('\n').filter(n => n.trim() !== '');
    
    for (const name of names) {
      await addDoc(collection(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'students'), {
        name: name.trim(),
        fraternity: currentUserData.frat === 'all' ? 'fire' : currentUserData.frat,
        isLeader: false,
        createdAt: Date.now()
      });
    }
    setBulkInput('');
    showMsg(`Se agregaron ${names.length} alumnos`);
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'artifacts', APP_DATA_ID, 'public', 'data', 'students', id));
  };

  const showMsg = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(null), 3000);
  };

  // --- FILTROS Y ESTADÍSTICAS ---
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

  // --- RENDER VISTAS ---

  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border-t-8 border-indigo-500">
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-75" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse delay-150" />
            <div className="w-3 h-3 rounded-full bg-slate-400 animate-pulse delay-300" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Portal Elemental</h1>
          <p className="text-slate-400 mb-10 font-medium">Gestión de Fraternidades</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Usuario"
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all"
                value={loginForm.user}
                onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Contraseña"
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all"
                value={loginForm.pass}
                onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
              />
            </div>
            {loginError && <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1"><AlertCircle size={14}/> Credenciales incorrectas</p>}
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
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{currentUserData.name}</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" /> Sincronizado
            </p>
          </div>
        </div>

        <nav className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'attendance', label: 'Lista', icon: <ClipboardCheck size={18}/> },
            { id: 'reports', label: 'Métricas', icon: <BarChart3 size={18}/> },
            ...(currentUserData.frat === 'all' ? [
              { id: 'admin', label: 'Alumnos', icon: <UserPlus size={18}/> },
              { id: 'staff', label: 'Staff', icon: <Settings size={18}/> }
            ] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="px-4 py-3 rounded-2xl text-red-400 hover:bg-red-50 transition-colors ml-2">
            <LogOut size={20} />
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'attendance' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Control de Fecha y Resumen */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Día de Actividad</p>
                  <input 
                    type="date" 
                    className="text-xl font-black text-slate-800 outline-none bg-transparent cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presentes Hoy</p>
                  <p className="text-3xl font-black text-indigo-600">{stats.presentCount}</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efectividad</p>
                  <p className="text-3xl font-black text-slate-800">
                    {students.length > 0 ? Math.round((stats.presentCount / students.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Fraternidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FRATERNITIES.filter(f => currentUserData.frat === 'all' || f.id === currentUserData.frat).map(frat => (
                <div key={frat.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] transition-all hover:shadow-md">
                  <div className={`${frat.color} p-6 text-white`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 font-black uppercase text-sm tracking-widest">
                        {frat.icon} {frat.name}
                      </div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black">
                        {filteredStudents.filter(s => s.fraternity === frat.id && attendanceRecords[`${selectedDate}_${s.id}`]).length} / {filteredStudents.filter(s => s.fraternity === frat.id).length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredStudents.filter(s => s.fraternity === frat.id).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
                        <UsersRound size={48} strokeWidth={1} className="mb-2" />
                        <p className="text-xs font-black uppercase tracking-tighter">Sin registros</p>
                      </div>
                    ) : (
                      filteredStudents
                        .filter(s => s.fraternity === frat.id)
                        .sort((a,b) => (b.isLeader ? 1 : -1) || a.name.localeCompare(b.name))
                        .map(student => {
                          const isPresent = attendanceRecords[`${selectedDate}_${student.id}`];
                          return (
                            <button
                              key={student.id}
                              onClick={() => toggleAttendance(student.id)}
                              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                                isPresent ? `${frat.border} bg-white shadow-sm translate-y-[-2px]` : 'border-transparent bg-slate-50 opacity-60 grayscale-[0.5]'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all ${isPresent ? frat.color : 'bg-slate-300'}`}>
                                {isPresent ? <UserCheck size={18}/> : <span className="text-xs font-black">{student.name[0]}</span>}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className={`font-bold text-xs truncate leading-tight ${isPresent ? 'text-slate-900' : 'text-slate-500'}`}>{student.name}</p>
                                {student.isLeader && <p className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1 mt-0.5"><Star size={8} className="fill-amber-500"/> Líder</p>}
                              </div>
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-indigo-600 p-4 rounded-2xl text-white">
                <UserPlus size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Gestión de Alumnos</h2>
                <p className="text-slate-400 font-medium">Registro masivo y control de base</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Ingreso por lista (un nombre por línea)</span>
                  <textarea 
                    className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                    placeholder="Ejemplo:&#10;Juan Perez&#10;Maria Garcia&#10;..."
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                </label>
                <button 
                  onClick={addStudentsBulk}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Cargar Alumnos
                </button>
              </div>

              <div className="bg-slate-50 rounded-[2.5rem] p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter">Lista Actual ({students.length})</h3>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <Search size={16} className="text-slate-400" />
                  </div>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${FRATERNITIES.find(f => f.id === s.fraternity)?.color}`} />
                        <span className="text-sm font-bold text-slate-700">{s.name}</span>
                      </div>
                      <button 
                        onClick={() => deleteStudent(s.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.fratStats.map(f => (
                <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${f.color} opacity-[0.03] rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform`} />
                  <div className={`${f.text} mb-4`}>{f.icon}</div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{f.name}</h4>
                  <p className="text-4xl font-black text-slate-900 mb-2">{f.perc}%</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${f.color} h-full transition-all duration-1000`} style={{ width: `${f.perc}%` }} />
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-500">{f.present} de {f.total} alumnos</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                 <TrendingUp className="text-indigo-600" /> Ausentismo hoy
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {students.filter(s => !attendanceRecords[`${selectedDate}_${s.id}`]).map(s => (
                   <div key={s.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className={`w-2 h-10 rounded-full ${FRATERNITIES.find(f => f.id === s.fraternity)?.color} opacity-50`} />
                     <div>
                       <p className="text-xs font-black text-slate-800">{s.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{FRATERNITIES.find(f => f.id === s.fraternity)?.name}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Notificaciones Flash */}
      {message && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          <span className="font-black text-xs uppercase tracking-widest">{message}</span>
        </div>
      )}

      {/* Estilos Extra */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}