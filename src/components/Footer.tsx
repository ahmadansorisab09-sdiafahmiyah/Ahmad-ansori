import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base block tracking-tight">
                  TUGAS ONLINE SDI AL-FAHMIYAH
                </span>
                <span className="text-yellow-400 font-extrabold text-xs block">
                  MOTTO: CERIA BERIMAN
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              “Belajar dengan Gembira, Berkarya dengan Ilmu, Berakhlak dengan Iman.”
            </p>
            <p className="text-[11px] text-gray-500">
              LMS pembelajaran, penugasan, dan asesmen formatif-sumatif Kelas 5 SD Fase C.
            </p>
          </div>

          {/* Col 2: System Capabilities */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Standar Keamanan & Teknologi
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Cloud Firestore Online Database Terintegrasi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>AI Generator Soal Kurikulum Merdeka (Bloom C1 - C6)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Hak Akses Berjenjang (Siswa, Guru, Admin)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Autosave & Pencegahan Pengiriman Ganda</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Motto & Character */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Nilai Karakter SDI Al-Fahmiyah
            </h4>
            <div className="bg-gray-800/80 p-3.5 rounded-xl border border-gray-700/80 space-y-1.5 text-gray-300">
              <div className="font-bold text-emerald-300">Ceria Beriman:</div>
              <p className="text-[11px] leading-relaxed">
                Membangun generasi pembelajar yang giat, berkarakter santun, berjiwa qur’ani, dan menguasai teknologi abad ke-21.
              </p>
            </div>
            <div className="text-[11px] text-gray-500">
              © {new Date().getFullYear()} SDI Al-Fahmiyah. Seluruh Hak Cipta Dilindungi.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
