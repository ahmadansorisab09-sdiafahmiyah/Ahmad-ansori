import React, { useState, useEffect } from 'react';
import { Material, Subject } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import {
  FolderOpen,
  FileText,
  Video,
  Image as ImageIcon,
  PlusCircle,
  ExternalLink,
  BookOpen,
  Filter,
  Trash2
} from 'lucide-react';

export const MaterialsLibrary: React.FC = () => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New material form
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('sub-ipas');
  const [type, setType] = useState<'pdf' | 'lkpd' | 'video' | 'gambar' | 'proyek'>('lkpd');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mList, sList] = await Promise.all([
      DataService.getMaterials(),
      DataService.getSubjects()
    ]);
    setMaterials(mList);
    setSubjects(sList);
  };

  const handleCreateMaterial = async () => {
    if (!title.trim()) {
      alert('Judul materi harus diisi.');
      return;
    }
    const currentSub = subjects.find(s => s.id === subjectId);
    const newMat: Material = {
      id: `mat-${Date.now()}`,
      title: title.trim(),
      subjectId,
      subjectName: currentSub?.name || 'Mata Pelajaran',
      targetClasses: ['5A', '5B'],
      type,
      contentUrl: contentUrl.trim() || '#',
      description: description.trim(),
      teacherName: currentUser?.fullName || 'Guru SDI Al-Fahmiyah',
      createdAt: new Date().toISOString()
    };

    await DataService.saveMaterial(newMat);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setContentUrl('');
    loadData();
  };

  const filteredMaterials = materials.filter((m) => {
    if (selectedSubject !== 'all' && m.subjectId !== selectedSubject) return false;
    if (selectedType !== 'all' && m.type !== selectedType) return false;
    return true;
  });

  const getTypeIcon = (mType: string) => {
    switch (mType) {
      case 'video':
        return <Video className="w-5 h-5 text-rose-600" />;
      case 'gambar':
        return <ImageIcon className="w-5 h-5 text-indigo-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            Perpustakaan Digital • SDI Al-Fahmiyah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Materi Pembelajaran & LKPD Kelas 5
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Akses rangkuman modul, Lembar Kerja Peserta Didik (LKPD), video sains, dan panduan proyek.
          </p>
        </div>

        {currentUser?.role !== 'siswa' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Unggah Materi / LKPD Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-gray-700">Mata Pelajaran:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <span className="font-bold text-gray-700 ml-2">Tipe Materi:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">Semua Tipe</option>
            <option value="lkpd">LKPD (Lembar Kerja)</option>
            <option value="pdf">Modul & PDF</option>
            <option value="video">Video Pembelajaran</option>
            <option value="proyek">Panduan Proyek</option>
          </select>
        </div>

        <span className="text-xs text-gray-500 font-semibold">
          Ditemukan {filteredMaterials.length} Sumber Belajar
        </span>
      </div>

      {/* Grid of Materials */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm">
          Belum ada materi pembelajaran pada filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {m.subjectName}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                    {getTypeIcon(m.type)}
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                  {m.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {m.description}
                </p>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span>Guru: {m.teacherName}</span>
                  <span className="uppercase font-semibold">{m.type}</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => alert(`Membuka berkas: "${m.title}". Silakan unduh dan pelajari dengan seksama.`)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka & Pelajari Materi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Material */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="font-extrabold text-base text-gray-900">
              Unggah Materi / LKPD Baru
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Judul Materi:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Modul Eksperimen Pembiasan Cahaya"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mata Pelajaran:</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-gray-50"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tipe Berkas / Konten:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-gray-50"
                >
                  <option value="lkpd">LKPD (Lembar Kerja Peserta Didik)</option>
                  <option value="pdf">Dokumen PDF Ringkasan</option>
                  <option value="video">Tautan Video Edukatif</option>
                  <option value="proyek">Panduan Proyek & Produk</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tautan / URL Berkas (Opsional):</label>
                <input
                  type="text"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau tautan video"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Deskripsi Singkat:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan ringkasan isi materi untuk ananda..."
                  className="w-full border rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateMaterial}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan & Terbitkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
