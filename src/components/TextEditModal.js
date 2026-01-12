import React, { useState, useEffect } from 'react';

function TextEditModal({ element, onSave, onClose }) {
    const [text, setText] = useState('');

    useEffect(() => {
        if (element && element.content) {
            setText(element.content.content || '');
        }
    }, [element]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(element.id, text);
            onClose();
        } else {
            alert('텍스트를 입력해주세요.');
        }
    };

    if (!element) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600' }}>
                    ✏️ 텍스트 수정
                </h2>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="텍스트를 입력하세요"
                    autoFocus
                    style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        marginBottom: '24px'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                    }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TextEditModal;