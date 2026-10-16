import React, { useState, useEffect } from 'react';
import { QuestionItem, Subject, BloomLevel, BLOOM_DEFINITIONS } from '../types';
import { DataService } from '../services/dataService';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  Trash2,
  Edit3,
  CheckCircle,
  HelpCircle,
  Layers,
  Award
} from 'lucide-react';

interface QuestionBankViewProps {
  onOpenAiGenerator: () => void;
  onAddToTask?: (q: QuestionItem) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onOpenAiGenerator,
  onAddToTask
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedBloom, setSelectedBloom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, sList] = await Promise.all([
        DataService.getQuestionBank(),
        DataService.getSubjects()
      ]);
      setQuestions(qList);
      setSubjects(sList);
    } catch (e) {
      console.error('Error loading question bank:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Bapak/Ibu yakin ingin menghapus butir soal ini dari Bank Soal?')) {
      await DataService.deleteQuestionFromBank(id);
      loadData();
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
    if (selectedBloom !== 'all' && q.bloomLevel !== selectedBloom) return false;
    if (searchQuery.trim()) {
      const matchText = (q.questionText + (q.stimulus || '') + (q.tpDescription || '')).toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
            Perbendaharaan Soal Terverifikasi • SDI Al-Fahmiyah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Bank Soal Asesmen Kelas 5 SD
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kumpulan butir soal terstandar Taksonomi Bloom C1 - C6 lengkap dengan stimulus, kunci jawaban, dan rubrik penskoran.
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Tambah Soal Cerdas dengan AI</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
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

          <span className="font-bold text-gray-700 ml-2">Level Bloom:</span>
          <select
            value={selectedBloom}
            onChange={(e) => setSelectedBloom(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">Semua Level (C1 - C6)</option>
            <option value="C1">C1 — Mengingat</option>
            <option value="C2">C2 — Memahami</option>
            <option value="C3">C3 — Menerapkan</option>
            <option value="C4">C4 — Menganalisis</option>
            <option value="C5">C5 — Mengevaluasi</option>
            <option value="C6">C6 — Mencipta</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari teks pertanyaan / stimulus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-xl text-xs w-64"
          />
        </div>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm">
          Tidak ditemukan butir soal yang sesuai. Silakan buat soal baru menggunakan Generator AI.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const bloomInfo = BLOOM_DEFINITIONS[q.bloomLevel] || {
              name: q.bloomLevel,
              color: 'bg-gray-100 text-gray-800 border-gray-300'
            };

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${bloomInfo.color}`}>
                      {q.bloomLevel} — {bloomInfo.name}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {q.subjectName || 'Mata Pelajaran'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Tipe: <strong>{q.type.replace('_', ' ').toUpperCase()}</strong>
                    </span>
                    <span className="text-xs text-gray-500">
                      Skor Maks: <strong>{q.maxScore}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onAddToTask && (
                      <button
                        onClick={() => {
                          onAddToTask(q);
                          alert('Soal berhasil ditambahkan ke draf tugas!');
                        }}
                        className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 cursor-pointer"
                      >
                        + Tambah ke Tugas
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stimulus */}
                {q.stimulus && (
                  <div className="bg-amber-50/60 border-l-4 border-amber-400 p-3 rounded-r-lg text-xs text-gray-800 leading-relaxed">
                    <strong className="text-amber-900 block font-bold mb-0.5">Stimulus:</strong>
                    {q.stimulus}
                  </div>
                )}

                {/* Question Text */}
                <div className="font-bold text-gray-900 text-sm">
                  {q.questionText}
                </div>

                {/* Options if any */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = q.answerKey === opt.id || (Array.isArray(q.answerKey) && q.answerKey.includes(opt.id));
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                            isCorrect ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                          {isCorrect && <span className="ml-auto text-[10px] text-emerald-700">(Kunci)</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Details Footer */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <strong className="text-gray-700 block mb-0.5">Kunci & Pembahasan:</strong>
                    <span className="text-emerald-800 font-bold">Kunci: {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : String(q.answerKey)}</span>
                    <p className="mt-0.5 text-gray-600">{q.explanation}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 block mb-0.5">Pedoman Penskoran:</strong>
                    <p>{q.scoringRubric || 'Skor maksimal diberikan jika jawaban lengkap dan tepat.'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
