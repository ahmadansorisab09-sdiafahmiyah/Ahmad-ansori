import React, { useState, useEffect } from 'react';
import { Task, Submission, Subject, LearningObjective, BloomLevel, BLOOM_DEFINITIONS } from '../types';
import { DataService } from '../services/dataService';
import {
  BarChart3,
  Download,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PieChart,
  Users,
  Award,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [kktpScore, setKktpScore] = useState<number>(75); // Kriteria Ketercapaian Tujuan Pembelajaran

  useEffect(() => {
    async function loadData() {
      const [tList, sList, subList] = await Promise.all([
        DataService.getTasks(),
        DataService.getAllSubmissions(),
        DataService.getSubjects()
      ]);
      setTasks(tList);
      setSubmissions(sList);
      setSubjects(subList);
    }
    loadData();
  }, []);

  const filteredTasks = selectedSubject === 'all'
    ? tasks
    : tasks.filter(t => t.subjectId === selectedSubject);

  const gradedSubs = submissions.filter(s => s.status === 'graded' || s.finalScore !== undefined);

  // Calculate Average Score
  const avgScore = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((a, b) => a + (b.finalScore || 0), 0) / gradedSubs.length)
    : 0;

  // Calculate KKTP Mastery Rate
  const masteredCount = gradedSubs.filter(s => {
    const task = tasks.find(t => t.id === s.taskId);
    if (!task || !task.maxScore) return false;
    const pct = ((s.finalScore || 0) / task.maxScore) * 100;
    return pct >= kktpScore;
  }).length;

  const masteryPercent = gradedSubs.length > 0
    ? Math.round((masteredCount / gradedSubs.length) * 100)
    : 0;

  // Calculate Bloom Taxonomy Distribution across all tasks
  const bloomCounts: Record<BloomLevel, number> = {
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0
  };

  tasks.forEach((t) => {
    t.questions.forEach((q) => {
      if (q.bloomLevel && bloomCounts[q.bloomLevel] !== undefined) {
        bloomCounts[q.bloomLevel]++;
      }
    });
  });

  // Export CSV for Excel
  const handleExportCsv = () => {
    const headers = ['Nama Siswa', 'Kelas', 'Judul Tugas', 'Mata Pelajaran', 'Skor Akhir', 'Skor Maksimal', 'Persentase', 'Status Ketuntasan (KKTP)', 'Waktu Pengumpulan'];
    const rows = submissions.map((sub) => {
      const task = tasks.find(t => t.id === sub.taskId);
      const maxScore = task?.maxScore || 100;
      const score = sub.finalScore || 0;
      const pct = Math.round((score / maxScore) * 100);
      const isMastered = pct >= kktpScore ? 'TUNTAS' : 'PERLU REMEDIAL';
      return [
        `"${sub.studentName}"`,
        `"${sub.studentClass}"`,
        `"${sub.taskTitle}"`,
        `"${task?.subjectName || '-'}"`,
        score,
        maxScore,
        `${pct}%`,
        isMastered,
        `"${sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : '-'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_SDI_AlFahmiyah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            Analisis Komprehensif Kurikulum Merdeka • SDI Al-Fahmiyah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Analisis Hasil Belajar & Rekap Nilai
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau ketuntasan KKTP, capaian Tujuan Pembelajaran (TP), dan sebaran tingkat kognitif Bloom C1 - C6 siswa.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Rekap Excel (CSV)</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Rata-Rata Nilai</span>
            <span className="text-2xl font-extrabold text-blue-700">{avgScore} Poin</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Ketuntasan KKTP (&ge;{kktpScore})</span>
            <span className="text-2xl font-extrabold text-emerald-700">{masteryPercent}% Siswa</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Pekerjaan Dikoreksi</span>
            <span className="text-2xl font-extrabold text-purple-700">{gradedSubs.length} Lembar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Kriteria Ketuntasan (KKTP)</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="number"
                min="50"
                max="90"
                value={kktpScore}
                onChange={(e) => setKktpScore(parseInt(e.target.value, 10) || 75)}
                className="w-14 bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5 text-xs font-bold text-gray-800"
              />
              <span className="text-[11px] text-gray-400">Poin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloom Taxonomy Level Distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Distribusi Tingkat Kognitif Taksonomi Bloom (C1 - C6)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Keseimbangan antara soal pemahaman dasar (LOTS) dan pemecahan masalah/kreasi (HOTS).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(bloomCounts) as BloomLevel[]).map((lvl) => {
            const count = bloomCounts[lvl];
            const def = BLOOM_DEFINITIONS[lvl];
            return (
              <div
                key={lvl}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center space-y-1"
              >
                <span className="text-xs font-extrabold text-gray-800 block">
                  {lvl} — {def.name}
                </span>
                <span className="text-2xl font-black text-indigo-600 block">
                  {count}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Butir Soal
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Submissions Results Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Daftar Rekap Nilai Siswa Real-Time ({submissions.length} Pengumpulan)
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Filter Mapel:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Belum ada data nilai pengumpulan siswa yang tersimpan di sistem.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Tugas</th>
                  <th className="py-3 px-3">Waktu Kumpul</th>
                  <th className="py-3 px-3">Skor</th>
                  <th className="py-3 px-3">Ketuntasan KKTP</th>
                  <th className="py-3 px-4">Rekomendasi Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => {
                  const task = tasks.find(t => t.id === sub.taskId);
                  const max = task?.maxScore || 100;
                  const score = sub.finalScore || 0;
                  const pct = Math.round((score / max) * 100);
                  const isTuntas = pct >= kktpScore;

                  return (
                    <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{sub.studentName}</td>
                      <td className="py-3 px-3 font-semibold">{sub.studentClass}</td>
                      <td className="py-3 px-3">{sub.taskTitle}</td>
                      <td className="py-3 px-3 text-gray-500">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-sm text-gray-900">
                        {score} / {max} ({pct}%)
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isTuntas ? 'TUNTAS' : 'BELUM TUNTAS'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-gray-600">
                          {isTuntas
                            ? 'Diberikan pengayaan materi HOTS level C5-C6'
                            : 'Perlu bimbingan remedial pada konsep dasar TP terkait'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
