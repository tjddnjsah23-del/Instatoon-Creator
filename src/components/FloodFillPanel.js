import React, { useState } from 'react';

function FloodFillPanel({ onFloodFill }) {
    const [enabled, setEnabled] = useState(false);
    const [fillColor, setFillColor] = useState('#ff0000');
    const [tolerance, setTolerance] = useState(30);
    const [fillMode, setFillMode] = useState('adjacent'); // 'adjacent' or 'all'

    const presetColors = [
        { name: '빨강', color: '#ff0000' },
        { name: '파랑', color: '#0000ff' },
        { name: '초록', color: '#00ff00' },
        { name: '노랑', color: '#ffff00' },
        { name: '보라', color: '#800080' },
        { name: '주황', color: '#ffa500' },
        { name: '흰색', color: '#ffffff' },
        { name: '검정', color: '#000000' },
    ];

    const toggleEnabled = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        
        if (onFloodFill) {
            onFloodFill({
                type: 'toggle',
                enabled: newEnabled,
                fillColor: fillColor,
                tolerance: tolerance,
                fillMode: fillMode
            });
        }
    };

    const handlePresetClick = (color) => {
        setFillColor(color);
        
        // 설정 업데이트
        if (enabled && onFloodFill) {
            onFloodFill({
                type: 'toggle',
                enabled: true,
                fillColor: color,
                tolerance: tolerance,
                fillMode: fillMode
            });
        }
    };
    
    const handleColorChange = (color) => {
        setFillColor(color);
        
        // 설정 업데이트
        if (enabled && onFloodFill) {
            onFloodFill({
                type: 'toggle',
                enabled: true,
                fillColor: color,
                tolerance: tolerance,
                fillMode: fillMode
            });
        }
    };
    
    const handleToleranceChange = (value) => {
        setTolerance(value);
        
        // 설정 업데이트
        if (enabled && onFloodFill) {
            onFloodFill({
                type: 'toggle',
                enabled: true,
                fillColor: fillColor,
                tolerance: value,
                fillMode: fillMode
            });
        }
    };
    
    const handleModeChange = (mode) => {
        setFillMode(mode);
        
        // 설정 업데이트
        if (enabled && onFloodFill) {
            onFloodFill({
                type: 'toggle',
                enabled: true,
                fillColor: fillColor,
                tolerance: tolerance,
                fillMode: mode
            });
        }
    };

    return (
        <div className="panel-section">
            <div className="panel-header">
                <div className="panel-title">🎨 색 채우기</div>
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
                        <label className="control-label">프리셋 색상</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px'
                        }}>
                            {presetColors.map((preset, idx) => (
                                <button
                                    key={idx}
                                    className={`preset-color-btn ${fillColor === preset.color ? 'active' : ''}`}
                                    onClick={() => handlePresetClick(preset.color)}
                                    title={preset.name}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        backgroundColor: preset.color,
                                        border: fillColor === preset.color ? '3px solid #3b82f6' : '2px solid #ccc',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {fillColor === preset.color && '✓'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 커스텀 색상 */}
                    <div className="control-group">
                        <label className="control-label">채울 색상</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={fillColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="color-picker"
                                style={{ width: '60px', height: '36px' }}
                            />
                            <input
                                type="text"
                                value={fillColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="text-input"
                                style={{ flexGrow: 1 }}
                                placeholder="#ff0000"
                            />
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
                            onChange={(e) => handleToleranceChange(Number(e.target.value))}
                            className="slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                            <span>정확히</span>
                            <span>비슷하면</span>
                        </div>
                    </div>

                    {/* 채우기 모드 */}
                    <div className="control-group">
                        <label className="control-label">채우기 모드</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleModeChange('adjacent')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: fillMode === 'adjacent' ? '#3b82f6' : '#f3f4f6',
                                    color: fillMode === 'adjacent' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: fillMode === 'adjacent' ? 'bold' : 'normal',
                                    cursor: 'pointer'
                                }}
                            >
                                📍 인접 영역만
                            </button>
                            <button
                                onClick={() => handleModeChange('all')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: fillMode === 'all' ? '#3b82f6' : '#f3f4f6',
                                    color: fillMode === 'all' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: fillMode === 'all' ? 'bold' : 'normal',
                                    cursor: 'pointer'
                                }}
                            >
                                🌍 같은 색 모두
                            </button>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                            {fillMode === 'adjacent' 
                                ? '클릭한 영역과 연결된 부분만 채웁니다' 
                                : '같은 색이면 떨어진 곳도 모두 채웁니다'}
                        </div>
                    </div>

                    {/* 도움말 */}
                    <div className="help-text" style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#92400e'
                    }}>
                        <strong>💡 사용 방법:</strong><br/>
                        1. 레이어를 선택하세요<br/>
                        2. 채울 색상을 선택하세요<br/>
                        3. 허용 오차를 조절하세요<br/>
                        4. 채울 영역을 클릭하세요<br/>
                        <br/>
                        <strong>주의:</strong> 큰 영역은 처리 시간이 걸릴 수 있습니다
                    </div>

                    {/* 현재 상태 표시 */}
                    {enabled && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#1e40af',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            💧 색 채우기 모드 활성화됨
                            <br/>
                            레이어 위를 클릭하세요
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FloodFillPanel;
