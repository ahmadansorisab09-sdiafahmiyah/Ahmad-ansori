import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  Settings,
  FolderOpen,
  Bell,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser, switchDemoRole, signOut } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">Admin Utama</span>;
      case 'guru':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Guru Kelas 5</span>;
      case 'siswa':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">Siswa Kelas {currentUser?.kelas || '5'}</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      {/* Top Banner: Motto & Slogan */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full font-black text-[11px] tracking-wide shadow-xs">
              CERIA BERIMAN
            </span>
            <span className="hidden sm:inline text-blue-50">
              “Belajar dengan Gembira, Berkarya dengan Ilmu, Berakhlak dengan Iman.”
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-blue-100">SDI Al-Fahmiyah • Kelas 5 SD Fase C</span>
            {/* Quick Role Switcher for seamless testing */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-all"
              >
                <span>Uji Peran: <strong>{currentUser?.role.toUpperCase()}</strong></span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Ganti Peran Uji Coba:
                  </div>
                  <button
                    onClick={() => { switchDemoRole('siswa'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-xs flex items-center justify-between"
                  >
                    <span>Siswa (Ahmad Fathir)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Siswa</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('guru'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-xs flex items-center justify-between"
                  >
                    <span>Guru (Ibu Dewi Sartika)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Guru</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-xs flex items-center justify-between"
                  >
                    <span>Admin (Kepala Sekolah)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight">
                  TUGAS ONLINE
                </span>
                <span className="text-emerald-700 font-extrabold text-base sm:text-lg">
                  SDI AL-FAHMIYAH
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Learning Management System Berkarakter Islami & Ceria
              </p>
            </div>
          </div>

          {/* Navigation Items based on active role */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentUser?.role === 'siswa' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Tugas Saya</span>
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'results'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nilai & Masukan</span>
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'materials'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Materi & LKPD</span>
                </button>
              </>
            )}

            {currentUser?.role === 'guru' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Daftar Tugas</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-generator')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-xs ${
                    activeTab === 'ai-generator'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-blue-300'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Buat Soal AI (Bloom)</span>
                </button>
                <button
                  onClick={() => setActiveTab('question-bank')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'question-bank'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Bank Soal</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analisis & Rekap</span>
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'materials'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Materi</span>
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-gray-600 hover:text-purple-800 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Admin</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-generator')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'ai-generator'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-gray-600 hover:text-purple-800 hover:bg-gray-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Uji Generator AI</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-gray-600 hover:text-purple-800 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Rekap Seluruh Nilai</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Side: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-gray-800 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="mt-0.5">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {currentUser.fullName.charAt(0)}
                </div>
                <button
                  onClick={signOut}
                  title="Keluar"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 text-xs border-t border-gray-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {currentUser?.role === 'siswa' ? 'Tugas Saya' : 'Dashboard'}
          </button>
          {currentUser?.role !== 'siswa' && (
            <button
              onClick={() => setActiveTab('ai-generator')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'ai-generator' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Generator AI</span>
            </button>
          )}
          {currentUser?.role === 'siswa' ? (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                activeTab === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Nilai & Umpan Balik
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Analisis Nilai
            </button>
          )}
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Materi & LKPD
          </button>
        </div>
      </div>
    </header>
  );
};
