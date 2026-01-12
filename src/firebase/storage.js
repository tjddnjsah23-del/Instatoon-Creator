import { ref, uploadString, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';

/**
 * Firebase Storage 구조:
 * users/{userId}/projects/{projectId}/images/{imageId}.png
 */

// Base64를 압축하여 용량 줄이기 (PNG 투명도 보존)
const compressBase64Image = (base64String, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // 최대 너비 제한
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 원본 형식 감지
            const isPNG = base64String.includes('data:image/png');
            
            if (isPNG) {
                // PNG - 투명도 보존 (압축 없음, quality 무시)
                const compressedBase64 = canvas.toDataURL('image/png');
                console.log('🖼️ PNG 형식 유지 (투명도 보존)');
                resolve(compressedBase64);
            } else {
                // JPEG - 압축 적용
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                console.log('🖼️ JPEG 압축 적용');
                resolve(compressedBase64);
            }
        };
        img.onerror = reject;
        img.src = base64String;
    });
};

// 이미지를 Firebase Storage에 업로드 (자동 압축)
export const uploadImage = async (userId, projectId, imageId, base64Data, options = {}) => {
    try {
        const { compress = true, maxWidth = 1920, quality = 0.85 } = options;
        
        // base64Data 유효성 검사
        if (!base64Data || typeof base64Data !== 'string') {
            console.error('❌ 잘못된 이미지 데이터:', imageId);
            return { success: false, error: 'Invalid base64 data' };
        }
        
        // 자동 압축
        let uploadData = base64Data;
        if (compress && base64Data.includes('data:image')) {
            try {
                console.log('🗜️ 이미지 압축 중...');
                const compressed = await compressBase64Image(base64Data, maxWidth, quality);
                const originalSize = base64Data.length;
                const compressedSize = compressed.length;
                
                // 압축 효과 확인
                if (compressedSize < originalSize) {
                    // 압축 성공 - 더 작아짐
                    uploadData = compressed;
                    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                    console.log(`✅ 압축 성공: ${reduction}% 감소 (${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB)`);
                } else {
                    // 압축 후 더 커짐 - 원본 사용
                    uploadData = base64Data;
                    const increase = ((compressedSize / originalSize - 1) * 100).toFixed(1);
                    console.log(`ℹ️ 원본 사용: 압축 시 ${increase}% 증가 (${(originalSize / 1024).toFixed(0)}KB 유지)`);
                }
            } catch (compressError) {
                console.warn('⚠️ 압축 실패, 원본 사용:', compressError);
                uploadData = base64Data;
            }
        }

        // 원본 형식 감지
        const isPNG = uploadData.includes('data:image/png');
        const fileExtension = isPNG ? 'png' : 'jpg';
        
        // Storage 경로: users/{userId}/projects/{projectId}/images/{imageId}.{ext}
        const imagePath = `users/${userId}/projects/${projectId}/images/${imageId}.${fileExtension}`;
        const imageRef = ref(storage, imagePath);
        
        console.log(`📁 저장 형식: ${fileExtension.toUpperCase()}`);

        // Base64 업로드 (재시도 로직 포함)
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
            try {
                await uploadString(imageRef, uploadData, 'data_url');
                const downloadURL = await getDownloadURL(imageRef);
                console.log('✅ 이미지 업로드 성공:', imageId);
                return { success: true, url: downloadURL, path: imagePath };
            } catch (error) {
                lastError = error;
                retries--;
                if (retries > 0) {
                    console.log(`⚠️ 업로드 재시도 중... (${3 - retries}/3)`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
                }
            }
        }

        throw lastError;

    } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        return { success: false, error: error.message };
    }
};

// 여러 이미지 동시 업로드 (병렬 처리)
export const uploadMultipleImages = async (userId, projectId, imageElements, options = {}) => {
    try {
        console.log(`📤 이미지 ${imageElements.length}개 업로드 시작...`);
        
        const uploadPromises = imageElements.map(element => {
            // content.src 또는 content 자체가 base64일 수 있음
            const base64Data = element.content?.src || element.content;
            return uploadImage(userId, projectId, element.id, base64Data, options);
        });

        const results = await Promise.allSettled(uploadPromises);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

        console.log(`✅ 업로드 완료: ${successful.length}개 성공, ${failed.length}개 실패`);

        // 성공한 이미지들의 URL 매핑
        const urlMap = {};
        imageElements.forEach((element, index) => {
            const result = results[index];
            if (result.status === 'fulfilled' && result.value.success) {
                urlMap[element.id] = result.value.url;
                console.log(`🔗 URL 매핑: ${element.id} → ${result.value.url.substring(0, 50)}...`);
            } else {
                console.warn(`⚠️ URL 매핑 실패: ${element.id}`);
            }
        });
        
        console.log(`📊 urlMap 생성 완료: ${Object.keys(urlMap).length}개`);

        return { 
            success: true, 
            urlMap,
            successCount: successful.length,
            failCount: failed.length
        };
    } catch (error) {
        console.error('❌ 다중 이미지 업로드 실패:', error);
        return { success: false, error: error.message };
    }
};

// 이미지 다운로드 URL 가져오기
export const getImageURL = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath);
        const url = await getDownloadURL(imageRef);
        return { success: true, url };
    } catch (error) {
        console.error('❌ 이미지 URL 가져오기 실패:', error);
        return { success: false, error: error.message };
    }
};

// 프로젝트의 모든 이미지 삭제
export const deleteProjectImages = async (userId, projectId) => {
    try {
        const projectImagesPath = `users/${userId}/projects/${projectId}/images`;
        const projectImagesRef = ref(storage, projectImagesPath);

        // 모든 이미지 목록 가져오기
        const imagesList = await listAll(projectImagesRef);

        // 모든 이미지 삭제
        const deletePromises = imagesList.items.map(itemRef => deleteObject(itemRef));
        await Promise.all(deletePromises);

        console.log(`🗑️ 프로젝트 ${projectId}의 이미지 ${imagesList.items.length}개 삭제 완료`);
        return { success: true, count: imagesList.items.length };
    } catch (error) {
        // 폴더가 없으면 에러 무시
        if (error.code === 'storage/object-not-found') {
            console.log('ℹ️ 삭제할 이미지가 없음');
            return { success: true, count: 0 };
        }
        console.error('❌ 이미지 삭제 실패:', error);
        return { success: false, error: error.message };
    }
};

// 단일 이미지 삭제
export const deleteImage = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        console.log('🗑️ 이미지 삭제 완료:', imagePath);
        return { success: true };
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            console.log('ℹ️ 이미지가 이미 삭제됨');
            return { success: true };
        }
        console.error('❌ 이미지 삭제 실패:', error);
        return { success: false, error: error.message };
    }
};

// LocalStorage에서 Firebase Storage로 마이그레이션
export const migrateFromLocalStorage = async (userId, projectId) => {
    try {
        const localKey = `project_images_${projectId}`;
        const localData = localStorage.getItem(localKey);
        
        if (!localData) {
            console.log('ℹ️ LocalStorage에 마이그레이션할 데이터 없음');
            return { success: true, migrated: false };
        }

        const imageElements = JSON.parse(localData);
        console.log(`🔄 LocalStorage → Firebase Storage 마이그레이션 시작 (${imageElements.length}개)`);

        // Firebase Storage에 업로드
        const result = await uploadMultipleImages(userId, projectId, imageElements);

        if (result.success) {
            // 성공하면 LocalStorage 삭제
            localStorage.removeItem(localKey);
            console.log('✅ 마이그레이션 완료, LocalStorage 정리됨');
            return { 
                success: true, 
                migrated: true, 
                urlMap: result.urlMap,
                count: imageElements.length 
            };
        } else {
            console.warn('⚠️ 마이그레이션 실패, LocalStorage 유지');
            return { success: false, migrated: false };
        }
    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
        return { success: false, error: error.message, migrated: false };
    }
};
