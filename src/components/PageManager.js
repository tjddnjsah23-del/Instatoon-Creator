import React from 'react';

function PageManager({ pages, currentPage, onPageAdd, onPageDelete, onPageSelect }) {
    return (
        <div style={{
            height: '60px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: '12px',
            overflowX: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            {/* 페이지 탭들 */}
            {pages.map((page, index) => (
                <div
                    key={page.id}
                    onClick={() => onPageSelect(page.id)}
                    style={{
                        minWidth: '120px',
                        height: '40px',
                        padding: '0 16px',
                        background: currentPage === page.id ? '#6366f1' : '#f3f4f6',
                        color: currentPage === page.id ? 'white' : '#1f2937',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: currentPage === page.id ? '2px solid #4f46e5' : '2px solid transparent',
                        fontSize: '14px',
                        fontWeight: currentPage === page.id ? '600' : '500'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== page.id) {
                            e.currentTarget.style.background = '#e5e7eb';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (currentPage !== page.id) {
                            e.currentTarget.style.background = '#f3f4f6';
                        }
                    }}
                >
                    <span>📄 페이지 {index + 1}</span>
                    {pages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('이 페이지를 삭제하시겠습니까?')) {
                                    onPageDelete(page.id);
                                }
                            }}
                            style={{
                                width: '20px',
                                height: '20px',
                                background: 'rgba(0,0,0,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}

            {/* 페이지 추가 버튼 */}
            <button
                onClick={onPageAdd}
                style={{
                    minWidth: '120px',
                    height: '40px',
                    padding: '0 16px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <span style={{ fontSize: '18px' }}>+</span> 페이지 추가
            </button>
        </div>
    );
}

export default PageManager;