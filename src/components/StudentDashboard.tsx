import React, { useState, useEffect } from 'react';
import { Task, Submission, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Award,
  Calendar,
  Sparkles,
  BookOpen,
  Bell,
  ChevronRight,
  HelpCircle,
  Star
} from 'lucide-react';

interface StudentDashboardProps {
  onStartTask: (task: Task) => void;
  onViewResults: (task: Task, submission: Submission) => void;
  onOpenMaterials: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartTask,
  onViewResults,
  onOpenMaterials
}) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum' | 'proses' | 'selesai' | 'terlambat'>('semua');
  const [loading, setLoading] = useState(true);

  const studentId = currentUser?.id || 'siswa-guest';
  const studentClass = currentUser?.kelas || '5A';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allTasks, allSubs, allAnn] = await Promise.all([
          DataService.getTasks(),
          DataService.getAllSubmissions(),
          DataService.getAnnouncements()
        ]);

        // Filter tasks that match student class or 'Semua' and are published
        const myTasks = allTasks.filter(
          t => t.status === 'published' &&
          (t.targetClasses.includes(studentClass) || t.targetClasses.includes('Semua') || t.targetClasses.length === 0)
        );
        const mySubs = allSubs.filter(s => s.studentId === studentId);

        setTasks(myTasks);
        setSubmissions(mySubs);
        setAnnouncements(allAnn);
      } catch (e) {
        console.error('Error loading student dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId, studentClass]);

  const getSubmissionForTask = (taskId: string) => {
    return submissions.find(s => s.taskId === taskId);
  };

  const getTaskState = (task: Task) => {
    const sub = getSubmissionForTask(task.id);
    const isPastDue = new Date() > new Date(task.dueDate);

    if (sub && (sub.status === 'submitted' || sub.status === 'graded' || sub.status === 'returned')) {
      return { label: 'Sudah Dikumpulkan', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', type: 'selesai' };
    }
    if (sub && sub.status === 'draft') {
      return { label: 'Sedang Dikerjakan (Draf)', color: 'bg-amber-100 text-amber-800 border-amber-200', type: 'proses' };
    }
    if (isPastDue) {
      return { label: 'Terlambat', color: 'bg-rose-100 text-rose-800 border-rose-200', type: 'terlambat' };
    }
    return { label: 'Belum Dikerjakan', color: 'bg-blue-100 text-blue-800 border-blue-200', type: 'belum' };
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'semua') return true;
    const state = getTaskState(t);
    return state.type === filterStatus;
  });

  const completedCount = tasks.filter(t => getTaskState(t).type === 'selesai').length;
  const pendingCount = tasks.filter(t => getTaskState(t).type === 'belum' || getTaskState(t).type === 'proses').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Student Greeting Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full shadow-xs">
              <Star className="w-3.5 h-3.5 fill-blue-950" />
              Siswa Ceria SDI Al-Fahmiyah • Kelas {studentClass}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalamu’alaikum, {currentUser?.fullName}!
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              “Semangat belajar! Kerjakan setiap tugas dan latihan dengan jujur, teliti, dan penuh kegembiraan.”
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/20">
              <span className="text-2xl sm:text-3xl font-black block">{pendingCount}</span>
              <span className="text-xs text-blue-100 font-medium">Tugas Aktif</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/20">
              <span className="text-2xl sm:text-3xl font-black block text-yellow-300">{completedCount}</span>
              <span className="text-xs text-blue-100 font-medium">Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Board */}
      {announcements.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Pemberitahuan Guru & Madrasah</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 2).map((ann) => (
              <div key={ann.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {ann.category.toUpperCase()}
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-1">{ann.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">Oleh: {ann.authorName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'semua', label: 'Semua Tugas' },
            { id: 'belum', label: 'Belum Dikerjakan' },
            { id: 'proses', label: 'Sedang Dikerjakan' },
            { id: 'selesai', label: 'Sudah Dikumpulkan' },
            { id: 'terlambat', label: 'Terlambat' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenMaterials}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Buka Perpustakaan Materi & LKPD</span>
        </button>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          Memuat daftar tugas ananda...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Tidak ada tugas pada kategori ini</h3>
          <p className="text-xs text-gray-500 mt-1">Alhamdulillah, semua tugas terpantau dengan baik!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const sub = getSubmissionForTask(task.id);
            const state = getTaskState(task);
            const isCompleted = state.type === 'selesai';
            const hasScore = sub && sub.finalScore !== undefined && task.isScorePublished;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 truncate">
                      {task.subjectName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${state.color}`}>
                      {state.label}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-base leading-snug line-clamp-2">
                    {task.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {task.instructions}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Batas: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {task.durationMinutes > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Durasi: {task.durationMinutes} Menit</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Award className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.questions.length} Butir Soal • Skor Maks: {task.maxScore}</span>
                    </div>
                  </div>

                  {/* If graded & published, show score card */}
                  {hasScore && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">Nilai Kamu:</span>
                        <span className="text-lg font-black text-emerald-700">{sub.finalScore} / {task.maxScore}</span>
                      </div>
                      {sub.feedback && (
                        <p className="text-[11px] text-emerald-800 italic mt-1">
                          Guru: “{sub.feedback}”
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Card Button */}
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  {isCompleted ? (
                    <button
                      onClick={() => sub && onViewResults(task, sub)}
                      className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Lihat Riwayat & Ulasan Nilai</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartTask(task)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{state.type === 'proses' ? 'Lanjutkan Kerjakan' : 'Mulai Kerjakan Tugas'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
