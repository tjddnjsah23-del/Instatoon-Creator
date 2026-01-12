import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { 
    uploadMultipleImages, 
    deleteProjectImages, 
    migrateFromLocalStorage 
} from './storage';

/**
 * Firestore 데이터 구조 (Phase 6 - 페이지별 분할):
 * 
 * users/{userId}/projects/{projectId}
 * {
 *   id: string,
 *   name: string,
 *   canvasSize: string,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   pages: [
 *     {
 *       id: number,
 *       elements: [
 *         {
 *           id: number,
 *           type: string,
 *           x: number,
 *           y: number,
 *           width: number,
 *           height: number,
 *           content: object,
 *           ...
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

// 프로젝트 저장 (Phase 6: Firebase Storage + 페이지별 분할 저장)
// 프로젝트 저장 (Phase 6: Firebase Storage + 페이지별 분할 저장)
export const saveProject = async (userId, project) => {
    try {
        console.log('💾 프로젝트 저장 시작:', project.name);
        
        // 1단계: 모든 이미지 요소 추출
        const allImageElements = project.pages.flatMap((page, pageIndex) => 
            page.elements
                .filter(el => el.type === 'image')
                .map(el => ({ ...el, pageIndex }))
        );
        
        // 2단계: 기존 URL과 새 base64 분리
        let imageUrlMap = {};
        const newImageElements = [];
        
        allImageElements.forEach(el => {
            const src = el.content?.src || el.content;
            const isUrl = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));
            const isBase64 = typeof src === 'string' && src.startsWith('data:');
            
            if (isUrl) {
                // 이미 URL - 업로드 건너뛰고 URL 유지
                imageUrlMap[el.id] = src;
                console.log(`ℹ️ 이미 업로드됨: ${el.id}`);
            } else if (isBase64) {
                // base64 - 업로드 필요
                newImageElements.push(el);
                console.log(`📤 업로드 필요: ${el.id}`);
            } else {
                console.warn(`⚠️ 알 수 없는 형식: ${el.id}`, typeof src);
            }
        });
        
        console.log(`📊 전체 이미지: ${allImageElements.length}개, 업로드 필요: ${newImageElements.length}개`);
        
        // 3단계: 새 이미지만 Firebase Storage에 업로드
        if (newImageElements.length > 0) {
            console.log(`📤 새 이미지 ${newImageElements.length}개 업로드 중...`);
            
            const uploadResult = await uploadMultipleImages(
                userId, 
                project.id, 
                newImageElements,
                { compress: true, maxWidth: 1920, quality: 0.85 }
            );
            
            if (uploadResult.success) {
                // 새로 업로드된 URL을 기존 imageUrlMap에 병합
                imageUrlMap = { ...imageUrlMap, ...uploadResult.urlMap };
                console.log(`✅ 새 이미지 업로드 완료: ${uploadResult.successCount}개 성공`);
                console.log(`📊 전체 imageUrlMap:`, Object.keys(imageUrlMap));
                
                // LocalStorage 정리
                try {
                    localStorage.removeItem(`project_images_${project.id}`);
                    console.log('🗑️ LocalStorage 정리 완료');
                } catch (e) {
                    // 무시
                }
            } else {
                console.warn('⚠️ 새 이미지 업로드 실패, 기존 URL 유지...');
            }
        } else {
            console.log('ℹ️ 업로드할 새 이미지 없음, 기존 URL 유지');
        }
        
        console.log(`📊 최종 imageUrlMap: ${Object.keys(imageUrlMap).length}개`);
        
        // 4단계: Batch 생성
        const batch = writeBatch(db);
        const projectRef = doc(db, 'users', userId, 'projects', String(project.id));
        
        // 5단계: 프로젝트 메타데이터
        const existingDoc = await getDoc(projectRef);
        const projectMetadata = {
            id: project.id,
            name: project.name,
            canvasSize: project.canvasSize,
            backgroundColor: project.backgroundColor || '#ffffff', // 배경색 추가
            pageCount: project.pages.length,
            imageCount: allImageElements.length,
            updatedAt: serverTimestamp(),
            storageVersion: 'v2',
            _note: 'Images in Firebase Storage'
        };
        
        if (!existingDoc.exists()) {
            projectMetadata.createdAt = serverTimestamp();
        }
        
        batch.set(projectRef, projectMetadata, { merge: true });
        
        // 6단계: 각 페이지 저장
        for (let i = 0; i < project.pages.length; i++) {
            const page = project.pages[i];
            const pageRef = doc(db, 'users', userId, 'projects', String(project.id), 'pages', String(page.id));
            
            // page.elements 안전 체크
            if (!page.elements || !Array.isArray(page.elements)) {
                console.warn(`⚠️ 페이지 ${i} elements가 없음, 빈 배열로 초기화`);
                page.elements = [];
            }
            
            // 페이지 요소 처리 - undefined 완전 제거!
            const processedElements = page.elements
                .filter(element => element && element.type) // null/undefined 제거
                .map(element => {
                    if (element.type === 'image') {
                        const imageUrl = imageUrlMap[element.id];
                        
                        // 디버깅
                        if (!imageUrl) {
                            console.warn(`⚠️ 이미지 URL 없음: ${element.id}`);
                        } else {
                            console.log(`✅ 이미지 URL 매칭: ${element.id} → ${imageUrl.substring(0, 50)}...`);
                        }
                        
                        // base64 데이터 완전 제거! undefined도 제거!
                        const newContent = {
                            src: imageUrl || '',
                            alt: element.content?.alt || ''
                        };
                        
                        // URL 있으면 Storage 정보 추가
                        if (imageUrl) {
                            newContent._storageUrl = imageUrl;
                            newContent._compressed = true;
                        }
                        
                        // undefined 제거 - 명시적 기본값
                        return {
                            id: element.id || Date.now(),
                            type: 'image',
                            x: element.x ?? 0,
                            y: element.y ?? 0,
                            width: element.width ?? 100,
                            height: element.height ?? 100,
                            zIndex: element.zIndex ?? 1,
                            content: newContent
                        };
                    } else if (element.type === 'text') {
                        // 텍스트 요소 - undefined 제거
                        return {
                            id: element.id || Date.now(),
                            type: 'text',
                            x: element.x ?? 0,
                            y: element.y ?? 0,
                            width: element.width ?? 200,
                            height: element.height ?? 100,
                            zIndex: element.zIndex ?? 1,
                            content: {
                                text: element.content?.text || '',
                                fontSize: element.content?.fontSize || 16,
                                fontFamily: element.content?.fontFamily || 'Arial',
                                color: element.content?.color || '#000000',
                                align: element.content?.align || 'left',
                                bold: element.content?.bold || false,
                                italic: element.content?.italic || false
                            }
                        };
                    }
                    
                    // 다른 타입 요소 - undefined 제거
                    return {
                        id: element.id || Date.now(),
                        type: element.type || 'unknown',
                        x: element.x ?? 0,
                        y: element.y ?? 0,
                        width: element.width ?? 100,
                        height: element.height ?? 100,
                        zIndex: element.zIndex ?? 1,
                        content: element.content || {}
                    };
                });
            
            console.log(`📝 페이지 ${i} 요소 처리 완료: ${processedElements.length}개`);
            
            const pageData = {
                id: page.id,
                pageIndex: i,
                elements: processedElements,
                elementCount: processedElements.length,
                updatedAt: serverTimestamp()
            };
            
            batch.set(pageRef, pageData);
        }
        
        // 7단계: 일괄 저장
        await batch.commit();
        console.log('✅ 프로젝트 저장 성공:', project.name);
        return { success: true };
        
    } catch (error) {
        console.error('❌ 프로젝트 저장 실패:', error);
        
        // 에러 타입별 메시지
        if (error.message.includes('exceeds the limit')) {
            console.error('💾 데이터 크기 제한 초과');
        } else if (error.message.includes('permission')) {
            console.error('🔒 권한 오류: Firestore/Storage 규칙 확인 필요');
        } else if (error.message.includes('network')) {
            console.error('🌐 네트워크 오류: 인터넷 연결 확인');
        } else if (error.message.includes('batch')) {
            console.error('📝 Batch 오류: 저장 중 문제 발생');
        }
        
        return { success: false, error: error.message };
    }
};

// 프로젝트 불러오기 (Phase 6: 페이지별 분할 로딩)
export const loadProject = async (userId, projectId) => {
    try {
        console.log('📂 프로젝트 불러오기 시작:', projectId);
        
        // 1단계: 프로젝트 메타데이터 로드
        const projectRef = doc(db, 'users', userId, 'projects', String(projectId));
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            console.log('❌ 프로젝트를 찾을 수 없음:', projectId);
            return { success: false, error: '프로젝트를 찾을 수 없습니다.' };
        }

        const projectData = projectSnap.data();
        const storageVersion = projectData.storageVersion || 'v1';
        
        // 2단계: LocalStorage 마이그레이션 (v1 프로젝트용)
        if (storageVersion === 'v1') {
            console.log('🔄 구버전 프로젝트 감지, 마이그레이션 시작...');
            const migrationResult = await migrateFromLocalStorage(userId, projectId);
            if (migrationResult.migrated) {
                console.log('✅ 마이그레이션 완료, 다시 로드...');
                // 마이그레이션 후 다시 로드
                return loadProject(userId, projectId);
            }
        }
        
        // 3단계: 페이지별로 로드
        const pagesRef = collection(db, 'users', userId, 'projects', String(projectId), 'pages');
        const pagesSnapshot = await getDocs(pagesRef);
        
        const pages = [];
        pagesSnapshot.forEach((doc) => {
            pages.push(doc.data());
        });
        
        // 페이지 정렬 (pageIndex 순서대로)
        pages.sort((a, b) => a.pageIndex - b.pageIndex);
        
        console.log(`✅ 프로젝트 불러오기 성공: ${projectData.name} (${pages.length}페이지)`);
        
        return { 
            success: true, 
            project: {
                id: projectData.id,
                name: projectData.name,
                canvasSize: projectData.canvasSize,
                backgroundColor: projectData.backgroundColor || '#ffffff', // 배경색 추가 (기본값 흰색)
                pages: pages,
                date: projectData.updatedAt?.toDate().toLocaleDateString('ko-KR') || new Date().toLocaleDateString('ko-KR'),
                storageVersion: storageVersion
            }
        };
        
    } catch (error) {
        console.error('❌ 프로젝트 불러오기 실패:', error);
        return { success: false, error: error.message };
    }
};

// 모든 프로젝트 불러오기 (Phase 6: 메타데이터만 로드)
export const loadAllProjects = async (userId) => {
    try {
        console.log('📂 프로젝트 목록 불러오기 시작...');
        
        const projectsRef = collection(db, 'users', userId, 'projects');
        const q = query(projectsRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const projects = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // 메타데이터만 저장 (페이지는 개별 로드 시 불러옴)
            projects.push({
                id: data.id,
                name: data.name,
                canvasSize: data.canvasSize,
                backgroundColor: data.backgroundColor || '#ffffff', // 배경색 추가 (기본값 흰색)
                pageCount: data.pageCount || 0,
                imageCount: data.imageCount || 0,
                date: data.updatedAt?.toDate().toLocaleDateString('ko-KR') || new Date().toLocaleDateString('ko-KR'),
                storageVersion: data.storageVersion || 'v1',
                pages: [] // 빈 배열 (나중에 로드)
            });
        });

        console.log(`✅ 프로젝트 ${projects.length}개 불러오기 성공`);
        return { success: true, projects };
    } catch (error) {
        console.error('❌ 프로젝트 불러오기 실패:', error);
        return { success: false, error: error.message, projects: [] };
    }
};

// 프로젝트 삭제 (Phase 6: Storage + 페이지 서브컬렉션 삭제)
export const deleteProject = async (userId, projectId) => {
    try {
        console.log('🗑️ 프로젝트 삭제 시작:', projectId);
        
        // 1단계: Firebase Storage 이미지 삭제
        await deleteProjectImages(userId, projectId);
        
        // 2단계: 페이지 서브컬렉션 삭제
        const pagesRef = collection(db, 'users', userId, 'projects', String(projectId), 'pages');
        const pagesSnapshot = await getDocs(pagesRef);
        
        const batch = writeBatch(db);
        pagesSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        // 3단계: 프로젝트 메인 문서 삭제
        const projectRef = doc(db, 'users', userId, 'projects', String(projectId));
        batch.delete(projectRef);
        
        await batch.commit();
        
        // 4단계: LocalStorage 정리
        try {
            localStorage.removeItem(`project_images_${projectId}`);
            console.log('🗑️ LocalStorage 정리 완료');
        } catch (localError) {
            // 무시
        }
        
        console.log('✅ 프로젝트 삭제 성공:', projectId);
        return { success: true };
    } catch (error) {
        console.error('❌ 프로젝트 삭제 실패:', error);
        return { success: false, error: error.message };
    }
};

// 프로젝트 이름 변경
export const renameProject = async (userId, projectId, newName) => {
    try {
        const projectRef = doc(db, 'users', userId, 'projects', String(projectId));
        await updateDoc(projectRef, {
            name: newName,
            updatedAt: serverTimestamp()
        });
        
        console.log('✅ 프로젝트 이름 변경 성공:', newName);
        return { success: true };
    } catch (error) {
        console.error('❌ 프로젝트 이름 변경 실패:', error);
        return { success: false, error: error.message };
    }
};

// 페이지 저장 (개별)
export const savePage = async (userId, projectId, page) => {
    try {
        const projectRef = doc(db, 'users', userId, 'projects', String(projectId));
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            const pages = projectData.pages || [];
            
            // 페이지 업데이트 또는 추가
            const pageIndex = pages.findIndex(p => p.id === page.id);
            if (pageIndex >= 0) {
                pages[pageIndex] = page;
            } else {
                pages.push(page);
            }

            await updateDoc(projectRef, {
                pages: pages,
                updatedAt: serverTimestamp()
            });

            console.log('✅ 페이지 저장 성공');
            return { success: true };
        } else {
            return { success: false, error: '프로젝트를 찾을 수 없습니다.' };
        }
    } catch (error) {
        console.error('❌ 페이지 저장 실패:', error);
        return { success: false, error: error.message };
    }
};
