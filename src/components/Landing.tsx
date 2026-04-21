import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

export default function Landing({ onLogin }: LandingProps) {
  return (
    <section className="wave-section">
      <div className="wave">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="wave-content max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            Laboratório de <br className="hidden md:block" /> Protagonismo
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 font-light">
            Prepare-se para o futuro digital e o mercado de trabalho.
          </p>
          <div className="pt-8">
            <button
              onClick={onLogin}
              className="group flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full text-xl font-semibold shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              <LogIn className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Entrar com Gmail
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            Acesso exclusivo para alunos e responsáveis via Google
          </p>
        </motion.div>
      </div>
    </section>
  );
}
