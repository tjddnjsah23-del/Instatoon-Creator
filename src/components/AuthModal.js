import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase/auth';

function AuthModal({ onClose }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Google 로그인
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        const result = await signInWithGoogle();
        setLoading(false);
        
        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    // 이메일 로그인
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await signInWithEmail(email, password);
        setLoading(false);
        
        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    // 이메일 회원가입
    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!displayName.trim()) {
            setError('이름을 입력해주세요.');
            setLoading(false);
            return;
        }
        
        const result = await signUpWithEmail(email, password, displayName);
        setLoading(false);
        
        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="auth-header">
                    <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="auth-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* Google 로그인 */}
                <button 
                    className="auth-btn google-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <span className="google-icon">G</span>
                    Google로 계속하기
                </button>

                <div className="auth-divider">
                    <span>또는</span>
                </div>

                {/* 이메일 로그인/회원가입 폼 */}
                <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignup}>
                    {mode === 'signup' && (
                        <div className="auth-input-group">
                            <label>이름</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="홍길동"
                                disabled={loading}
                                required
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="6자 이상"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-btn primary-btn"
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
                    </button>
                </form>

                {/* 모드 전환 */}
                <div className="auth-footer">
                    {mode === 'login' ? (
                        <>
                            계정이 없으신가요?{' '}
                            <button 
                                className="auth-link"
                                onClick={() => {
                                    setMode('signup');
                                    setError('');
                                }}
                            >
                                회원가입
                            </button>
                        </>
                    ) : (
                        <>
                            이미 계정이 있으신가요?{' '}
                            <button 
                                className="auth-link"
                                onClick={() => {
                                    setMode('login');
                                    setError('');
                                }}
                            >
                                로그인
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
