import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WorkflowSteps from './components/WorkflowSteps';
import Canvas from './components/Canvas';
import CharacterPanel from './components/CharacterPanel';
import BackgroundPanel from './components/BackgroundPanel';
import TextPanel from './components/TextPanel';
import ImageEditPanel from './components/ImageEditPanel';
import LayersPanel from './components/LayersPanel';
import CanvasGuidePanel from './components/CanvasGuidePanel';
import DrawingPanel from './components/DrawingPanel';
import ColorRemoverPanel from './components/ColorRemoverPanel';
import ImageCropperPanel from './components/ImageCropperPanel';
import FloodFillPanel from './components/FloodFillPanel';
import CanvasSizeModal from './components/CanvasSizeModal';
import PageManager from './components/PageManager';
import ExportPanel from './components/ExportPanel';
import TextEditModal from './components/TextEditModal';
import FirebaseTest from './components/FirebaseTest';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import { onAuthChange } from './firebase/auth';
import { saveProject, loadAllProjects, loadProject, deleteProject } from './firebase/projects';
import './styles/App.css';

function App() {
    // 인증 상태
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // 프로젝트 관리
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    
    // 워크플로우
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    
    // 페이지 시스템
    const [pages, setPages] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    
    // 현재 페이지의 캔버스 요소
    const [canvasElements, setCanvasElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    
    // 실행 취소/다시 실행
    const [history, setHistory] = useState([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    // 캔버스 줌
    const [zoomLevel, setZoomLevel] = useState(100); // 50, 75, 100, 125, 150, 200
    
    // 캔버스 가이드 설정
    const [guideSettings, setGuideSettings] = useState({
        enabled: true,
        color: '#ef4444',
        thickness: 2,
        opacity: 0.5
    });
    
    // 그림판 설정
    const [drawingSettings, setDrawingSettings] = useState({
        enabled: false,
        tool: 'line', // 'line', 'rectangle', 'circle'
        color: '#000000',
        thickness: 5,
        fillShape: false
    });
    
    // 자르기 설정
    const [cropSettings, setCropSettings] = useState({
        enabled: false,
        aspectRatio: 'free', // 'free', '1:1', '16:9', etc.
        cropArea: null // { x, y, width, height }
    });
    
    // Flood Fill 설정
    const [floodFillSettings, setFloodFillSettings] = useState({
        enabled: false,
        fillColor: '#ff0000',
        tolerance: 30,
        fillMode: 'adjacent' // 'adjacent' or 'all'
    });
    
    // 텍스트 편집
    const [editingText, setEditingText] = useState(null);
    
    // 모달
    const [showCanvasSizeModal, setShowCanvasSizeModal] = useState(false);
    const [selectedCanvasSize, setSelectedCanvasSize] = useState('1080x1080');
    const [selectedBgColor, setSelectedBgColor] = useState('#ffffff'); // 배경색 상태 추가
    const [showExportPanel, setShowExportPanel] = useState(false);
    
    // 패널 옵션
    const [characterOption, setCharacterOption] = useState('');
    const [backgroundOption, setBackgroundOption] = useState('');
    const [textContent, setTextContent] = useState('');

    // 자동 저장 디바운스 타이머
    const saveTimerRef = useRef(null);

    // 인증 상태 감지
    useEffect(() => {
        const unsubscribe = onAuthChange(async (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            
            if (currentUser) {
                console.log('✅ 로그인됨:', currentUser.email);
                // Firestore에서 프로젝트 불러오기
                const result = await loadAllProjects(currentUser.uid);
                if (result.success && result.projects.length > 0) {
                    setProjects(result.projects);
                    console.log(`📂 프로젝트 ${result.projects.length}개 불러옴`);
                } else {
                    setProjects([]);
                }
            } else {
                console.log('❌ 로그아웃됨');
                // 로그아웃 시 상태 초기화
                setProjects([]);
                setActiveProject(null);
                setPages([]);
                setCurrentPageId(null);
                setCanvasElements([]);
            }
        });

        // 컴포넌트 언마운트 시 저장 타이머 정리
        return () => {
            unsubscribe();
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    // 새 프로젝트 생성
    const handleNewProject = () => {
        setShowCanvasSizeModal(true);
    };

    const createProject = async () => {
        // 로그인 체크
        if (!user) {
            alert('⚠️ 로그인이 필요합니다.\n\n프로젝트를 생성하려면 먼저 로그인해주세요.');
            setShowCanvasSizeModal(false);
            setShowAuthModal(true);
            return;
        }
        
        const newProjectId = Date.now();
        const firstPageId = Date.now() + 1;
        
        const newProject = {
            id: newProjectId,
            name: `새 프로젝트 ${projects.length + 1}`,
            date: new Date().toLocaleDateString('ko-KR'),
            canvasSize: selectedCanvasSize,
            backgroundColor: selectedBgColor, // 배경색 추가
            pages: [
                {
                    id: firstPageId,
                    elements: []
                }
            ]
        };
        
        setProjects([newProject, ...projects]);
        setActiveProject(newProject);
        setPages(newProject.pages);
        setCurrentPageId(firstPageId);
        setShowCanvasSizeModal(false);
        setCurrentStep(1);
        setCompletedSteps([]);
        setCanvasElements([]);
        setSelectedElement(null);

        // Firestore에 저장 (로그인된 경우만)
        if (user) {
            await saveProject(user.uid, newProject);
        }
    };

    // 프로젝트 선택
    const handleProjectSelect = async (project) => {
        // Phase 6: 프로젝트 선택 시 전체 데이터 로드
        if (user && project.pages && project.pages.length === 0) {
            // 페이지 데이터가 없으면 Firestore에서 로드
            console.log('📂 프로젝트 상세 데이터 로딩 중...');
            const result = await loadProject(user.uid, project.id);
            if (result.success) {
                project = result.project;
                // projects 배열도 업데이트
                const updatedProjects = projects.map(p => 
                    p.id === project.id ? project : p
                );
                setProjects(updatedProjects);
            }
        }
        
        setActiveProject(project);
        setPages(project.pages || []);
        
        if (project.pages && project.pages.length > 0) {
            const firstPage = project.pages[0];
            setCurrentPageId(firstPage.id);
            setCanvasElements(firstPage.elements || []);
        } else {
            setCurrentPageId(null);
            setCanvasElements([]);
        }
        
        setCurrentStep(1);
        setCompletedSteps([]);
        setSelectedElement(null);
    };

    // 프로젝트 삭제
    const handleProjectDelete = async (projectId) => {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        
        if (activeProject && activeProject.id === projectId) {
            if (updatedProjects.length > 0) {
                handleProjectSelect(updatedProjects[0]);
            } else {
                setActiveProject(null);
                setPages([]);
                setCurrentPageId(null);
                setCanvasElements([]);
            }
            setCurrentStep(1);
            setCompletedSteps([]);
            setSelectedElement(null);
        }

        // Firestore에서 삭제 (로그인된 경우만)
        if (user) {
            await deleteProject(user.uid, projectId);
        }
    };

    // 페이지 추가
    const handlePageAdd = async () => {
        if (!activeProject) return;
        
        const newPageId = Date.now();
        const newPage = {
            id: newPageId,
            elements: []
        };
        
        const updatedPages = [...pages, newPage];
        setPages(updatedPages);
        setCurrentPageId(newPageId);
        setCanvasElements([]);
        setSelectedElement(null);
        
        // 프로젝트 업데이트
        const updatedProject = { ...activeProject, pages: updatedPages };
        const updatedProjects = projects.map(p =>
            p.id === activeProject.id ? updatedProject : p
        );
        setProjects(updatedProjects);
        setActiveProject(updatedProject);

        // Firestore에 저장 (로그인된 경우만)
        if (user) {
            await saveProject(user.uid, updatedProject);
        }
    };

    // 페이지 삭제
    const handlePageDelete = async (pageId) => {
        if (!activeProject || pages.length <= 1) return;
        
        const updatedPages = pages.filter(p => p.id !== pageId);
        setPages(updatedPages);
        
        // 현재 페이지가 삭제되면 첫 번째 페이지로 이동
        if (currentPageId === pageId) {
            const firstPage = updatedPages[0];
            setCurrentPageId(firstPage.id);
            setCanvasElements(firstPage.elements || []);
        }
        
        // 프로젝트 업데이트
        const updatedProject = { ...activeProject, pages: updatedPages };
        const updatedProjects = projects.map(p =>
            p.id === activeProject.id ? updatedProject : p
        );
        setProjects(updatedProjects);
        setActiveProject(updatedProject);

        // Firestore에 저장 (로그인된 경우만)
        if (user) {
            await saveProject(user.uid, updatedProject);
        }
    };

    // 페이지 선택
    const handlePageSelect = (pageId) => {
        const selectedPage = pages.find(p => p.id === pageId);
        if (selectedPage) {
            setCurrentPageId(pageId);
            setCanvasElements(selectedPage.elements || []);
            setSelectedElement(null);
            // 히스토리 초기화
            setHistory([selectedPage.elements || []]);
            setHistoryIndex(0);
        }
    };

    // 현재 페이지의 요소 업데이트 (헬퍼 함수)
    const updateCurrentPageElements = (newElements, addToHistory = true) => {
        setCanvasElements(newElements);
        
        // 히스토리 저장
        if (addToHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newElements);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        
        if (!activeProject || !currentPageId) return;
        
        // 페이지 업데이트
        const updatedPages = pages.map(p =>
            p.id === currentPageId
                ? { ...p, elements: newElements }
                : p
        );
        setPages(updatedPages);
        
        // 프로젝트 업데이트
        const updatedProject = { ...activeProject, pages: updatedPages };
        const updatedProjects = projects.map(p =>
            p.id === activeProject.id ? updatedProject : p
        );
        setProjects(updatedProjects);
        setActiveProject(updatedProject);

        // Firestore에 자동 저장 (디바운스 적용: 2초 후 저장)
        if (user) {
            // 기존 타이머 취소
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            // 2초 후 저장
            saveTimerRef.current = setTimeout(async () => {
                await saveProject(user.uid, updatedProject);
                console.log('💾 자동 저장 완료');
            }, 2000);
        }
    };

    // 실행 취소
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const previousElements = history[newIndex];
            setCanvasElements(previousElements);
            
            // 페이지/프로젝트 업데이트 (히스토리에 추가 안 함)
            if (activeProject && currentPageId) {
                const updatedPages = pages.map(p =>
                    p.id === currentPageId
                        ? { ...p, elements: previousElements }
                        : p
                );
                setPages(updatedPages);
                
                const updatedProjects = projects.map(p =>
                    p.id === activeProject.id
                        ? { ...p, pages: updatedPages }
                        : p
                );
                setProjects(updatedProjects);
                setActiveProject({ ...activeProject, pages: updatedPages });
            }
        }
    };

    // 다시 실행
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextElements = history[newIndex];
            setCanvasElements(nextElements);
            
            // 페이지/프로젝트 업데이트 (히스토리에 추가 안 함)
            if (activeProject && currentPageId) {
                const updatedPages = pages.map(p =>
                    p.id === currentPageId
                        ? { ...p, elements: nextElements }
                        : p
                );
                setPages(updatedPages);
                
                const updatedProjects = projects.map(p =>
                    p.id === activeProject.id
                        ? { ...p, pages: updatedPages }
                        : p
                );
                setProjects(updatedProjects);
                setActiveProject({ ...activeProject, pages: updatedPages });
            }
        }
    };

    // 단계 완료
    const handleStepComplete = () => {
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    // 요소 추가
    const addElement = (type, content, filtersOrOptions = null) => {
        // drawing 타입 처리 (메타데이터 포함)
        if (type === 'drawing') {
            const newElement = {
                id: Date.now(),
                type,
                content,
                x: filtersOrOptions.x,
                y: filtersOrOptions.y,
                width: filtersOrOptions.width,
                height: filtersOrOptions.height,
                drawingData: filtersOrOptions.drawingData
            };
            
            const updatedElements = [...canvasElements, newElement];
            updateCurrentPageElements(updatedElements);
            setSelectedElement(newElement.id);
            return;
        }
        
        if (type === 'image') {
            // 이미지 타입일 때 실제 이미지 크기 측정
            const img = new Image();
            img.onload = () => {
                // 캔버스 크기에 맞게 스케일 조정 (최대 300px)
                const maxSize = 300;
                let width = img.naturalWidth;
                let height = img.naturalHeight;
                
                // 비율 유지하면서 크기 조정
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                const newElement = {
                    id: Date.now(),
                    type,
                    content,
                    filters: filtersOrOptions,
                    x: 50,
                    y: 50,
                    width: Math.round(width),
                    height: Math.round(height)
                };
                
                const updatedElements = [...canvasElements, newElement];
                updateCurrentPageElements(updatedElements);
            };
            img.src = content;
        } else {
            // 텍스트나 다른 타입
            const newElement = {
                id: Date.now(),
                type,
                content,
                filters: filtersOrOptions,
                x: 50,
                y: 50,
                width: type === 'text' ? 200 : 250,
                height: type === 'text' ? 80 : 200
            };
            
            const updatedElements = [...canvasElements, newElement];
            updateCurrentPageElements(updatedElements);
        }
    };

    // Drawing 재생성 함수
    const regenerateDrawing = (drawingData, newWidth, newHeight, canvasSize) => {
        const ratio = canvasSize === '1080x1080' ? 2.7 : (canvasSize === '1080x1350' ? 2.7 : 2.16);
        
        // 실제 픽셀 크기
        const canvasW = newWidth * ratio;
        const canvasH = newHeight * ratio;
        
        // Canvas 생성
        const drawingCanvas = document.createElement('canvas');
        drawingCanvas.width = canvasW;
        drawingCanvas.height = canvasH;
        const ctx = drawingCanvas.getContext('2d');
        
        ctx.strokeStyle = drawingData.color;
        ctx.fillStyle = drawingData.color;
        ctx.lineWidth = drawingData.thickness; // 두께 유지!
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // bbox offset 고려
        const offsetX = drawingData.bboxOffsetX;
        const offsetY = drawingData.bboxOffsetY;
        
        // 원본 크기
        const origStartX = drawingData.startX - offsetX;
        const origStartY = drawingData.startY - offsetY;
        const origEndX = drawingData.endX - offsetX;
        const origEndY = drawingData.endY - offsetY;
        
        // 스케일 비율 계산 (두께 제외)
        const origW = Math.abs(origEndX - origStartX);
        const origH = Math.abs(origEndY - origStartY);
        const scaleX = origW > 0 ? canvasW / (origW + drawingData.thickness + 10) : 1;
        const scaleY = origH > 0 ? canvasH / (origH + drawingData.thickness + 10) : 1;
        
        // 새 좌표 계산
        const padding = drawingData.thickness / 2 + 5;
        const newStartX = (origStartX * scaleX) + padding;
        const newStartY = (origStartY * scaleY) + padding;
        const newEndX = (origEndX * scaleX) + padding;
        const newEndY = (origEndY * scaleY) + padding;
        
        switch (drawingData.type) {
            case 'line': {
                ctx.beginPath();
                ctx.moveTo(newStartX, newStartY);
                ctx.lineTo(newEndX, newEndY);
                ctx.stroke();
                break;
            }
                
            case 'rectangle': {
                const x = Math.min(newStartX, newEndX);
                const y = Math.min(newStartY, newEndY);
                const w = Math.abs(newEndX - newStartX);
                const h = Math.abs(newEndY - newStartY);
                
                if (drawingData.fillShape) {
                    ctx.fillRect(x, y, w, h);
                } else {
                    ctx.strokeRect(x, y, w, h);
                }
                break;
            }
                
            case 'circle': {
                const x = Math.min(newStartX, newEndX);
                const y = Math.min(newStartY, newEndY);
                const w = Math.abs(newEndX - newStartX);
                const h = Math.abs(newEndY - newStartY);
                const radius = Math.sqrt(w * w + h * h) / 2;
                const centerX = x + w / 2;
                const centerY = y + h / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                if (drawingData.fillShape) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;
            }
        }
        
        return drawingCanvas.toDataURL('image/png');
    };

    // 색상 제거 함수
    const removeColor = (options) => {
        if (!selectedElement) {
            alert('레이어를 먼저 선택하세요!');
            return;
        }

        const element = canvasElements.find(el => el.id === selectedElement);
        if (!element) return;

        // 이미지 또는 drawing 타입만 가능
        if (element.type !== 'image' && element.type !== 'drawing') {
            alert('이미지 또는 그림 레이어만 색상 제거가 가능합니다!');
            return;
        }

        // 스포이드 모드는 별도 처리
        if (options.type === 'eyedropper-mode') {
            // TODO: 스포이드 모드 처리
            return;
        }

        const { targetColor, tolerance } = options;

        // 16진수 색상을 RGB로 변환
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const target = hexToRgb(targetColor);
        if (!target) {
            alert('올바른 색상을 선택하세요!');
            return;
        }

        // Canvas 생성
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            // 이미지 그리기
            ctx.drawImage(img, 0, 0);

            // 픽셀 데이터 가져오기
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // 색상 거리 계산 함수
            const colorDistance = (r1, g1, b1, r2, g2, b2) => {
                return Math.sqrt(
                    Math.pow(r1 - r2, 2) +
                    Math.pow(g1 - g2, 2) +
                    Math.pow(b1 - b2, 2)
                );
            };

            // 모든 픽셀 검사
            let changedPixels = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                const distance = colorDistance(r, g, b, target.r, target.g, target.b);

                if (distance <= tolerance) {
                    pixels[i + 3] = 0; // 투명으로
                    changedPixels++;
                }
            }

            // 변경된 픽셀이 없으면 알림
            if (changedPixels === 0) {
                alert('제거할 색상을 찾을 수 없습니다. 허용 오차를 높여보세요!');
                return;
            }

            // 수정된 데이터 적용
            ctx.putImageData(imageData, 0, 0);

            // PNG로 변환
            const newImageData = canvas.toDataURL('image/png');

            // 레이어 업데이트
            const updatedElements = canvasElements.map(el => {
                if (el.id === selectedElement) {
                    return { ...el, content: newImageData };
                }
                return el;
            });

            updateCurrentPageElements(updatedElements);
            alert(`${changedPixels / 4} 픽셀이 투명으로 변경되었습니다!`);
        };

        img.onerror = () => {
            alert('이미지를 불러올 수 없습니다!');
        };

        img.src = element.content;
    };

    // 이미지 자르기 함수
    const handleCrop = (options) => {
        if (options.type === 'toggle') {
            // 자르기 모드 토글
            setCropSettings({
                enabled: options.enabled,
                aspectRatio: 'free',
                cropArea: null
            });
            return;
        }

        if (options.type === 'apply') {
            // 자르기 적용
            if (!selectedElement) {
                alert('레이어를 먼저 선택하세요!');
                return;
            }

            const element = canvasElements.find(el => el.id === selectedElement);
            if (!element) return;

            // 이미지 또는 drawing 타입만 가능
            if (element.type !== 'image' && element.type !== 'drawing') {
                alert('이미지 또는 그림 레이어만 자르기가 가능합니다!');
                return;
            }

            if (!cropSettings.cropArea) {
                alert('드래그해서 자를 영역을 먼저 선택하세요!');
                return;
            }

            const { x, y, width, height } = cropSettings.cropArea;

            // Canvas 생성
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // 레이어별 실제 비율 계산 (레이어 크기에 따라 달라짐)
                const ratioX = img.naturalWidth / element.width;
                const ratioY = img.naturalHeight / element.height;

                // 실제 픽셀 크기로 변환
                const cropX = x * ratioX;
                const cropY = y * ratioY;
                const cropW = width * ratioX;
                const cropH = height * ratioY;

                canvas.width = cropW;
                canvas.height = cropH;
                const ctx = canvas.getContext('2d');

                // 자를 영역만 그리기
                ctx.drawImage(
                    img,
                    cropX, cropY, cropW, cropH, // 소스
                    0, 0, cropW, cropH // 목적지
                );

                // PNG로 변환
                const croppedImage = canvas.toDataURL('image/png');

                // 레이어 업데이트 (위치와 크기도 조정)
                const updatedElements = canvasElements.map(el => {
                    if (el.id === selectedElement) {
                        return {
                            ...el,
                            content: croppedImage,
                            x: el.x + x,
                            y: el.y + y,
                            width: width,
                            height: height
                        };
                    }
                    return el;
                });

                updateCurrentPageElements(updatedElements);
                
                // 자르기 영역만 초기화 (enabled는 유지 → 계속 자르기 가능!)
                setCropSettings({
                    enabled: true, // 켜진 상태 유지!
                    aspectRatio: 'free',
                    cropArea: null // 영역만 초기화
                });

                alert('이미지가 자르기되었습니다!\n계속 자르시려면 다시 드래그하세요.');
            };

            img.onerror = () => {
                alert('이미지를 불러올 수 없습니다!');
            };

            img.src = element.content;
        }

        if (options.type === 'set-area') {
            // 자를 영역 설정
            setCropSettings({
                ...cropSettings,
                cropArea: options.area
            });
        }
    };

    // Flood Fill 처리
    const handleFloodFill = (options) => {
        if (options.type === 'toggle') {
            setFloodFillSettings({
                enabled: options.enabled,
                fillColor: options.fillColor || '#ff0000',
                tolerance: options.tolerance !== undefined ? options.tolerance : 30,
                fillMode: options.fillMode || 'adjacent'
            });
            return;
        }

        // 실제 Flood Fill 적용
        // Canvas에서 클릭 이벤트로 호출됨
        if (options.type === 'fill') {
            if (!selectedElement) {
                alert('레이어를 먼저 선택하세요!');
                return;
            }

            const element = canvasElements.find(el => el.id === selectedElement);
            if (!element) return;

            if (element.type !== 'image' && element.type !== 'drawing') {
                alert('이미지 또는 그림 레이어만 색 채우기가 가능합니다!');
                return;
            }

            const { clickX, clickY, fillColor, tolerance, fillMode } = options;

            // Canvas 생성
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                // 이미지 그리기
                ctx.drawImage(img, 0, 0);

                // 픽셀 데이터 가져오기
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                // 클릭한 픽셀의 색상 가져오기
                // 레이어별 실제 비율 계산 (레이어 크기에 따라 달라짐)
                const ratioX = img.naturalWidth / element.width;
                const ratioY = img.naturalHeight / element.height;
                
                const startX = Math.floor(clickX * ratioX);
                const startY = Math.floor(clickY * ratioY);
                const startIndex = (startY * canvas.width + startX) * 4;

                const targetR = pixels[startIndex];
                const targetG = pixels[startIndex + 1];
                const targetB = pixels[startIndex + 2];
                const targetA = pixels[startIndex + 3];

                // 채울 색상 변환
                const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                };

                const fill = hexToRgb(fillColor);
                if (!fill) return;

                // 색상 거리 계산
                const colorDistance = (r1, g1, b1, r2, g2, b2) => {
                    return Math.sqrt(
                        Math.pow(r1 - r2, 2) +
                        Math.pow(g1 - g2, 2) +
                        Math.pow(b1 - b2, 2)
                    );
                };

                // Flood Fill 알고리즘 (스택 기반)
                if (fillMode === 'adjacent') {
                    // 인접 영역만
                    const stack = [[startX, startY]];
                    const visited = new Set();
                    let filledPixels = 0;

                    while (stack.length > 0) {
                        const [x, y] = stack.pop();
                        const key = `${x},${y}`;

                        if (visited.has(key)) continue;
                        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

                        const index = (y * canvas.width + x) * 4;
                        const r = pixels[index];
                        const g = pixels[index + 1];
                        const b = pixels[index + 2];

                        // 색상 체크
                        const distance = colorDistance(r, g, b, targetR, targetG, targetB);
                        if (distance > tolerance) continue;

                        visited.add(key);

                        // 색상 변경
                        pixels[index] = fill.r;
                        pixels[index + 1] = fill.g;
                        pixels[index + 2] = fill.b;
                        filledPixels++;

                        // 상하좌우 추가
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }

                    if (filledPixels === 0) {
                        alert('채울 영역을 찾을 수 없습니다!');
                        return;
                    }
                } else {
                    // 같은 색 모두
                    let filledPixels = 0;
                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];

                        const distance = colorDistance(r, g, b, targetR, targetG, targetB);
                        if (distance <= tolerance) {
                            pixels[i] = fill.r;
                            pixels[i + 1] = fill.g;
                            pixels[i + 2] = fill.b;
                            filledPixels++;
                        }
                    }

                    if (filledPixels === 0) {
                        alert('채울 영역을 찾을 수 없습니다!');
                        return;
                    }
                }

                // 수정된 데이터 적용
                ctx.putImageData(imageData, 0, 0);

                // PNG로 변환
                const filledImage = canvas.toDataURL('image/png');

                // 레이어 업데이트
                const updatedElements = canvasElements.map(el => {
                    if (el.id === selectedElement) {
                        return { ...el, content: filledImage };
                    }
                    return el;
                });

                updateCurrentPageElements(updatedElements);
                alert('색 채우기가 완료되었습니다!');
            };

            img.onerror = () => {
                alert('이미지를 불러올 수 없습니다!');
            };

            img.src = element.content;
        }
    };

    // 요소 이동
    const moveElement = (id, deltaX, deltaY) => {
        const updatedElements = canvasElements.map(el =>
            el.id === id ? { ...el, x: el.x + deltaX, y: el.y + deltaY } : el
        );
        updateCurrentPageElements(updatedElements);
    };

    // 요소 리사이즈
    const resizeElement = (id, deltaX, deltaY, handle) => {
        const updatedElements = canvasElements.map(el => {
            if (el.id !== id) return el;
            
            let newWidth = el.width;
            let newHeight = el.height;
            let newX = el.x;
            let newY = el.y;
            
            // 현재 비율
            const aspectRatio = el.width / el.height;
            
            // Drawing의 선 타입 특수 처리
            if (el.type === 'drawing' && el.drawingData && el.drawingData.type === 'line') {
                if (handle === 'line-start') {
                    // 시작점 이동
                    newX = el.x + deltaX;
                    newY = el.y + deltaY;
                    // 끝점 상대 위치 유지 (실제로는 width/height 변경)
                    newWidth = el.width - deltaX;
                    newHeight = el.height - deltaY;
                } else if (handle === 'line-end') {
                    // 끝점 이동
                    newWidth = el.width + deltaX;
                    newHeight = el.height + deltaY;
                    // 시작점 고정
                }
                
                return { ...el, width: newWidth, height: newHeight, x: newX, y: newY };
            }
            
            switch(handle) {
                // 모서리 핸들 (자유 리사이즈)
                case 'se':
                    newWidth = Math.max(50, el.width + deltaX);
                    newHeight = Math.max(50, el.height + deltaY);
                    break;
                case 'sw':
                    newWidth = Math.max(50, el.width - deltaX);
                    newHeight = Math.max(50, el.height + deltaY);
                    if (newWidth > 50) newX = el.x + deltaX;
                    break;
                case 'ne':
                    newWidth = Math.max(50, el.width + deltaX);
                    newHeight = Math.max(50, el.height - deltaY);
                    if (newHeight > 50) newY = el.y + deltaY;
                    break;
                case 'nw':
                    newWidth = Math.max(50, el.width - deltaX);
                    newHeight = Math.max(50, el.height - deltaY);
                    if (newWidth > 50) newX = el.x + deltaX;
                    if (newHeight > 50) newY = el.y + deltaY;
                    break;
                    
                // 변 중앙 핸들 (비율 유지 + 기준선 고정)
                case 'n': // 위 - 아래 경계선 고정
                    newHeight = Math.max(50, el.height - deltaY);
                    newWidth = newHeight * aspectRatio;
                    newY = el.y + deltaY;
                    newX = el.x + (el.width - newWidth) / 2;
                    break;
                case 's': // 아래 - 위 경계선 고정
                    newHeight = Math.max(50, el.height + deltaY);
                    newWidth = newHeight * aspectRatio;
                    // y는 유지 (위쪽 고정)
                    newX = el.x + (el.width - newWidth) / 2;
                    break;
                case 'e': // 오른쪽 - 왼쪽 경계선 고정
                    newWidth = Math.max(50, el.width + deltaX);
                    newHeight = newWidth / aspectRatio;
                    // x는 유지 (왼쪽 고정)
                    newY = el.y + (el.height - newHeight) / 2;
                    break;
                case 'w': // 왼쪽 - 오른쪽 경계선 고정
                    newWidth = Math.max(50, el.width - deltaX);
                    newHeight = newWidth / aspectRatio;
                    newX = el.x + deltaX;
                    newY = el.y + (el.height - newHeight) / 2;
                    break;
                default:
                    break;
            }
            
            return { ...el, width: newWidth, height: newHeight, x: newX, y: newY };
        });
        
        // Drawing 타입이면 재생성
        const finalElements = updatedElements.map(el => {
            if (el.type === 'drawing' && el.drawingData && el.id === id) {
                const newImageData = regenerateDrawing(
                    el.drawingData,
                    el.width,
                    el.height,
                    activeProject.canvasSize
                );
                return { ...el, content: newImageData };
            }
            return el;
        });
        
        updateCurrentPageElements(finalElements);
    };

    // 레이어 순서 변경
    const moveLayer = (index, direction) => {
        const newElements = [...canvasElements];
        if (direction === 'up' && index < newElements.length - 1) {
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        } else if (direction === 'down' && index > 0) {
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }
        updateCurrentPageElements(newElements);
    };

    // 레이어 삭제
    const deleteLayer = (id) => {
        const updatedElements = canvasElements.filter(el => el.id !== id);
        updateCurrentPageElements(updatedElements);
        
        if (selectedElement === id) {
            setSelectedElement(null);
        }
    };

    // 키보드 단축키
    useEffect(() => {
        const handleKeyDown = (e) => {
            // input, textarea에서는 동작하지 않도록
            const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            
            // Ctrl+Z: 실행 취소
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInputField) {
                e.preventDefault();
                handleUndo();
                return;
            }
            
            // Ctrl+Shift+Z 또는 Ctrl+Y: 다시 실행
            if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y') && !isInputField) {
                e.preventDefault();
                handleRedo();
                return;
            }
            
            // Ctrl+C: 복사 (클립보드에 저장)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement && !isInputField) {
                e.preventDefault();
                const element = canvasElements.find(el => el.id === selectedElement);
                if (element) {
                    localStorage.setItem('copiedElement', JSON.stringify(element));
                }
                return;
            }
            
            // Ctrl+V: 붙여넣기
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isInputField) {
                e.preventDefault();
                const copiedElement = localStorage.getItem('copiedElement');
                if (copiedElement) {
                    const element = JSON.parse(copiedElement);
                    const newElement = {
                        ...element,
                        id: Date.now(),
                        x: element.x + 20,
                        y: element.y + 20
                    };
                    const updatedElements = [...canvasElements, newElement];
                    updateCurrentPageElements(updatedElements);
                    setSelectedElement(newElement.id);
                }
                return;
            }
            
            // Ctrl+D: 복제
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement && !isInputField) {
                e.preventDefault();
                duplicateLayer(selectedElement);
                return;
            }
            
            // Ctrl+A: 전체 선택 (첫 번째 요소 선택)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isInputField) {
                e.preventDefault();
                if (canvasElements.length > 0) {
                    setSelectedElement(canvasElements[canvasElements.length - 1].id);
                }
                return;
            }
            
            // Arrow 키: 이동 (1px 또는 10px)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElement && !isInputField) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                let deltaX = 0;
                let deltaY = 0;
                
                switch(e.key) {
                    case 'ArrowUp': deltaY = -step; break;
                    case 'ArrowDown': deltaY = step; break;
                    case 'ArrowLeft': deltaX = -step; break;
                    case 'ArrowRight': deltaX = step; break;
                }
                
                const updatedElements = canvasElements.map(el =>
                    el.id === selectedElement
                        ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
                        : el
                );
                updateCurrentPageElements(updatedElements);
                return;
            }
            
            // Del 또는 Backspace: 삭제
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !isInputField) {
                e.preventDefault();
                deleteLayer(selectedElement);
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, canvasElements, historyIndex, history]);

    // 레이어 복사
    const duplicateLayer = (id) => {
        const element = canvasElements.find(el => el.id === id);
        if (!element) return;

        const newElement = {
            ...element,
            id: Date.now(),
            x: element.x + 20, // 약간 오프셋
            y: element.y + 20
        };

        const updatedElements = [...canvasElements, newElement];
        updateCurrentPageElements(updatedElements);
        setSelectedElement(newElement.id);
    };

    // 정렬 함수들
    const alignElements = (alignType) => {
        if (!selectedElement) return;
        
        const selectedEl = canvasElements.find(el => el.id === selectedElement);
        if (!selectedEl) return;
        
        // 캔버스 크기
        const canvasWidth = activeProject?.canvasSize === '1080x1080' ? 400 : 400;
        const canvasHeight = activeProject?.canvasSize === '1080x1080' ? 400 : 500;
        
        let updatedElements = [...canvasElements];
        
        switch(alignType) {
            case 'left': // 좌측 정렬
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement ? { ...el, x: 0 } : el
                );
                break;
            case 'center': // 중앙 정렬 (가로)
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement 
                        ? { ...el, x: (canvasWidth - el.width) / 2 } 
                        : el
                );
                break;
            case 'right': // 우측 정렬
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement 
                        ? { ...el, x: canvasWidth - el.width } 
                        : el
                );
                break;
            case 'top': // 상단 정렬
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement ? { ...el, y: 0 } : el
                );
                break;
            case 'middle': // 중앙 정렬 (세로)
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement 
                        ? { ...el, y: (canvasHeight - el.height) / 2 } 
                        : el
                );
                break;
            case 'bottom': // 하단 정렬
                updatedElements = canvasElements.map(el =>
                    el.id === selectedElement 
                        ? { ...el, y: canvasHeight - el.height } 
                        : el
                );
                break;
        }
        
        updateCurrentPageElements(updatedElements);
    };

    // 레이어 개별 저장
    const saveLayer = async (id) => {
        const element = canvasElements.find(el => el.id === id);
        if (!element) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 캔버스 크기 설정
        const [canvasWidth, canvasHeight] = activeProject.canvasSize.split('x').map(Number);
        const scaleX = canvasWidth / 400;
        const scaleY = activeProject.canvasSize === '1080x1080' ? canvasWidth / 400 : canvasHeight / 500;
        
        canvas.width = Math.round(element.width * scaleX);
        canvas.height = Math.round(element.height * scaleY);

        if (element.type === 'image') {
            await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.save();
                    
                    // 필터 적용
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
                    }
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                    resolve();
                };
                img.src = element.content;
            });
        } else if (element.type === 'text') {
            // 텍스트 렌더링
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const fontSize = (element.content.fontSize || 16) * scaleX;
            ctx.font = `${element.content.fontWeight || 'normal'} ${fontSize}px ${element.content.fontFamily || 'Noto Sans KR'}`;
            ctx.fillStyle = element.content.textColor || '#000000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const lines = element.content.content.split('\n');
            const lineHeight = fontSize * (element.content.lineHeight || 1.5);
            lines.forEach((line, i) => {
                ctx.fillText(line, 10, 10 + i * lineHeight);
            });
        }

        // 다운로드
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `layer-${element.id}.png`;
        link.href = dataURL;
        link.click();
    };

    // 텍스트 편집 시작
    const handleTextEdit = (element) => {
        if (element.type === 'text') {
            setEditingText(element);
        }
    };

    // 텍스트 저장
    const handleTextSave = (id, newText) => {
        const updatedElements = canvasElements.map(el => {
            if (el.id === id && el.type === 'text') {
                return {
                    ...el,
                    content: {
                        ...el.content,
                        content: newText
                    }
                };
            }
            return el;
        });
        updateCurrentPageElements(updatedElements);
        setEditingText(null);
    };

    // 줌 컨트롤
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 25, 50));
    };

    const handleZoomReset = () => {
        setZoomLevel(100);
    };

    const handleZoomChange = (level) => {
        setZoomLevel(level);
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <Sidebar
                projects={projects}
                activeProject={activeProject}
                onProjectSelect={handleProjectSelect}
                onNewProject={handleNewProject}
                onProjectDelete={handleProjectDelete}
                onExport={() => setShowExportPanel(true)}
                user={user}
                onLogin={() => setShowAuthModal(true)}
            />

            {/* Main Content */}
            <div className="main-content">
                {activeProject ? (
                    <>
                        {/* Top Bar */}
                        <div className="top-bar">
                            <WorkflowSteps
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                                onStepClick={setCurrentStep}
                            />
                        </div>

                        {/* Page Manager */}
                        <PageManager
                            pages={pages}
                            currentPage={currentPageId}
                            onPageAdd={handlePageAdd}
                            onPageDelete={handlePageDelete}
                            onPageSelect={handlePageSelect}
                        />

                        <div className="workspace">
                            {/* Canvas */}
                            <Canvas
                                canvasSize={activeProject.canvasSize}
                                backgroundColor={activeProject.backgroundColor || '#ffffff'}
                                elements={canvasElements}
                                selectedElement={selectedElement}
                                onElementSelect={setSelectedElement}
                                onElementMove={moveElement}
                                onElementResize={resizeElement}
                                onTextEdit={handleTextEdit}
                                zoomLevel={zoomLevel}
                                onZoomIn={handleZoomIn}
                                onZoomOut={handleZoomOut}
                                onZoomReset={handleZoomReset}
                                onZoomChange={handleZoomChange}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                canUndo={historyIndex > 0}
                                canRedo={historyIndex < history.length - 1}
                                guideSettings={guideSettings}
                                drawingSettings={drawingSettings}
                                onAddDrawing={addElement}
                                cropSettings={cropSettings}
                                onCropAreaChange={(area) => handleCrop({ type: 'set-area', area })}
                                floodFillSettings={floodFillSettings}
                                onFloodFill={handleFloodFill}
                            />

                            {/* Control Panel */}
                            <div className="control-panel">
                                {currentStep === 1 && (
                                    <CharacterPanel
                                        option={characterOption}
                                        setOption={setCharacterOption}
                                        onComplete={handleStepComplete}
                                        onAdd={addElement}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <BackgroundPanel
                                        option={backgroundOption}
                                        setOption={setBackgroundOption}
                                        onComplete={handleStepComplete}
                                        onAdd={addElement}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <TextPanel
                                        content={textContent}
                                        setContent={setTextContent}
                                        onAdd={addElement}
                                    />
                                )}
                                {currentStep === 4 && (
                                    <ImageEditPanel
                                        onAdd={addElement}
                                    />
                                )}

                                {/* Layers Panel */}
                                <LayersPanel
                                    elements={canvasElements}
                                    selectedElement={selectedElement}
                                    onElementSelect={setSelectedElement}
                                    onLayerMove={moveLayer}
                                    onLayerDelete={deleteLayer}
                                    onTextEdit={handleTextEdit}
                                    onLayerDuplicate={duplicateLayer}
                                    onLayerSave={saveLayer}
                                    onAlign={alignElements}
                                />
                                
                                {/* Canvas Guide Panel */}
                                <CanvasGuidePanel
                                    guideSettings={guideSettings}
                                    onGuideChange={setGuideSettings}
                                />
                                
                                {/* Drawing Panel */}
                                <DrawingPanel
                                    drawingSettings={drawingSettings}
                                    onDrawingChange={setDrawingSettings}
                                />
                                
                                {/* Color Remover Panel */}
                                <ColorRemoverPanel
                                    onRemoveColor={removeColor}
                                />
                                
                                {/* Image Cropper Panel */}
                                <ImageCropperPanel
                                    onCrop={handleCrop}
                                />
                                
                                {/* Flood Fill Panel */}
                                <FloodFillPanel
                                    onFloodFill={handleFloodFill}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="canvas-area">
                        <div className="empty-state">
                            <h2>프로젝트를 선택하거나 새로 만들어보세요</h2>
                            <p>왼쪽 사이드바에서 시작하세요</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Canvas Size Modal */}
            <CanvasSizeModal
                show={showCanvasSizeModal}
                onClose={() => setShowCanvasSizeModal(false)}
                onConfirm={createProject}
                selectedSize={selectedCanvasSize}
                setSelectedSize={setSelectedCanvasSize}
                selectedBgColor={selectedBgColor}
                setSelectedBgColor={setSelectedBgColor}
            />

            {/* Export Panel */}
            {showExportPanel && activeProject && (
                <ExportPanel
                    pages={pages}
                    currentPageId={currentPageId}
                    canvasSize={activeProject.canvasSize}
                    backgroundColor={activeProject.backgroundColor || '#ffffff'}
                    onClose={() => setShowExportPanel(false)}
                />
            )}

            {/* Text Edit Modal */}
            {editingText && (
                <TextEditModal
                    element={editingText}
                    onSave={handleTextSave}
                    onClose={() => setEditingText(null)}
                />
            )}

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}

            {/* Firebase 연결 테스트 (개발 모드) */}
            {process.env.NODE_ENV === 'development' && <FirebaseTest />}
        </div>
    );
}

export default App;
