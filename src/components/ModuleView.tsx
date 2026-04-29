import { useParams, Link } from 'react-router-dom';
import { MODULES } from '../constants';
import { UserProfile } from '../App';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function ModuleView({ profile }: { profile: UserProfile }) {
  const { moduleId } = useParams();
  const module = MODULES.find(m => m.id === moduleId);

  if (!module) return <div>Módulo não encontrado</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduleDate = new Date(module.scheduleDate + 'T00:00:00');
  if (today < scheduleDate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-amber-100 text-amber-600">
            <Icons.CalendarClock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Módulo ainda não liberado</h2>
          <p className="text-slate-500 mb-8">Este módulo estará disponível a partir de <strong>{scheduleDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</strong>.</p>
          <Link to="/dashboard" className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
 }

  // @ts-ignore
  const IconComponent = Icons[module.icon] as LucideIcon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
        <Icons.ChevronLeft size={20} />
        Voltar ao Painel
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              {IconComponent && <IconComponent size={32} />}
            </div>
            <span className="text-blue-200 font-bold uppercase tracking-widest text-sm">Módulo Acadêmico</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">{module.title}</h1>
        </div>

        <div className="bg-white p-8 md:p-12">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-blue-700">
            {module.content.split('\n').map((line, i) => {
              if (line.trim().startsWith('-')) {
                return (
                  <div key={i} className="flex gap-3 mb-4 group topic-item">
                    <span className="topic-icon shrink-0 mt-1">✔</span>
                    <p className="text-slate-600 m-0 text-sm font-medium">{line.replace('-', '').trim()}</p>
                  </div>
                );
              }
              if (line.trim().startsWith('#')) {
                return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-slate-800">{line.replace('#', '').trim()}</h3>;
              }
              return line.trim() ? <p key={i} className="mb-6 leading-relaxed text-base text-slate-500 font-medium">{line.trim()}</p> : null;
            })}
          </div>

          <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-slate-800">Pronto para o próximo passo?</h4>
              <p className="text-slate-500 text-sm">Atingir 70% desbloqueia automaticamente o próximo módulo.</p>
            </div>
            
            <Link
              to={`/quiz/${module.id}`}
              className="btn-test max-w-xs text-center flex items-center justify-center gap-2"
            >
              <Icons.Zap size={18} className="fill-white" />
              Iniciar Avaliação Final
            </Link>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
