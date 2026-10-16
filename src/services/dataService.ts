import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Subject,
  LearningObjective,
  QuestionItem,
  Task,
  Submission,
  Material,
  Announcement,
  AppUser
} from '../types';

// INITIAL SEED DATA FOR SDI AL-FAHMIYAH (KELAS 5 SD FASE C)
export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-pai',
    name: 'Pendidikan Agama Islam dan Budi Pekerti',
    code: 'PAI-BP',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I',
    isActive: true,
    color: 'emerald',
    icon: 'book-open'
  },
  {
    id: 'sub-pancasila',
    name: 'Pendidikan Pancasila',
    code: 'PPKN-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ibu Siti Rahmah, S.Pd',
    isActive: true,
    color: 'rose',
    icon: 'shield'
  },
  {
    id: 'sub-bindo',
    name: 'Bahasa Indonesia',
    code: 'BIND-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ibu Nurul Hidayati, M.Pd',
    isActive: true,
    color: 'amber',
    icon: 'file-text'
  },
  {
    id: 'sub-mtk',
    name: 'Matematika',
    code: 'MTK-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Bpk. Hendra Pratama, S.Si',
    isActive: true,
    color: 'blue',
    icon: 'calculator'
  },
  {
    id: 'sub-ipas',
    name: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    code: 'IPAS-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ibu Dewi Sartika, M.Pd',
    isActive: true,
    color: 'teal',
    icon: 'globe'
  },
  {
    id: 'sub-sbdp',
    name: 'Seni Budaya dan Prakarya (SBdP)',
    code: 'SBDP-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ibu Ratna Kumala, S.Sn',
    isActive: true,
    color: 'purple',
    icon: 'palette'
  },
  {
    id: 'sub-pjok',
    name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    code: 'PJOK-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Bpk. Rizky Anugrah, S.Pd',
    isActive: true,
    color: 'orange',
    icon: 'activity'
  },
  {
    id: 'sub-bing',
    name: 'Bahasa Inggris',
    code: 'ENG-5',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Miss Anisa Zahra, S.Pd',
    isActive: true,
    color: 'indigo',
    icon: 'compass'
  },
  {
    id: 'sub-madura',
    name: 'Bahasa Madura (Muatan Lokal)',
    code: 'MULOK-MDR',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ust. Masduki, S.Pd',
    isActive: true,
    color: 'cyan',
    icon: 'map-pin'
  },
  {
    id: 'sub-ai-koding',
    name: 'Koding dan Kecerdasan Artifisial',
    code: 'AI-KODING',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Bpk. Dimas Wahyu, M.Kom',
    isActive: true,
    color: 'violet',
    icon: 'cpu'
  },
  {
    id: 'sub-mulok-islam',
    name: 'Tahfidz dan Bahasa Arab (Mulok Khusus)',
    code: 'MULOK-ISL',
    kelas: '5',
    fase: 'C',
    semester: '1',
    teacherName: 'Ust. Zainuddin, Lc',
    isActive: true,
    color: 'green',
    icon: 'award'
  }
];

export const INITIAL_TPS: LearningObjective[] = [
  {
    id: 'tp-ipas-1',
    subjectId: 'sub-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    unitName: 'Bab 1: Melihat karena Cahaya, Mendengar karena Bunyi',
    code: 'TP 5.1.1',
    description: 'Menjelaskan sifat-sifat cahaya (merambat lurus, dapat dipantulkan, menembus benda bening, dan dapat dibiaskan) melalui pengamatan dan percobaan sederhana.',
    cp: 'Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada manusia (pancaindra).',
    semester: '1'
  },
  {
    id: 'tp-ipas-2',
    subjectId: 'sub-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    unitName: 'Bab 2: Harmoni dalam Ekosistem',
    code: 'TP 5.1.2',
    description: 'Menganalisis hubungan antar makhluk hidup pada rantai makanan dan jaring-jaring makanan di lingkungan sekitar sekolah dan sawah.',
    cp: 'Peserta didik menyelidiki bagaimana hubungan saling ketergantungan antar komponen biotik dan abiotik dapat memengaruhi kestabilan ekosistem.',
    semester: '1'
  },
  {
    id: 'tp-mtk-1',
    subjectId: 'sub-mtk',
    subjectName: 'Matematika',
    unitName: 'Bab 1: Operasi Hitung Pecahan dan Desimal',
    code: 'TP 5.1.1',
    description: 'Menyelesaikan masalah kontekstual sehari-hari yang berkaitan dengan penjumlahan dan pengurangan pecahan biasa dan campuran berpenyebut berbeda.',
    cp: 'Peserta didik dapat membandingkan dan mengurutkan berbagai pecahan termasuk pecahan campuran serta melakukan operasi hitung.',
    semester: '1'
  },
  {
    id: 'tp-mtk-2',
    subjectId: 'sub-mtk',
    subjectName: 'Matematika',
    unitName: 'Bab 2: Kecepatan dan Debit Air',
    code: 'TP 5.1.2',
    description: 'Menghitung perbandingan jarak dengan waktu (kecepatan) serta volume dengan waktu (debit) dalam kehidupan sehari-hari.',
    cp: 'Peserta didik menyelesaikan masalah yang berkaitan dengan rasio dan pengukuran.',
    semester: '1'
  },
  {
    id: 'tp-pai-1',
    subjectId: 'sub-pai',
    subjectName: 'Pendidikan Agama Islam dan Budi Pekerti',
    unitName: 'Bab 1: Menyayangi Anak Yatim (Surah Al-Maun)',
    code: 'TP 5.1.1',
    description: 'Membaca, menghafal, dan memahami pesan pokok Surah Al-Ma’un tentang kepedulian sosial terhadap anak yatim dan fakir miskin.',
    cp: 'Peserta didik terbiasa membaca Al-Qur’an dengan tartil dan mengamalkan pesan pokoknya.',
    semester: '1'
  },
  {
    id: 'tp-bindo-1',
    subjectId: 'sub-bindo',
    subjectName: 'Bahasa Indonesia',
    unitName: 'Bab 1: Aku yang Unik (Teks Deskripsi & Karakter)',
    code: 'TP 5.1.1',
    description: 'Mengidentifikasi unsur instrinsik cerita, makna kata sifat, dan menyusun teks deskripsi sederhana mengenai sahabat atau cita-cita diri.',
    cp: 'Peserta didik mampu memahami ide pokok dan pendukung pada teks informatif serta deskriptif.',
    semester: '1'
  },
  {
    id: 'tp-ai-1',
    subjectId: 'sub-ai-koding',
    subjectName: 'Koding dan Kecerdasan Artifisial',
    unitName: 'Bab 1: Berpikir Komputasional & Perintah Dasar Scratch',
    code: 'TP 5.1.1',
    description: 'Merancang algoritma runtut (sekuensial) dan membuat animasi gerak sederhana karakter menggunakan blok visual koding.',
    cp: 'Peserta didik memahami konsep dasar algoritma dan berpikir komputasional dalam memecahkan masalah.',
    semester: '1'
  }
];

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-ipas-01',
    subjectId: 'sub-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    tpId: 'tp-ipas-1',
    tpCode: 'TP 5.1.1',
    tpDescription: 'Menjelaskan sifat-sifat cahaya melalui pengamatan dan percobaan sederhana.',
    indicator: 'Disajikan fenomena pensil dalam gelas air, siswa dapat menganalisis sifat pembiasan cahaya.',
    bloomLevel: 'C4',
    bloomReason: 'Memerlukan analisis hubungan antara kerapatan optik dua medium (udara dan air) dengan arah rambat cahaya.',
    topic: 'Sifat-sifat Cahaya',
    stimulus: 'Fathir sedang melakukan eksperimen sains di laboratorium SDI Al-Fahmiyah. Ia meletakkan sebatang pensil lurus ke dalam gelas bening yang berisi air bersih. Saat dilihat dari sisi samping kaca, pensil tersebut tampak patah dan bergeser posisinya.',
    type: 'pilihan_ganda',
    questionText: 'Berdasarkan pengamatan Fathir, peristiwa pensil tampak patah membuktikan bahwa salah satu sifat cahaya adalah...',
    options: [
      { id: 'A', text: 'Cahaya merambat lurus tanpa hambatan di semua zat' },
      { id: 'B', text: 'Cahaya dapat dibiaskan ketika melewati dua medium dengan kerapatan berbeda' },
      { id: 'C', text: 'Cahaya hanya dapat dipantulkan sempurna oleh air' },
      { id: 'D', text: 'Cahaya diserap seluruhnya oleh permukaan air jernih' }
    ],
    answerKey: 'B',
    explanation: 'Pembiasan (refraksi) terjadi ketika cahaya merambat melalui dua zat yang berbeda kerapatan optiknya (dari udara ke air), sehingga arah rambat berkas cahaya berbelok dan pensil terlihat seperti patah.',
    scoringRubric: 'Skor 10 jika memilih B (benar). Skor 0 jika opsi lain.',
    maxScore: 10,
    difficulty: 'Sedang'
  },
  {
    id: 'q-mtk-01',
    subjectId: 'sub-mtk',
    subjectName: 'Matematika',
    tpId: 'tp-mtk-1',
    tpCode: 'TP 5.1.1',
    tpDescription: 'Menyelesaikan masalah kontekstual sehari-hari penjumlahan dan pengurangan pecahan berpenyebut berbeda.',
    indicator: 'Siswa dapat menghitung sisa beras setelah disedekahkan dalam bentuk pecahan.',
    bloomLevel: 'C3',
    bloomReason: 'Siswa menerapkan prosedur operasi hitung pecahan dengan menyamakan penyebut dalam masalah nyata sedekah beras.',
    topic: 'Penjumlahan dan Pengurangan Pecahan',
    stimulus: 'Keluarga Hasan menyiapkan 3 1/2 kg beras untuk kegiatan Jumat Berkah di SDI Al-Fahmiyah. Sebanyak 1 3/4 kg telah disalurkan kepada tetangga di sekitar madrasah yang membutuhkan.',
    type: 'pilihan_ganda',
    questionText: 'Berapakah sisa beras Jumat Berkah yang belum disalurkan?',
    options: [
      { id: 'A', text: '1 1/4 kg' },
      { id: 'B', text: '1 1/2 kg' },
      { id: 'C', text: '1 3/4 kg' },
      { id: 'D', text: '2 1/4 kg' }
    ],
    answerKey: 'C',
    explanation: '3 1/2 - 1 3/4 = 7/2 - 7/4 = 14/4 - 7/4 = 7/4 = 1 3/4 kg beras.',
    scoringRubric: 'Skor 10 untuk jawaban C.',
    maxScore: 10,
    difficulty: 'Sedang'
  },
  {
    id: 'q-pai-01',
    subjectId: 'sub-pai',
    subjectName: 'Pendidikan Agama Islam dan Budi Pekerti',
    tpId: 'tp-pai-1',
    tpCode: 'TP 5.1.1',
    tpDescription: 'Memahami pesan pokok Surah Al-Maun tentang kepedulian sosial.',
    indicator: 'Siswa dapat mengevaluasi perilaku yang bertentangan dengan ajaran Surah Al-Maun.',
    bloomLevel: 'C5',
    bloomReason: 'Siswa mengevaluasi dan menilai perilaku sosial berdasarkan kriteria dan dalil firman Allah pada Surah Al-Maun.',
    topic: 'Surah Al-Maun',
    stimulus: 'Allah SWT berfirman dalam Surah Al-Ma\'un ayat 1-3 tentang orang-orang yang mendustakan agama, di antaranya mereka yang berbuat sewenang-wenang dan mengabaikan orang yang lemah.',
    type: 'uraian',
    questionText: 'Jelaskan 3 (tiga) ciri orang yang mendustakan agama menurut Surah Al-Ma\'un, serta berikan contoh konkret bagaimana siswa SDI Al-Fahmiyah dapat menghindarinya di lingkungan sekolah!',
    answerKey: '1. Menghardik anak yatim, 2. Tidak menganjurkan memberi makan orang miskin, 3. Lalai dalam salat dan berbuat riya / enggan memberi bantuan barang berguna.',
    explanation: 'Jawaban harus memuat minimal 3 ciri sesuai Surah Al-Maun dan contoh amalan terpuji di sekolah (seperti infak Jumat, menyayangi teman, salat berjamaah tepat waktu).',
    scoringRubric: 'Skor 20: Menyebutkan 3 ciri dengan tepat dan memberikan contoh amalan Islami yang relevan. Skor 10-15: Menyebutkan 2 ciri atau contoh kurang lengkap. Skor <10: Hanya menyebut 1 ciri.',
    maxScore: 20,
    difficulty: 'Sedang'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-ipas-01',
    title: 'Asesmen Formatif IPAS 1: Menyelidiki Sifat-Sifat Cahaya',
    subjectId: 'sub-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    unit: 'Bab 1: Cahaya dan Penglihatan',
    tpIds: ['tp-ipas-1'],
    tpNames: ['Sifat-sifat Cahaya & Pembiasan'],
    instructions: 'Bismillahirrohmanirrohim. Kerjakan soal asesmen ini dengan teliti, mandiri, dan jujur. Bacalah setiap stimulus cerita dengan seksama sebelum memilih jawaban terbaik.',
    taskType: 'formatif',
    targetClasses: ['5A', '5B'],
    questions: [INITIAL_QUESTIONS[0]],
    startDate: new Date(Date.now() - 3600000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    durationMinutes: 45,
    allowRetake: false,
    allowLate: true,
    maxScore: 10,
    isScorePublished: true,
    status: 'published',
    teacherId: 'teacher-dewi',
    teacherName: 'Ibu Dewi Sartika, M.Pd',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-mtk-01',
    title: 'Latihan Soal Matematika: Operasi Hitung Pecahan Kontekstual',
    subjectId: 'sub-mtk',
    subjectName: 'Matematika',
    unit: 'Bab 1: Pecahan dan Desimal',
    tpIds: ['tp-mtk-1'],
    tpNames: ['Operasi Hitung Pecahan Kontekstual'],
    instructions: 'Semangat belajar! Hitunglah dengan cermat di buku coretan sebelum memasukkan jawaban ke lembar tugas online ini.',
    taskType: 'latihan',
    targetClasses: ['5A', '5B'],
    questions: [INITIAL_QUESTIONS[1]],
    startDate: new Date(Date.now() - 7200000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    durationMinutes: 0,
    allowRetake: true,
    maxRetakes: 2,
    allowLate: true,
    maxScore: 10,
    isScorePublished: true,
    status: 'published',
    teacherId: 'teacher-hendra',
    teacherName: 'Bpk. Hendra Pratama, S.Si',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-pai-01',
    title: 'Asesmen Sumatif PAI: Telaah Makna dan Pengamalan Surah Al-Ma\'un',
    subjectId: 'sub-pai',
    subjectName: 'Pendidikan Agama Islam dan Budi Pekerti',
    unit: 'Bab 1: Menyayangi Anak Yatim',
    tpIds: ['tp-pai-1'],
    tpNames: ['Pemahaman Pesan Pokok Surah Al-Maun'],
    instructions: 'Tuliskan jawaban uraian Anda dengan bahasa yang santun, runtut, dan sertakan contoh amalan nyata di SDI Al-Fahmiyah.',
    taskType: 'sumatif',
    targetClasses: ['5A'],
    questions: [INITIAL_QUESTIONS[2]],
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    durationMinutes: 60,
    allowRetake: false,
    allowLate: false,
    maxScore: 20,
    isScorePublished: false,
    status: 'published',
    teacherId: 'teacher-fauzi',
    teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'Selamat Datang di Tugas Online SDI Al-Fahmiyah (Ceria Beriman)',
    content: 'Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat datang seluruh ananda siswa dan Bapak/Ibu guru kelas 5 SDI Al-Fahmiyah. Mari gunakan aplikasi ini dengan gembira, jujur, dan bersemangat mencari ilmu yang berkah!',
    authorName: 'Kepala Sekolah SDI Al-Fahmiyah',
    category: 'umum',
    targetClasses: ['5A', '5B'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann-02',
    title: 'Jadwal Asesmen Formatif IPAS Bab 1 Telah Dibuka',
    content: 'Ananda kelas 5A dan 5B dapat mulai mengerjakan tugas asesmen mandiri IPAS sifat cahaya sampai hari Ahad pukul 23.59 WIB.',
    authorName: 'Ibu Dewi Sartika, M.Pd',
    category: 'tugas',
    targetClasses: ['5A', '5B'],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-01',
    title: 'LKPD Percobaan Sederhana Pembiasan Cahaya di Rumah',
    subjectId: 'sub-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    targetClasses: ['5A', '5B'],
    type: 'lkpd',
    contentUrl: '#',
    description: 'Lembar Kerja Peserta Didik panduan eksperimen pensil dan gelas kaca bening beserta tabel pengamatan mandiri.',
    teacherName: 'Ibu Dewi Sartika, M.Pd',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-02',
    title: 'Ringkasan Materi: Mengubah Pecahan Biasa ke Campuran & Desimal',
    subjectId: 'sub-mtk',
    subjectName: 'Matematika',
    targetClasses: ['5A', '5B'],
    type: 'pdf',
    contentUrl: '#',
    description: 'Rangkuman rumus praktis dan langkah-langkah menyamakan penyebut dengan KPK untuk siswa kelas 5.',
    teacherName: 'Bpk. Hendra Pratama, S.Si',
    createdAt: new Date().toISOString()
  }
];

// DATA SERVICE CLASS
export class DataService {
  // Check and seed initial collections if empty
  static async initializeDefaults() {
    try {
      const subjectsCol = collection(db, 'subjects');
      const snap = await getDocs(subjectsCol);
      if (snap.empty) {
        console.log('[DataService] Seeding initial subjects for SDI Al-Fahmiyah...');
        for (const s of INITIAL_SUBJECTS) {
          await setDoc(doc(db, 'subjects', s.id), s);
        }
        for (const tp of INITIAL_TPS) {
          await setDoc(doc(db, 'learningObjectives', tp.id), tp);
        }
        for (const q of INITIAL_QUESTIONS) {
          await setDoc(doc(db, 'questionBank', q.id), q);
        }
        for (const t of INITIAL_TASKS) {
          await setDoc(doc(db, 'tasks', t.id), t);
        }
        for (const a of INITIAL_ANNOUNCEMENTS) {
          await setDoc(doc(db, 'announcements', a.id), a);
        }
        for (const m of INITIAL_MATERIALS) {
          await setDoc(doc(db, 'materials', m.id), m);
        }
      }
    } catch (err) {
      console.warn('Initial seeding note (using defaults fallback):', err);
    }
  }

  // USER PROFILE OPERATIONS
  static async getUserProfile(uid: string): Promise<AppUser | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as AppUser;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  }

  static async saveUserProfile(user: AppUser): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  }

  static async getAllUsers(): Promise<AppUser[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => d.data() as AppUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  }

  static async updateUserStatus(uid: string, status: 'active' | 'pending' | 'disabled'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), { status, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // SUBJECTS
  static async getSubjects(): Promise<Subject[]> {
    try {
      const snap = await getDocs(collection(db, 'subjects'));
      if (snap.empty) {
        return INITIAL_SUBJECTS;
      }
      return snap.docs.map(d => d.data() as Subject);
    } catch (error) {
      console.warn('Failed to fetch subjects from firestore, returning default:', error);
      return INITIAL_SUBJECTS;
    }
  }

  static async saveSubject(subject: Subject): Promise<void> {
    try {
      await setDoc(doc(db, 'subjects', subject.id), subject);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `subjects/${subject.id}`);
    }
  }

  // LEARNING OBJECTIVES
  static async getLearningObjectives(subjectId?: string): Promise<LearningObjective[]> {
    try {
      let q;
      if (subjectId) {
        q = query(collection(db, 'learningObjectives'), where('subjectId', '==', subjectId));
      } else {
        q = collection(db, 'learningObjectives');
      }
      const snap = await getDocs(q);
      if (snap.empty) {
        return subjectId ? INITIAL_TPS.filter(tp => tp.subjectId === subjectId) : INITIAL_TPS;
      }
      return snap.docs.map(d => d.data() as LearningObjective);
    } catch (error) {
      console.warn('Failed to fetch TPs:', error);
      return subjectId ? INITIAL_TPS.filter(tp => tp.subjectId === subjectId) : INITIAL_TPS;
    }
  }

  static async saveLearningObjective(tp: LearningObjective): Promise<void> {
    try {
      await setDoc(doc(db, 'learningObjectives', tp.id), tp);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `learningObjectives/${tp.id}`);
    }
  }

  // QUESTION BANK
  static async getQuestionBank(subjectId?: string): Promise<QuestionItem[]> {
    try {
      let q;
      if (subjectId) {
        q = query(collection(db, 'questionBank'), where('subjectId', '==', subjectId));
      } else {
        q = collection(db, 'questionBank');
      }
      const snap = await getDocs(q);
      if (snap.empty) {
        return subjectId ? INITIAL_QUESTIONS.filter(q => q.subjectId === subjectId) : INITIAL_QUESTIONS;
      }
      return snap.docs.map(d => d.data() as QuestionItem);
    } catch (error) {
      console.warn('Failed to fetch question bank:', error);
      return subjectId ? INITIAL_QUESTIONS.filter(q => q.subjectId === subjectId) : INITIAL_QUESTIONS;
    }
  }

  static async saveQuestionToBank(question: QuestionItem): Promise<void> {
    try {
      await setDoc(doc(db, 'questionBank', question.id), question);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `questionBank/${question.id}`);
    }
  }

  static async deleteQuestionFromBank(questionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'questionBank', questionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `questionBank/${questionId}`);
    }
  }

  // TASKS
  static async getTasks(): Promise<Task[]> {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      if (snap.empty) {
        return INITIAL_TASKS;
      }
      return snap.docs.map(d => d.data() as Task);
    } catch (error) {
      console.warn('Failed to fetch tasks:', error);
      return INITIAL_TASKS;
    }
  }

  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const snap = await getDoc(doc(db, 'tasks', taskId));
      if (snap.exists()) {
        return snap.data() as Task;
      }
      const found = INITIAL_TASKS.find(t => t.id === taskId);
      return found || null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `tasks/${taskId}`);
      return null;
    }
  }

  static async saveTask(task: Task): Promise<void> {
    try {
      await setDoc(doc(db, 'tasks', task.id), task);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${task.id}`);
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  }

  // SUBMISSIONS
  static async getSubmissionsForTask(taskId: string): Promise<Submission[]> {
    try {
      const q = query(collection(db, 'submissions'), where('taskId', '==', taskId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Submission);
    } catch (error) {
      console.warn('Failed to fetch submissions for task:', error);
      return [];
    }
  }

  static async getAllSubmissions(): Promise<Submission[]> {
    try {
      const snap = await getDocs(collection(db, 'submissions'));
      return snap.docs.map(d => d.data() as Submission);
    } catch (error) {
      console.warn('Failed to fetch all submissions:', error);
      return [];
    }
  }

  static async getStudentSubmission(taskId: string, studentId: string): Promise<Submission | null> {
    try {
      const subId = `${taskId}_${studentId}`;
      const snap = await getDoc(doc(db, 'submissions', subId));
      if (snap.exists()) {
        return snap.data() as Submission;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get student submission:', error);
      return null;
    }
  }

  static async saveSubmission(submission: Submission): Promise<void> {
    try {
      await setDoc(doc(db, 'submissions', submission.id), submission);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `submissions/${submission.id}`);
    }
  }

  // ANNOUNCEMENTS
  static async getAnnouncements(): Promise<Announcement[]> {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      if (snap.empty) {
        return INITIAL_ANNOUNCEMENTS;
      }
      return snap.docs.map(d => d.data() as Announcement);
    } catch (error) {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  static async saveAnnouncement(announcement: Announcement): Promise<void> {
    try {
      await setDoc(doc(db, 'announcements', announcement.id), announcement);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `announcements/${announcement.id}`);
    }
  }

  // MATERIALS
  static async getMaterials(): Promise<Material[]> {
    try {
      const snap = await getDocs(collection(db, 'materials'));
      if (snap.empty) {
        return INITIAL_MATERIALS;
      }
      return snap.docs.map(d => d.data() as Material);
    } catch (error) {
      return INITIAL_MATERIALS;
    }
  }

  static async saveMaterial(mat: Material): Promise<void> {
    try {
      await setDoc(doc(db, 'materials', mat.id), mat);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `materials/${mat.id}`);
    }
  }
}
