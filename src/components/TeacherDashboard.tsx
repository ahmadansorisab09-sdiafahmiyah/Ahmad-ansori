import React, { useState, useEffect } from 'react';
import { Task, Submission, QuestionItem } from '../types';
import { DataService } from '../services/dataService';
import {
  ClipboardList,
  Sparkles,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Users,
  Search,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

interface TeacherDashboardProps {
  onOpenAiGenerator: () => void;
  onOpenTaskEditor: (task?: Task) => void;
  onOpenGrading: (task: Task, submission: Submission) => void;
  onOpenBankSoal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenAiGenerator,
  onOpenTaskEditor,
  onOpenGrading,
  onOpenBankSoal
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState<Task | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList, qList] = await Promise.all([
        DataService.getTasks(),
        DataService.getAllSubmissions(),
        DataService.getQuestionBank()
      ]);
      setTasks(tList);
      setSubmissions(sList);
      setQuestionsCount(qList.length);
      if (tList.length > 0 && !selectedTaskForSubmissions) {
        setSelectedTaskForSubmissions(tList[0]);
      }
    } catch (e) {
      console.error('Error loading teacher data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Apakah Bapak/Ibu yakin ingin menghapus tugas ini?')) {
      await DataService.deleteTask(taskId);
      loadData();
    }
  };

  const handleToggleScorePublish = async (task: Task) => {
    const updated = { ...task, isScorePublished: !task.isScorePublished, updatedAt: new Date().toISOString() };
    await DataService.saveTask(updated);
    loadData();
  };

  const pendingGradingCount = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
            Pusat Pengelolaan Pembelajaran Guru • SDI Al-Fahmiyah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manajemen Tugas & Asesmen Kelas 5
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola penugasan, koreksi hasil siswa dengan rubrik transparan, dan rumuskan soal cerdas dengan AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiGenerator}
            className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Buat Soal AI (Bloom)</span>
          </button>
          <button
            onClick={() => onOpenTaskEditor()}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Total Tugas</span>
            <span className="text-2xl font-extrabold text-gray-900">{tasks.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Perlu Dikoreksi</span>
            <span className="text-2xl font-extrabold text-amber-600">{pendingGradingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Bank Soal Siap</span>
            <span className="text-2xl font-extrabold text-emerald-700">{questionsCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Terkumpul Siswa</span>
            <span className="text-2xl font-extrabold text-purple-700">{submissions.length}</span>
          </div>
        </div>
      </div>

      {/* Main Task Management List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Daftar Tugas & Asesmen Terbit
          </h2>
          <button
            onClick={onOpenBankSoal}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            Lihat Bank Soal SDI ({questionsCount})
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Belum ada tugas dibuat. Silakan klik tombol "Buat Tugas Baru" atau "Buat Soal AI".
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const taskSubs = submissions.filter(s => s.taskId === task.id);
              const submittedCount = taskSubs.length;
              const gradedCount = taskSubs.filter(s => s.status === 'graded').length;

              return (
                <div
                  key={task.id}
                  className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {task.subjectName}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        Kelas: {task.targetClasses.join(', ') || '5A, 5B'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                        Tipe: {task.taskType.toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        task.isScorePublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {task.isScorePublished ? 'Nilai Dibuka untuk Siswa' : 'Nilai Belum Dibuka'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">
                      {task.title}
                    </h3>

                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-4 pt-1">
                      <span>Batas: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{task.questions.length} Butir Soal</span>
                      <span>Skor Maks: {task.maxScore}</span>
                      <span className="text-emerald-700 font-semibold">
                        Pengumpulan: {submittedCount} Siswa ({gradedCount} telah dinilai)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedTaskForSubmissions(task)}
                      className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Hasil Siswa ({submittedCount})</span>
                    </button>

                    <button
                      onClick={() => handleToggleScorePublish(task)}
                      className={`py-1.5 px-3 text-xs font-bold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                        task.isScorePublished
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title="Atur apakah nilai langsung terlihat oleh siswa atau disimpan sementara"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{task.isScorePublished ? 'Tutup Nilai' : 'Buka Nilai'}</span>
                    </button>

                    <button
                      onClick={() => onOpenTaskEditor(task)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="Edit Tugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submissions Section for Selected Task */}
      {selectedTaskForSubmissions && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase">Lembar Pemeriksaan Guru</span>
              <h3 className="font-extrabold text-gray-900 text-lg">
                Pengumpulan Tugas: {selectedTaskForSubmissions.title}
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Target Kelas: {selectedTaskForSubmissions.targetClasses.join(', ')}
            </span>
          </div>

          {submissions.filter(s => s.taskId === selectedTaskForSubmissions.id).length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Belum ada siswa yang mengumpulkan tugas ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-[11px] border-b">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3">Waktu Pengumpulan</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Nilai</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions
                    .filter(s => s.taskId === selectedTaskForSubmissions.id)
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{sub.studentName}</td>
                        <td className="py-3.5 px-3 font-semibold">{sub.studentClass}</td>
                        <td className="py-3.5 px-3">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          {sub.isLate && <span className="ml-1 text-[10px] text-rose-600 font-bold">(Terlambat)</span>}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            sub.status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.status === 'graded' ? 'Sudah Dinilai' : 'Perlu Diperiksa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-sm text-gray-900">
                          {sub.finalScore !== undefined ? `${sub.finalScore} / ${selectedTaskForSubmissions.maxScore}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onOpenGrading(selectedTaskForSubmissions, sub)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Koreksi & Nilai
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
