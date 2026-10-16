import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithGoogle, registerStudent, loginWithUsername } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Student state
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regKelas, setRegKelas] = useState('5A');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [classCode, setClassCode] = useState('SDI5');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginUsername.trim()) {
      setError('Nama pengguna atau username wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const success = await loginWithUsername(loginUsername);
      if (success) {
        onClose();
      } else {
        setError('Username tidak ditemukan. Coba gunakan akun demo seperti "admin", "dewi", atau daftar sebagai siswa baru.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !regUsername.trim() || !password) {
      setError('Mohon lengkapi seluruh kolom pendaftaran.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        fullName: fullName.trim(),
        username: regUsername.trim(),
        kelas: regKelas
      });
      alert(`Alhamdulillah! Akun ananda ${fullName} berhasil dibuat.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan akun siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan akun Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 leading-tight">
                SDI AL-FAHMIYAH
              </h2>
              <span className="text-[11px] text-emerald-700 font-bold block">
                CERIA BERIMAN
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600'
            }`}
          >
            Daftar Akun Siswa
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-800 border border-rose-200 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Nama Pengguna / Username:
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Contoh: fathir_5a, dewi, atau admin"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Kata Sandi:
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[11px] text-gray-400 uppercase">
                <span className="bg-white px-2">atau</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk dengan Google (Guru / Pengajar)</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Nama Lengkap Sesuai Identitas Siswa:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Muhammad Rayhan Firdaus"
                className="w-full border rounded-xl p-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Kelas 5:</label>
                <select
                  value={regKelas}
                  onChange={(e) => setRegKelas(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 font-bold text-blue-700"
                >
                  <option value="5A">Kelas 5A</option>
                  <option value="5B">Kelas 5B</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Username Unik:</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="rayhan_5a"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Kata Sandi:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full border rounded-xl p-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Konfirmasi Kata Sandi:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi"
                className="w-full border rounded-xl p-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Kode Pendaftaran Kelas:</label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="SDI5"
                className="w-full border rounded-xl p-2.5 text-sm bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer mt-2"
            >
              {loading ? 'Mendaftarkan...' : 'Daftarkan Akun Siswa'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
