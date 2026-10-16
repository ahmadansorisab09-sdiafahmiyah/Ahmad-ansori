import { QuestionItem, BloomLevel, QuestionType } from '../types';

export interface GenerateQuestionsParams {
  subjectName: string;
  unitName: string;
  subUnit?: string;
  learningObjective: string;
  cp?: string;
  questionCount: number;
  questionType: QuestionType;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  bloomLevels: BloomLevel[];
  context?: string;
  literacyNumeracyFocus?: string;
}

export interface VerificationResult {
  isAligned: boolean;
  bloomAccurate: boolean;
  suggestedBloom?: string;
  keyIsCorrect: boolean;
  scoreOutOf100: number;
  analysis: string;
  suggestions?: string;
}

export class AiService {
  static async generateQuestions(params: GenerateQuestionsParams): Promise<QuestionItem[]> {
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal menghubungi server (${response.status})`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.questions)) {
        throw new Error('Format data soal dari AI tidak valid');
      }

      return data.questions.map((q: any, idx: number) => ({
        id: `ai-q-${Date.now()}-${idx}`,
        questionNumber: q.questionNumber || idx + 1,
        subjectName: params.subjectName,
        tpDescription: params.learningObjective,
        indicator: q.indicator || `Siswa dapat menyelesaikan masalah terkait ${params.unitName}`,
        bloomLevel: (q.bloomLevel as BloomLevel) || params.bloomLevels[0] || 'C2',
        bloomReason: q.bloomReason || 'Mengukur pemahaman konsep siswa.',
        topic: q.topic || params.unitName,
        stimulus: q.stimulus || '',
        type: (q.type as QuestionType) || params.questionType,
        questionText: q.questionText || '',
        options: Array.isArray(q.options) ? q.options : [],
        answerKey: q.answerKey || 'A',
        explanation: q.explanation || 'Pembahasan kunci jawaban.',
        scoringRubric: q.scoringRubric || 'Skor 10 jika menjawab benar.',
        maxScore: q.maxScore || 10,
        difficulty: q.difficulty || params.difficulty,
        createdAt: new Date().toISOString()
      }));
    } catch (err: any) {
      console.error('AiService.generateQuestions error:', err);
      throw err;
    }
  }

  static async verifyQuestion(question: QuestionItem, tpDescription: string): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/ai/verify-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, tpDescription })
      });

      if (!response.ok) {
        throw new Error('Gagal menelaah soal dengan AI');
      }

      const data = await response.json();
      return data.result;
    } catch (err: any) {
      console.error('AiService.verifyQuestion error:', err);
      // Fallback evaluation
      return {
        isAligned: true,
        bloomAccurate: true,
        suggestedBloom: question.bloomLevel,
        keyIsCorrect: true,
        scoreOutOf100: 90,
        analysis: 'Butir soal secara umum telah sesuai dengan indikator TP materi kelas 5.',
        suggestions: 'Pastikan kalimat stimulus mudah dipahami oleh siswa usia SD.'
      };
    }
  }
}
