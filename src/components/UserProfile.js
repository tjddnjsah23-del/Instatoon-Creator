import React, { useState } from 'react';
import { logOut } from '../firebase/auth';

function UserProfile({ user }) {
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        const result = await logOut();
        if (result.success) {
            setShowMenu(false);
        }
    };

    // 사용자 이니셜 또는 프로필 이미지
    const getUserInitial = () => {
        if (user.displayName) {
            return user.displayName.charAt(0).toUpperCase();
        }
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <div className="sidebar-user-profile">
            <button 
                className="sidebar-user-btn"
                onClick={() => setShowMenu(!showMenu)}
            >
                {user.photoURL ? (
                    <img 
                        src={user.photoURL} 
                        alt={user.displayName || user.email}
                        className="sidebar-user-avatar-img"
                    />
                ) : (
                    <div className="sidebar-user-avatar">
                        {getUserInitial()}
                    </div>
                )}
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">
                        {user.displayName || '사용자'}
                    </div>
                    <div className="sidebar-user-email">
                        {user.email}
                    </div>
                </div>
            </button>

            {showMenu && (
                <>
                    <div 
                        className="sidebar-user-backdrop"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="sidebar-user-menu">
                        <button 
                            className="sidebar-user-menu-item sidebar-logout-btn"
                            onClick={handleLogout}
                        >
                            🚪 로그아웃
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default UserProfile;
