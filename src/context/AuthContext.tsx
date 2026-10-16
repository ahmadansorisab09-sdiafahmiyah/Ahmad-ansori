import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { AppUser, UserRole } from '../types';
import { DataService } from '../services/dataService';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerStudent: (data: { fullName: string; username: string; kelas: string }) => Promise<void>;
  registerTeacher: (data: { fullName: string; username: string; email: string }) => Promise<void>;
  loginWithUsername: (username: string) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'ansorisdi@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize DataService defaults
  useEffect(() => {
    DataService.initializeDefaults().catch(console.error);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Look up Firestore profile
        let profile = await DataService.getUserProfile(user.uid);
        if (!profile) {
          // If first time login
          const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          profile = {
            id: user.uid,
            username: user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`,
            fullName: user.displayName || (isAdmin ? 'Admin SDI Al-Fahmiyah' : 'Pengguna SDI'),
            role: isAdmin ? 'admin' : 'guru',
            kelas: 'Semua',
            status: 'active',
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await DataService.saveUserProfile(profile);
        }
        setCurrentUser(profile);
      } else {
        // Fallback or default demo user so user can explore immediately
        const cached = localStorage.getItem('sdi_current_user');
        if (cached) {
          try {
            setCurrentUser(JSON.parse(cached));
          } catch {
            setDefaultStudent();
          }
        } else {
          setDefaultStudent();
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setDefaultStudent = () => {
    const defaultStudent: AppUser = {
      id: 'siswa-fathir-5a',
      username: 'fathir_5a',
      fullName: 'Ahmad Fathir Al-Ghifari',
      role: 'siswa',
      kelas: '5A',
      status: 'active',
      email: null,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(defaultStudent);
    localStorage.setItem('sdi_current_user', JSON.stringify(defaultStudent));
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (data: { fullName: string; username: string; kelas: string }) => {
    const studentId = `siswa_${data.username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
    const newStudent: AppUser = {
      id: studentId,
      username: data.username.toLowerCase().trim(),
      fullName: data.fullName.trim(),
      role: 'siswa',
      kelas: data.kelas,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await DataService.saveUserProfile(newStudent);
    setCurrentUser(newStudent);
    localStorage.setItem('sdi_current_user', JSON.stringify(newStudent));
  };

  const registerTeacher = async (data: { fullName: string; username: string; email: string }) => {
    const teacherId = `guru_${data.username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
    const newTeacher: AppUser = {
      id: teacherId,
      username: data.username.toLowerCase().trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      role: 'guru',
      kelas: 'Semua',
      status: 'active', // can be pending if admin approval required
      createdAt: new Date().toISOString()
    };

    await DataService.saveUserProfile(newTeacher);
    setCurrentUser(newTeacher);
    localStorage.setItem('sdi_current_user', JSON.stringify(newTeacher));
  };

  const loginWithUsername = async (username: string): Promise<boolean> => {
    const cleanUsername = username.toLowerCase().trim();
    const users = await DataService.getAllUsers();
    const found = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('sdi_current_user', JSON.stringify(found));
      return true;
    }
    // If not found in firestore, check predefined demo accounts
    if (cleanUsername === 'admin') {
      const adminUser: AppUser = {
        id: 'admin-sdi-01',
        username: 'admin',
        fullName: 'Administrator SDI Al-Fahmiyah',
        role: 'admin',
        kelas: 'Semua',
        status: 'active',
        email: ADMIN_EMAIL
      };
      setCurrentUser(adminUser);
      localStorage.setItem('sdi_current_user', JSON.stringify(adminUser));
      return true;
    } else if (cleanUsername.includes('guru') || cleanUsername === 'dewi') {
      const teacherUser: AppUser = {
        id: 'guru-dewi-01',
        username: 'dewi',
        fullName: 'Ibu Dewi Sartika, M.Pd (Guru Kelas 5)',
        role: 'guru',
        kelas: 'Semua',
        status: 'active',
        email: 'dewi.sartika@sdialfahmiyah.sch.id'
      };
      setCurrentUser(teacherUser);
      localStorage.setItem('sdi_current_user', JSON.stringify(teacherUser));
      return true;
    }
    return false;
  };

  const switchDemoRole = (role: UserRole) => {
    let mockUser: AppUser;
    if (role === 'admin') {
      mockUser = {
        id: 'admin-sdi-01',
        username: 'admin',
        fullName: 'H. Ansori, M.Pd (Kepala Sekolah / Admin)',
        role: 'admin',
        kelas: 'Semua',
        status: 'active',
        email: ADMIN_EMAIL
      };
    } else if (role === 'guru') {
      mockUser = {
        id: 'teacher-dewi',
        username: 'dewi_guru5',
        fullName: 'Ibu Dewi Sartika, M.Pd (Guru Kelas 5)',
        role: 'guru',
        kelas: 'Semua',
        status: 'active',
        email: 'dewi@sdialfahmiyah.sch.id'
      };
    } else {
      mockUser = {
        id: 'siswa-fathir-5a',
        username: 'fathir_5a',
        fullName: 'Ahmad Fathir Al-Ghifari',
        role: 'siswa',
        kelas: '5A',
        status: 'active'
      };
    }
    setCurrentUser(mockUser);
    localStorage.setItem('sdi_current_user', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    if (firebaseUser) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('sdi_current_user');
    setDefaultStudent();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        signInWithGoogle,
        registerStudent,
        registerTeacher,
        loginWithUsername,
        switchDemoRole,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
