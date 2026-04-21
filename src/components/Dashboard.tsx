import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MODULES } from '../constants';
import { UserProfile } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score: number;
}

export default function Dashboard({ profile }: { profile: UserProfile }) {
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const q = query(collection(db, 'users', profile.uid, 'progress'));
      const querySnapshot = await getDocs(q);
      const progMap: Record<string, ModuleProgress> = {};
      querySnapshot.forEach((doc) => {
        progMap[doc.id] = doc.data() as ModuleProgress;
      });
      setProgress(progMap);
      setLoading(false);
    };
    fetchProgress();
  }, [profile.uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-240px)]">
        {/* Sidebar Summary */}
        <aside className="lg:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-6">Resumo Educacional</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-2xl">
                  <Icons.TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {Math.round((Object.values(progress).filter((p: any) => p.completed).length / MODULES.length) * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 font-bold">Curso Concluído</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <p className="text-sm font-bold text-slate-700 mb-4 italic">"Transformando o hoje em um futuro brilhante."</p>
                <div className="parent-widget-polish">
                  <div className="text-2xl">🎓</div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-blue-400">Jornada Pro</h4>
                    <p className="text-[10px] text-slate-400">Certificado disponível ao final.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-slate-800">Meus Módulos</h1>
            <p className="text-slate-500 text-sm">Clique em um cartão para continuar sua trilha de conhecimento.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODULES.map((module, index) => {
              const modProg = progress[module.id];
              const isCompleted = modProg?.completed;
              const prevModule = MODULES[index - 1];
              const isLocked = index > 0 && !(progress[prevModule?.id]?.completed);
              
              // @ts-ignore
              const IconComponent = Icons[module.icon] as LucideIcon;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`module-card-polish group relative flex flex-col ${
                    isLocked ? 'opacity-50 grayscale pointer-events-none' : ''
                  } ${isCompleted ? 'module-card-active' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl transition-colors ${
                      isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      {IconComponent && <IconComponent size={28} />}
                    </div>
                    {isLocked && <Icons.Lock size={18} className="text-slate-300" />}
                    {isCompleted && <Icons.Award size={22} className="text-green-500" />}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2">{module.title}</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    {index === 0 ? 'Conheça o sistema e domine os atalhos essenciais.' : 'Avance para o próximo nível técnico profissional.'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <div className="flex justify-between text-xs font-black mb-2">
                       <span className={isCompleted ? 'text-green-600' : 'text-slate-400'}>
                         {isCompleted ? 'COMPLETO' : 'DISPONÍVEL'}
                       </span>
                       <span className="text-slate-500">{isCompleted ? '100%' : '0%'}</span>
                    </div>
                    <div className="polish-progress-bg">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        className="polish-progress-fill"
                      />
                    </div>
                    
                    <Link
                      to={`/module/${module.id}`}
                      className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        isCompleted 
                          ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                      }`}
                    >
                      {isCompleted ? 'Revisar' : 'Entrar'}
                      <Icons.ChevronRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
