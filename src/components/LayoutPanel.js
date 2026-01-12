import React, { useState } from 'react';

function LayoutPanel({ currentLayout, onLayoutChange }) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // 기본 레이아웃 프리셋
    const layouts = [
        { id: 'none', name: '레이아웃 없음', rows: 1, cols: 1, icon: '⬜' },
        { id: '1x2', name: '2컷 가로', rows: 1, cols: 2, icon: '▦' },
        { id: '2x1', name: '2컷 세로', rows: 2, cols: 1, icon: '▥' },
        { id: '1x3', name: '3컷 가로', rows: 1, cols: 3, icon: '▦▦' },
        { id: '3x1', name: '3컷 세로', rows: 3, cols: 1, icon: '▥▥' },
        { id: '2x2', name: '4컷', rows: 2, cols: 2, icon: '▦▦' },
        { id: '2x3', name: '6컷', rows: 2, cols: 3, icon: '▦▦▦' }
    ];

    const handleLayoutSelect = (layout) => {
        onLayoutChange({
            type: layout.id,
            rows: layout.rows,
            cols: layout.cols,
            margin: currentLayout?.margin || 10,
            borderWidth: currentLayout?.borderWidth || 2,
            borderColor: currentLayout?.borderColor || '#000000',
            maskOpacity: currentLayout?.maskOpacity || 0.5
        });
    };

    const handleMarginChange = (e) => {
        onLayoutChange({
            ...currentLayout,
            margin: parseInt(e.target.value)
        });
    };

    const handleBorderWidthChange = (e) => {
        onLayoutChange({
            ...currentLayout,
            borderWidth: parseInt(e.target.value)
        });
    };

    const handleBorderColorChange = (e) => {
        onLayoutChange({
            ...currentLayout,
            borderColor: e.target.value
        });
    };

    const handleMaskOpacityChange = (e) => {
        onLayoutChange({
            ...currentLayout,
            maskOpacity: parseFloat(e.target.value)
        });
    };

    const currentLayoutPreset = layouts.find(l => l.id === currentLayout?.type) || layouts[0];

    return (
        <div className="panel">
            <h3 className="panel-title">📐 레이아웃</h3>
            
            {/* 레이아웃 프리셋 */}
            <div className="input-group">
                <label className="input-label">레이아웃 선택</label>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '8px',
                    marginTop: '8px'
                }}>
                    {layouts.map(layout => (
                        <button
                            key={layout.id}
                            onClick={() => handleLayoutSelect(layout)}
                            style={{
                                padding: '12px',
                                border: currentLayout?.type === layout.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: currentLayout?.type === layout.id ? '#f0f1ff' : 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                            title={layout.name}
                        >
                            <div>{layout.icon}</div>
                            <div style={{ fontSize: '11px', marginTop: '4px', color: '#6b7280' }}>
                                {layout.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 현재 레이아웃 정보 */}
            {currentLayout?.type !== 'none' && (
                <>
                    <div style={{
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#6b7280',
                        marginTop: '12px'
                    }}>
                        <strong>{currentLayoutPreset.name}</strong>
                        <div style={{ marginTop: '4px' }}>
                            {currentLayout.rows} × {currentLayout.cols} 컷
                        </div>
                    </div>

                    {/* 여백 설정 */}
                    <div className="input-group">
                        <label className="input-label">
                            여백: {currentLayout?.margin || 10}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={currentLayout?.margin || 10}
                            onChange={handleMarginChange}
                            className="slider"
                        />
                    </div>

                    {/* 테두리 두께 */}
                    <div className="input-group">
                        <label className="input-label">
                            테두리 두께: {currentLayout?.borderWidth || 2}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={currentLayout?.borderWidth || 2}
                            onChange={handleBorderWidthChange}
                            className="slider"
                        />
                    </div>

                    {/* 테두리 색상 */}
                    <div className="input-group">
                        <label className="input-label">테두리 색상</label>
                        <input
                            type="color"
                            value={currentLayout?.borderColor || '#000000'}
                            onChange={handleBorderColorChange}
                            style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    {/* 마스크 투명도 */}
                    <div className="input-group">
                        <label className="input-label">
                            테두리 밖 어둡기: {Math.round((currentLayout?.maskOpacity || 0.5) * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={currentLayout?.maskOpacity || 0.5}
                            onChange={handleMaskOpacityChange}
                            className="slider"
                        />
                    </div>

                    {/* 안내 메시지 */}
                    <div style={{
                        padding: '12px',
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#92400e',
                        marginTop: '12px'
                    }}>
                        💡 <strong>팁:</strong> 테두리 밖 영역이 어둡게 표시되어 작업 영역을 명확히 구분할 수 있습니다.
                    </div>
                </>
            )}
        </div>
    );
}

export default LayoutPanel;
