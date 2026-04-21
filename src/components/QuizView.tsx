import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MODULES, Question } from '../constants';
import { UserProfile } from '../App';
import { db } from '../lib/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

export default function QuizView({ profile }: { profile: UserProfile }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = MODULES.find(m => m.id === moduleId);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [gradingDetails, setGradingDetails] = useState<string>('');

  if (!module) return <div>Módulo não encontrado</div>;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let correctCount = 0;
    const totalQuestions = module.quiz.length;
    
    // Quick grading for objective questions
    const objectiveQuestions = module.quiz.filter(q => q.type === 'objective');
    objectiveQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const subjectiveQuestions = module.quiz.filter(q => q.type === 'subjective');
    
    if (subjectiveQuestions.length > 0) {
      // Use Gemini to grade subjective answers
      try {
        const prompt = `
          Você é um professor avaliando um teste de informática. 
          Módulo: ${module.title}
          Perguntas e Respostas do Aluno:
          ${subjectiveQuestions.map(q => `P: ${q.text}\nR: ${answers[q.id] || '(Sem resposta)'}`).join('\n\n')}
          
          Atribua uma nota de 0 a ${subjectiveQuestions.length} baseada na clareza e correção das respostas subjetivas.
          Responda APENAS com um número (a nota total para as subjetivas) e opcionalmente um breve feedback em uma nova linha.
        `;
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
        });
        const text = response.text || '';
        const scoreMatch = text.match(/^\d+/);
        if (scoreMatch) {
          correctCount += parseInt(scoreMatch[0]);
        }
        setGradingDetails(text.split('\n').slice(1).join('\n'));
      } catch (err) {
        console.error("Gemini grading failed, defaulting to basic text check", err);
        // Fallback: if they wrote more than 20 chars, give points
        subjectiveQuestions.forEach(q => {
          if ((answers[q.id] || '').length > 20) correctCount++;
        });
      }
    }

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= 70;

    // Save to Firestore
    try {
      const progressRef = doc(db, 'users', profile.uid, 'progress', module.id);
      await setDoc(progressRef, {
        moduleId: module.id,
        completed: passed,
        score: scorePercent,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, 'users', profile.uid, 'quizResults'), {
        moduleId: module.id,
        score: scorePercent,
        passed,
        timestamp: serverTimestamp()
      });

      setResult({ score: scorePercent, passed });
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100"
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8 ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {result.passed ? <Icons.Trophy size={48} /> : <Icons.AlertCircle size={48} />}
          </div>
          
          <h2 className="text-4xl font-black text-slate-800 mb-2">
            {result.passed ? 'Parabéns!' : 'Quase lá!'}
          </h2>
          <p className="text-6xl font-black text-blue-600 my-6">{result.score}%</p>
          
          <p className="text-slate-600 text-lg mb-4">
            {result.passed 
              ? 'Você dominou este módulo e desbloqueou o próximo nível!' 
              : 'Você precisa de pelo menos 70% para avançar. Revise o conteúdo e tente novamente.'}
          </p>

          {gradingDetails && (
            <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 mb-8 italic">
              <span className="font-bold block not-italic mb-1">Feedback do Instrutor IA:</span>
              "{gradingDetails.trim()}"
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Voltar ao Início
            </Link>
            {!result.passed ? (
               <button
                onClick={() => { setResult(null); setAnswers({}); }}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Tentar Novamente
              </button>
            ) : (
                <Link
                to="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Próximo Módulo
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
       <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-800">Avaliação do Módulo</h1>
        <p className="text-slate-500">{module.title}</p>
      </div>

      <div className="space-y-8">
        {module.quiz.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex gap-4 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                {idx + 1}
              </span>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{q.text}</h3>
            </div>

            {q.type === 'objective' ? (
              <div className="grid gap-3">
                {q.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: option }))}
                    className={`text-left p-4 rounded-xl border-2 transition-all font-medium ${
                      answers[q.id] === option 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 hover:border-blue-200 text-slate-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Desenvolva sua resposta aqui..."
                className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all resize-none text-slate-600 bg-slate-50"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          disabled={isSubmitting || Object.keys(answers).length < module.quiz.length}
          onClick={handleSubmit}
          className="group relative flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-blue-100"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              Avaliando Respostas...
            </>
          ) : (
            <>
              Finalizar Teste
              <Icons.Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
      {Object.keys(answers).length < module.quiz.length && (
        <p className="text-center text-slate-400 mt-4 text-sm italic">
          Responda todas as {module.quiz.length} questões para habilitar a entrega.
        </p>
      )}
    </div>
  );
}
