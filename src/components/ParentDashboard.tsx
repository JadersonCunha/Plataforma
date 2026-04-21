import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../App';
import { MODULES } from '../constants';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface StudentData {
  uid: string;
  email: string;
  displayName: string;
  progress: Record<string, { completed: boolean; score: number }>;
}

export default function ParentDashboard({ profile }: { profile: UserProfile }) {
  const [children, setChildren] = useState<StudentData[]>([]);
  const [newChildEmail, setNewChildEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildrenData = async () => {
      if (profile.childrenUids && profile.childrenUids.length > 0) {
        const childrenData: StudentData[] = [];
        for (const childUid of profile.childrenUids) {
          const childDoc = await getDoc(doc(db, 'users', childUid));
          if (childDoc.exists()) {
            const data = childDoc.data();
            // Fetch child progress
            const progressSnap = await getDocs(query(collection(db, 'users', childUid, 'progress')));
            const progressMap: Record<string, any> = {};
            progressSnap.forEach(d => {
              progressMap[d.id] = d.data();
            });
            
            childrenData.push({
              uid: childUid,
              email: data.email,
              displayName: data.displayName,
              progress: progressMap
            });
          }
        }
        setChildren(childrenData);
      }
      setLoading(false);
    };
    fetchChildrenData();
  }, [profile.childrenUids]);

  const handleAddChild = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const q = query(collection(db, 'users'), where('email', '==', newChildEmail), where('role', '==', 'student'));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      setError('Aluno não encontrado com este e-mail.');
      return;
    }

    const studentUid = snap.docs[0].id;
    if (profile.childrenUids?.includes(studentUid)) {
      setError('Este aluno já está vinculado.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        childrenUids: arrayUnion(studentUid)
      });
      setNewChildEmail('');
      window.location.reload(); // Quick refresh to trigger effect
    } catch (err) {
      setError('Erro ao vincular aluno.');
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando dados dos alunos...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800">Painel do Responsável</h1>
          <p className="text-slate-500 mt-2">Acompanhe de perto a evolução tecnológica do seu filho.</p>
        </div>

        <form onSubmit={handleAddChild} className="flex gap-2">
          <input
            type="email"
            value={newChildEmail}
            onChange={(e) => setNewChildEmail(e.target.value)}
            placeholder="E-mail do seu filho(a)"
            className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 transition-all min-w-[280px]"
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Vincular
          </button>
        </form>
      </header>
      
      {error && <p className="text-red-500 mb-6 font-medium">⚠️ {error}</p>}

      {children.length === 0 ? (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-20 text-center">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.UserPlus size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Nenhum aluno vinculado ainda</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Use o formulário acima para vincular a conta de um aluno e começar a visualizar o progresso nos módulos.
          </p>
        </div>
      ) : (
        <div className="grid gap-12">
          {children.map(child => (
            <motion.div
              key={child.uid}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12"
            >
              <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-blue-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center font-black text-4xl shadow-lg shadow-blue-100">
                    {child.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{child.displayName}</h3>
                    <p className="text-sm font-bold text-slate-400 tracking-wide">{child.email.toUpperCase()}</p>
                  </div>
                </div>

                <div className="parent-widget-polish min-w-[280px]">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <Icons.Activity size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Desempenho Geral</p>
                    <p className="text-lg font-black">
                      {Object.values(child.progress).filter((p: any) => p.completed).length} de {MODULES.length} Concluídos
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MODULES.map(m => {
                    const prog = child.progress[m.id];
                    return (
                      <div key={m.id} className="p-5 rounded-2xl bg-white border border-slate-50 shadow-sm transition-all hover:shadow-md group">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{m.title}</span>
                           {prog?.completed ? (
                             <Icons.CheckCircle2 className="text-green-500" size={18} />
                           ) : (
                             <Icons.Clock className="text-slate-300 group-hover:text-blue-400 transition-colors" size={18} />
                           )}
                        </div>
                        <div className="flex items-end justify-between">
                          <p className={`text-2xl font-black ${prog?.completed ? 'text-green-600' : 'text-slate-300'}`}>
                            {prog ? `${prog.score}%` : '0%'}
                          </p>
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden bg-slate-100`}>
                             <div 
                               className={`h-full transition-all duration-1000 ${prog?.completed ? 'bg-green-500' : 'bg-slate-300'}`} 
                               style={{ width: `${prog?.score || 0}%` }}
                             />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
