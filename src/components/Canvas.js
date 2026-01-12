import React, { useState, useEffect, useRef } from 'react';

function CanvasElement({ element, selected, onSelect, onMove, onResize, onTextEdit, drawingMode, floodFillMode, cropMode }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState(null);
    const elementRef = useRef(null);

    const handleMouseDown = (e) => {
        if (drawingMode || floodFillMode || cropMode) return; // 특수 모드에서는 레이어 선택 불가
        if (e.target.classList.contains('resize-handle')) {
            return;
        }
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        onSelect();
        e.stopPropagation();
    };

    // 더블클릭으로 텍스트 편집
    const handleDoubleClick = (e) => {
        if (element.type === 'text' && onTextEdit) {
            e.stopPropagation();
            onTextEdit(element);
        }
    };

    const handleResizeStart = (e, handle) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        onSelect();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                onMove(element.id, deltaX, deltaY);
                setDragStart({ x: e.clientX, y: e.clientY });
            } else if (isResizing && resizeHandle) {
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                onResize(element.id, deltaX, deltaY, resizeHandle);
                setDragStart({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, element.id, onMove, onResize, resizeHandle]);

    const elementStyle = {
        left: element.x + 'px',
        top: element.y + 'px',
        width: element.width + 'px',
        height: element.height + 'px',
        pointerEvents: (drawingMode || floodFillMode || cropMode) ? 'none' : 'auto' // 특수 모드에서는 이벤트 무시
    };

    // 말풍선 스타일 생성
    const getBubbleStyle = (bubbleType) => {
        const baseStyle = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 0
        };

        switch(bubbleType) {
            case 'round':
                return {
                    ...baseStyle,
                    borderRadius: '50%'
                };
            case 'rect':
                return {
                    ...baseStyle,
                    borderRadius: '12px'
                };
            case 'cloud':
                return {
                    ...baseStyle,
                    borderRadius: '60% 40% 40% 60% / 60% 30% 70% 40%'
                };
            case 'shout':
                return {
                    ...baseStyle,
                    borderRadius: '10px',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)'
                };
            case 'think':
                return {
                    ...baseStyle,
                    borderRadius: '50%',
                    boxShadow: '-15px 15px 0 -8px currentColor, -25px 25px 0 -12px currentColor'
                };
            case 'whisper':
                return {
                    ...baseStyle,
                    borderRadius: '20px 20px 20px 0'
                };
            default:
                return baseStyle;
        }
    };

    return (
        <div
            ref={elementRef}
            className={`canvas-element ${selected ? 'selected' : ''}`}
            style={elementStyle}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {element.type === 'text' ? (
                <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '100%',
                    opacity: element.content.opacity || 1,
                    transform: `rotate(${element.content.rotation || 0}deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'text'
                }}
                title="더블클릭하여 수정"
                >
                    {/* 말풍선 배경 */}
                    {element.content.bubbleStyle && element.content.bubbleStyle !== 'none' && (
                        <div
                            style={{
                                ...getBubbleStyle(element.content.bubbleStyle),
                                backgroundColor: element.content.bubbleColor || '#ffffff',
                                border: `${element.content.bubbleBorderWidth || 2}px solid ${element.content.bubbleBorderColor || '#000000'}`,
                                color: element.content.bubbleBorderColor || '#000000'
                            }}
                        />
                    )}
                    
                    {/* 텍스트 */}
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: element.content.bubbleStyle !== 'none' ? '15px' : '8px',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: element.content.textAlign === 'center' ? 'center' : 
                                       element.content.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        fontSize: element.content.fontSize + 'px',
                        fontFamily: element.content.fontFamily || 'Noto Sans KR',
                        fontWeight: element.content.fontWeight || 'normal',
                        fontStyle: element.content.fontStyle || 'normal',
                        textDecoration: element.content.textDecoration || 'none',
                        color: element.content.textColor,
                        backgroundColor: element.content.backgroundColor !== 'transparent' ? element.content.backgroundColor : 'transparent',
                        letterSpacing: `${element.content.letterSpacing || 0}px`,
                        lineHeight: element.content.lineHeight || 1.5,
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        writingMode: element.content.verticalText ? 'vertical-rl' : 'horizontal-tb',
                        textOrientation: element.content.verticalText ? 'upright' : 'mixed',
                        WebkitTextStroke: element.content.strokeWidth ? `${element.content.strokeWidth}px ${element.content.strokeColor || '#000000'}` : 'none',
                        textShadow: element.content.shadowBlur ? 
                            `${element.content.shadowX || 0}px ${element.content.shadowY || 0}px ${element.content.shadowBlur || 0}px ${element.content.shadowColor || '#000000'}` 
                            : 'none',
                        borderRadius: element.content.bubbleStyle === 'none' ? '8px' : '0'
                    }}>
                        <span style={{
                            width: '100%',
                            textAlign: element.content.textAlign || 'left'
                        }}>
                            {element.content.content}
                        </span>
                    </div>
                </div>
            ) : element.type === 'image' || element.type === 'drawing' ? (
                <img 
                    src={typeof element.content === 'string' ? element.content : element.content?.src} 
                    alt={element.content?.alt || "uploaded"} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        filter: element.filters ? `
                            brightness(${element.filters.brightness}%)
                            contrast(${element.filters.contrast}%)
                            saturate(${element.filters.saturation}%)
                            hue-rotate(${element.filters.hue}deg)
                            blur(${element.filters.blur}px)
                            grayscale(${element.filters.grayscale}%)
                            sepia(${element.filters.sepia}%)
                            invert(${element.filters.invert}%)
                        ` : 'none',
                        opacity: element.filters ? element.filters.opacity / 100 : 1,
                        transform: element.filters ? 
                            `rotate(${element.filters.rotate}deg) scale(${element.filters.flipH ? -1 : 1}, ${element.filters.flipV ? -1 : 1})`
                            : 'none'
                    }} 
                />
            ) : (
                <div className={`element-content ${element.type === 'character' ? 'element-character' : 'element-background'}`}>
                    {element.type === 'character' ? '캐릭터' : '배경'}
                </div>
            )}
            
            {selected && (
                <>
                    {/* 텍스트 수정 버튼 */}
                    {element.type === 'text' && onTextEdit && (
                        <button
                            className="text-edit-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTextEdit(element);
                            }}
                            title="텍스트 수정"
                        >
                            ✏️ 수정
                        </button>
                    )}
                    
                    {/* Drawing 타입 전용 핸들 */}
                    {element.type === 'drawing' && element.drawingData ? (
                        <>
                            {element.drawingData.type === 'line' ? (
                                <>
                                    {/* 선: 양쪽 끝점만 */}
                                    <div 
                                        className="resize-handle line-start" 
                                        onMouseDown={(e) => handleResizeStart(e, 'line-start')}
                                        style={{
                                            left: '-6px',
                                            top: '-6px',
                                            width: '12px',
                                            height: '12px',
                                            background: '#3b82f6',
                                            border: '2px solid white',
                                            borderRadius: '50%',
                                            cursor: 'move'
                                        }}
                                    />
                                    <div 
                                        className="resize-handle line-end" 
                                        onMouseDown={(e) => handleResizeStart(e, 'line-end')}
                                        style={{
                                            right: '-6px',
                                            bottom: '-6px',
                                            width: '12px',
                                            height: '12px',
                                            background: '#3b82f6',
                                            border: '2px solid white',
                                            borderRadius: '50%',
                                            cursor: 'move'
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* 사각형/원: 상하좌우 + 모서리 */}
                                    <div className="resize-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
                                    <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, 's')} />
                                    <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                                    <div className="resize-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
                                    <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                                    <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                                    <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                                    <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* 일반 레이어: 기존 핸들 */}
                            <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                            <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                            <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                            <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
                            <div className="resize-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
                            <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, 's')} />
                            <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                            <div className="resize-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function Canvas({ canvasSize, backgroundColor, elements, selectedElement, onElementSelect, onElementMove, onElementResize, onTextEdit, zoomLevel, onZoomIn, onZoomOut, onZoomReset, onZoomChange, onUndo, onRedo, canUndo, canRedo, guideSettings, drawingSettings, onAddDrawing, cropSettings, onCropAreaChange, floodFillSettings, onFloodFill }) {
    const canvasWidth = canvasSize === '1080x1080' ? 400 : 400;
    const canvasHeight = canvasSize === '1080x1080' ? 400 : 500;
    
    const scale = zoomLevel / 100;
    
    // 그림 그리기 상태
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState(null);
    const [currentShape, setCurrentShape] = useState(null);
    const canvasRef = useRef(null);
    
    // 자르기 상태
    const [isCropping, setIsCropping] = useState(false);
    const [cropStart, setCropStart] = useState(null);
    const [cropEnd, setCropEnd] = useState(null);

    // 그림 그리기 핸들러
    const handleCanvasMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        
        // rect는 scale이 적용된 크기
        // 원본 좌표계로 변환 (매우 중요!)
        const clickXInScaled = e.clientX - rect.left;
        const clickYInScaled = e.clientY - rect.top;
        
        const x = (clickXInScaled / rect.width) * canvasWidth;
        const y = (clickYInScaled / rect.height) * canvasHeight;

        // 1. 자르기 모드
        if (cropSettings?.enabled) {
            if (!selectedElement) {
                alert('레이어를 먼저 선택하세요!');
                return;
            }

            const element = elements.find(el => el.id === selectedElement);
            if (!element) return;

            if (element.type !== 'image' && element.type !== 'drawing') {
                alert('이미지 또는 그림 레이어만 자르기가 가능합니다!');
                return;
            }

            // 레이어 내부 클릭인지 확인
            if (x >= element.x && x <= element.x + element.width &&
                y >= element.y && y <= element.y + element.height) {
                
                // 레이어 내부 상대 좌표
                const relativeX = x - element.x;
                const relativeY = y - element.y;
                
                setIsCropping(true);
                setCropStart({ x: relativeX, y: relativeY });
                setCropEnd({ x: relativeX, y: relativeY });
            }
            return;
        }

        // 2. Flood Fill 모드
        if (floodFillSettings?.enabled) {
            if (!selectedElement) {
                alert('레이어를 먼저 선택하세요!');
                return;
            }

            const element = elements.find(el => el.id === selectedElement);
            if (!element) return;

            if (element.type !== 'image' && element.type !== 'drawing') {
                alert('이미지 또는 그림 레이어만 색 채우기가 가능합니다!');
                return;
            }

            // 레이어 내부 클릭인지 확인
            if (x >= element.x && x <= element.x + element.width &&
                y >= element.y && y <= element.y + element.height) {
                
                // 레이어 내부 상대 좌표
                const clickX = x - element.x;
                const clickY = y - element.y;

                // Flood Fill 실행
                if (onFloodFill) {
                    onFloodFill({
                        type: 'fill',
                        clickX,
                        clickY,
                        fillColor: floodFillSettings.fillColor || '#ff0000',
                        tolerance: floodFillSettings.tolerance || 30,
                        fillMode: floodFillSettings.fillMode || 'adjacent'
                    });
                }
            }
            return;
        }

        // 3. 그리기 모드
        if (drawingSettings?.enabled) {
            setIsDrawing(true);
            setDrawStart({ x, y });
            setCurrentShape({
                type: drawingSettings.tool,
                startX: x,
                startY: y,
                endX: x,
                endY: y,
                color: drawingSettings.color,
                thickness: drawingSettings.thickness,
                fillShape: drawingSettings.fillShape
            });
        }
    };

    const handleCanvasMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        
        // rect는 scale이 적용된 크기
        // 원본 좌표계로 변환
        const clickXInScaled = e.clientX - rect.left;
        const clickYInScaled = e.clientY - rect.top;
        
        const x = (clickXInScaled / rect.width) * canvasWidth;
        const y = (clickYInScaled / rect.height) * canvasHeight;

        // 자르기 드래그
        if (isCropping && cropStart) {
            const element = elements.find(el => el.id === selectedElement);
            if (!element) return;

            // 레이어 내부 상대 좌표
            const relativeX = Math.max(0, Math.min(element.width, x - element.x));
            const relativeY = Math.max(0, Math.min(element.height, y - element.y));
            
            setCropEnd({ x: relativeX, y: relativeY });
            return;
        }

        // 그리기 드래그
        if (isDrawing && drawStart) {
            setCurrentShape(prev => ({
                ...prev,
                endX: x,
                endY: y
            }));
        }
    };

    const handleCanvasMouseUp = () => {
        // 자르기 종료
        if (isCropping && cropStart && cropEnd) {
            const minX = Math.min(cropStart.x, cropEnd.x);
            const minY = Math.min(cropStart.y, cropEnd.y);
            const maxX = Math.max(cropStart.x, cropEnd.x);
            const maxY = Math.max(cropStart.y, cropEnd.y);
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            // 최소 크기 체크
            if (width > 5 && height > 5) {
                if (onCropAreaChange) {
                    onCropAreaChange({
                        x: minX,
                        y: minY,
                        width: width,
                        height: height
                    });
                }
            }
            
            setIsCropping(false);
            setCropStart(null);
            setCropEnd(null);
            return;
        }

        // 그리기 종료
        if (!isDrawing || !currentShape) {
            setIsDrawing(false);
            setDrawStart(null);
            setCurrentShape(null);
            return;
        }
        
        // 최소 크기 체크
        const width = Math.abs(currentShape.endX - currentShape.startX);
        const height = Math.abs(currentShape.endY - currentShape.startY);
        
        if (width < 3 && height < 3) {
            setIsDrawing(false);
            setDrawStart(null);
            setCurrentShape(null);
            return;
        }
        
        const ratio = canvasSize === '1080x1080' ? 2.7 : (canvasSize === '1080x1350' ? 2.7 : 2.16);
        
        // Bounding Box 계산 (두께 고려)
        const padding = currentShape.thickness * ratio + 5; // 여백 추가
        
        let bbox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        
        // 도형별 Bounding Box 계산
        switch (currentShape.type) {
            case 'line': {
                const x1 = currentShape.startX * ratio;
                const y1 = currentShape.startY * ratio;
                const x2 = currentShape.endX * ratio;
                const y2 = currentShape.endY * ratio;
                
                bbox.minX = Math.min(x1, x2) - padding;
                bbox.minY = Math.min(y1, y2) - padding;
                bbox.maxX = Math.max(x1, x2) + padding;
                bbox.maxY = Math.max(y1, y2) + padding;
                break;
            }
            
            case 'rectangle': {
                const x = Math.min(currentShape.startX, currentShape.endX) * ratio;
                const y = Math.min(currentShape.startY, currentShape.endY) * ratio;
                const w = Math.abs(currentShape.endX - currentShape.startX) * ratio;
                const h = Math.abs(currentShape.endY - currentShape.startY) * ratio;
                
                bbox.minX = x - padding;
                bbox.minY = y - padding;
                bbox.maxX = x + w + padding;
                bbox.maxY = y + h + padding;
                break;
            }
            
            case 'circle': {
                const x = Math.min(currentShape.startX, currentShape.endX) * ratio;
                const y = Math.min(currentShape.startY, currentShape.endY) * ratio;
                const w = Math.abs(currentShape.endX - currentShape.startX) * ratio;
                const h = Math.abs(currentShape.endY - currentShape.startY) * ratio;
                const radius = Math.sqrt(w * w + h * h) / 2;
                const centerX = x + w / 2;
                const centerY = y + h / 2;
                
                bbox.minX = centerX - radius - padding;
                bbox.minY = centerY - radius - padding;
                bbox.maxX = centerX + radius + padding;
                bbox.maxY = centerY + radius + padding;
                break;
            }
        }
        
        // Canvas 크기 (딱 맞게)
        const canvasW = bbox.maxX - bbox.minX;
        const canvasH = bbox.maxY - bbox.minY;
        
        // Canvas 생성
        const drawingCanvas = document.createElement('canvas');
        drawingCanvas.width = canvasW;
        drawingCanvas.height = canvasH;
        const ctx = drawingCanvas.getContext('2d');
        
        // 원점을 bbox 좌상단으로 이동
        ctx.translate(-bbox.minX, -bbox.minY);
        
        ctx.strokeStyle = currentShape.color;
        ctx.fillStyle = currentShape.color;
        ctx.lineWidth = currentShape.thickness * ratio;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 그리기
        switch (currentShape.type) {
            case 'line': {
                ctx.beginPath();
                ctx.moveTo(currentShape.startX * ratio, currentShape.startY * ratio);
                ctx.lineTo(currentShape.endX * ratio, currentShape.endY * ratio);
                ctx.stroke();
                break;
            }
                
            case 'rectangle': {
                const x = Math.min(currentShape.startX, currentShape.endX) * ratio;
                const y = Math.min(currentShape.startY, currentShape.endY) * ratio;
                const w = Math.abs(currentShape.endX - currentShape.startX) * ratio;
                const h = Math.abs(currentShape.endY - currentShape.startY) * ratio;
                
                if (currentShape.fillShape) {
                    ctx.fillRect(x, y, w, h);
                } else {
                    ctx.strokeRect(x, y, w, h);
                }
                break;
            }
                
            case 'circle': {
                const x = Math.min(currentShape.startX, currentShape.endX) * ratio;
                const y = Math.min(currentShape.startY, currentShape.endY) * ratio;
                const w = Math.abs(currentShape.endX - currentShape.startX) * ratio;
                const h = Math.abs(currentShape.endY - currentShape.startY) * ratio;
                const radius = Math.sqrt(w * w + h * h) / 2;
                const centerX = x + w / 2;
                const centerY = y + h / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                if (currentShape.fillShape) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;
            }
        }
        
        // Canvas를 이미지로 변환
        const imageData = drawingCanvas.toDataURL('image/png');
        
        // 메타데이터 저장
        const drawingData = {
            type: currentShape.type,
            startX: currentShape.startX * ratio,
            startY: currentShape.startY * ratio,
            endX: currentShape.endX * ratio,
            endY: currentShape.endY * ratio,
            thickness: currentShape.thickness * ratio,
            color: currentShape.color,
            fillShape: currentShape.fillShape,
            bboxOffsetX: bbox.minX,
            bboxOffsetY: bbox.minY
        };
        
        // 새 이미지 레이어로 추가 (메타데이터 포함)
        onAddDrawing('drawing', imageData, {
            x: bbox.minX / ratio,
            y: bbox.minY / ratio,
            width: canvasW / ratio,
            height: canvasH / ratio,
            drawingData: drawingData
        });
        
        setIsDrawing(false);
        setDrawStart(null);
        setCurrentShape(null);
    };

    // 마우스 휠 줌 (캔버스 위에서 휠만으로)
    const handleWheel = (e) => {
        e.preventDefault(); // 페이지 스크롤 방지
        const delta = e.deltaY > 0 ? -25 : 25;
        const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
        onZoomChange(newZoom);
    };

    return (
        <div className="canvas-area">
            {/* 실행 취소/다시 실행 & 줌 컨트롤 */}
            <div className="canvas-top-controls">
                <div className="history-controls">
                    <button 
                        className="history-btn" 
                        onClick={onUndo} 
                        disabled={!canUndo}
                        title="실행 취소 (Ctrl+Z)"
                    >
                        ↶ 실행 취소
                    </button>
                    <button 
                        className="history-btn" 
                        onClick={onRedo} 
                        disabled={!canRedo}
                        title="다시 실행 (Ctrl+Shift+Z)"
                    >
                        ↷ 다시 실행
                    </button>
                </div>
                
                <div className="zoom-controls">
                    <button className="zoom-btn" onClick={onZoomOut} disabled={zoomLevel <= 50} title="축소 (마우스 휠)">
                        −
                    </button>
                    <select 
                        className="zoom-select" 
                        value={zoomLevel} 
                        onChange={(e) => onZoomChange(Number(e.target.value))}
                    >
                        <option value={50}>50%</option>
                        <option value={75}>75%</option>
                        <option value={100}>100%</option>
                        <option value={125}>125%</option>
                        <option value={150}>150%</option>
                        <option value={200}>200%</option>
                    </select>
                    <button className="zoom-btn" onClick={onZoomIn} disabled={zoomLevel >= 200} title="확대 (마우스 휠)">
                        +
                    </button>
                    <button className="zoom-btn zoom-reset" onClick={onZoomReset} title="원래 크기">
                        100%
                    </button>
                </div>
            </div>

            {/* 캔버스 컨테이너 */}
            <div 
                ref={canvasRef}
                className="canvas-container" 
                style={{ 
                    width: canvasWidth, 
                    height: canvasHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    cursor: cropSettings?.enabled ? 'crosshair' :
                            drawingSettings?.enabled ? 'crosshair' : 
                            floodFillSettings?.enabled ? 'pointer' : 'default',
                    backgroundColor: backgroundColor || '#ffffff' // 배경색 적용
                }}
                onWheel={handleWheel}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
            >
                {elements.map(element => (
                    <CanvasElement
                        key={element.id}
                        element={element}
                        selected={selectedElement === element.id}
                        onSelect={() => onElementSelect(element.id)}
                        onMove={onElementMove}
                        onResize={onElementResize}
                        onTextEdit={onTextEdit}
                        drawingMode={drawingSettings?.enabled}
                        floodFillMode={floodFillSettings?.enabled}
                        cropMode={cropSettings?.enabled}
                    />
                ))}
                
                {/* 현재 그리는 중인 도형 미리보기 */}
                {currentShape && (
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 9000
                        }}
                    >
                        {currentShape.type === 'line' && (
                            <line
                                x1={currentShape.startX}
                                y1={currentShape.startY}
                                x2={currentShape.endX}
                                y2={currentShape.endY}
                                stroke={currentShape.color}
                                strokeWidth={currentShape.thickness}
                                strokeLinecap="round"
                                opacity={0.7}
                            />
                        )}
                        {currentShape.type === 'rectangle' && (
                            <rect
                                x={Math.min(currentShape.startX, currentShape.endX)}
                                y={Math.min(currentShape.startY, currentShape.endY)}
                                width={Math.abs(currentShape.endX - currentShape.startX)}
                                height={Math.abs(currentShape.endY - currentShape.startY)}
                                fill={currentShape.fillShape ? currentShape.color : 'none'}
                                stroke={currentShape.fillShape ? 'none' : currentShape.color}
                                strokeWidth={currentShape.thickness}
                                opacity={0.7}
                            />
                        )}
                        {currentShape.type === 'circle' && (
                            <circle
                                cx={(currentShape.startX + currentShape.endX) / 2}
                                cy={(currentShape.startY + currentShape.endY) / 2}
                                r={Math.sqrt(
                                    Math.pow(currentShape.endX - currentShape.startX, 2) +
                                    Math.pow(currentShape.endY - currentShape.startY, 2)
                                ) / 2}
                                fill={currentShape.fillShape ? currentShape.color : 'none'}
                                stroke={currentShape.fillShape ? 'none' : currentShape.color}
                                strokeWidth={currentShape.thickness}
                                opacity={0.7}
                            />
                        )}
                    </svg>
                )}
                
                {/* 자르기 영역 오버레이 */}
                {cropSettings?.enabled && selectedElement && (() => {
                    const element = elements.find(el => el.id === selectedElement);
                    if (!element || (element.type !== 'image' && element.type !== 'drawing')) return null;
                    
                    let cropArea = null;
                    
                    // 드래그 중이면 실시간 박스 표시
                    if (isCropping && cropStart && cropEnd) {
                        const minX = Math.min(cropStart.x, cropEnd.x);
                        const minY = Math.min(cropStart.y, cropEnd.y);
                        const maxX = Math.max(cropStart.x, cropEnd.x);
                        const maxY = Math.max(cropStart.y, cropEnd.y);
                        
                        cropArea = {
                            x: minX,
                            y: minY,
                            width: maxX - minX,
                            height: maxY - minY
                        };
                    }
                    // 드래그 끝났으면 확정된 영역 표시
                    else if (cropSettings.cropArea) {
                        cropArea = cropSettings.cropArea;
                    }
                    
                    if (!cropArea || cropArea.width < 5 || cropArea.height < 5) {
                        // 안내 텍스트만 표시
                        return (
                            <div style={{
                                position: 'absolute',
                                left: element.x,
                                top: element.y,
                                width: element.width,
                                height: element.height,
                                border: '2px dashed #3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: 8000,
                                backgroundColor: 'rgba(59, 130, 246, 0.1)'
                            }}>
                                <div style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    🖱️ 드래그해서 자를 영역을 선택하세요
                                </div>
                            </div>
                        );
                    }
                    
                    return (
                        <>
                            {/* 어두운 마스크 */}
                            <div style={{
                                position: 'absolute',
                                left: element.x,
                                top: element.y,
                                width: element.width,
                                height: element.height,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                pointerEvents: 'none',
                                zIndex: 8000
                            }} />
                            
                            {/* 자를 영역 (밝게) */}
                            <div style={{
                                position: 'absolute',
                                left: element.x + cropArea.x,
                                top: element.y + cropArea.y,
                                width: cropArea.width,
                                height: cropArea.height,
                                border: '3px solid #3b82f6',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                                pointerEvents: 'none',
                                zIndex: 8500
                            }}>
                                {/* 크기 표시 */}
                                <div style={{
                                    position: 'absolute',
                                    top: -35,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ✂️ {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                                </div>
                                
                                {/* 안내 텍스트 */}
                                {!isCropping && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: -45,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        padding: '8px 20px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        💡 [자르기 적용] 버튼을 눌러주세요
                                    </div>
                                )}
                            </div>
                        </>
                    );
                })()}
                
                {/* 캔버스 크기 가이드 라인 (설정에 따라 표시) */}
                
                {/* 캔버스 크기 가이드 라인 (설정에 따라 표시) */}
                {guideSettings?.enabled && (
                    <div 
                        className="canvas-guide-border"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: `${guideSettings.thickness}px dashed ${guideSettings.color}`,
                            opacity: guideSettings.opacity,
                            pointerEvents: 'none',
                            zIndex: 10000,
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* 캔버스 크기 표시 */}
                        <div style={{
                            position: 'absolute',
                            top: -30,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: guideSettings.color,
                            opacity: Math.min(guideSettings.opacity + 0.3, 1),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}>
                            📐 {canvasSize} (최종 출력 크기)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Canvas;
