import React, { useState } from 'react';

function CharacterPanel({ option, setOption, onComplete, onAdd }) {
    const [prompt, setPrompt] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('');
    
    // 레퍼런스 기반 생성용 state
    const [referenceImage, setReferenceImage] = useState(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState(null);
    const [referencePrompt, setReferencePrompt] = useState('');

    const presets = ['만화풍', '애니메이션', '실사', '미니멀'];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // GIF 파일 차단
            if (file.type === 'image/gif') {
                alert('⚠️ GIF 파일은 지원하지 않습니다.\n정지 이미지만 업로드 가능합니다.\n\nPNG, JPG, WEBP 등을 사용해주세요.');
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                onAdd('image', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 레퍼런스 이미지 업로드
    const handleReferenceImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // GIF 파일 차단
            if (file.type === 'image/gif') {
                alert('⚠️ GIF 파일은 지원하지 않습니다.\n정지 이미지만 업로드 가능합니다.\n\nPNG, JPG, WEBP 등을 사용해주세요.');
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                setReferenceImage(event.target.result);
                setReferenceImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 레퍼런스 기반 생성 초기화
    const handleResetReference = () => {
        setReferenceImage(null);
        setReferenceImagePreview(null);
        setReferencePrompt('');
    };

    return (
        <div className="panel-section">
            <div className="panel-title">👤 캐릭터 생성</div>
            
            <div 
                className={`generation-option ${option === 'ai-text' ? 'selected' : ''}`} 
                onClick={() => setOption('ai-text')}
            >
                <div className="option-title">✨ AI 텍스트 생성</div>
                <div className="option-desc">설명을 입력하면 AI가 캐릭터를 생성합니다</div>
            </div>

            {option === 'ai-text' && (
                <div className="fade-in" style={{ marginTop: '16px' }}>
                    <div className="input-group">
                        <label className="input-label">프롬프트</label>
                        <textarea
                            className="input-field"
                            placeholder="예: 파란 옷을 입은 귀여운 고양이 캐릭터"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">스타일</label>
                        <div className="preset-grid">
                            {presets.map(preset => (
                                <div
                                    key={preset}
                                    className={`preset-item ${selectedPreset === preset ? 'selected' : ''}`}
                                    onClick={() => setSelectedPreset(preset)}
                                >
                                    {preset}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }} 
                        onClick={() => {
                            if (prompt) {
                                alert('AI 이미지 생성 기능은 Phase 7에서 구현됩니다.\n현재는 "이미지 직접 업로드"를 사용해주세요.');
                            }
                        }}
                    >
                        캐릭터 생성
                    </button>
                </div>
            )}

            <div 
                className={`generation-option ${option === 'reference' ? 'selected' : ''}`} 
                onClick={() => setOption('reference')}
            >
                <div className="option-title">🖼️ 레퍼런스 기반 생성</div>
                <div className="option-desc">참고 이미지와 텍스트로 유사한 캐릭터 생성</div>
            </div>

            {option === 'reference' && (
                <div className="fade-in" style={{ marginTop: '16px' }}>
                    {/* 레퍼런스 이미지 업로드 */}
                    <div className="input-group">
                        <label className="input-label">레퍼런스 이미지</label>
                        <input 
                            type="file" 
                            className="file-input" 
                            accept="image/*"
                            onChange={handleReferenceImageUpload}
                        />
                        
                        {/* 이미지 미리보기 */}
                        {referenceImagePreview && (
                            <div style={{ 
                                marginTop: '12px', 
                                position: 'relative',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid #e5e7eb'
                            }}>
                                <img 
                                    src={referenceImagePreview} 
                                    alt="레퍼런스" 
                                    style={{ 
                                        width: '100%', 
                                        maxHeight: '200px', 
                                        objectFit: 'cover',
                                        display: 'block'
                                    }} 
                                />
                                <button
                                    onClick={handleResetReference}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="이미지 제거"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 레퍼런스 설명 텍스트 */}
                    <div className="input-group">
                        <label className="input-label">참고할 특징 설명</label>
                        <textarea
                            className="input-field"
                            placeholder="예: 이 캐릭터의 헤어스타일과 옷 색상을 참고해서, 더 밝은 표정으로 만들어줘"
                            value={referencePrompt}
                            onChange={(e) => setReferencePrompt(e.target.value)}
                            style={{ minHeight: '100px' }}
                        />
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280', 
                            marginTop: '8px',
                            lineHeight: '1.5'
                        }}>
                            💡 <strong>팁:</strong> 이미지에서 어떤 부분을 참고할지, 어떻게 변경할지 구체적으로 작성하면 더 좋은 결과를 얻을 수 있어요.
                        </div>
                    </div>

                    {/* 스타일 선택 */}
                    <div className="input-group">
                        <label className="input-label">스타일</label>
                        <div className="preset-grid">
                            {presets.map(preset => (
                                <div
                                    key={preset}
                                    className={`preset-item ${selectedPreset === preset ? 'selected' : ''}`}
                                    onClick={() => setSelectedPreset(preset)}
                                >
                                    {preset}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }} 
                        onClick={() => {
                            if (!referenceImage) {
                                alert('레퍼런스 이미지를 업로드해주세요.');
                                return;
                            }
                            if (!referencePrompt.trim()) {
                                alert('참고할 특징을 입력해주세요.');
                                return;
                            }
                            alert('AI 레퍼런스 기반 생성 기능은 Phase 7에서 구현됩니다.\n\n입력하신 내용:\n이미지: 업로드됨\n설명: ' + referencePrompt);
                        }}
                        disabled={!referenceImage || !referencePrompt.trim()}
                    >
                        레퍼런스 기반 생성
                    </button>
                    
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
                        * AI 레퍼런스 기반 생성은 Phase 7에서 구현됩니다.
                    </p>
                </div>
            )}

            <div 
                className={`generation-option ${option === 'upload' ? 'selected' : ''}`} 
                onClick={() => setOption('upload')}
            >
                <div className="option-title">📤 이미지 직접 업로드</div>
                <div className="option-desc">준비된 캐릭터 이미지를 바로 사용</div>
            </div>

            {option === 'upload' && (
                <div className="fade-in" style={{ marginTop: '16px' }}>
                    <input 
                        type="file" 
                        className="file-input" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            )}

            {option && (
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => setOption('')}>초기화</button>
                    <button className="btn btn-primary" onClick={onComplete}>단계 완료</button>
                </div>
            )}
        </div>
    );
}

export default CharacterPanel;
