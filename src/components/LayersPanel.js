import React from 'react';

function LayersPanel({ elements, selectedElement, onElementSelect, onLayerMove, onLayerDelete, onTextEdit, onLayerDuplicate, onLayerSave, onAlign }) {
    const reversedElements = [...elements].reverse();

    const getLayerIcon = (type) => {
        switch(type) {
            case 'character':
            case 'image':
                return '👤';
            case 'background':
                return '🖼️';
            case 'text':
                return '💬';
            case 'drawing':
                return '✏️';
            default:
                return '📄';
        }
    };

    const getLayerName = (element) => {
        if (element.type === 'text') {
            const content = element.content?.content || '';
            return `${getLayerIcon(element.type)} ${content.substring(0, 15)}${content.length > 15 ? '...' : ''}`;
        }
        if (element.type === 'drawing') {
            const drawingType = element.drawingData?.type || '';
            const typeName = drawingType === 'line' ? '선' : 
                           drawingType === 'rectangle' ? '사각형' : 
                           drawingType === 'circle' ? '원' : '그림';
            return `${getLayerIcon(element.type)} ${typeName}`;
        }
        return `${getLayerIcon(element.type)} ${element.type === 'image' ? '이미지' : element.type === 'character' ? '캐릭터' : '배경'}`;
    };

    return (
        <div className="panel-section">
            <div className="panel-title">🎨 레이어</div>
            
            {/* 정렬 도구 */}
            {selectedElement && (
                <div className="align-tools">
                    <div className="align-group">
                        <span className="align-label">가로 정렬</span>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('left')}
                            title="좌측 정렬"
                        >
                            ⫷
                        </button>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('center')}
                            title="중앙 정렬"
                        >
                            ⫼
                        </button>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('right')}
                            title="우측 정렬"
                        >
                            ⫸
                        </button>
                    </div>
                    <div className="align-group">
                        <span className="align-label">세로 정렬</span>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('top')}
                            title="상단 정렬"
                        >
                            ⬆
                        </button>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('middle')}
                            title="중앙 정렬"
                        >
                            ●
                        </button>
                        <button 
                            className="align-btn" 
                            onClick={() => onAlign('bottom')}
                            title="하단 정렬"
                        >
                            ⬇
                        </button>
                    </div>
                </div>
            )}
            {elements.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    아직 추가된 요소가 없습니다
                </p>
            ) : (
                <div>
                    {reversedElements.map((element, index) => {
                        const originalIndex = elements.length - 1 - index;
                        return (
                            <div
                                key={element.id}
                                className={`layer-item ${selectedElement === element.id ? 'selected' : ''}`}
                                onClick={() => onElementSelect(element.id)}
                            >
                                <span className="layer-name">
                                    {getLayerName(element)}
                                </span>
                                <div className="layer-controls">
                                    {/* 텍스트 수정 버튼 */}
                                    {element.type === 'text' && onTextEdit && (
                                        <button 
                                            className="layer-btn layer-btn-edit" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                onTextEdit(element); 
                                            }}
                                            title="텍스트 수정"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {/* 복사 버튼 */}
                                    <button 
                                        className="layer-btn layer-btn-duplicate" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onLayerDuplicate(element.id); 
                                        }}
                                        title="레이어 복사"
                                    >
                                        📋
                                    </button>
                                    {/* 저장 버튼 */}
                                    <button 
                                        className="layer-btn layer-btn-save" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onLayerSave(element.id); 
                                        }}
                                        title="레이어 저장"
                                    >
                                        💾
                                    </button>
                                    <button 
                                        className="layer-btn" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onLayerMove(originalIndex, 'up'); 
                                        }}
                                        disabled={originalIndex === elements.length - 1}
                                        title="위로"
                                    >
                                        ↑
                                    </button>
                                    <button 
                                        className="layer-btn" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onLayerMove(originalIndex, 'down'); 
                                        }}
                                        disabled={originalIndex === 0}
                                        title="아래로"
                                    >
                                        ↓
                                    </button>
                                    <button 
                                        className="layer-btn" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onLayerDelete(element.id); 
                                        }}
                                        title="삭제"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default LayersPanel;
