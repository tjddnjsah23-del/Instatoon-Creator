import React from 'react';

function CanvasSizeModal({ show, onClose, onConfirm, selectedSize, setSelectedSize, selectedBgColor, setSelectedBgColor }) {
    if (!show) return null;

    const bgColors = [
        { name: '흰색', color: '#ffffff' },
        { name: '검정', color: '#000000' },
        { name: '회색', color: '#808080' },
        { name: '베이지', color: '#f5f5dc' },
        { name: '하늘색', color: '#87ceeb' },
        { name: '연분홍', color: '#ffb6c1' }
    ];

    return (
        <div className={`modal-overlay ${show ? 'active' : ''}`}>
            <div className="modal">
                <h2 className="modal-title">프로젝트 설정</h2>
                
                {/* 캔버스 크기 */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>캔버스 크기</h3>
                    <div className="canvas-size-options">
                        <div
                            className={`size-option ${selectedSize === '1080x1080' ? 'selected' : ''}`}
                            onClick={() => setSelectedSize('1080x1080')}
                        >
                            <div className="size-label">정사각형</div>
                            <div className="size-dimensions">1080 × 1080</div>
                        </div>
                        <div
                            className={`size-option ${selectedSize === '1080x1350' ? 'selected' : ''}`}
                            onClick={() => setSelectedSize('1080x1350')}
                        >
                            <div className="size-label">세로형</div>
                            <div className="size-dimensions">1080 × 1350</div>
                        </div>
                    </div>
                </div>
                
                {/* 배경색 선택 */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>배경색</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                    }}>
                        {bgColors.map((bg, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedBgColor(bg.color)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: selectedBgColor === bg.color ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                                    backgroundColor: bg.color,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '60px',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: bg.color === '#ffffff' || bg.color === '#f5f5dc' || bg.color === '#87ceeb' || bg.color === '#ffb6c1' ? '#333' : '#fff',
                                    textShadow: bg.color === '#ffffff' ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
                                }}>
                                    {bg.name}
                                </span>
                                {selectedBgColor === bg.color && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        fontSize: '16px'
                                    }}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {/* 커스텀 색상 */}
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>직접 선택:</label>
                        <input
                            type="color"
                            value={selectedBgColor}
                            onChange={(e) => setSelectedBgColor(e.target.value)}
                            style={{
                                width: '60px',
                                height: '36px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{selectedBgColor}</span>
                    </div>
                </div>
                
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={onClose}>취소</button>
                    <button className="btn btn-primary" onClick={onConfirm}>프로젝트 생성</button>
                </div>
            </div>
        </div>
    );
}

export default CanvasSizeModal;
