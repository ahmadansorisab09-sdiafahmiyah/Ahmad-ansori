import React, { useState, useEffect } from 'react';
import {
  Subject,
  LearningObjective,
  QuestionItem,
  BloomLevel,
  QuestionType,
  BLOOM_DEFINITIONS
} from '../types';
import { DataService } from '../services/dataService';
import { AiService, VerificationResult } from '../services/aiService';
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  RefreshCw,
  Eye,
  PlusCircle,
  Save,
  HelpCircle,
  Layers,
  Award,
  ArrowRight,
  X,
  FileCheck2,
  Lightbulb
} from 'lucide-react';

interface AiQuestionGeneratorProps {
  onAddQuestionsToTask?: (questions: QuestionItem[]) => void;
  onNavigateToTaskEditor?: () => void;
}

export const AiQuestionGenerator: React.FC<AiQuestionGeneratorProps> = ({
  onAddQuestionsToTask,
  onNavigateToTaskEditor
}) => {
  // Subjects and TPs state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-ipas');
  const [selectedTpId, setSelectedTpId] = useState<string>('');
  const [unitName, setUnitName] = useState<string>('Bab 1: Cahaya dan Penglihatan');
  const [subUnit, setSubUnit] = useState<string>('Sifat-sifat Cahaya & Pembiasan');
  const [customTp, setCustomTp] = useState<string>('Menjelaskan sifat-sifat cahaya (merambat lurus, dipantulkan, menembus benda bening, dan dibiaskan) melalui pengamatan nyata.');
  const [cp, setCp] = useState<string>('Peserta didik menganalisis hubungan antara bentuk serta fungsi pancaindra pada manusia.');
  const [semester, setSemester] = useState<string>('1 (Ganjil)');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [questionType, setQuestionType] = useState<QuestionType>('pilihan_ganda');
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [selectedBloomLevels, setSelectedBloomLevels] = useState<BloomLevel[]>(['C2', 'C3', 'C4']);
  const [context, setContext] = useState<string>('Lingkungan sekolah SDI Al-Fahmiyah, sains sehari-hari, dan keluarga');
  const [literacyFocus, setLiteracyFocus] = useState<string>('Stimulus teks cerita pendek kontekstual dan tabel data');

  // Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal / Preview / Edit states
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [verificationModal, setVerificationModal] = useState<{
    question: QuestionItem;
    result: VerificationResult;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load subjects and TPs
  useEffect(() => {
    async function loadData() {
      const subs = await DataService.getSubjects();
      setSubjects(subs);
      if (subs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subs[0].id);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadTps() {
      if (!selectedSubjectId) return;
      const tps = await DataService.getLearningObjectives(selectedSubjectId);
      setLearningObjectives(tps);
      if (tps.length > 0) {
        setSelectedTpId(tps[0].id);
        setCustomTp(tps[0].description);
        setUnitName(tps[0].unitName || 'Materi Pembelajaran');
        if (tps[0].cp) setCp(tps[0].cp);
      }
    }
    loadTps();
  }, [selectedSubjectId]);

  const handleTpSelect = (tpId: string) => {
    setSelectedTpId(tpId);
    const found = learningObjectives.find(t => t.id === tpId);
    if (found) {
      setCustomTp(found.description);
      setUnitName(found.unitName);
      if (found.cp) setCp(found.cp);
    }
  };

  const toggleBloomLevel = (lvl: BloomLevel) => {
    if (selectedBloomLevels.includes(lvl)) {
      if (selectedBloomLevels.length > 1) {
        setSelectedBloomLevels(selectedBloomLevels.filter(l => l !== lvl));
      }
    } else {
      setSelectedBloomLevels([...selectedBloomLevels, lvl]);
    }
  };

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Generate Questions via Backend
  const handleGenerate = async () => {
    if (!customTp.trim()) {
      setStatusMessage({ type: 'error', text: 'Tujuan Pembelajaran (TP) tidak boleh kosong.' });
      return;
    }

    setIsGenerating(true);
    setStatusMessage({ type: 'info', text: 'Sedang merumuskan soal berbasis Taksonomi Bloom dan kurikulum SDI Al-Fahmiyah...' });

    try {
      const questions = await AiService.generateQuestions({
        subjectName: currentSubject ? currentSubject.name : 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
        unitName,
        subUnit,
        learningObjective: customTp,
        cp,
        questionCount,
        questionType,
        difficulty,
        bloomLevels: selectedBloomLevels,
        context,
        literacyNumeracyFocus: literacyFocus
      });

      setGeneratedQuestions(questions);
      setStatusMessage({
        type: 'success',
        text: `Alhamdulillah! Berhasil menghasilkan ${questions.length} butir soal. Silakan telaah, edit, dan simpan ke bank soal.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghasilkan soal dengan AI. Pastikan server aktif.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Verify alignment with AI
  const handleVerifyAlignment = async (q: QuestionItem) => {
    setIsVerifying(true);
    try {
      const result = await AiService.verifyQuestion(q, customTp);
      setVerificationModal({ question: q, result });
    } catch (err: any) {
      alert('Gagal melakukan telaah otomatis: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Save single question to Bank Soal
  const handleSaveToBank = async (q: QuestionItem) => {
    try {
      await DataService.saveQuestionToBank({
        ...q,
        subjectId: selectedSubjectId,
        subjectName: currentSubject?.name || 'Mata Pelajaran'
      });
      alert('Alhamdulillah! Butir soal berhasil disimpan ke Bank Soal SDI Al-Fahmiyah.');
    } catch (err: any) {
      alert('Gagal menyimpan soal: ' + err.message);
    }
  };

  // Delete question from review list
  const handleDeleteQuestion = (id: string) => {
    setGeneratedQuestions(generatedQuestions.filter(q => q.id !== id));
  };

  // Save edited question
  const handleSaveEdit = (updated: QuestionItem) => {
    setGeneratedQuestions(generatedQuestions.map(q => (q.id === updated.id ? updated : q)));
    setEditingQuestion(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-blue-950" />
            FITUR UTAMA LMS: GENERATOR SOAL EDUKASI BERBASIS BLOOM C1 - C6
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pembuat Soal Asesmen Cerdas SDI Al-Fahmiyah
          </h1>
          <p className="mt-2 text-blue-100 max-w-3xl text-sm sm:text-base leading-relaxed">
            Menghasilkan butir soal formatif & sumatif berkualitas tinggi untuk Kelas 5 SD Fase C. Soal dirancang
            menyeluruh dengan stimulus kontekstual, indikator, level kognitif Bloom yang tepat, rubrik penskoran, dan kunci jawaban terpercaya.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-spin" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <BookOpen className="w-5 h-5 text-blue-600" />
              1. Identitas Mata Pelajaran & Kurikulum Kelas 5 SD
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mata Pelajaran (Kelas 5 SD Fase C)
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Semester & Jenjang
                </label>
                <div className="flex gap-2">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
                    <option value="2 (Genap)">Semester 2 (Genap)</option>
                  </select>
                  <span className="inline-flex items-center px-3 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 whitespace-nowrap">
                    Kelas 5 SD (Fase C)
                  </span>
                </div>
              </div>
            </div>

            {/* TP Quick Selection */}
            {learningObjectives.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Pilih Tujuan Pembelajaran (TP) Tersimpan:
                </label>
                <select
                  value={selectedTpId}
                  onChange={(e) => handleTpSelect(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {learningObjectives.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      [{tp.code}] {tp.unitName} - {tp.description.slice(0, 80)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Bab / Unit Pembelajaran
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Contoh: Bab 1: Melihat karena Cahaya"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Submateri / Topik Khusus
                </label>
                <input
                  type="text"
                  value={subUnit}
                  onChange={(e) => setSubUnit(e.target.value)}
                  placeholder="Contoh: Pembiasan cahaya pada medium air"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Tujuan Pembelajaran (TP) yang Diukur (Wajib & Spesifik)
              </label>
              <textarea
                rows={2}
                value={customTp}
                onChange={(e) => setCustomTp(e.target.value)}
                placeholder="Tuliskan TP yang hendak diuji oleh soal..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Capaian Pembelajaran (CP)
              </label>
              <input
                type="text"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
                placeholder="Capaian pembelajaran kurikulum..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cognitive & Bloom Taxonomy Configuration */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
              <Layers className="w-5 h-5 text-indigo-600" />
              2. Level Kognitif Taksonomi Bloom (Revisi)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Pilih satu atau beberapa level Bloom yang diinginkan. Soal yang dihasilkan akan secara tegas mencerminkan karakteristik level tersebut.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(BLOOM_DEFINITIONS) as BloomLevel[]).map((lvl) => {
                const def = BLOOM_DEFINITIONS[lvl];
                const isSelected = selectedBloomLevels.includes(lvl);
                return (
                  <div
                    key={lvl}
                    onClick={() => toggleBloomLevel(lvl)}
                    className={`cursor-pointer rounded-xl p-3 border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-gray-900">
                        {lvl} — {def.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium line-clamp-2">
                      {def.desc}
                    </p>
                    <div className="mt-2 text-[10px] text-indigo-700 italic">
                      Kata kerja: {def.verbs.slice(0, 40)}...
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Format & Context */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Award className="w-5 h-5 text-emerald-600" />
              3. Format Soal, Konteks & Literasi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Jenis Butir Soal
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="pilihan_ganda">1. Pilihan Ganda (4 Opsi A-D)</option>
                  <option value="pilihan_ganda_kompleks">2. Pilihan Ganda Kompleks (Centang Lebih dari 1)</option>
                  <option value="benar_salah">3. Benar / Salah</option>
                  <option value="menjodohkan">4. Menjodohkan (Matching)</option>
                  <option value="isian_singkat">5. Isian Singkat</option>
                  <option value="uraian">6. Uraian / Essay (dengan Rubrik)</option>
                  <option value="literasi">7. Teks Literasi Mendalam</option>
                  <option value="numerasi">8. Soal Numerasi & Tabel Data</option>
                  <option value="proyek">9. Tugas Proyek / Produk</option>
                  <option value="praktik">10. Tugas Praktik & Unggah Bukti</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Mudah">Mudah (Dasar & Langsung)</option>
                  <option value="Sedang">Sedang (Standar Kelas 5 SD)</option>
                  <option value="Sukar">Sukar (HOTS / Pemecahan Masalah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Jumlah Soal Dihasilkan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                  <span className="w-8 text-center font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 text-sm">
                    {questionCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Konteks Soal (Kearifan Lokal & Kehidupan Nyata)
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Contoh: Lingkungan SDI Al-Fahmiyah, keluarga, masjid, alam sekitar"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Pengaturan Stimulus & Literasi
                </label>
                <input
                  type="text"
                  value={literacyFocus}
                  onChange={(e) => setLiteracyFocus(e.target.value)}
                  placeholder="Contoh: Cerita inspiratif, tabel pengamatan, infografis sederhana"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Bloom Summary & Action Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl p-6 shadow-md">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-yellow-300 mb-3">
              <Lightbulb className="w-5 h-5" />
              Panduan Bloom SDI Al-Fahmiyah
            </h3>
            <div className="space-y-3 text-xs text-indigo-100 leading-relaxed">
              <div className="bg-white/10 p-2.5 rounded-lg">
                <strong className="text-white block font-semibold mb-0.5">Aturan Anti-AI Slop:</strong>
                Soal C6 (Mencipta) benar-benar menuntut anak merancang karya/solusi, bukan pilihan ganda hafalan yang ditempeli label C6.
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg">
                <strong className="text-white block font-semibold mb-0.5">Prinsip Guru Berdaulat:</strong>
                Soal dari AI berstatus draf. Guru berhak memeriksa, mengoreksi, menghapus, atau memvalidasi sebelum diberikan ke siswa.
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Sedang Menghasilkan Soal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span>Mulai Buat Soal Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Actions if questions exist */}
          {generatedQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Tindakan Batch ({generatedQuestions.length} Soal Siap)
              </h4>
              <button
                onClick={() => {
                  if (onAddQuestionsToTask) {
                    onAddQuestionsToTask(generatedQuestions);
                    if (onNavigateToTaskEditor) onNavigateToTaskEditor();
                  } else {
                    alert('Pertanyaan telah siap ditautkan ke tugas.');
                  }
                }}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambahkan Semua ke Tugas Baru</span>
              </button>
              <button
                onClick={async () => {
                  for (const q of generatedQuestions) {
                    await DataService.saveQuestionToBank({
                      ...q,
                      subjectId: selectedSubjectId,
                      subjectName: currentSubject?.name || 'Mata Pelajaran'
                    });
                  }
                  alert(`Alhamdulillah, ${generatedQuestions.length} soal berhasil disimpan ke Bank Soal!`);
                }}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua ke Bank Soal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generated Questions List Section */}
      {generatedQuestions.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Daftar Butir Soal Hasil Generator ({generatedQuestions.length} Soal)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Periksa setiap butir soal, kunci jawaban, dan rubrik penskoran sebelum diterbitkan.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              Mata Pelajaran: {currentSubject?.name}
            </span>
          </div>

          <div className="space-y-6">
            {generatedQuestions.map((q, idx) => {
              const bloomInfo = BLOOM_DEFINITIONS[q.bloomLevel] || {
                name: q.bloomLevel,
                color: 'bg-gray-100 text-gray-800 border-gray-300'
              };

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all"
                >
                  {/* Question Card Top Bar */}
                  <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bloomInfo.color}`}>
                        {q.bloomLevel} — {bloomInfo.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {q.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        Tingkat: <strong>{q.difficulty}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyAlignment(q)}
                        disabled={isVerifying}
                        className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Telaah keselarasan soal dengan TP menggunakan AI"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Telaah AI</span>
                      </button>
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Lihat tampilan soal sebagaimana dilihat siswa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau Siswa</span>
                      </button>
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit soal ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleSaveToBank(q)}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Simpan ke Bank Soal"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="Hapus soal ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6 space-y-4">
                    {/* TP & Indikator */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <strong className="text-gray-700 block mb-0.5">Tujuan Pembelajaran (TP):</strong>
                        <span className="text-gray-600">{q.tpDescription || customTp}</span>
                      </div>
                      <div>
                        <strong className="text-gray-700 block mb-0.5">Indikator Soal & Alasan Bloom:</strong>
                        <span className="text-gray-600">{q.indicator} — <em className="text-indigo-700">({q.bloomReason})</em></span>
                      </div>
                    </div>

                    {/* Stimulus if any */}
                    {q.stimulus && (
                      <div className="bg-amber-50/60 border-l-4 border-amber-400 p-4 rounded-r-xl">
                        <strong className="text-xs uppercase tracking-wider text-amber-900 block font-bold mb-1">
                          Stimulus Kontekstual:
                        </strong>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {q.stimulus}
                        </p>
                      </div>
                    )}

                    {/* Question Text */}
                    <div>
                      <strong className="text-sm font-bold text-gray-900 block mb-2">
                        Pertanyaan:
                      </strong>
                      <p className="text-base text-gray-800 font-medium leading-relaxed">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Options if Objective */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                        {q.options.map((opt) => {
                          const isCorrect = q.answerKey === opt.id || (Array.isArray(q.answerKey) && q.answerKey.includes(opt.id));
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border text-sm flex items-start gap-2.5 ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold'
                                  : 'bg-gray-50 border-gray-200 text-gray-800'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <span className="ml-auto text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                                  Kunci
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Teacher Guide: Answer Key, Explanation, Rubric */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-900 font-bold block mb-1">
                          Kunci Jawaban & Pembahasan:
                        </strong>
                        <div className="text-emerald-800 font-semibold mb-1">
                          Kunci: {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : String(q.answerKey)}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <strong className="text-blue-900 font-bold block mb-1">
                          Pedoman Penskoran & Rubrik (Skor Maksimal: {q.maxScore}):
                        </strong>
                        <p className="text-gray-700 leading-relaxed">
                          {q.scoringRubric}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Verification Result from AI */}
      {verificationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Hasil Telaah Butir Soal AI
              </h3>
              <button
                onClick={() => setVerificationModal(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <span className="font-semibold text-gray-700">Skor Kelayakan Butir:</span>
                <span className="font-extrabold text-lg text-emerald-600">
                  {verificationModal.result.scoreOutOf100} / 100
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {verificationModal.result.isAligned ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-gray-800">
                    Keselarasan dengan TP: {verificationModal.result.isAligned ? 'Sangat Selaras' : 'Kurang Selaras'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {verificationModal.result.bloomAccurate ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-gray-800">
                    Ketepatan Level Bloom: {verificationModal.result.bloomAccurate ? 'Tepat' : `Disarankan: ${verificationModal.result.suggestedBloom}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {verificationModal.result.keyIsCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-gray-800">
                    Kunci Jawaban: {verificationModal.result.keyIsCorrect ? 'Valid & Tidak Ambigu' : 'Perlu Diperiksa Kembali'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl text-xs text-gray-700 space-y-1">
                <strong>Analisis Telaah:</strong>
                <p>{verificationModal.result.analysis}</p>
              </div>

              {verificationModal.result.suggestions && (
                <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-900 space-y-1">
                  <strong>Saran Perbaikan:</strong>
                  <p>{verificationModal.result.suggestions}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setVerificationModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Tutup Telaah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive Student Preview */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                  Mode Siswa
                </span>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Pratinjau Tampilan Siswa SDI Al-Fahmiyah
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              {previewQuestion.stimulus && (
                <div className="p-3 bg-white rounded-lg border border-amber-200 text-gray-800 text-xs leading-relaxed">
                  <strong className="text-amber-800 block mb-1">Bacalah teks/stimulus berikut:</strong>
                  {previewQuestion.stimulus}
                </div>
              )}

              <div className="font-semibold text-gray-900 text-base">
                {previewQuestion.questionText}
              </div>

              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div className="space-y-2">
                  {previewQuestion.options.map(opt => (
                    <label
                      key={opt.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <input type="radio" name="preview_ans" className="mt-0.5" />
                      <span className="font-bold text-gray-700">{opt.id}.</span>
                      <span className="text-gray-800">{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {previewQuestion.type === 'uraian' && (
                <textarea
                  rows={3}
                  placeholder="Lembar jawaban siswa akan diketikkan di sini..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-xs"
                />
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Question */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Edit Butir Soal
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Pertanyaan:</label>
                <textarea
                  rows={3}
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Stimulus (Opsional):</label>
                <textarea
                  rows={3}
                  value={editingQuestion.stimulus || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, stimulus: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Kunci Jawaban:</label>
                  <input
                    type="text"
                    value={String(editingQuestion.answerKey)}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, answerKey: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Skor Maksimal:</label>
                  <input
                    type="number"
                    value={editingQuestion.maxScore}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, maxScore: parseInt(e.target.value, 10) || 10 })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pembahasan:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Rubrik Penskoran:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.scoringRubric || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, scoringRubric: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveEdit(editingQuestion)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
