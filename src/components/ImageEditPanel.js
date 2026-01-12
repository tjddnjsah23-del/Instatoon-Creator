import React, { useState } from 'react';
import ImageCropTool from './ImageCropTool';

function ImageEditPanel({ onAdd }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showCropTool, setShowCropTool] = useState(false);
    
    // 이미지 필터
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [hue, setHue] = useState(0);
    const [blur, setBlur] = useState(0);
    const [opacity, setOpacity] = useState(100);
    
    // 이미지 변환
    const [rotate, setRotate] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [grayscale, setGrayscale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [invert, setInvert] = useState(0);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // GIF 파일 차단
            if (file.type === 'image/gif') {
                alert('⚠️ GIF 파일은 지원하지 않습니다.\n정지 이미지만 업로드 가능합니다.\n\nPNG, JPG, WEBP 등을 사용해주세요.');
                e.target.value = ''; // 입력 초기화
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getFilterStyle = () => {
        const scaleX = flipH ? -1 : 1;
        const scaleY = flipV ? -1 : 1;
        
        return {
            filter: `
                brightness(${brightness}%)
                contrast(${contrast}%)
                saturate(${saturation}%)
                hue-rotate(${hue}deg)
                blur(${blur}px)
                grayscale(${grayscale}%)
                sepia(${sepia}%)
                invert(${invert}%)
            `,
            opacity: opacity / 100,
            transform: `rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`
        };
    };

    const handleAddToCanvas = () => {
        if (!selectedImage) {
            alert('이미지를 먼저 업로드해주세요.');
            return;
        }

        // 캔버스에 필터가 적용된 이미지 추가
        onAdd('image', selectedImage, {
            brightness,
            contrast,
            saturation,
            hue,
            blur,
            opacity,
            rotate,
            flipH,
            flipV,
            grayscale,
            sepia,
            invert
        });

        alert('이미지가 캔버스에 추가되었습니다!\n캔버스에서 위치와 크기를 조절하세요.');
    };

    const resetFilters = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setHue(0);
        setBlur(0);
        setOpacity(100);
        setRotate(0);
        setFlipH(false);
        setFlipV(false);
        setGrayscale(0);
        setSepia(0);
        setInvert(0);
    };

    const applyPreset = (preset) => {
        resetFilters();
        
        switch(preset) {
            case 'vintage':
                setSepia(40);
                setContrast(90);
                setBrightness(110);
                break;
            case 'bw':
                setGrayscale(100);
                setContrast(110);
                break;
            case 'bright':
                setBrightness(130);
                setContrast(105);
                break;
            case 'dark':
                setBrightness(70);
                setContrast(120);
                break;
            case 'vivid':
                setSaturation(150);
                setContrast(110);
                break;
            case 'soft':
                setBlur(2);
                setBrightness(105);
                setSaturation(90);
                break;
            default:
                break;
        }
    };

    return (
        <div className="panel-section">
            <div className="panel-title">🎨 이미지 편집</div>
            
            {/* 이미지 업로드 */}
            <div className="input-group">
                <label className="input-label">이미지 업로드</label>
                <input 
                    type="file" 
                    className="file-input" 
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageUpload}
                />
            </div>

            {/* 이미지 미리보기 */}
            {imagePreview && (
                <div className="input-group">
                    <label className="input-label">미리보기</label>
                    <div style={{ 
                        width: '100%',
                        height: '200px',
                        background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e5e7eb'
                    }}>
                        <img 
                            src={imagePreview} 
                            alt="미리보기" 
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                ...getFilterStyle()
                            }}
                        />
                    </div>
                </div>
            )}

            {selectedImage && (
                <>
                    {/* 프리셋 */}
                    <div className="input-group">
                        <label className="input-label">프리셋 필터</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            <button className="preset-btn" onClick={() => applyPreset('vintage')}>빈티지</button>
                            <button className="preset-btn" onClick={() => applyPreset('bw')}>흑백</button>
                            <button className="preset-btn" onClick={() => applyPreset('bright')}>밝게</button>
                            <button className="preset-btn" onClick={() => applyPreset('dark')}>어둡게</button>
                            <button className="preset-btn" onClick={() => applyPreset('vivid')}>선명</button>
                            <button className="preset-btn" onClick={() => applyPreset('soft')}>부드럽게</button>
                        </div>
                    </div>

                    {/* 밝기 */}
                    <div className="input-group">
                        <label className="input-label">밝기: {brightness}%</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 대비 */}
                    <div className="input-group">
                        <label className="input-label">대비: {contrast}%</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 채도 */}
                    <div className="input-group">
                        <label className="input-label">채도: {saturation}%</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 색조 */}
                    <div className="input-group">
                        <label className="input-label">색조 회전: {hue}°</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={hue}
                            onChange={(e) => setHue(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 흐림 */}
                    <div className="input-group">
                        <label className="input-label">흐림: {blur}px</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={blur}
                            onChange={(e) => setBlur(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 불투명도 */}
                    <div className="input-group">
                        <label className="input-label">불투명도: {opacity}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 회전 */}
                    <div className="input-group">
                        <label className="input-label">회전: {rotate}°</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={rotate}
                            onChange={(e) => setRotate(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 흑백 */}
                    <div className="input-group">
                        <label className="input-label">흑백: {grayscale}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={grayscale}
                            onChange={(e) => setGrayscale(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 세피아 */}
                    <div className="input-group">
                        <label className="input-label">세피아: {sepia}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sepia}
                            onChange={(e) => setSepia(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 반전 */}
                    <div className="input-group">
                        <label className="input-label">색상 반전: {invert}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={invert}
                            onChange={(e) => setInvert(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>

                    {/* 뒤집기 */}
                    <div className="input-group">
                        <label className="input-label">뒤집기</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button 
                                className={`text-style-btn ${flipH ? 'active' : ''}`}
                                onClick={() => setFlipH(!flipH)}
                            >
                                ↔️ 좌우
                            </button>
                            <button 
                                className={`text-style-btn ${flipV ? 'active' : ''}`}
                                onClick={() => setFlipV(!flipV)}
                            >
                                ↕️ 상하
                            </button>
                        </div>
                    </div>

                    {/* 이미지 자르기 */}
                    <div className="input-group">
                        <label className="input-label">이미지 자르기</label>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => setShowCropTool(true)}
                            style={{ width: '100%' }}
                        >
                            ✂️ 이미지 자르기
                        </button>
                    </div>

                    {/* 버튼 */}
                    <div className="btn-group">
                        <button className="btn btn-secondary" onClick={resetFilters}>
                            초기화
                        </button>
                        <button className="btn btn-primary" onClick={handleAddToCanvas}>
                            캔버스에 추가
                        </button>
                    </div>
                </>
            )}
            
            {/* 이미지 크롭 도구 */}
            {showCropTool && selectedImage && (
                <ImageCropTool
                    image={selectedImage}
                    onCrop={(croppedImage) => {
                        setSelectedImage(croppedImage);
                        setImagePreview(croppedImage);
                        setShowCropTool(false);
                    }}
                    onCancel={() => setShowCropTool(false)}
                />
            )}
        </div>
    );
}

export default ImageEditPanel;