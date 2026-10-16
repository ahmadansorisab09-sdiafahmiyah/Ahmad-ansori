import React, { useState, useEffect } from 'react';
import { Subject, AppUser } from '../types';
import { DataService } from '../services/dataService';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Settings,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
  Search
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'subjects' | 'security'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Subject Modal
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubTeacher, setNewSubTeacher] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, sList] = await Promise.all([
        DataService.getAllUsers(),
        DataService.getSubjects()
      ]);
      setUsers(uList);
      setSubjects(sList);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: AppUser) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    await DataService.updateUserStatus(user.id, nextStatus);
    loadData();
  };

  const handleCreateSubject = async () => {
    if (!newSubName.trim()) {
      alert('Nama mata pelajaran harus diisi.');
      return;
    }
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode.trim() || 'MULOK-5',
      kelas: '5',
      fase: 'C',
      semester: '1',
      teacherName: newSubTeacher.trim() || 'Guru Pengampu',
      isActive: true,
      color: 'blue'
    };
    await DataService.saveSubject(newSubject);
    setShowAddSubject(false);
    setNewSubName('');
    setNewSubCode('');
    setNewSubTeacher('');
    loadData();
  };

  const handleToggleSubjectActive = async (sub: Subject) => {
    const updated = { ...sub, isActive: !sub.isActive };
    await DataService.saveSubject(updated);
    loadData();
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-yellow-400 text-purple-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Hak Akses Administrator Utama
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Panel Kontrol Administrator SDI Al-Fahmiyah
          </h1>
          <p className="text-purple-200 text-sm mt-1 max-w-2xl">
            Pusat tata kelola kurikulum, mata pelajaran Kelas 5 Fase C, persetujuan akun guru, dan keamanan sistem.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-purple-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Kelola Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'subjects' ? 'bg-white text-purple-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Mata Pelajaran ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-white text-purple-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Status Keamanan
          </button>
        </div>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                Daftar Akun Guru, Siswa, & Admin Terdaftar
              </h3>
              <p className="text-xs text-gray-500">
                Verifikasi atau nonaktifkan akun sesuai kewenangan pengawas sekolah.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-xl text-xs w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Peran (Role)</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/30">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{u.fullName}</td>
                    <td className="py-3.5 px-3 text-gray-600 font-mono text-[11px]">{u.username}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'guru'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold">{u.kelas || '-'}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status === 'active' ? 'Aktif' : 'Dinonaktifkan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Subjects Management */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                Daftar Mata Pelajaran Kelas 5 SD (Fase C)
              </h3>
              <p className="text-xs text-gray-500">
                Admin dapat menambah muatan lokal atau mata pelajaran baru sesuai struktur kurikulum SDI Al-Fahmiyah.
              </p>
            </div>
            <button
              onClick={() => setShowAddSubject(true)}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className={`p-4 rounded-xl border transition-all ${
                  sub.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {sub.code}
                  </span>
                  <button
                    onClick={() => handleToggleSubjectActive(sub)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      sub.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sub.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                  {sub.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Guru: <strong>{sub.teacherName}</strong>
                </p>
                <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
                  <span>Kelas 5 SD (Fase C)</span>
                  <span>Semester {sub.semester}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Security & System Audit */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Keamanan Data & Aturan Firestore (ABAC)
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Sistem berjalan di atas Cloud Firestore dengan <strong>Firebase Security Rules</strong> yang dipersenjatai Attribute-Based Access Control (ABAC):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">1. Perlindungan Kunci Jawaban:</strong>
              <p className="text-slate-600">
                Siswa tidak diizinkan membaca kunci jawaban atau ulasan sebelum guru menerbitkan nilai secara resmi.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">2. Isolasi Pengumpulan:</strong>
              <p className="text-slate-600">
                Setiap siswa hanya memiliki izin baca & tulis pada dokumen pengumpulan miliknya sendiri (studentId == auth.uid).
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">3. Backend AI Terlindungi:</strong>
              <p className="text-slate-600">
                Pemanggilan model AI Gemini 3.8 Flash dieksekusi secara server-side melalui Express proxy tanpa mengekspos API key ke browser.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">4. Pencegahan Manipulasi Nilai:</strong>
              <p className="text-slate-600">
                Nilai dan rubrik hanya dapat dimodifikasi oleh akun guru aktif atau admin sekolah yang terverifikasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Subject */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="font-extrabold text-base text-gray-900">
              Tambah Mata Pelajaran / Muatan Lokal Baru
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Mata Pelajaran:</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Contoh: Robotika & Sains Kreatif"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Kode Singkatan:</label>
                <input
                  type="text"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  placeholder="Contoh: ROBOT-5"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Guru Pengampu:</label>
                <input
                  type="text"
                  value={newSubTeacher}
                  onChange={(e) => setNewSubTeacher(e.target.value)}
                  placeholder="Contoh: Bpk. Muhammad Ilham, S.Pd"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddSubject(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSubject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan Mata Pelajaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
