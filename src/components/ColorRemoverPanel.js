import React, { useState } from 'react';

function ColorRemoverPanel({ onRemoveColor }) {
    const [enabled, setEnabled] = useState(false);
    const [targetColor, setTargetColor] = useState('#ffffff');
    const [tolerance, setTolerance] = useState(30);
    const [useEyedropper, setUseEyedropper] = useState(false);

    const presetColors = [
        { name: '흰색', color: '#ffffff', icon: '⬜' },
        { name: '검은색', color: '#000000', icon: '⬛' },
        { name: '초록', color: '#00ff00', icon: '🟩' },
        { name: '파란색', color: '#0000ff', icon: '🟦' },
    ];

    const handlePresetClick = (color) => {
        setTargetColor(color);
    };

    const handleApply = () => {
        if (!enabled) {
            alert('색상 제거 도구를 먼저 활성화하세요!');
            return;
        }
        
        onRemoveColor({
            targetColor,
            tolerance
        });
    };

    const toggleEnabled = () => {
        setEnabled(!enabled);
    };

    const handleEyedropperClick = () => {
        setUseEyedropper(true);
        // 스포이드 모드 활성화 알림
        if (onRemoveColor) {
            onRemoveColor({ type: 'eyedropper-mode', enabled: true });
        }
    };

    return (
        <div className="panel-section">
            <div className="panel-header">
                <div className="panel-title">🎨 색상 제거</div>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={enabled}
                        onChange={toggleEnabled}
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>

            {enabled && (
                <div className="panel-content">
                    {/* 프리셋 색상 */}
                    <div className="control-group">
                        <label className="control-label">프리셋</label>
                        <div className="preset-colors">
                            {presetColors.map((preset, idx) => (
                                <button
                                    key={idx}
                                    className={`preset-color-btn ${targetColor === preset.color ? 'active' : ''}`}
                                    onClick={() => handlePresetClick(preset.color)}
                                    title={preset.name}
                                    style={{
                                        backgroundColor: preset.color,
                                        border: preset.color === '#ffffff' ? '2px solid #ccc' : '2px solid transparent'
                                    }}
                                >
                                    {preset.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 커스텀 색상 */}
                    <div className="control-group">
                        <label className="control-label">제거할 색상</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={targetColor}
                                onChange={(e) => setTargetColor(e.target.value)}
                                className="color-picker"
                                style={{ width: '60px', height: '36px' }}
                            />
                            <input
                                type="text"
                                value={targetColor}
                                onChange={(e) => setTargetColor(e.target.value)}
                                className="text-input"
                                style={{ width: '100px' }}
                                placeholder="#ffffff"
                            />
                            <button
                                className="tool-btn"
                                onClick={handleEyedropperClick}
                                title="이미지에서 색상 선택"
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: useEyedropper ? '#3b82f6' : '#f3f4f6',
                                    color: useEyedropper ? 'white' : 'black'
                                }}
                            >
                                💧 스포이드
                            </button>
                        </div>
                    </div>

                    {/* 허용 오차 */}
                    <div className="control-group">
                        <label className="control-label">
                            허용 오차: {tolerance}
                            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                (0=정확히, 100=비슷한 색도)
                            </span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={tolerance}
                            onChange={(e) => setTolerance(Number(e.target.value))}
                            className="slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                            <span>정확히</span>
                            <span>비슷하면</span>
                        </div>
                    </div>

                    {/* 적용 버튼 */}
                    <div className="control-group">
                        <button
                            className="primary-btn"
                            onClick={handleApply}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            🗑️ 색상 제거 (투명으로)
                        </button>
                    </div>

                    {/* 도움말 */}
                    <div className="help-text" style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        backgroundColor: '#f0f9ff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#0369a1'
                    }}>
                        <strong>💡 사용 방법:</strong><br/>
                        1. 레이어를 선택하세요<br/>
                        2. 제거할 색상을 선택하세요<br/>
                        3. 허용 오차를 조절하세요<br/>
                        4. [색상 제거] 버튼 클릭<br/>
                        <br/>
                        <strong>팁:</strong> 흰 배경 제거는 허용 오차 30 추천
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColorRemoverPanel;
