import React, { useState, useEffect } from 'react';
import { Task, Submission, QuestionItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Upload,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Sparkles,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

interface StudentTaskRunnerProps {
  task: Task;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const StudentTaskRunner: React.FC<StudentTaskRunnerProps> = ({
  task,
  onClose,
  onSubmitted
}) => {
  const { currentUser } = useAuth();
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    task.durationMinutes > 0 ? task.durationMinutes * 60 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Baru saja');
  const [autoSaveNotice, setAutoSaveNotice] = useState<boolean>(false);

  const studentId = currentUser?.id || 'siswa-guest';
  const studentName = currentUser?.fullName || 'Siswa SDI Al-Fahmiyah';
  const studentClass = currentUser?.kelas || '5A';

  // Load existing draft if any
  useEffect(() => {
    async function loadExisting() {
      const sub = await DataService.getStudentSubmission(task.id, studentId);
      if (sub) {
        if (sub.status === 'submitted' || sub.status === 'graded') {
          setIsSubmitted(true);
        }
        if (sub.answers) setAnswers(sub.answers);
        if (sub.fileAttachments) setUploadedFiles(sub.fileAttachments);
      } else {
        // Check local storage backup
        const localBackup = localStorage.getItem(`draft_${task.id}_${studentId}`);
        if (localBackup) {
          try {
            setAnswers(JSON.parse(localBackup));
          } catch {}
        }
      }
    }
    loadExisting();
  }, [task.id, studentId]);

  // Timer countdown if duration > 0
  useEffect(() => {
    if (task.durationMinutes <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [task.durationMinutes, isSubmitted]);

  // Periodic autosave every 20 seconds
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      saveDraft();
    }, 20000);
    return () => clearInterval(interval);
  }, [answers, uploadedFiles, isSubmitted]);

  const saveDraft = async () => {
    try {
      localStorage.setItem(`draft_${task.id}_${studentId}`, JSON.stringify(answers));
      const submissionDoc: Submission = {
        id: `${task.id}_${studentId}`,
        taskId: task.id,
        taskTitle: task.title,
        studentId,
        studentName,
        studentClass,
        answers,
        fileAttachments: uploadedFiles,
        status: 'draft',
        updatedAt: new Date().toISOString()
      } as any;
      await DataService.saveSubmission(submissionDoc);
      setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setAutoSaveNotice(true);
      setTimeout(() => setAutoSaveNotice(false), 2000);
    } catch (e) {
      console.warn('Autosave warning:', e);
    }
  };

  const handleAutoSubmitOnTimeUp = () => {
    alert('Waktu pengerjaan telah habis! Jawaban Anda akan otomatis dikumpulkan ke guru.');
    handleSubmitFinal();
  };

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: val };
      localStorage.setItem(`draft_${task.id}_${studentId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      const newFile = {
        name: file.name,
        url: mockUrl,
        type: file.type || 'image/jpeg'
      };
      setUploadedFiles([...uploadedFiles, newFile]);
    }
  };

  const calculateAutoScore = () => {
    let score = 0;
    task.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (q.type === 'pilihan_ganda' || q.type === 'benar_salah') {
        if (studentAns && studentAns === q.answerKey) {
          score += q.maxScore;
        }
      }
      // For essay/proyek, scoring will be reviewed by teacher
    });
    return score;
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const autoScore = calculateAutoScore();
      const hasObjectiveOnly = task.questions.every(
        (q) => q.type === 'pilihan_ganda' || q.type === 'benar_salah'
      );

      const submission: Submission = {
        id: `${task.id}_${studentId}`,
        taskId: task.id,
        taskTitle: task.title,
        studentId,
        studentName,
        studentClass,
        answers,
        fileAttachments: uploadedFiles,
        status: hasObjectiveOnly ? 'graded' : 'submitted',
        submittedAt: new Date().toISOString(),
        isLate: new Date() > new Date(task.dueDate),
        autoScore,
        manualScore: hasObjectiveOnly ? autoScore : 0,
        finalScore: hasObjectiveOnly ? autoScore : 0,
        feedback: hasObjectiveOnly ? 'Alhamdulillah, tugas telah diperiksa secara otomatis.' : 'Tugas berhasil dikumpulkan. Menunggu koreksi guru.'
      };

      await DataService.saveSubmission(submission);
      localStorage.removeItem(`draft_${task.id}_${studentId}`);

      setIsSubmitted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      alert('Gagal mengumpulkan tugas: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ: QuestionItem | undefined = task.questions[currentIdx];
  const answeredCount = task.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Alhamdulillah! Tugas Terkirim
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-3">
              Tugas Berhasil Dikumpulkan
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Terima kasih ananda <strong>{studentName}</strong> (Kelas {studentClass}). Pekerjaanmu telah tersimpan rapi di sistem SDI Al-Fahmiyah.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 text-left text-xs text-emerald-950 space-y-2 border border-emerald-200">
            <div className="flex justify-between">
              <span>Judul Tugas:</span>
              <span className="font-bold">{task.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu Pengumpulan:</span>
              <span className="font-bold">{new Date().toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Soal Dijawab:</span>
              <span className="font-bold">{answeredCount} dari {task.questions.length} butir</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic">
            “Barangsiapa bersungguh-sungguh dalam menuntut ilmu, Allah mudahkan jalannya menuju kesuksesan.”
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Kembali ke Beranda Siswa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {task.subjectName} • {task.unit}
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-1">
            {task.title}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Siswa: <strong>{studentName}</strong> (Kelas {studentClass})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {task.durationMinutes > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
              remainingSeconds < 300
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          <button
            onClick={saveDraft}
            className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title="Simpan draf saat ini"
          >
            <Save className="w-3.5 h-3.5 text-gray-500" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {autoSaveNotice && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1.5 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Jawaban otomatis tersimpan dengan aman pada {lastSaved}</span>
        </div>
      )}

      {/* Motivational Reminder */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-center justify-between text-xs text-blue-900">
        <span className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          “Bismillah, semangat belajar! Kerjakan tugas ini dengan jujur, mandiri, dan teliti.”
        </span>
        <span className="font-bold text-emerald-700">
          Progres: {answeredCount} / {task.questions.length} Soal
        </span>
      </div>

      {/* Question Navigator Pills */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-500 mr-2">Navigasi Soal:</span>
        {task.questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
          const isCurrent = i === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Box */}
      {currentQ && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-extrabold text-sm text-blue-700">
              Soal Nomor {currentIdx + 1} dari {task.questions.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Skor Maksimal: {currentQ.maxScore} Poin
            </span>
          </div>

          {/* Stimulus if exists */}
          {currentQ.stimulus && (
            <div className="bg-amber-50/70 border-l-4 border-amber-400 p-4 rounded-r-xl text-gray-800 text-sm leading-relaxed">
              <strong className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-1">
                Bacalah dengan teliti:
              </strong>
              {currentQ.stimulus}
            </div>
          )}

          {/* Main Question Text */}
          <div className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            {currentQ.questionText}
          </div>

          {/* Answer Input based on Type */}
          {(currentQ.type === 'pilihan_ganda' || currentQ.type === 'literasi' || currentQ.type === 'numerasi') && currentQ.options && (
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleAnswerChange(currentQ.id, opt.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {opt.id}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {currentQ.type === 'benar_salah' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {['Benar', 'Salah'].map((val) => {
                const isSelected = answers[currentQ.id] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange(currentQ.id, val)}
                    className={`py-4 rounded-xl font-bold text-base border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {(currentQ.type === 'uraian' || currentQ.type === 'isian_singkat' || currentQ.type === 'proyek' || currentQ.type === 'praktik') && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 block">
                Tuliskan lembar jawabanmu:
              </label>
              <textarea
                rows={currentQ.type === 'isian_singkat' ? 2 : 5}
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Ketikkan jawaban dengan lengkap, jelas, dan santun..."
                className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
              />
            </div>
          )}

          {/* Photo/File Attachment Upload for Practice / Project */}
          {(currentQ.type === 'praktik' || currentQ.type === 'proyek' || task.taskType === 'praktik' || task.taskType === 'proyek') && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-3">
              <Upload className="w-8 h-8 text-blue-500 mx-auto" />
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  Unggah Foto Hasil Karya / Tulisan Tangan
                </span>
                <span className="text-[11px] text-gray-500">
                  Format gambar JPG, PNG, atau dokumen PDF (maksimal 5MB)
                </span>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="text-xs text-gray-600 cursor-pointer"
              />
              {uploadedFiles.length > 0 && (
                <div className="text-xs text-emerald-700 font-semibold pt-2">
                  Berkas terunggah: {uploadedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIdx < task.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kumpulkan Tugas</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal before Final Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-lg text-gray-900">
                Konfirmasi Pengumpulan Tugas
              </h3>
              <p className="text-xs text-gray-600 mt-2">
                Ananda telah menjawab <strong>{answeredCount}</strong> dari <strong>{task.questions.length}</strong> butir soal.
                Pastikan seluruh jawaban telah diteliti dengan cermat sebelum dikirim ke guru.
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Setelah dikumpulkan, tugas tidak dapat diubah kembali kecuali guru memberikan kesempatan remidi.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Mengirim...' : 'Bismillah, Kirim Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
