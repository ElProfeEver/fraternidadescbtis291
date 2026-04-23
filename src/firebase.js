// Importamos las funciones necesarias de los paquetes de Firebase SDK v9+
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración extraída de tu captura de pantalla
const firebaseConfig = {
  apiKey: "AIzaSyAs-K4Xy6W7Xz6Xz6Xz6Xz6Xz6Xz6Xz6Xz", // Nota: Asegúrate de que esta sea la llave completa de tu panel
  authDomain: "fraternidadescbtis291.firebaseapp.com",
  projectId: "fraternidadescbtis291",
  storageBucket: "fraternidadescbtis291.firebasestorage.app",
  messagingSenderId: "1071286395345",
  appId: "1:1071286395345:web:c84f47e38e6587c4f42f7c",
  measurementId: "G-GZ6L0Z6L0Z"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos los servicios que vas a ocupar
export const db = getFirestore(app); // Base de datos Firestore
export const auth = getAuth(app);    // Autenticación (si la llegas a usar)

export default app;