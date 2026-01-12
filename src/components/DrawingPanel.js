import React from 'react';

function DrawingPanel({ drawingSettings, onDrawingChange }) {
    const handleToggle = () => {
        onDrawingChange({
            ...drawingSettings,
            enabled: !drawingSettings.enabled
        });
    };

    const handleToolChange = (tool) => {
        onDrawingChange({
            ...drawingSettings,
            tool
        });
    };

    const handleColorChange = (e) => {
        onDrawingChange({
            ...drawingSettings,
            color: e.target.value
        });
    };

    const handleThicknessChange = (e) => {
        onDrawingChange({
            ...drawingSettings,
            thickness: parseInt(e.target.value)
        });
    };

    const handleFillToggle = () => {
        onDrawingChange({
            ...drawingSettings,
            fillShape: !drawingSettings.fillShape
        });
    };

    // 프리셋 색상
    const presetColors = [
        { name: '검은색', value: '#000000' },
        { name: '흰색', value: '#ffffff' },
        { name: '빨간색', value: '#ef4444' },
        { name: '파란색', value: '#3b82f6' },
        { name: '초록색', value: '#10b981' },
        { name: '노란색', value: '#fbbf24' },
        { name: '보라색', value: '#8b5cf6' },
        { name: '분홍색', value: '#ec4899' }
    ];

    // 두께 프리셋
    const thicknessPresets = [
        { name: '얇게', value: 2 },
        { name: '기본', value: 5 },
        { name: '중간', value: 10 },
        { name: '두껍게', value: 20 },
        { name: '매우 두껍게', value: 50 }
    ];

    return (
        <div className="panel">
            <h3 className="panel-title">🎨 그림판</h3>
            
            {/* On/Off 토글 */}
            <div className="input-group">
                <label className="input-label">그림판 모드</label>
                <button
                    onClick={handleToggle}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: drawingSettings.enabled ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {drawingSettings.enabled ? '✅ 활성화' : '❌ 비활성화'}
                </button>
                {drawingSettings.enabled && (
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '8px',
                        padding: '8px',
                        background: '#f0f9ff',
                        borderRadius: '6px'
                    }}>
                        💡 캔버스를 드래그하여 그리세요
                    </p>
                )}
            </div>

            {drawingSettings.enabled && (
                <>
                    {/* 도구 선택 */}
                    <div className="input-group">
                        <label className="input-label">도구</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            marginTop: '8px'
                        }}>
                            <button
                                onClick={() => handleToolChange('line')}
                                style={{
                                    padding: '12px',
                                    background: drawingSettings.tool === 'line' ? '#3b82f6' : 'white',
                                    color: drawingSettings.tool === 'line' ? 'white' : '#374151',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    transition: 'all 0.2s'
                                }}
                                title="선 그리기"
                            >
                                ╱
                            </button>
                            <button
                                onClick={() => handleToolChange('rectangle')}
                                style={{
                                    padding: '12px',
                                    background: drawingSettings.tool === 'rectangle' ? '#3b82f6' : 'white',
                                    color: drawingSettings.tool === 'rectangle' ? 'white' : '#374151',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    transition: 'all 0.2s'
                                }}
                                title="사각형"
                            >
                                ▭
                            </button>
                            <button
                                onClick={() => handleToolChange('circle')}
                                style={{
                                    padding: '12px',
                                    background: drawingSettings.tool === 'circle' ? '#3b82f6' : 'white',
                                    color: drawingSettings.tool === 'circle' ? 'white' : '#374151',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    transition: 'all 0.2s'
                                }}
                                title="원"
                            >
                                ●
                            </button>
                        </div>
                    </div>

                    {/* 도형 채우기 (사각형/원만) */}
                    {(drawingSettings.tool === 'rectangle' || drawingSettings.tool === 'circle') && (
                        <div className="input-group">
                            <label className="input-label">채우기</label>
                            <button
                                onClick={handleFillToggle}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: drawingSettings.fillShape ? '#3b82f6' : 'white',
                                    color: drawingSettings.fillShape ? 'white' : '#374151',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {drawingSettings.fillShape ? '✅ 채움' : '⬜ 테두리만'}
                            </button>
                        </div>
                    )}

                    {/* 프리셋 색상 */}
                    <div className="input-group">
                        <label className="input-label">프리셋 색상</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                            marginTop: '8px'
                        }}>
                            {presetColors.map(preset => (
                                <button
                                    key={preset.value}
                                    onClick={() => onDrawingChange({ ...drawingSettings, color: preset.value })}
                                    style={{
                                        padding: '8px',
                                        background: preset.value,
                                        border: drawingSettings.color === preset.value ? '3px solid #6366f1' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        height: '40px',
                                        transition: 'all 0.2s'
                                    }}
                                    title={preset.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 커스텀 색상 */}
                    <div className="input-group">
                        <label className="input-label">커스텀 색상</label>
                        <input
                            type="color"
                            value={drawingSettings.color}
                            onChange={handleColorChange}
                            style={{
                                width: '100%',
                                height: '50px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    {/* 두께 프리셋 */}
                    <div className="input-group">
                        <label className="input-label">두께 프리셋</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            marginTop: '8px'
                        }}>
                            {thicknessPresets.map(preset => (
                                <button
                                    key={preset.value}
                                    onClick={() => onDrawingChange({ ...drawingSettings, thickness: preset.value })}
                                    style={{
                                        padding: '12px 8px',
                                        background: drawingSettings.thickness === preset.value ? '#3b82f6' : 'white',
                                        color: drawingSettings.thickness === preset.value ? 'white' : '#374151',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {preset.name} ({preset.value}px)
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 두께 슬라이더 */}
                    <div className="input-group">
                        <label className="input-label">
                            두께: {drawingSettings.thickness}px
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={drawingSettings.thickness}
                            onChange={handleThicknessChange}
                            className="slider"
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            <span>얇게 (1px)</span>
                            <span>두껍게 (100px)</span>
                        </div>
                    </div>

                    {/* 미리보기 */}
                    <div className="input-group">
                        <label className="input-label">미리보기</label>
                        <div style={{
                            width: '100%',
                            height: '80px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '2px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {drawingSettings.tool === 'line' && (
                                <svg width="100%" height="100%">
                                    <line
                                        x1="20%"
                                        y1="50%"
                                        x2="80%"
                                        y2="50%"
                                        stroke={drawingSettings.color}
                                        strokeWidth={Math.min(drawingSettings.thickness, 20)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                            {drawingSettings.tool === 'rectangle' && (
                                <div
                                    style={{
                                        width: '60%',
                                        height: '60%',
                                        background: drawingSettings.fillShape ? drawingSettings.color : 'transparent',
                                        border: drawingSettings.fillShape ? 'none' : `${Math.min(drawingSettings.thickness / 2, 5)}px solid ${drawingSettings.color}`
                                    }}
                                />
                            )}
                            {drawingSettings.tool === 'circle' && (
                                <div
                                    style={{
                                        width: '60%',
                                        height: '60%',
                                        borderRadius: '50%',
                                        background: drawingSettings.fillShape ? drawingSettings.color : 'transparent',
                                        border: drawingSettings.fillShape ? 'none' : `${Math.min(drawingSettings.thickness / 2, 5)}px solid ${drawingSettings.color}`
                                    }}
                                />
                            )}
                        </div>
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
                        1. 도구 선택 (선/사각형/원)<br/>
                        2. 색상과 두께 설정<br/>
                        3. 캔버스를 드래그하여 그리기<br/>
                        4. 각 그림은 새 레이어로 추가됩니다
                    </div>
                </>
            )}
        </div>
    );
}

export default DrawingPanel;
