import React from 'react';

function CanvasGuidePanel({ guideSettings, onGuideChange }) {
    const handleToggle = () => {
        onGuideChange({
            ...guideSettings,
            enabled: !guideSettings.enabled
        });
    };

    const handleColorChange = (e) => {
        onGuideChange({
            ...guideSettings,
            color: e.target.value
        });
    };

    const handleThicknessChange = (e) => {
        onGuideChange({
            ...guideSettings,
            thickness: parseInt(e.target.value)
        });
    };

    const handleOpacityChange = (e) => {
        onGuideChange({
            ...guideSettings,
            opacity: parseFloat(e.target.value)
        });
    };

    // 프리셋 색상
    const presetColors = [
        { name: '빨간색', value: '#ef4444' },
        { name: '파란색', value: '#3b82f6' },
        { name: '초록색', value: '#10b981' },
        { name: '보라색', value: '#8b5cf6' },
        { name: '주황색', value: '#f97316' },
        { name: '분홍색', value: '#ec4899' },
        { name: '검은색', value: '#000000' },
        { name: '회색', value: '#6b7280' }
    ];

    return (
        <div className="panel">
            <h3 className="panel-title">📐 캔버스 가이드</h3>
            
            {/* On/Off 토글 */}
            <div className="input-group">
                <label className="input-label">가이드 라인 표시</label>
                <button
                    onClick={handleToggle}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: guideSettings.enabled ? '#10b981' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {guideSettings.enabled ? '✅ 표시 중' : '❌ 숨김'}
                </button>
            </div>

            {/* 경계선 설정 (표시 중일 때만) */}
            {guideSettings.enabled && (
                <>
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
                                    onClick={() => onGuideChange({ ...guideSettings, color: preset.value })}
                                    style={{
                                        padding: '8px',
                                        background: preset.value,
                                        border: guideSettings.color === preset.value ? '3px solid #6366f1' : '1px solid #e5e7eb',
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
                            value={guideSettings.color}
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

                    {/* 두께 조절 */}
                    <div className="input-group">
                        <label className="input-label">
                            선 두께: {guideSettings.thickness}px
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={guideSettings.thickness}
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
                            <span>두껍게 (10px)</span>
                        </div>
                    </div>

                    {/* 투명도 조절 */}
                    <div className="input-group">
                        <label className="input-label">
                            투명도: {Math.round(guideSettings.opacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={guideSettings.opacity}
                            onChange={handleOpacityChange}
                            className="slider"
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            <span>투명 (10%)</span>
                            <span>불투명 (100%)</span>
                        </div>
                    </div>

                    {/* 미리보기 */}
                    <div className="input-group">
                        <label className="input-label">미리보기</label>
                        <div style={{
                            width: '100%',
                            height: '80px',
                            background: 'white',
                            borderRadius: '8px',
                            border: `${guideSettings.thickness}px dashed ${guideSettings.color}`,
                            opacity: guideSettings.opacity,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6b7280',
                            fontSize: '12px'
                        }}>
                            가이드 라인 미리보기
                        </div>
                    </div>

                    {/* 안내 */}
                    <div style={{
                        padding: '12px',
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#0c4a6e',
                        marginTop: '12px'
                    }}>
                        💡 <strong>팁:</strong> 가이드 라인은 최종 출력 크기를 표시하며, 내보내기 시 포함되지 않습니다.
                    </div>
                </>
            )}
        </div>
    );
}

export default CanvasGuidePanel;
