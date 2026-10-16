export type UserRole = 'admin' | 'guru' | 'siswa';
export type UserStatus = 'active' | 'pending' | 'disabled';

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  kelas?: string; // '5A', '5B', etc.
  status: UserStatus;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  kelas: string;
  fase: string;
  semester: '1' | '2' | 'Ganjil' | 'Genap';
  teacherName: string;
  teacherId?: string;
  isActive: boolean;
  color?: string;
  icon?: string;
  createdAt?: string;
}

export interface LearningObjective {
  id: string;
  subjectId: string;
  subjectName: string;
  unitName: string;
  code: string; // e.g. "TP 5.1.1"
  description: string;
  cp?: string;
  semester: string;
}

export type BloomLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export const BLOOM_DEFINITIONS: Record<BloomLevel, { name: string; verbs: string; color: string; desc: string }> = {
  C1: {
    name: 'Mengingat',
    verbs: 'Mengenali, menyebutkan, mengidentifikasi, mengingat, memilih informasi',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
    desc: 'Mengingat kembali fakta dasar, istilah, dan konsep tanpa mengubah maknanya.'
  },
  C2: {
    name: 'Memahami',
    verbs: 'Menjelaskan, menguraikan, mengelompokkan, menafsirkan, memberi contoh',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Memahami konsep dengan menyatakan kembali menggunakan kata-kata sendiri atau memberi contoh konkret.'
  },
  C3: {
    name: 'Menerapkan',
    verbs: 'Menghitung, menggunakan, menentukan, menerapkan prosedur, menyelesaikan masalah',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Menggunakan rumus, aturan, atau konsep yang dipelajari pada situasi atau masalah baru.'
  },
  C4: {
    name: 'Menganalisis',
    verbs: 'Membandingkan, membedakan, menghubungkan sebab-akibat, menganalisis pola',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Memecah informasi menjadi bagian-bagian terperinci dan menemukan pola atau relasi antar bagian.'
  },
  C5: {
    name: 'Mengevaluasi',
    verbs: 'Menilai, memeriksa kebenaran, mengkritisi, memilih solusi terbaik dengan argumen',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    desc: 'Membuat penilaian atau keputusan berdasarkan kriteria, standar, dan bukti yang sahih.'
  },
  C6: {
    name: 'Mencipta',
    verbs: 'Merancang, menyusun, membuat model, merumuskan solusi alternatif, menghasilkan karya',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Menggabungkan unsur-unsur menjadi pola atau karya baru yang utuh (desain, prosedur, model).'
  }
};

export type QuestionType =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'benar_salah'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'uraian'
  | 'literasi'
  | 'numerasi'
  | 'proyek'
  | 'praktik';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  questionNumber?: number;
  subjectId?: string;
  subjectName?: string;
  tpId?: string;
  tpCode?: string;
  tpDescription?: string;
  indicator?: string;
  bloomLevel: BloomLevel;
  bloomReason?: string;
  topic?: string;
  stimulus?: string;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  answerKey: any; // hidden from students until results published
  explanation?: string;
  scoringRubric?: string;
  maxScore: number;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  createdBy?: string;
  createdAt?: string;
}

export type TaskType = 'latihan' | 'formatif' | 'sumatif' | 'proyek' | 'praktik';
export type TaskStatus = 'draft' | 'published' | 'closed';

export interface TaskAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  unit: string;
  tpIds?: string[];
  tpNames?: string[];
  instructions: string;
  taskType: TaskType;
  targetClasses: string[]; // e.g. ['5A', '5B']
  questions: QuestionItem[];
  attachments?: TaskAttachment[];
  startDate: string;
  dueDate: string;
  durationMinutes: number; // 0 = no time limit
  allowRetake: boolean;
  maxRetakes?: number;
  allowLate: boolean;
  maxScore: number;
  isScorePublished: boolean;
  status: TaskStatus;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

export interface StudentAnswer {
  questionId: string;
  answer: any; // string, string[], or boolean
  score?: number;
  isCorrect?: boolean;
  teacherNote?: string;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, any>;
  fileAttachments?: FileAttachment[];
  status: SubmissionStatus;
  submittedAt?: string;
  isLate?: boolean;
  autoScore?: number;
  manualScore?: number;
  finalScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  scoreHistory?: {
    score: number;
    timestamp: string;
    note: string;
  }[];
}

export interface Material {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  targetClasses: string[];
  type: 'pdf' | 'lkpd' | 'video' | 'gambar' | 'proyek';
  contentUrl: string;
  description: string;
  teacherName: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: 'tugas' | 'jadwal' | 'nilai' | 'umum';
  targetClasses?: string[];
  createdAt: string;
}
