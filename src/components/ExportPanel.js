import React, { useState } from 'react';

function ExportPanel({ pages, currentPageId, canvasSize, backgroundColor, onClose }) {
    const [exportFormat, setExportFormat] = useState('png');
    const [exportQuality, setExportQuality] = useState(1.0);
    const [exportType, setExportType] = useState('current'); // 'current' or 'all'
    const [isExporting, setIsExporting] = useState(false);

    // 캔버스를 이미지로 변환
    const convertCanvasToImage = async (pageElements, pageIndex) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 캔버스 크기 설정
            const [width, height] = canvasSize.split('x').map(Number);
            canvas.width = width;
            canvas.height = height;
            
            // 배경색 그리기 (항상 적용)
            ctx.fillStyle = backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // 요소들을 그리기
            const drawElements = async () => {
                for (const element of pageElements) {
                    const scaleX = width / 400; // 캔버스 표시 크기 400px 기준
                    const scaleY = canvasSize === '1080x1080' ? width / 400 : height / 500;
                    
                    const x = element.x * scaleX;
                    const y = element.y * scaleY;
                    const w = element.width * scaleX;
                    const h = element.height * scaleY;
                    
                    if (element.type === 'image' || element.type === 'drawing') {
                        await new Promise((imgResolve) => {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = () => {
                                ctx.save();
                                
                                // 이미지 필터 적용
                                if (element.filters) {
                                    const f = element.filters;
                                    ctx.filter = `
                                        brightness(${f.brightness}%)
                                        contrast(${f.contrast}%)
                                        saturate(${f.saturation}%)
                                        hue-rotate(${f.hue}deg)
                                        blur(${f.blur}px)
                                        grayscale(${f.grayscale}%)
                                        sepia(${f.sepia}%)
                                        invert(${f.invert}%)
                                    `;
                                    ctx.globalAlpha = f.opacity / 100;
                                    
                                    // 회전 및 반전
                                    ctx.translate(x + w/2, y + h/2);
                                    ctx.rotate(f.rotate * Math.PI / 180);
                                    ctx.scale(f.flipH ? -1 : 1, f.flipV ? -1 : 1);
                                    ctx.drawImage(img, -w/2, -h/2, w, h);
                                } else {
                                    ctx.drawImage(img, x, y, w, h);
                                }
                                
                                ctx.restore();
                                imgResolve();
                            };
                            img.onerror = () => {
                                console.error('이미지 로드 실패:', element.id);
                                imgResolve(); // 오류 발생해도 계속 진행
                            };
                            
                            // 프로젝트 로드 시: element.content = { src: url, alt: "" }
                            // 직접 추가 시: element.content = "data:image/..."
                            const imageSrc = element.content?.src || element.content;
                            img.src = imageSrc;
                        });
                    } else if (element.type === 'text') {
                        ctx.save();
                        
                        const content = element.content;
                        
                        // 말풍선 그리기
                        if (content.bubbleStyle && content.bubbleStyle !== 'none') {
                            ctx.fillStyle = content.bubbleColor || '#ffffff';
                            ctx.strokeStyle = content.bubbleBorderColor || '#000000';
                            ctx.lineWidth = (content.bubbleBorderWidth || 2) * scaleX;
                            
                            switch(content.bubbleStyle) {
                                case 'round':
                                    ctx.beginPath();
                                    ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
                                    ctx.fill();
                                    ctx.stroke();
                                    break;
                                case 'rect':
                                    ctx.beginPath();
                                    ctx.roundRect(x, y, w, h, 12 * scaleX);
                                    ctx.fill();
                                    ctx.stroke();
                                    break;
                                default:
                                    ctx.fillRect(x, y, w, h);
                                    ctx.strokeRect(x, y, w, h);
                                    break;
                            }
                        }
                        
                        // 텍스트 그리기
                        const textAlign = content.textAlign || 'left';
                        let textX = 0;
                        
                        // 정렬에 따라 X 위치 조정
                        if (textAlign === 'left') {
                            textX = -w/2 + 15; // 왼쪽 정렬
                        } else if (textAlign === 'center') {
                            textX = 0; // 중앙 정렬
                        } else if (textAlign === 'right') {
                            textX = w/2 - 15; // 오른쪽 정렬
                        }
                        
                        ctx.translate(x + w/2, y + h/2);
                        ctx.rotate((content.rotation || 0) * Math.PI / 180);
                        ctx.globalAlpha = content.opacity || 1;
                        
                        ctx.font = `${content.fontStyle || 'normal'} ${content.fontWeight || 'normal'} ${content.fontSize * scaleX}px ${content.fontFamily || 'Noto Sans KR'}`;
                        ctx.fillStyle = content.textColor || '#000000';
                        ctx.textAlign = textAlign;
                        ctx.textBaseline = 'middle';
                        
                        // 외곽선
                        if (content.strokeWidth) {
                            ctx.strokeStyle = content.strokeColor || '#000000';
                            ctx.lineWidth = content.strokeWidth * scaleX;
                            ctx.strokeText(content.content, textX, 0);
                        }
                        
                        // 그림자
                        if (content.shadowBlur) {
                            ctx.shadowOffsetX = (content.shadowX || 0) * scaleX;
                            ctx.shadowOffsetY = (content.shadowY || 0) * scaleY;
                            ctx.shadowBlur = (content.shadowBlur || 0) * scaleX;
                            ctx.shadowColor = content.shadowColor || '#000000';
                        }
                        
                        ctx.fillText(content.content, textX, 0);
                        
                        ctx.restore();
                    }
                }
            };
            
            drawElements().then(() => {
                resolve({
                    canvas,
                    pageIndex
                });
            });
        });
    };

    // 현재 페이지 내보내기
    const exportCurrentPage = async () => {
        setIsExporting(true);
        
        try {
            const currentPage = pages.find(p => p.id === currentPageId);
            if (!currentPage) {
                alert('현재 페이지를 찾을 수 없습니다.');
                return;
            }
            
            const result = await convertCanvasToImage(currentPage.elements || [], 1);
            downloadImage(result.canvas, 'page-1');
            
            alert('이미지가 다운로드되었습니다!');
        } catch (error) {
            console.error('내보내기 오류:', error);
            alert('이미지 내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    // 모든 페이지 내보내기
    const exportAllPages = async () => {
        setIsExporting(true);
        
        try {
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const result = await convertCanvasToImage(page.elements || [], i + 1);
                downloadImage(result.canvas, `page-${i + 1}`);
                
                // 잠시 대기 (브라우저 부하 방지)
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            alert(`${pages.length}개의 이미지가 다운로드되었습니다!`);
        } catch (error) {
            console.error('내보내기 오류:', error);
            alert('이미지 내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    // 이미지 다운로드
    const downloadImage = (canvas, filename) => {
        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const url = canvas.toDataURL(mimeType, exportQuality);
        
        const link = document.createElement('a');
        link.download = `${filename}.${exportFormat}`;
        link.href = url;
        link.click();
    };

    // 내보내기 실행
    const handleExport = () => {
        if (exportType === 'current') {
            exportCurrentPage();
        } else {
            exportAllPages();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600' }}>
                    📤 이미지 내보내기
                </h2>

                {/* 내보내기 유형 */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        내보내기 범위
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            className={`preset-item ${exportType === 'current' ? 'selected' : ''}`}
                            onClick={() => setExportType('current')}
                            style={{ padding: '12px' }}
                        >
                            📄 현재 페이지만
                        </button>
                        <button
                            className={`preset-item ${exportType === 'all' ? 'selected' : ''}`}
                            onClick={() => setExportType('all')}
                            style={{ padding: '12px' }}
                        >
                            📚 모든 페이지 ({pages.length}개)
                        </button>
                    </div>
                </div>

                {/* 이미지 형식 */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        이미지 형식
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            className={`preset-item ${exportFormat === 'png' ? 'selected' : ''}`}
                            onClick={() => setExportFormat('png')}
                            style={{ padding: '12px' }}
                        >
                            PNG (투명 배경 가능)
                        </button>
                        <button
                            className={`preset-item ${exportFormat === 'jpg' ? 'selected' : ''}`}
                            onClick={() => setExportFormat('jpg')}
                            style={{ padding: '12px' }}
                        >
                            JPG (용량 작음)
                        </button>
                    </div>
                </div>

                {/* 품질 설정 */}
                {exportFormat === 'jpg' && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            이미지 품질: {Math.round(exportQuality * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="1.0"
                            step="0.1"
                            value={exportQuality}
                            onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                            className="range-input"
                        />
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            <span>작은 용량</span>
                            <span>최고 품질</span>
                        </div>
                    </div>
                )}

                {/* 정보 */}
                <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: '#4b5563'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        📐 <strong>해상도:</strong> {canvasSize}px
                    </div>
                    {exportType === 'all' && (
                        <div>
                            📊 <strong>파일 개수:</strong> {pages.length}개
                        </div>
                    )}
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            opacity: isExporting ? 0.5 : 1
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        style={{
                            flex: 2,
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            background: isExporting 
                                ? '#9ca3af' 
                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isExporting ? '내보내는 중...' : '내보내기 시작'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportPanel;