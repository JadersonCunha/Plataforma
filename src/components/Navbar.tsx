import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import * as Icons from 'lucide-react';
import { UserProfile } from '../App';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(auth).then(() => navigate('/'));
  };

  return (
    <nav className="hero-header px-4 md:px-12">
      <div className="wave-container">
        <div className="wave-span"></div>
        <div className="wave-span"></div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-black text-3xl">
            <span>Laboratório de Protagonismo</span>
          </Link>
          <p className="text-blue-100/80 text-sm font-medium mt-1">Academia de Tecnologia para o Futuro</p>
          
          <div className="hidden md:flex gap-6 mt-4">
            <Link to="/dashboard" className="text-white hover:text-blue-100 font-bold border-b-2 border-white/40 pb-1 transition-all">
              Meus Módulos
            </Link>
            {profile.role === 'parent' && (
              <Link to="/parent" className="text-white/70 hover:text-white font-bold pb-1 transition-all">
                Área do Responsável
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="user-pill group cursor-default">
            <div className="pill-avatar">
              {profile.displayName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-none">{profile.displayName}</span>
              <span className="text-[10px] uppercase opacity-70 mt-0.5">
                {profile.role === 'student' ? 'Aluno' : 'Responsável'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
            title="Sair"
          >
            <Icons.LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
