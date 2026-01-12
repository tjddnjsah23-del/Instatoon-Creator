import React, { useState } from 'react';

function MaskPanel({ maskBoxes, onMaskChange, onAddBox, onDeleteBox, onUpdateBox }) {
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [selectedBoxId, setSelectedBoxId] = useState(null);
    
    // 마스크 활성화/비활성화
    const handleToggle = () => {
        onMaskChange({
            ...maskBoxes,
            enabled: !maskBoxes.enabled
        });
    };

    // 마스크 투명도 변경
    const handleOpacityChange = (e) => {
        onMaskChange({
            ...maskBoxes,
            maskOpacity: parseFloat(e.target.value)
        });
    };

    // 마스크 색상 변경
    const handleColorChange = (e) => {
        onMaskChange({
            ...maskBoxes,
            maskColor: e.target.value
        });
    };

    // 그리기 모드 토글
    const handleDrawModeToggle = () => {
        setIsDrawMode(!isDrawMode);
    };

    // 박스 선택
    const handleBoxSelect = (boxId) => {
        setSelectedBoxId(boxId === selectedBoxId ? null : boxId);
    };

    // 박스 삭제
    const handleBoxDelete = (boxId) => {
        onDeleteBox(boxId);
        if (selectedBoxId === boxId) {
            setSelectedBoxId(null);
        }
    };

    // 모든 박스 삭제
    const handleClearAll = () => {
        if (window.confirm('모든 마스크 박스를 삭제하시겠습니까?')) {
            maskBoxes.boxes.forEach(box => onDeleteBox(box.id));
            setSelectedBoxId(null);
        }
    };

    return (
        <div className="panel">
            <h3 className="panel-title">🎭 마스크</h3>
            
            {/* 마스크 On/Off */}
            <div className="input-group">
                <label className="input-label">마스크 효과</label>
                <button
                    onClick={handleToggle}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: maskBoxes.enabled ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {maskBoxes.enabled ? '✅ 활성화' : '❌ 비활성화'}
                </button>
            </div>

            {maskBoxes.enabled && (
                <>
                    {/* 박스 그리기 모드 */}
                    <div className="input-group">
                        <label className="input-label">박스 그리기</label>
                        <button
                            onClick={handleDrawModeToggle}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: isDrawMode ? '#3b82f6' : '#e5e7eb',
                                color: isDrawMode ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isDrawMode ? '✏️ 그리기 모드 중...' : '➕ 박스 추가'}
                        </button>
                        {isDrawMode && (
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '8px',
                                padding: '8px',
                                background: '#f0f9ff',
                                borderRadius: '6px'
                            }}>
                                💡 캔버스를 드래그하여 박스를 그리세요
                            </p>
                        )}
                    </div>

                    {/* 박스 목록 */}
                    <div className="input-group">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>
                                박스 목록 ({maskBoxes.boxes.length})
                            </label>
                            {maskBoxes.boxes.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    style={{
                                        padding: '4px 8px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    전체 삭제
                                </button>
                            )}
                        </div>
                        
                        {maskBoxes.boxes.length === 0 ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: '13px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                border: '2px dashed #e5e7eb'
                            }}>
                                박스를 추가해주세요
                            </div>
                        ) : (
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                {maskBoxes.boxes.map((box, index) => (
                                    <div
                                        key={box.id}
                                        onClick={() => handleBoxSelect(box.id)}
                                        style={{
                                            padding: '12px',
                                            background: selectedBoxId === box.id ? '#f0f9ff' : 'white',
                                            border: selectedBoxId === box.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>
                                                📦 박스 {index + 1}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBoxDelete(box.id);
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#6b7280',
                                            marginTop: '6px'
                                        }}>
                                            위치: ({Math.round(box.x)}, {Math.round(box.y)})<br/>
                                            크기: {Math.round(box.width)} × {Math.round(box.height)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 마스크 색상 */}
                    <div className="input-group">
                        <label className="input-label">마스크 색상</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => onMaskChange({ ...maskBoxes, maskColor: '#000000' })}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#000000',
                                    border: maskBoxes.maskColor === '#000000' ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }}
                            >
                                검은색
                            </button>
                            <button
                                onClick={() => onMaskChange({ ...maskBoxes, maskColor: '#ffffff' })}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#ffffff',
                                    border: maskBoxes.maskColor === '#ffffff' ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }}
                            >
                                흰색
                            </button>
                        </div>
                    </div>

                    {/* 마스크 투명도 */}
                    <div className="input-group">
                        <label className="input-label">
                            마스크 어둡기: {Math.round(maskBoxes.maskOpacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={maskBoxes.maskOpacity}
                            onChange={handleOpacityChange}
                            className="slider"
                        />
                    </div>

                    {/* 안내 */}
                    <div style={{
                        padding: '12px',
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#92400e'
                    }}>
                        💡 <strong>사용법:</strong><br/>
                        1. "박스 추가" 클릭<br/>
                        2. 캔버스를 드래그하여 박스 그리기<br/>
                        3. 박스 안 이미지만 보임<br/>
                        4. 내보내기 시 박스 밖 잘림
                    </div>
                </>
            )}
        </div>
    );
}

export default MaskPanel;
