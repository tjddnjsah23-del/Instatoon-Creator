import React, { useState } from 'react';

function ImageCropperPanel({ onCrop }) {
    const [enabled, setEnabled] = useState(false);

    const toggleEnabled = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        
        if (onCrop) {
            onCrop({
                type: 'toggle',
                enabled: newEnabled
            });
        }
    };

    const handleCrop = () => {
        if (!enabled) {
            alert('자르기 도구를 먼저 활성화하세요!');
            return;
        }
        
        if (onCrop) {
            onCrop({
                type: 'apply'
            });
        }
    };

    return (
        <div className="panel-section">
            <div className="panel-header">
                <div className="panel-title">✂️ 이미지 자르기</div>
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
                    {/* 자르기 버튼 */}
                    <div className="control-group">
                        <button
                            className="primary-btn"
                            onClick={handleCrop}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            ✂️ 자르기 적용
                        </button>
                    </div>

                    {/* 도움말 */}
                    <div className="help-text" style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        backgroundColor: '#f0fdf4',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#15803d'
                    }}>
                        <strong>💡 사용 방법:</strong><br/>
                        1. 레이어를 선택하세요<br/>
                        2. 레이어 위에서 드래그하세요<br/>
                        3. 파란 박스 확인 후 [자르기 적용]<br/>
                        4. 자른 후에도 계속 드래그 가능!<br/>
                        <br/>
                        <strong>팁:</strong> 여러 번 반복해서 자를 수 있습니다
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageCropperPanel;
