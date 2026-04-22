import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { MODULES } from './constants';

// Components
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import ModuleView from './components/ModuleView';
import QuizView from './components/QuizView';
import ParentDashboard from './components/ParentDashboard';
import Navbar from './components/Navbar';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'parent';
  childrenUids?: string[];
}

// App entry point - Optimized for Laboratório de Protagonismo
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const docRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user defaults to student
          const newProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Aluno',
            role: 'student',
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        {user && profile && <Navbar profile={profile} />}
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Landing onLogin={signInWithGoogle} />} 
          />
          <Route 
            path="/dashboard" 
            element={user && profile ? (
              profile.role === 'parent' ? <ParentDashboard profile={profile} /> : <Dashboard profile={profile} />
            ) : <Navigate to="/" />} 
          />
          <Route 
            path="/module/:moduleId" 
            element={user && profile ? <ModuleView profile={profile} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/quiz/:moduleId" 
            element={user && profile ? <QuizView profile={profile} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/parent" 
            element={user && profile && profile.role === 'parent' ? <ParentDashboard profile={profile} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
