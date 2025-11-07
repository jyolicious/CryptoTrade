import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    // demo delay to simulate network call
    setTimeout(() => {
      setIsLoading(false);

      // store a demo token so protected pages won't immediately redirect
      // replace with real token from your API when integrating
      try {
        localStorage.setItem("token", "demo-token");
      } catch (err) {
        console.warn("Could not store token in localStorage:", err);
      }

      // navigate to absolute dashboard path
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Enhanced animated background with more gradients */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)'
        }}
      />
      
      {/* Animated background blobs */}
      <div style={{ position: 'absolute', top: '5rem', left: '5rem', width: '24rem', height: '24rem', background: '#a855f7', borderRadius: '9999px', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.3, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      <div style={{ position: 'absolute', top: '10rem', right: '5rem', width: '24rem', height: '24rem', background: '#3b82f6', borderRadius: '9999px', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.3, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s' }}></div>
      <div style={{ position: 'absolute', bottom: '5rem', left: '50%', width: '24rem', height: '24rem', background: '#ec4899', borderRadius: '9999px', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.3, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '4s' }}></div>

      {/* Main container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '28rem', zIndex: 10 }}>
        {/* Logo section with gradient border */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', padding: '4px', borderRadius: '1rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #EC4899 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: '#0f172a' }}>
              <span style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>₿</span>
            </div>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            Crypto<span 
              style={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >Trade</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Secure. Fast. Reliable.</p>
        </div>

        {/* Login card with gradient border */}
        <div 
          style={{
            padding: '4px',
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) 50%, rgba(236, 72, 153, 0.5) 100%)'
          }}
        >
          <div style={{ padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', background: 'rgba(15, 23, 42, 0.95)' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 'bold', marginBottom: '1.5rem' }}>Welcome Back</h2>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#d1d5db', fontWeight: '500' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '3rem', 
                      paddingRight: '1rem', 
                      paddingTop: '0.75rem', 
                      paddingBottom: '0.75rem', 
                      color: 'white', 
                      borderRadius: '0.75rem', 
                      border: '1px solid rgba(139, 92, 246, 0.3)', 
                      outline: 'none', 
                      transition: 'all 0.3s',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#d1d5db', fontWeight: '500' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '3rem', 
                      paddingRight: '1rem', 
                      paddingTop: '0.75rem', 
                      paddingBottom: '0.75rem', 
                      color: 'white', 
                      borderRadius: '0.75rem', 
                      border: '1px solid rgba(139, 92, 246, 0.3)', 
                      outline: 'none', 
                      transition: 'all 0.3s',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: '#d1d5db', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem' }} />
                  <span style={{ marginLeft: '0.5rem' }}>Remember me</span>
                </label>
                <button type="button" style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>

              {/* Login button with gradient */} 
              <button 
                type="submit"
                onClick={handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in..
                  </>
                ) : (
                  <>
                    Log In
                    <svg style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => navigate('/signup')}
                  style={{
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: '#6b7280', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>256-bit SSL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Privacy Protected</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
                