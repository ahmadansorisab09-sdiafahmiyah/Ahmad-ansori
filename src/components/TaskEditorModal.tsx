import React, { useState, useEffect } from 'react';
import {
  Task,
  Subject,
  LearningObjective,
  QuestionItem,
  TaskType,
  TaskStatus
} from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface TaskEditorModalProps {
  initialTask?: Task;
  importedQuestions?: QuestionItem[];
  onClose: () => void;
  onSaved: () => void;
  onOpenAiGenerator?: () => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  initialTask,
  importedQuestions,
  onClose,
  onSaved,
  onOpenAiGenerator
}) => {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionItem[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialTask?.title || '');
  const [subjectId, setSubjectId] = useState(initialTask?.subjectId || 'sub-ipas');
  const [unit, setUnit] = useState(initialTask?.unit || 'Bab 1: Cahaya dan Penglihatan');
  const [instructions, setInstructions] = useState(
    initialTask?.instructions || 'Bismillahirrohmanirrohim. Kerjakan dengan jujur, mandiri, dan teliti.'
  );
  const [taskType, setTaskType] = useState<TaskType>(initialTask?.taskType || 'formatif');
  const [targetClasses, setTargetClasses] = useState<string[]>(initialTask?.targetClasses || ['5A', '5B']);
  const [startDate, setStartDate] = useState(
    initialTask?.startDate ? initialTask.startDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate
      ? initialTask.dueDate.slice(0, 16)
      : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(initialTask?.durationMinutes || 45);
  const [allowRetake, setAllowRetake] = useState<boolean>(initialTask?.allowRetake || false);
  const [allowLate, setAllowLate] = useState<boolean>(initialTask?.allowLate !== false);
  const [isScorePublished, setIsScorePublished] = useState<boolean>(initialTask?.isScorePublished ?? true);
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'published');
  const [questions, setQuestions] = useState<QuestionItem[]>(
    initialTask?.questions || importedQuestions || []
  );

  useEffect(() => {
    async function loadData() {
      const [subs, bank] = await Promise.all([
        DataService.getSubjects(),
        DataService.getQuestionBank()
      ]);
      setSubjects(subs);
      setQuestionBank(bank);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
    }
    loadData();
  }, []);

  const toggleClass = (cls: string) => {
    if (targetClasses.includes(cls)) {
      if (targetClasses.length > 1) {
        setTargetClasses(targetClasses.filter(c => c !== cls));
      }
    } else {
      setTargetClasses([...targetClasses, cls]);
    }
  };

  const handleAddQuestionFromBank = (q: QuestionItem) => {
    if (!questions.some(item => item.id === q.id)) {
      setQuestions([...questions, q]);
    }
    setShowBankPicker(false);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleAddManualQuestion = () => {
    const newQ: QuestionItem = {
      id: `manual-q-${Date.now()}`,
      bloomLevel: 'C2',
      type: 'pilihan_ganda',
      questionText: 'Tuliskan pertanyaan soal baru di sini...',
      options: [
        { id: 'A', text: 'Pilihan A' },
        { id: 'B', text: 'Pilihan B' },
        { id: 'C', text: 'Pilihan C' },
        { id: 'D', text: 'Pilihan D' }
      ],
      answerKey: 'A',
      maxScore: 10,
      difficulty: 'Sedang',
      explanation: 'Pembahasan jawaban.',
      scoringRubric: 'Skor 10 untuk jawaban tepat.'
    };
    setQuestions([...questions, newQ]);
  };

  const totalMaxScore = questions.reduce((acc, q) => acc + (q.maxScore || 10), 0);

  const handleSave = async (targetStatus?: TaskStatus) => {
    if (!title.trim()) {
      alert('Judul tugas tidak boleh kosong.');
      return;
    }
    if (questions.length === 0) {
      alert('Tugas harus memiliki minimal 1 butir soal.');
      return;
    }

    const curSub = subjects.find(s => s.id === subjectId);
    const finalTask: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      subjectId,
      subjectName: curSub?.name || 'Mata Pelajaran',
      unit,
      instructions,
      taskType,
      targetClasses,
      questions,
      startDate: new Date(startDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      durationMinutes,
      allowRetake,
      allowLate,
      maxScore: totalMaxScore,
      isScorePublished,
      status: targetStatus || status,
      teacherId: currentUser?.id || 'teacher-01',
      teacherName: currentUser?.fullName || 'Guru Kelas 5',
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await DataService.saveTask(finalTask);
      alert('Alhamdulillah! Tugas berhasil disimpan.');
      onSaved();
      onClose();
    } catch (e: any) {
      alert('Gagal menyimpan tugas: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Pusat Perumusan Asesmen & Penugasan
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
              {initialTask ? 'Edit Tugas Online' : 'Buat Tugas / Asesmen Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Identity Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="font-bold text-gray-700 block mb-1">Judul Tugas / Asesmen:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Asesmen Formatif IPAS 1: Menyelidiki Sifat Cahaya"
              className="w-full border rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Mata Pelajaran (Kelas 5 SD):</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Bab / Unit Pembelajaran:</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Contoh: Bab 1: Melihat karena Cahaya"
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Jenis Tugas:</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 font-medium"
            >
              <option value="formatif">Asesmen Formatif (Penilaian Harian)</option>
              <option value="sumatif">Asesmen Sumatif (Lingkup Materi / STS / SAS)</option>
              <option value="latihan">Latihan Soal Mandiri</option>
              <option value="proyek">Tugas Proyek & Produk</option>
              <option value="praktik">Tugas Praktik & Eksperimen</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Target Kelas Siswa:</label>
            <div className="flex gap-2 pt-1">
              {['5A', '5B'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClass(c)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                    targetClasses.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  Kelas {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-gray-700 block mb-1">Petunjuk Pengerjaan untuk Siswa:</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Schedule & Rules */}
        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-blue-950 block mb-1">Batas Pengumpulan (Tenggat):</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-blue-950 block mb-1">Durasi Ujian (Menit):</label>
            <input
              type="number"
              min="0"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
              placeholder="0 = Tanpa batas waktu"
              className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs"
            />
            <span className="text-[10px] text-blue-700 italic">0 = Tanpa batas waktu pengerjaan</span>
          </div>

          <div className="flex flex-col justify-center space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-950">
              <input
                type="checkbox"
                checked={allowLate}
                onChange={(e) => setAllowLate(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Izinkan Keterlambatan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-950">
              <input
                type="checkbox"
                checked={isScorePublished}
                onChange={(e) => setIsScorePublished(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Buka Nilai Langsung ke Siswa</span>
            </label>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                Daftar Butir Soal ({questions.length} Butir • Total Skor: {totalMaxScore})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBankPicker(true)}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pilih dari Bank Soal</span>
              </button>
              <button
                type="button"
                onClick={handleAddManualQuestion}
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal Manual</span>
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs">
              Belum ada soal ditambahkan. Gunakan Bank Soal atau Buat Soal AI.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.bloomLevel}
                      </span>
                      <span className="font-semibold text-gray-600">
                        {q.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-gray-500">
                        Skor Maks: {q.maxScore}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {q.questionText}
                    </p>
                    <span className="text-emerald-700 font-medium">
                      Kunci: {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : String(q.answerKey)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Hapus soal dari tugas ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bank Picker */}
        {showBankPicker && (
          <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-sm text-gray-900">
                  Pilih Soal dari Bank Soal SDI ({questionBank.length} Soal)
                </h4>
                <button onClick={() => setShowBankPicker(false)} className="cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                {questionBank.map((bq) => (
                  <div
                    key={bq.id}
                    onClick={() => handleAddQuestionFromBank(bq)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 cursor-pointer text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-blue-700">{bq.subjectName} • {bq.bloomLevel}</span>
                      <span className="text-gray-500">Skor: {bq.maxScore}</span>
                    </div>
                    <p className="text-gray-800 line-clamp-2">{bq.questionText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Batal
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Simpan Sebagai Draf
            </button>
            <button
              onClick={() => handleSave('published')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan Tugas Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
