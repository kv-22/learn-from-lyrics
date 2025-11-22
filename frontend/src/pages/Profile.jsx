import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getVocabulary } from '../utils/vocabulary';
import './Profile.css';

const Profile = ({ onMenuClick }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('Arabic Learner');
  const [stats, setStats] = useState({
    songsLearned: 24,
    studyTime: '12h',
  });

  useEffect(() => {
    // Check if user is signed in (dummy check)
    const signedIn = localStorage.getItem('arabic_songs_signed_in') === 'true';
    setIsSignedIn(signedIn);
    
    if (signedIn) {
      // Calculate stats from vocabulary
      const vocabulary = getVocabulary();
      // For now, using dummy stats
    }
  }, []);

  const handleSignIn = () => {
    localStorage.setItem('arabic_songs_signed_in', 'true');
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('arabic_songs_signed_in');
      setIsSignedIn(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="profile-page">
        <Header title="Profile" onMenuClick={onMenuClick} />
        <div className="profile-content">
          <div className="sign-in-container">
            <div className="sign-in-card">
              <h2>Welcome to Arabic Songs</h2>
              <p>Sign in to track your progress and sync your vocabulary across devices.</p>
              <button className="sign-in-button" onClick={handleSignIn}>
                Sign In
              </button>
              <p className="sign-in-note">Note: This is a demo. Full authentication will be available soon.</p>
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
          <p className="profile-meta">Learning since November 2024</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Songs Learned</span>
              <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
            <div className="stat-value">{stats.songsLearned}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Study Time</span>
              <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-value">{stats.studyTime}</div>
          </div>
        </div>

        <div className="profile-actions">
          <div className="action-card">
            <div className="action-item">
              <div className="action-icon-wrapper settings-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                </svg>
              </div>
              <div className="action-content">
                <div className="action-title">App Settings</div>
                <div className="action-subtitle">Notifications, Audio, Privacy</div>
              </div>
            </div>

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

