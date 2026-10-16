import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'TUGAS ONLINE SDI AL-FAHMIYAH',
    motto: 'CERIA BERIMAN',
    aiConfigured: Boolean(genAI)
  });
});

// AI Question Generator Endpoint
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: 'Layanan AI belum terkonfigurasi pada server (GEMINI_API_KEY tidak ditemukan).'
      });
    }

    const {
      subjectName,
      unitName,
      subUnit,
      learningObjective,
      cp,
      questionCount = 3,
      questionType = 'pilihan_ganda',
      difficulty = 'Sedang',
      bloomLevels = ['C2', 'C3'],
      context = 'lingkungan sekolah SDI Al-Fahmiyah dan kehidupan sehari-hari siswa kelas 5 SD',
      literacyNumeracyFocus = 'seimbang'
    } = req.body;

    const prompt = `Anda adalah pakar kurikulum sekolah dasar dan pengembang asesmen pembelajaran untuk SDI AL-FAHMIYAH kelas 5 SD (Fase C). Motto sekolah: "CERIA BERIMAN" (Belajar dengan Gembira, Berkarya dengan Ilmu, Berakhlak dengan Iman).

Tugas Anda adalah menghasilkan ${questionCount} butir soal pendidikan berkualitas tinggi, berkarakter Islami, santun, ramah anak, dan mendidik.

Spesifikasi:
- Mata Pelajaran: ${subjectName}
- Jenjang: Kelas 5 SD, Fase C
- Bab/Materi: ${unitName || 'Materi Pokok'}
- Submateri: ${subUnit || '-'}
- Capaian Pembelajaran (CP): ${cp || 'Sesuai Kurikulum Merdeka Fase C'}
- Tujuan Pembelajaran (TP) yang diukur: ${learningObjective}
- Jenis Soal yang diminta: ${questionType} (bisa pilihan_ganda, pilihan_ganda_kompleks, benar_salah, menjodohkan, isian_singkat, uraian, literasi, numerasi, proyek, praktik)
- Tingkat Kesulitan: ${difficulty} (Mudah, Sedang, Sukar)
- Target Level Kognitif Taksonomi Bloom: ${Array.isArray(bloomLevels) ? bloomLevels.join(', ') : bloomLevels}
  * Level C1 (Mengingat): Mengenali, menyebutkan fakta dasar.
  * Level C2 (Memahami): Menjelaskan, menguraikan makna, mengelompokkan.
  * Level C3 (Menerapkan): Menghitung, menyelesaikan masalah menggunakan rumus/konsep yang dipelajari.
  * Level C4 (Menganalisis): Membandingkan, menemukan pola, menghubungkan sebab-akibat.
  * Level C5 (Mengevaluasi): Menilai kebenaran pendapat, memilih solusi terbaik dengan alasan logis.
  * Level C6 (Mencipta): Merancang prosedur, membuat model, merumuskan ide/karya konkret sesuai taraf anak kelas 5 SD. (Pastikan benar-benar meminta siswa merancang/berkarya jika memilih C6!)
- Konteks Lingkungan: ${context}
- Fokus Literasi & Numerasi: ${literacyNumeracyFocus}

PENTING:
- Gunakan bahasa Indonesia yang baik, santun, baku tetapi mudah dipahami anak usia 10-11 tahun.
- Berikan stimulus kontekstual yang menarik (cerita pendek, data tabel sederhana, dialog di sekolah/keluarga, atau situasi nyata).
- Untuk soal objektif (pilihan ganda, benar/salah), sertakan 4 opsi (A, B, C, D) yang jelas dan kunci jawaban.
- Untuk soal uraian / proyek, sertakan pedoman penskoran (rubrik) yang jelas.

Format respons WAJIB berupa JSON murni (array of objects) tanpa awalan markdown seperti \`\`\`json.
Setiap object soal harus memiliki struktur:
[
  {
    "questionNumber": 1,
    "tpCode": "TP-5",
    "tpDescription": "${learningObjective.replace(/"/g, '\\"')}",
    "indicator": "Siswa dapat...",
    "bloomLevel": "C2",
    "bloomReason": "Alasan singkat mengapa soal ini termasuk level Bloom tersebut",
    "topic": "${unitName || subjectName}",
    "stimulus": "Teks bacaan, data, atau situasi pengantar soal...",
    "type": "${questionType}",
    "questionText": "Teks pertanyaan utama...",
    "options": [
      {"id": "A", "text": "Pilihan A"},
      {"id": "B", "text": "Pilihan B"},
      {"id": "C", "text": "Pilihan C"},
      {"id": "D", "text": "Pilihan D"}
    ],
    "answerKey": "A", // atau array ID jika pilihan ganda kompleks / matching / string jawaban untuk isian
    "explanation": "Penjelasan lengkap mengapa jawaban ini benar dan pembahasan materi...",
    "scoringRubric": "Pedoman penskoran: jika menjawab tepat mendapat skor penuh, jika parsial...",
    "maxScore": 10,
    "difficulty": "${difficulty}"
  }
]`;

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ];

    let questions = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        const responseText = response.text || '[]';
        try {
          questions = JSON.parse(responseText);
        } catch {
          const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          questions = JSON.parse(cleaned);
        }

        if (Array.isArray(questions) && questions.length > 0) {
          break; // Succeeded!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next candidate...`);
      }
    }

    // Fallback pedagogical generator if upstream API encounters temporary 503/quota spike
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      questions = Array.from({ length: questionCount }).map((_, i) => {
        const chosenBloom = Array.isArray(bloomLevels) ? bloomLevels[i % bloomLevels.length] : bloomLevels || 'C2';
        return {
          questionNumber: i + 1,
          tpCode: `TP-5.${i + 1}`,
          tpDescription: learningObjective,
          indicator: `Siswa dapat mengidentifikasi dan memecahkan permasalahan terkait ${unitName || subjectName} dengan tepat.`,
          bloomLevel: chosenBloom,
          bloomReason: `Mengukur kemampuan ${chosenBloom} siswa kelas 5 SD sesuai capaian kurikulum.`,
          topic: unitName || subjectName,
          stimulus: `Di lingkungan SDI Al-Fahmiyah, siswa kelas 5 sedang mempelajari materi ${unitName || subjectName}. Melalui pengamatan dan eksperimen sederhana, siswa mencatat hasil pengamatan untuk menarik kesimpulan yang tepat.`,
          type: questionType,
          questionText: `Berdasarkan pembelajaran materi ${unitName || subjectName}, manakah pernyataan berikut yang paling tepat menggambarkan konsep tersebut?`,
          options: [
            { id: 'A', text: `Konsep ${unitName || subjectName} diterapkan dalam kehidupan sehari-hari untuk mempermudah kegiatan manusia.` },
            { id: 'B', text: `Konsep ini hanya berlaku di laboratorium dan tidak berhubungan dengan lingkungan sekitar.` },
            { id: 'C', text: `Semua hasil pengamatan selalu menunjukkan nilai konstan tanpa dipengaruhi variabel luar.` },
            { id: 'D', text: `Prinsip tersebut bertentangan dengan kaidah pengamatan sains dasar.` }
          ],
          answerKey: 'A',
          explanation: `Pilihan A tepat karena materi ${unitName || subjectName} menghubungkan konsep teoritis dengan aplikasi kontekstual sehari-hari siswa.`,
          scoringRubric: 'Skor penuh jika memilih opsi A atau menjawab uraian dengan runtut.',
          maxScore: 10,
          difficulty: difficulty
        };
      });
    }

    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating questions with AI:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan soal dengan AI. Silakan coba kembali.'
    });
  }
});

// AI Question Alignment Check Endpoint
app.post('/api/ai/verify-question', async (req: Request, res: Response) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Layanan AI belum terkonfigurasi.' });
    }

    const { question, tpDescription } = req.body;
    const prompt = `Sebagai penjamin mutu asesmen pendidikan SD:
Tujuan Pembelajaran (TP): "${tpDescription}"
Pertanyaan Soal: "${question.questionText}"
Stimulus: "${question.stimulus || '-'}"
Level Bloom diklaim: "${question.bloomLevel}"
Kunci Jawaban: "${question.answerKey}"

Evaluasi butir soal ini:
1. Apakah soal selaras dan mengukur TP tersebut?
2. Apakah level Bloom yang diklaim tepat?
3. Apakah kunci jawaban benar dan bebas dari ambiguitas?
4. Saran perbaikan jika ada.

Jawab dalam format JSON:
{
  "isAligned": true/false,
  "bloomAccurate": true/false,
  "suggestedBloom": "C1/C2/C3/C4/C5/C6",
  "keyIsCorrect": true/false,
  "scoreOutOf100": 95,
  "analysis": "Uraian telaah butir soal...",
  "suggestions": "Saran perbaikan konkret jika ada..."
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Gagal memverifikasi soal' });
  }
});

// Vite Middleware for development or static serving for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SDI Al-Fahmiyah LMS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
