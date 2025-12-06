import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getVocabulary } from '../utils/vocabulary';
import './Profile.css';
import { signUp, signIn } from "../utils/auth";
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Profile = ({ onMenuClick }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('Arabic Learner');
  const [stats, setStats] = useState({
    wordsLearned: 0,
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserName(currentUser.email || 'Arabic Learner');
        // Calculate stats from vocabulary
        (async () => {
          try {
            const vocab = await getVocabulary();
            setStats({
              wordsLearned: vocab.length,
            });
          } catch (e) {
            console.error('Error loading vocabulary for profile stats', e);
          }
        })();
      } else {
        setUserName('Arabic Learner');
        // Clear any leftover auth form state when user signs out
        setEmail('');
        setPassword('');
        setError('');
      }
    });

    return () => unsubscribe();
  }, []);

  // Clear fields when switching between sign in and sign up
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [isSignUp]);

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (!result.user) {
        if (result.error) {
          const errorCode = result.error.code;
          if (errorCode === 'auth/user-not-found') {
            // Email doesn't match any existing account
            setError('Account does not exist. Please sign up first.');
          } else if (errorCode === 'auth/invalid-credential') {
            // Firebase now uses this for most bad email/password combinations;
            // we can't reliably know which part is wrong, so show a safe message that also suggests signing up.
            setError('Email or password is incorrect. Please try again or sign up.');
          } else if (errorCode === 'auth/invalid-email') {
            setError('Invalid email address.');
          } else {
            setError('Error signing in. Please try again.');
          }
        }
      }
    } catch (err) {
      setError('Error signing in. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signUp(email, password);
      if (!result.user) {
        if (result.error) {
          const errorCode = result.error.code;
          if (errorCode === 'auth/email-already-in-use') {
            setError('Account already exists. Please sign in instead.');
          } else if (errorCode === 'auth/invalid-email') {
            setError('Invalid email address.');
          } else if (errorCode === 'auth/weak-password') {
            setError('Password is too weak. Password should be at least 6 characters.');
          } else {
            setError('Error creating account. Please try again.');
          }
        } else {
          setError('Error creating account. Please try again.');
        }
      }
    } catch (err) {
      setError('Error creating account. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {

    try {
      await signOut(auth);
      // Also clear local auth form state immediately after sign out
      setEmail('');
      setPassword('');
      setError('');
      setIsSignUp(false);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }

  };

  if (!user) {
    return (
      <div className="profile-page">
        <Header title="Profile" onMenuClick={onMenuClick} />
        <div className="profile-content">
          <div className="sign-in-container">
            <div className="sign-in-card">
              <h2>Welcome to Arabic Songs</h2>
              <p>Sign in to track your progress and sync your vocabulary across devices.</p>
              <div className="auth-form">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-buttons">
                  <button 
                    className="sign-in-button" 
                    onClick={isSignUp ? handleSignUp : handleSignIn}
                    disabled={loading}
                  >
                    {loading ? (isSignUp ? 'Creating...' : 'Loading...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </button>
                  <button 
                    className="sign-up-button" 
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Sign In' : 'Need an account?'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header title="Profile" onMenuClick={onMenuClick} />
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="profile-name">{userName}</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Words Learned</span>
              <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
            <div className="stat-value">{stats.wordsLearned}</div>
          </div>
        </div>

        <div className="profile-actions">
          <div className="action-card">
            <div className="action-item sign-out" onClick={handleSignOut}>
              <div className="action-icon-wrapper sign-out-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <div className="action-content">
                <div className="action-title">Sign Out</div>
                <div className="action-subtitle">Log out of your account</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;




