import React from 'react';
import { Task, Submission } from '../types';
import {
  X,
  CheckCircle,
  Award,
  MessageSquare,
  Clock,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface StudentResultModalProps {
  task: Task;
  submission: Submission;
  onClose: () => void;
}

export const StudentResultModal: React.FC<StudentResultModalProps> = ({
  task,
  submission,
  onClose
}) => {
  const isScorePublished = task.isScorePublished;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase">
              Hasil Asesmen Belajar
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">
              {task.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Siswa: <strong>{submission.studentName}</strong> (Kelas {submission.studentClass})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner */}
        {isScorePublished ? (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-100 font-bold block uppercase tracking-wider">
                Nilai Prestasi Ananda
              </span>
              <div className="text-4xl font-black mt-1">
                {submission.finalScore ?? submission.autoScore ?? 0}
                <span className="text-lg font-normal text-emerald-200"> / {task.maxScore}</span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                {((submission.finalScore ?? 0) / task.maxScore) * 100 >= 75
                  ? 'MasyaAllah! Ananda mencapai ketuntasan (KKTP).'
                  : 'Tetap bersemangat! Lakukan perbaikan konsep bersama guru.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-2">
            <Clock className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-blue-900">
              Tugas Sedang Dalam Pemeriksaan Guru
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed max-w-md mx-auto">
              Alhamdulillah, pekerjaan ananda telah tersimpan dengan aman pada{' '}
              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('id-ID') : 'baru saja'}.
              Bapak/Ibu guru sedang menelaah lembar jawaban. Nilai dan umpan balik akan ditampilkan setelah dibuka oleh guru.
            </p>
          </div>
        )}

        {/* Teacher Feedback Note if available */}
        {submission.feedback && isScorePublished && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Catatan & Umpan Balik Guru ({submission.gradedBy || 'Guru Kelas 5'}):</span>
            </div>
            <p className="text-xs text-gray-800 italic leading-relaxed pl-6">
              “{submission.feedback}”
            </p>
          </div>
        )}

        {/* Questions breakdown if published */}
        {isScorePublished && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2">
              Ulasan Butir Soal & Jawaban
            </h3>

            <div className="space-y-4">
              {task.questions.map((q, idx) => {
                const studentAns = submission.answers[q.id];
                const isObjective = q.type === 'pilihan_ganda' || q.type === 'benar_salah';
                const isCorrect = isObjective && studentAns === q.answerKey;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-gray-900">Soal {idx + 1}</span>
                      <span className={isCorrect ? 'text-emerald-700' : 'text-gray-600'}>
                        {isObjective ? (isCorrect ? 'Jawaban Tepat (+Skor Penuh)' : 'Belum Tepat') : 'Dinilai Guru'}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-800 text-sm">
                      {q.questionText}
                    </p>

                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                      <div>
                        <span className="text-gray-500 font-medium">Jawaban Ananda: </span>
                        <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {studentAns !== undefined && studentAns !== '' ? String(studentAns) : '(Tidak dijawab)'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Kunci Jawaban: </span>
                        <strong className="text-emerald-700">
                          {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : String(q.answerKey)}
                        </strong>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-gray-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        <strong className="text-blue-900 block mb-0.5">Pembahasan Materi:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
