import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testFirebaseConnection } from './firebase/config';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AiQuestionGenerator } from './components/AiQuestionGenerator';
import { QuestionBankView } from './components/QuestionBankView';
import { AnalyticsView } from './components/AnalyticsView';
import { MaterialsLibrary } from './components/MaterialsLibrary';
import { StudentTaskRunner } from './components/StudentTaskRunner';
import { StudentResultModal } from './components/StudentResultModal';
import { TaskEditorModal } from './components/TaskEditorModal';
import { GradingModal } from './components/GradingModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Task, Submission, QuestionItem } from './types';

function MainApp() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Interactive flow states
  const [activeTaskForRunning, setActiveTaskForRunning] = useState<Task | null>(null);
  const [viewingResult, setViewingResult] = useState<{ task: Task; submission: Submission } | null>(null);
  const [taskEditorOpen, setTaskEditorOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [importedQuestionsForTask, setImportedQuestionsForTask] = useState<QuestionItem[]>([]);
  const [gradingModalData, setGradingModalData] = useState<{ task: Task; submission: Submission } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Test Firebase connection on boot
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-extrabold text-gray-800">TUGAS ONLINE SDI AL-FAHMIYAH</h2>
        <p className="text-xs text-emerald-700 font-bold mt-1">CERIA BERIMAN • Memuat Sistem...</p>
      </div>
    );
  }

  // If student is currently taking a test/task: full-screen distraction-free view
  if (activeTaskForRunning) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentTaskRunner
          task={activeTaskForRunning}
          onClose={() => setActiveTaskForRunning(null)}
          onSubmitted={() => {
            setActiveTaskForRunning(null);
            setActiveTab('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <>
            {currentUser?.role === 'siswa' && (
              <StudentDashboard
                onStartTask={(t) => setActiveTaskForRunning(t)}
                onViewResults={(t, sub) => setViewingResult({ task: t, submission: sub })}
                onOpenMaterials={() => setActiveTab('materials')}
              />
            )}
            {currentUser?.role === 'guru' && (
              <TeacherDashboard
                onOpenAiGenerator={() => setActiveTab('ai-generator')}
                onOpenTaskEditor={(t) => {
                  setEditingTask(t);
                  setTaskEditorOpen(true);
                }}
                onOpenGrading={(t, sub) => setGradingModalData({ task: t, submission: sub })}
                onOpenBankSoal={() => setActiveTab('question-bank')}
              />
            )}
            {currentUser?.role === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}

        {activeTab === 'ai-generator' && (
          <AiQuestionGenerator
            onAddQuestionsToTask={(qs) => {
              setImportedQuestionsForTask(qs);
              setEditingTask(undefined);
              setTaskEditorOpen(true);
            }}
            onNavigateToTaskEditor={() => {
              setTaskEditorOpen(true);
            }}
          />
        )}

        {activeTab === 'question-bank' && (
          <QuestionBankView
            onOpenAiGenerator={() => setActiveTab('ai-generator')}
            onAddToTask={(q) => {
              setImportedQuestionsForTask([q]);
              setTaskEditorOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'materials' && (
          <MaterialsLibrary />
        )}

        {activeTab === 'results' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <StudentDashboard
              onStartTask={(t) => setActiveTaskForRunning(t)}
              onViewResults={(t, sub) => setViewingResult({ task: t, submission: sub })}
              onOpenMaterials={() => setActiveTab('materials')}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {viewingResult && (
        <StudentResultModal
          task={viewingResult.task}
          submission={viewingResult.submission}
          onClose={() => setViewingResult(null)}
        />
      )}

      {taskEditorOpen && (
        <TaskEditorModal
          initialTask={editingTask}
          importedQuestions={importedQuestionsForTask}
          onClose={() => {
            setTaskEditorOpen(false);
            setEditingTask(undefined);
            setImportedQuestionsForTask([]);
          }}
          onSaved={() => {
            setTaskEditorOpen(false);
            setEditingTask(undefined);
            setImportedQuestionsForTask([]);
            setActiveTab('dashboard');
          }}
          onOpenAiGenerator={() => {
            setTaskEditorOpen(false);
            setActiveTab('ai-generator');
          }}
        />
      )}

      {gradingModalData && (
        <GradingModal
          task={gradingModalData.task}
          submission={gradingModalData.submission}
          onClose={() => setGradingModalData(null)}
          onSaved={() => {
            setGradingModalData(null);
            // Refresh
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
