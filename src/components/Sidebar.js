import React, { useState } from 'react';
import UserProfile from './UserProfile';

function Sidebar({ projects, activeProject, onProjectSelect, onNewProject, onProjectDelete, onExport, user, onLogin }) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleDeleteClick = (e, projectId) => {
        e.stopPropagation(); // 프로젝트 선택 방지
        
        if (window.confirm('이 프로젝트를 삭제하시겠습니까?')) {
            onProjectDelete(projectId);
        }
    };

    return (
        <div className="sidebar fade-in">
            {/* 상단 로고 */}
            <div className="sidebar-header">
                <div className="logo">Instar Canvas</div>
            </div>
            
            {/* 새 프로젝트 버튼 */}
            <button className="new-project-btn-full" onClick={onNewProject}>
                <span style={{ fontSize: '20px' }}>+</span> 새 프로젝트
            </button>
            
            {/* 프로젝트 목록 */}
            <div className="sidebar-section">
                <div className="section-title">프로젝트</div>
                {projects.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: '#9ca3af',
                        fontSize: '14px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                        <div>프로젝트가 없습니다</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                            새 프로젝트를 만들어보세요!
                        </div>
                    </div>
                ) : (
                    <div>
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className={`project-item ${activeProject?.id === project.id ? 'active' : ''}`}
                                onClick={() => onProjectSelect(project)}
                            >
                                <div style={{ flex: 1 }}>
                                    <div className="project-name">{project.name}</div>
                                    <div className="project-date">{project.date} · {project.canvasSize}</div>
                                </div>
                                <button
                                    className="project-delete-btn"
                                    onClick={(e) => handleDeleteClick(e, project.id)}
                                    title="프로젝트 삭제"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 내보내기 버튼 */}
            {activeProject && (
                <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: '16px' }}>
                    <button
                        onClick={onExport}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📤</span>
                        이미지로 내보내기
                    </button>
                </div>
            )}

            {/* 하단 로그인/사용자 프로필 */}
            <div className="sidebar-footer">
                {user ? (
                    <UserProfile user={user} />
                ) : (
                    <button className="sidebar-login-btn" onClick={onLogin}>
                        <div className="login-icon">👤</div>
                        <div className="login-text">
                            <div className="login-title">로그인</div>
                            <div className="login-subtitle">시작하기</div>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
