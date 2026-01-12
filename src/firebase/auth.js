import { 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from './config';

// Google 로그인
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google 로그인 성공:', result.user.email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('❌ Google 로그인 실패:', error);
        return { success: false, error: error.message };
    }
};

// 이메일/비밀번호 로그인
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ 이메일 로그인 성공:', result.user.email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('❌ 이메일 로그인 실패:', error);
        let errorMessage = '로그인에 실패했습니다.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = '등록되지 않은 이메일입니다.';
                break;
            case 'auth/wrong-password':
                errorMessage = '비밀번호가 올바르지 않습니다.';
                break;
            case 'auth/invalid-email':
                errorMessage = '유효하지 않은 이메일 형식입니다.';
                break;
            case 'auth/user-disabled':
                errorMessage = '비활성화된 계정입니다.';
                break;
            default:
                errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
};

// 이메일/비밀번호 회원가입
export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // 사용자 프로필 업데이트 (이름 설정)
        if (displayName) {
            await updateProfile(result.user, {
                displayName: displayName
            });
        }
        
        console.log('✅ 회원가입 성공:', result.user.email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('❌ 회원가입 실패:', error);
        let errorMessage = '회원가입에 실패했습니다.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = '이미 사용 중인 이메일입니다.';
                break;
            case 'auth/invalid-email':
                errorMessage = '유효하지 않은 이메일 형식입니다.';
                break;
            case 'auth/weak-password':
                errorMessage = '비밀번호는 6자 이상이어야 합니다.';
                break;
            default:
                errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
};

// 로그아웃
export const logOut = async () => {
    try {
        await signOut(auth);
        console.log('✅ 로그아웃 성공');
        return { success: true };
    } catch (error) {
        console.error('❌ 로그아웃 실패:', error);
        return { success: false, error: error.message };
    }
};

// 인증 상태 변경 리스너
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
