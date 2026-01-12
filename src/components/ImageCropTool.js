import React, { useState, useRef, useEffect } from 'react';

function ImageCropTool({ image, onCrop, onCancel }) {
    const canvasRef = useRef(null);
    const [cropMode, setCropMode] = useState('rect'); // rect, circle, polygon
    const [isDrawing, setIsDrawing] = useState(false);
    const [cropArea, setCropArea] = useState(null);
    const [polygonPoints, setPolygonPoints] = useState([]);

    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // 캔버스 크기 설정
                const maxWidth = 600;
                const maxHeight = 400;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                
                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = image;
        }
    }, [image]);

    useEffect(() => {
        drawOverlay();
    }, [cropArea, polygonPoints, cropMode]);

    const drawOverlay = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // 원본 이미지 다시 그리기
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // 어두운 오버레이
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 크롭 영역 표시
            if (cropMode === 'rect' && cropArea) {
                ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
            } else if (cropMode === 'circle' && cropArea) {
                const centerX = cropArea.x + cropArea.width / 2;
                const centerY = cropArea.y + cropArea.height / 2;
                const radius = Math.max(1, Math.abs(Math.min(cropArea.width, cropArea.height)) / 2);
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();
                
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (cropMode === 'polygon' && polygonPoints.length > 0) {
                // 폴리곤 점들 그리기
                polygonPoints.forEach((point, index) => {
                    ctx.fillStyle = '#6366f1';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    if (index > 0) {
                        ctx.strokeStyle = '#6366f1';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(polygonPoints[index - 1].x, polygonPoints[index - 1].y);
                        ctx.lineTo(point.x, point.y);
                        ctx.stroke();
                    }
                });
                
                // 닫힌 도형이면 내부 클리어
                if (polygonPoints.length > 2) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
                    for (let i = 1; i < polygonPoints.length; i++) {
                        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
                    }
                    ctx.closePath();
                    ctx.clip();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }
            }
        };
        img.src = image;
    };

    const handleMouseDown = (e) => {
        if (cropMode === 'polygon') return; // 폴리곤은 클릭으로 처리
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsDrawing(true);
        setCropArea({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || cropMode === 'polygon') return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const width = currentX - cropArea.x;
        const height = currentY - cropArea.y;
        
        setCropArea({ ...cropArea, width, height });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleCanvasClick = (e) => {
        if (cropMode !== 'polygon') return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setPolygonPoints([...polygonPoints, { x, y }]);
    };

    const handleCrop = () => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            let croppedCanvas;
            
            if (cropMode === 'rect' && cropArea && cropArea.width > 0 && cropArea.height > 0) {
                croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = Math.abs(cropArea.width);
                croppedCanvas.height = Math.abs(cropArea.height);
                const croppedCtx = croppedCanvas.getContext('2d');
                
                const startX = cropArea.width < 0 ? cropArea.x + cropArea.width : cropArea.x;
                const startY = cropArea.height < 0 ? cropArea.y + cropArea.height : cropArea.y;
                
                croppedCtx.drawImage(
                    canvas,
                    startX, startY,
                    Math.abs(cropArea.width), Math.abs(cropArea.height),
                    0, 0,
                    Math.abs(cropArea.width), Math.abs(cropArea.height)
                );
                
                onCrop(croppedCanvas.toDataURL());
            } else if (cropMode === 'circle' && cropArea) {
                const centerX = cropArea.x + cropArea.width / 2;
                const centerY = cropArea.y + cropArea.height / 2;
                const radius = Math.max(10, Math.min(Math.abs(cropArea.width), Math.abs(cropArea.height)) / 2);
                
                croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = radius * 2;
                croppedCanvas.height = radius * 2;
                const croppedCtx = croppedCanvas.getContext('2d');
                
                croppedCtx.beginPath();
                croppedCtx.arc(radius, radius, radius, 0, Math.PI * 2);
                croppedCtx.clip();
                
                croppedCtx.drawImage(
                    canvas,
                    centerX - radius, centerY - radius,
                    radius * 2, radius * 2,
                    0, 0,
                    radius * 2, radius * 2
                );
                
                onCrop(croppedCanvas.toDataURL());
            } else if (cropMode === 'polygon' && polygonPoints.length > 2) {
                // 바운딩 박스 계산
                const minX = Math.min(...polygonPoints.map(p => p.x));
                const maxX = Math.max(...polygonPoints.map(p => p.x));
                const minY = Math.min(...polygonPoints.map(p => p.y));
                const maxY = Math.max(...polygonPoints.map(p => p.y));
                
                croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = maxX - minX;
                croppedCanvas.height = maxY - minY;
                const croppedCtx = croppedCanvas.getContext('2d');
                
                // 폴리곤 클리핑
                croppedCtx.beginPath();
                croppedCtx.moveTo(polygonPoints[0].x - minX, polygonPoints[0].y - minY);
                for (let i = 1; i < polygonPoints.length; i++) {
                    croppedCtx.lineTo(polygonPoints[i].x - minX, polygonPoints[i].y - minY);
                }
                croppedCtx.closePath();
                croppedCtx.clip();
                
                croppedCtx.drawImage(
                    canvas,
                    minX, minY,
                    maxX - minX, maxY - minY,
                    0, 0,
                    maxX - minX, maxY - minY
                );
                
                onCrop(croppedCanvas.toDataURL());
            } else {
                alert('크롭 영역을 지정해주세요.');
            }
        };
        img.src = image;
    };

    const resetPolygon = () => {
        setPolygonPoints([]);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '700px',
                width: '100%'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600' }}>
                    ✂️ 이미지 자르기
                </h2>

                {/* 크롭 모드 선택 */}
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                    <button
                        className={`preset-btn ${cropMode === 'rect' ? 'active' : ''}`}
                        onClick={() => { setCropMode('rect'); setCropArea(null); setPolygonPoints([]); }}
                        style={{ flex: 1 }}
                    >
                        ▭ 사각형
                    </button>
                    <button
                        className={`preset-btn ${cropMode === 'circle' ? 'active' : ''}`}
                        onClick={() => { setCropMode('circle'); setCropArea(null); setPolygonPoints([]); }}
                        style={{ flex: 1 }}
                    >
                        ⚫ 원
                    </button>
                    <button
                        className={`preset-btn ${cropMode === 'polygon' ? 'active' : ''}`}
                        onClick={() => { setCropMode('polygon'); setCropArea(null); setPolygonPoints([]); }}
                        style={{ flex: 1 }}
                    >
                        ⬢ 다각형
                    </button>
                </div>

                {/* 안내 */}
                <div style={{
                    padding: '12px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#4b5563'
                }}>
                    {cropMode === 'rect' && '💡 드래그하여 사각형 영역 선택'}
                    {cropMode === 'circle' && '💡 드래그하여 원형 영역 선택'}
                    {cropMode === 'polygon' && '💡 클릭하여 점 찍기 (3개 이상)'}
                </div>

                {/* 캔버스 */}
                <div style={{ 
                    marginBottom: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px'
                }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onClick={handleCanvasClick}
                        style={{ 
                            cursor: cropMode === 'polygon' ? 'crosshair' : 'crosshair',
                            maxWidth: '100%'
                        }}
                    />
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {cropMode === 'polygon' && polygonPoints.length > 0 && (
                        <button
                            onClick={resetPolygon}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '2px solid #ef4444',
                                borderRadius: '8px',
                                background: 'white',
                                color: '#ef4444',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            초기화
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#1f2937',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleCrop}
                        style={{
                            flex: 2,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        자르기 완료
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropTool;