import React, { useState } from 'react';

function TextPanel({ content, setContent, onAdd }) {
    const [textType, setTextType] = useState('title');
    
    // 기본 설정
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Noto Sans KR');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [textDecoration, setTextDecoration] = useState('none');
    const [textAlign, setTextAlign] = useState('left');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('transparent');
    
    // 고급 설정
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [lineHeight, setLineHeight] = useState(1.5);
    const [opacity, setOpacity] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [verticalText, setVerticalText] = useState(false);
    
    // 외곽선 & 그림자
    const [strokeWidth, setStrokeWidth] = useState(0);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [shadowX, setShadowX] = useState(0);
    const [shadowY, setShadowY] = useState(0);
    const [shadowBlur, setShadowBlur] = useState(0);
    const [shadowColor, setShadowColor] = useState('#000000');
    
    // 말풍선 설정
    const [bubbleStyle, setBubbleStyle] = useState('none');
    const [bubbleColor, setBubbleColor] = useState('#ffffff');
    const [bubbleBorderColor, setBubbleBorderColor] = useState('#000000');
    const [bubbleBorderWidth, setBubbleBorderWidth] = useState(2);
    
    // 말풍선 스타일 목록
    const bubbleStyles = [
        { value: 'none', label: '없음', icon: '⬜' },
        { value: 'round', label: '둥근 말풍선', icon: '💭' },
        { value: 'rect', label: '사각 말풍선', icon: '💬' },
        { value: 'cloud', label: '구름 말풍선', icon: '☁️' },
        { value: 'shout', label: '외침 말풍선', icon: '💥' },
        { value: 'think', label: '생각 말풍선', icon: '🤔' },
        { value: 'whisper', label: '속삭임 말풍선', icon: '🤫' }
    ];
    
    // 폰트 목록
    const fonts = [
        'Noto Sans KR',
        'Noto Serif KR',
        'Black Han Sans',
        'Do Hyeon',
        'Jua',
        'Gamja Flower',
        'Gaegu',
        'Song Myung',
        'Cute Font',
        'Poor Story',
        'Stylish',
        'East Sea Dokdo',
        'Hi Melody',
        'Yeon Sung',
        'Single Day'
    ];

    const handleAddText = () => {
        if (content.trim()) {
            onAdd('text', { 
                content,
                // 기본
                fontSize,
                fontFamily,
                fontWeight,
                fontStyle,
                textDecoration,
                textAlign,
                textColor,
                backgroundColor,
                // 고급
                letterSpacing,
                lineHeight,
                opacity,
                rotation,
                verticalText,
                // 외곽선 & 그림자
                strokeWidth,
                strokeColor,
                shadowX,
                shadowY,
                shadowBlur,
                shadowColor,
                // 말풍선
                bubbleStyle,
                bubbleColor,
                bubbleBorderColor,
                bubbleBorderWidth,
                type: textType 
            });
            setContent('');
        } else {
            alert('텍스트를 입력해주세요.');
        }
    };

    const toggleBold = () => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
    const toggleItalic = () => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic');
    const toggleUnderline = () => {
        if (textDecoration === 'underline') setTextDecoration('none');
        else if (textDecoration === 'line-through') setTextDecoration('underline line-through');
        else setTextDecoration('underline');
    };
    const toggleStrikethrough = () => {
        if (textDecoration === 'line-through') setTextDecoration('none');
        else if (textDecoration === 'underline') setTextDecoration('underline line-through');
        else setTextDecoration('line-through');
    };

    return (
        <div className="panel-section">
            <div className="panel-title">💬 말풍선 & 자막</div>
            
            {/* 텍스트 유형 */}
            <div className="input-group">
                <label className="input-label">텍스트 유형</label>
                <div className="preset-grid">
                    {[
                        { value: 'title', label: '제목' },
                        { value: 'subtitle', label: '부제목' },
                        { value: 'body', label: '본문' },
                        { value: 'caption', label: '캡션' }
                    ].map(type => (
                        <div
                            key={type.value}
                            className={`preset-item ${textType === type.value ? 'selected' : ''}`}
                            onClick={() => setTextType(type.value)}
                        >
                            {type.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* 말풍선 양식 */}
            <div className="input-group">
                <label className="input-label">말풍선 양식</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {bubbleStyles.map(style => (
                        <div
                            key={style.value}
                            className={`preset-item ${bubbleStyle === style.value ? 'selected' : ''}`}
                            onClick={() => setBubbleStyle(style.value)}
                            style={{ fontSize: '12px' }}
                        >
                            <span style={{ fontSize: '16px', marginRight: '4px' }}>{style.icon}</span>
                            {style.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* 말풍선 색상 (말풍선 선택시만 표시) */}
            {bubbleStyle !== 'none' && (
                <div className="input-group">
                    <label className="input-label">말풍선 설정</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>배경색</label>
                            <input
                                type="color"
                                value={bubbleColor}
                                onChange={(e) => setBubbleColor(e.target.value)}
                                className="color-input"
                                style={{ height: '35px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>테두리색</label>
                            <input
                                type="color"
                                value={bubbleBorderColor}
                                onChange={(e) => setBubbleBorderColor(e.target.value)}
                                className="color-input"
                                style={{ height: '35px' }}
                            />
                        </div>
                    </div>
                    <label className="input-label" style={{ marginTop: '8px' }}>테두리 두께: {bubbleBorderWidth}px</label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={bubbleBorderWidth}
                        onChange={(e) => setBubbleBorderWidth(Number(e.target.value))}
                        className="range-input"
                    />
                </div>
            )}

            {/* 텍스트 내용 */}
            <div className="input-group">
                <label className="input-label">텍스트 내용</label>
                <textarea
                    className="input-field"
                    placeholder="텍스트를 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ minHeight: '80px' }}
                />
            </div>

            {/* 폰트 선택 */}
            <div className="input-group">
                <label className="input-label">글꼴</label>
                <select 
                    className="input-field"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                >
                    {fonts.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>

            {/* 글꼴 크기 */}
            <div className="input-group">
                <label className="input-label">글꼴 크기: {fontSize}px</label>
                <input
                    type="range"
                    min="5"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="range-input"
                />
            </div>

            {/* 텍스트 스타일 버튼 */}
            <div className="input-group">
                <label className="input-label">텍스트 스타일</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <button 
                        className={`text-style-btn ${fontWeight === 'bold' ? 'active' : ''}`}
                        onClick={toggleBold}
                        title="굵게"
                    >
                        <strong>B</strong>
                    </button>
                    <button 
                        className={`text-style-btn ${fontStyle === 'italic' ? 'active' : ''}`}
                        onClick={toggleItalic}
                        title="기울임"
                    >
                        <em>I</em>
                    </button>
                    <button 
                        className={`text-style-btn ${textDecoration.includes('underline') ? 'active' : ''}`}
                        onClick={toggleUnderline}
                        title="밑줄"
                    >
                        <u>U</u>
                    </button>
                    <button 
                        className={`text-style-btn ${textDecoration.includes('line-through') ? 'active' : ''}`}
                        onClick={toggleStrikethrough}
                        title="취소선"
                    >
                        <s>S</s>
                    </button>
                </div>
            </div>

            {/* 텍스트 정렬 */}
            <div className="input-group">
                <label className="input-label">정렬</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <button 
                        className={`text-style-btn ${textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => setTextAlign('left')}
                        title="왼쪽"
                    >
                        ⬅
                    </button>
                    <button 
                        className={`text-style-btn ${textAlign === 'center' ? 'active' : ''}`}
                        onClick={() => setTextAlign('center')}
                        title="가운데"
                    >
                        ↔
                    </button>
                    <button 
                        className={`text-style-btn ${textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => setTextAlign('right')}
                        title="오른쪽"
                    >
                        ➡
                    </button>
                    <button 
                        className={`text-style-btn ${textAlign === 'justify' ? 'active' : ''}`}
                        onClick={() => setTextAlign('justify')}
                        title="양쪽"
                    >
                        ⬌
                    </button>
                </div>
            </div>

            {/* 색상 설정 */}
            <div className="input-group">
                <label className="input-label">색상 설정</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>글자색</label>
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="color-input"
                            style={{ height: '40px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>배경색</label>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="color-input"
                            style={{ height: '40px' }}
                        />
                    </div>
                </div>
                <button
                    onClick={() => setBackgroundColor('transparent')}
                    style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    배경색 투명하게
                </button>
            </div>

            {/* 자간 */}
            <div className="input-group">
                <label className="input-label">자간: {letterSpacing}px</label>
                <input
                    type="range"
                    min="-5"
                    max="20"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="range-input"
                />
            </div>

            {/* 줄간격 */}
            <div className="input-group">
                <label className="input-label">줄간격: {lineHeight}</label>
                <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="range-input"
                />
            </div>

            {/* 외곽선 */}
            <div className="input-group">
                <label className="input-label">외곽선</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>외곽선 색</label>
                        <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="color-input"
                            style={{ height: '35px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>두께: {strokeWidth}</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="input-field"
                            style={{ padding: '6px', height: '35px' }}
                        />
                    </div>
                </div>
            </div>

            {/* 그림자 */}
            <div className="input-group">
                <label className="input-label">그림자</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                    <div>
                        <label style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>가로: {shadowX}</label>
                        <input
                            type="number"
                            min="-20"
                            max="20"
                            value={shadowX}
                            onChange={(e) => setShadowX(Number(e.target.value))}
                            className="input-field"
                            style={{ padding: '4px', fontSize: '12px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>세로: {shadowY}</label>
                        <input
                            type="number"
                            min="-20"
                            max="20"
                            value={shadowY}
                            onChange={(e) => setShadowY(Number(e.target.value))}
                            className="input-field"
                            style={{ padding: '4px', fontSize: '12px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>흐림: {shadowBlur}</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            value={shadowBlur}
                            onChange={(e) => setShadowBlur(Number(e.target.value))}
                            className="input-field"
                            style={{ padding: '4px', fontSize: '12px' }}
                        />
                    </div>
                </div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>그림자 색</label>
                <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="color-input"
                    style={{ height: '35px' }}
                />
            </div>

            {/* 불투명도 */}
            <div className="input-group">
                <label className="input-label">불투명도: {Math.round(opacity * 100)}%</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="range-input"
                />
            </div>

            {/* 회전 */}
            <div className="input-group">
                <label className="input-label">회전: {rotation}°</label>
                <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="range-input"
                />
            </div>

            {/* 세로쓰기 */}
            <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={verticalText}
                        onChange={(e) => setVerticalText(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span className="input-label" style={{ marginBottom: 0 }}>세로쓰기</span>
                </label>
            </div>

            {/* 텍스트 추가 버튼 */}
            <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={handleAddText}
            >
                텍스트 추가
            </button>
        </div>
    );
}

export default TextPanel;
