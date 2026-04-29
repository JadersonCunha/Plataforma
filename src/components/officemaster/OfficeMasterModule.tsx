import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, CheckCircle2, Lock, Gamepad2, ArrowRight, X } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../App';
import { Link } from 'react-router-dom';
import { EXERCISES, TIPS, SHORTCUTS } from './data';
import { Exercise, Tip } from './types';

const MIN_COMPLETION = 0.7; // 70% dos exercícios
const MAX_ATTEMPTS = 3;

export default function OfficeMasterModule({ profile }: { profile: UserProfile }) {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [activeProgram, setActiveProgram] = useState<'Excel' | 'Word' | 'PowerPoint' | 'Workspace'>('Excel');

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', profile.uid, 'progress', 'm3'));
      if (snap.exists()) {
        const data = snap.data();
        setAttempts(data.attempts ?? 0);
        setApproved(data.completed ?? false);
        setCompletedExercises(data.completedExercises ?? []);
      }
      setLoading(false);
    };
    load();
  }, [profile.uid]);

  const handleCompleteExercise = async (exeId: string) => {
    if (completedExercises.includes(exeId)) return;
    const newCompleted = [...completedExercises, exeId];
    setCompletedExercises(newCompleted);

    const total = EXERCISES.length;
    const score = Math.round((newCompleted.length / total) * 100);
    const passed = newCompleted.length / total >= MIN_COMPLETION;
    const newAttempts = passed && !approved ? attempts + 1 : attempts;

    await setDoc(doc(db, 'users', profile.uid, 'progress', 'm3'), {
      moduleId: 'm3',
      completed: passed,
      score,
      attempts: newAttempts,
      completedExercises: newCompleted,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    if (passed) setApproved(true);
    if (newAttempts !== attempts) setAttempts(newAttempts);
    setSelectedExercise(null);
  };

  const programs = ['Excel', 'Word', 'PowerPoint', 'Workspace'] as const;
  const filteredExercises = EXERCISES.filter(e => e.program === activeProgram);
  const filteredTips = TIPS.filter(t => t.program === activeProgram);
  const filteredShortcuts = SHORTCUTS.filter(s => s.program === activeProgram).slice(0, 6);
  const total = EXERCISES.length;
  const scorePercent = Math.round((completedExercises.length / total) * 100);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  if (approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8 bg-green-100 text-green-600">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Módulo Concluído!</h2>
          <p className="text-slate-500 mb-8">Você completou {completedExercises.length} de {total} exercícios ({scorePercent}%). Aprovado!</p>
          <Link to="/dashboard" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  if (attempts >= MAX_ATTEMPTS && !approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-800 mb-4">Tentativas Esgotadas</h2>
          <p className="text-slate-500 mb-8">Você usou todas as {MAX_ATTEMPTS} tentativas. Fale com seu instrutor.</p>
          <Link to="/dashboard" className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">O</div>
          <span className="font-black text-lg">Office Master</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest text-white/70">
          <span>{completedExercises.length}/{total} exercícios — {scorePercent}%</span>
          <span className="text-amber-300">Meta: 70% para aprovação</span>
          <Link to="/dashboard" className="text-white/50 hover:text-white transition-colors">← Painel</Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-indigo-100">
        <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${scorePercent}%` }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Program Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {programs.map(p => (
            <button key={p} onClick={() => setActiveProgram(p)}
              className={`px-5 py-2 rounded-xl font-black text-sm transition-all ${activeProgram === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atalhos */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Atalhos Essenciais</h3>
            <div className="space-y-3">
              {filteredShortcuts.map(s => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-600 font-medium">{s.action}</span>
                  <kbd className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-700">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tutoriais */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Tutoriais</h3>
            <div className="space-y-3">
              {filteredTips.map(tip => (
                <button key={tip.id} onClick={() => setSelectedTip(tip)}
                  className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 transition-all group">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">{tip.title}</h4>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{tip.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Exercícios (avaliação) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Exercícios Práticos</h3>
            <div className="space-y-3">
              {filteredExercises.map(exe => (
                <button key={exe.id} onClick={() => setSelectedExercise(exe)}
                  className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 transition-all group relative">
                  {completedExercises.includes(exe.id) && (
                    <CheckCircle2 size={16} className="absolute top-4 right-4 text-green-500" />
                  )}
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block ${exe.difficulty === 'Fácil' ? 'bg-green-50 text-green-700' : exe.difficulty === 'Médio' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                    {exe.difficulty}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">{exe.title}</h4>
                  <p className="text-slate-500 text-xs mt-1">{exe.task}</p>
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">Nenhum exercício para este programa ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Exercício */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setSelectedExercise(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl text-slate-400">
              <X size={18} />
            </button>
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <Gamepad2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedExercise.title}</h3>
            <p className="text-slate-500 text-sm mb-6">{selectedExercise.task}</p>
            <div className="space-y-3 mb-8">
              {selectedExercise.instructions.map((step, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                  <p className="text-slate-700 text-sm font-medium">{step}</p>
                </div>
              ))}
            </div>
            <button onClick={() => handleCompleteExercise(selectedExercise.id)}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${completedExercises.includes(selectedExercise.id) ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'}`}>
              {completedExercises.includes(selectedExercise.id) ? <><CheckCircle2 size={18} /> Concluído</> : <><ArrowRight size={18} /> Marcar como Concluído</>}
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal Tutorial */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setSelectedTip(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-2 pr-8">{selectedTip.title}</h3>
            <p className="text-slate-500 text-sm mb-6">{selectedTip.description}</p>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <p className="text-slate-700 leading-relaxed font-medium">{selectedTip.fullTutorial}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
