import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, Trophy } from 'lucide-react';
import { TypingEngine } from './TypingEngine';
import { LevelSelector } from './LevelSelector';
import { LEVELS } from './curriculum';
import { Challenge, UserProgress, TypingStats } from './types';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../App';
import { Link } from 'react-router-dom';

const MIN_WPM = 30;
const MIN_ACCURACY = 90;
const MAX_ATTEMPTS = 3;

export default function TypeMasterModule({ profile }: { profile: UserProfile }) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<UserProgress>({ currentLevel: 1, completedChallenges: [], bestWpm: 0 });
  const [attempts, setAttempts] = useState(0);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', profile.uid, 'progress', 'm2'));
      if (snap.exists()) {
        const data = snap.data();
        setAttempts(data.attempts ?? 0);
        setApproved(data.completed ?? false);
        if (data.typemasterProgress) setProgress(data.typemasterProgress);
      }
      setLoading(false);
    };
    load();
  }, [profile.uid]);

  const handleChallengeFinish = async (stats: TypingStats) => {
    if (!activeChallenge) return;
    const success = stats.wpm >= activeChallenge.minWpm && stats.accuracy >= activeChallenge.minAccuracy;

    const newProgress = { ...progress };
    if (success && !progress.completedChallenges.includes(activeChallenge.id)) {
      newProgress.completedChallenges = [...progress.completedChallenges, activeChallenge.id];
      const currentLevelObj = LEVELS.find(l => l.id === progress.currentLevel);
      const allDone = currentLevelObj?.challenges.every(c => newProgress.completedChallenges.includes(c.id));
      if (allDone && progress.currentLevel < LEVELS.length) newProgress.currentLevel = progress.currentLevel + 1;
      newProgress.bestWpm = Math.max(progress.bestWpm, stats.wpm);
    }
    setProgress(newProgress);

    // Verifica aprovação geral: último desafio do nível 3 (30 WPM / 90%) concluído
    const finalApproved = stats.wpm >= MIN_WPM && stats.accuracy >= MIN_ACCURACY && success;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    await setDoc(doc(db, 'users', profile.uid, 'progress', 'm2'), {
      moduleId: 'm2',
      completed: finalApproved || approved,
      score: Math.round((stats.wpm / MIN_WPM) * 70),
      attempts: newAttempts,
      bestWpm: newProgress.bestWpm,
      typemasterProgress: newProgress,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    if (finalApproved) setApproved(true);
    setActiveChallenge(null);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" /></div>;

  if (approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#111113] p-12 rounded-3xl shadow-2xl border border-white/10">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8 bg-yellow-500/20 text-yellow-500">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Módulo Concluído!</h2>
          <p className="text-gray-400 mb-8">Você atingiu {progress.bestWpm} WPM. Digitação aprovada!</p>
          <Link to="/dashboard" className="px-8 py-4 bg-yellow-500 text-black rounded-2xl font-black hover:bg-yellow-400 transition-all">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#111113] p-12 rounded-3xl border border-white/10">
          <h2 className="text-3xl font-black text-white mb-4">Tentativas Esgotadas</h2>
          <p className="text-gray-400 mb-8">Você usou todas as {MAX_ATTEMPTS} tentativas. Fale com seu instrutor.</p>
          <Link to="/dashboard" className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 font-sans">
      <div className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <Keyboard className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase text-white">TYPE<span className="text-yellow-500">MASTER</span></span>
        </div>
        <div className="flex items-center gap-4 text-xs font-black text-gray-500 uppercase tracking-widest">
          <span>Meta: {MIN_WPM} WPM / {MIN_ACCURACY}% precisão</span>
          <span className="text-amber-500">Tentativa {attempts + 1}/{MAX_ATTEMPTS}</span>
          <Link to="/dashboard" className="text-gray-600 hover:text-white transition-colors">← Painel</Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LevelSelector levels={LEVELS} progress={progress} onSelectChallenge={setActiveChallenge} />
            </motion.div>
          ) : (
            <motion.div key="engine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-12 text-center">
                <h1 className="text-4xl font-black tracking-tighter text-white">{activeChallenge.title}</h1>
              </div>
              <TypingEngine challenge={activeChallenge} onFinish={handleChallengeFinish} onCancel={() => setActiveChallenge(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
