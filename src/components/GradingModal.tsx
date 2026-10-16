import React, { useState } from 'react';
import { Task, Submission, QuestionItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import {
  X,
  CheckCircle,
  FileText,
  Save,
  MessageSquare,
  Award,
  History,
  FileCheck
} from 'lucide-react';

interface GradingModalProps {
  task: Task;
  submission: Submission;
  onClose: () => void;
  onSaved: () => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  task,
  submission,
  onClose,
  onSaved
}) => {
  const { currentUser } = useAuth();
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initScores: Record<string, number> = {};
    task.questions.forEach((q) => {
      const studentAns = submission.answers[q.id];
      if (q.type === 'pilihan_ganda' || q.type === 'benar_salah') {
        initScores[q.id] = studentAns === q.answerKey ? q.maxScore : 0;
      } else {
        initScores[q.id] = submission.manualScore || 0;
      }
    });
    return initScores;
  });

  const [feedback, setFeedback] = useState<string>(
    submission.feedback || 'Alhamdulillah, hasil pekerjaan ananda sangat baik. Terus tingkatkan semangat belajar dan ketelitiannya!'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleScoreChange = (qId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setScores(prev => ({ ...prev, [qId]: clamped }));
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSaveGrading = async () => {
    setIsSaving(true);
    try {
      const historyItem = {
        score: totalScore,
        timestamp: new Date().toISOString(),
        note: `Dinilai oleh ${currentUser?.fullName || 'Guru'}`
      };

      const updated: Submission = {
        ...submission,
        status: 'graded',
        finalScore: totalScore,
        manualScore: totalScore,
        feedback,
        gradedBy: currentUser?.fullName || 'Guru Kelas 5',
        gradedAt: new Date().toISOString(),
        scoreHistory: [...(submission.scoreHistory || []), historyItem]
      };

      await DataService.saveSubmission(updated);
      alert('Alhamdulillah! Nilai dan umpan balik berhasil disimpan untuk siswa.');
      onSaved();
      onClose();
    } catch (e: any) {
      alert('Gagal menyimpan nilai: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Lembar Koreksi & Penilaian Guru
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
              {submission.studentName} ({submission.studentClass})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tugas: {task.title} • {task.subjectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questions and Answers Grading list */}
        <div className="space-y-6">
          {task.questions.map((q, idx) => {
            const studentAns = submission.answers[q.id];
            const isObjective = q.type === 'pilihan_ganda' || q.type === 'benar_salah';
            const isCorrect = isObjective && studentAns === q.answerKey;

            return (
              <div
                key={q.id}
                className="bg-gray-50/70 rounded-2xl p-5 border border-gray-200 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="font-extrabold text-sm text-gray-900">
                    Soal {idx + 1} ({q.type.replace('_', ' ').toUpperCase()})
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700">Skor Diperoleh:</label>
                    <input
                      type="number"
                      min="0"
                      max={q.maxScore}
                      value={scores[q.id] ?? 0}
                      onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value, 10) || 0, q.maxScore)}
                      className="w-16 bg-white border border-gray-300 rounded-lg p-1.5 text-center font-bold text-sm text-blue-700"
                    />
                    <span className="text-xs text-gray-500">/ {q.maxScore}</span>
                  </div>
                </div>

                {q.stimulus && (
                  <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 italic">
                    {q.stimulus}
                  </p>
                )}

                <div className="text-sm font-semibold text-gray-800">
                  {q.questionText}
                </div>

                {/* Student Answer */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                  <strong className="text-gray-600 block">Jawaban Siswa:</strong>
                  <div className={`font-bold text-sm ${isObjective ? (isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-gray-900'}`}>
                    {studentAns !== undefined && studentAns !== '' ? String(studentAns) : '(Tidak dijawab)'}
                  </div>
                </div>

                {/* Teacher Rubric & Answer Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-100 text-emerald-950">
                    <strong className="block mb-0.5">Kunci Jawaban Guru:</strong>
                    <span>{Array.isArray(q.answerKey) ? q.answerKey.join(', ') : String(q.answerKey)}</span>
                  </div>
                  <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-100 text-blue-950">
                    <strong className="block mb-0.5">Pedoman Penskoran:</strong>
                    <span>{q.scoringRubric || 'Skor sesuai rubrik jawaban.'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Uploaded Attachments by Student */}
        {submission.fileAttachments && submission.fileAttachments.length > 0 && (
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-900 block">Lampiran Berkas / Foto Hasil Praktik Siswa:</span>
            <div className="flex flex-wrap gap-2">
              {submission.fileAttachments.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-50 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{f.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Feedback to Student */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Catatan & Umpan Balik Guru untuk Ananda:
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tuliskan apresiasi, masukan, atau bimbingan perbaikan..."
            className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        {/* Total Score Summary & Submit */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 font-bold block">Total Nilai Akhir Siswa:</span>
            <span className="text-2xl font-black text-emerald-700">
              {totalScore} <span className="text-sm font-normal text-gray-500">/ {task.maxScore}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-white cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveGrading}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai & Umpan Balik'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
