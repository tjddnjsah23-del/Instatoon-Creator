import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

function FirebaseTest() {
    const [connectionStatus, setConnectionStatus] = useState('테스트 중...');
    const [testData, setTestData] = useState([]);

    useEffect(() => {
        testFirebaseConnection();
    }, []);

    const testFirebaseConnection = async () => {
        try {
            // 1. Firestore에 테스트 데이터 쓰기
            const testCollection = collection(db, 'test');
            const docRef = await addDoc(testCollection, {
                message: 'Firebase 연결 테스트',
                timestamp: serverTimestamp(),
                status: 'success'
            });

            console.log('✅ 테스트 문서 생성:', docRef.id);

            // 2. Firestore에서 테스트 데이터 읽기
            const querySnapshot = await getDocs(testCollection);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });

            setTestData(data);
            setConnectionStatus('✅ Firebase 연결 성공!');
            console.log('✅ Firebase 연결 성공!');
            console.log('📄 데이터:', data);

        } catch (error) {
            setConnectionStatus('❌ Firebase 연결 실패');
            console.error('❌ Firebase 연결 실패:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            border: '2px solid #6366f1',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '300px'
        }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#6366f1' }}>
                🔥 Firebase 연결 테스트
            </h3>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                상태: {connectionStatus}
            </div>
            {testData.length > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <div>📊 테스트 데이터: {testData.length}개</div>
                    <div style={{ marginTop: '8px', maxHeight: '150px', overflow: 'auto' }}>
                        {testData.map((item, index) => (
                            <div key={item.id} style={{ 
                                background: '#f3f4f6', 
                                padding: '8px', 
                                borderRadius: '4px',
                                marginBottom: '4px'
                            }}>
                                <div>#{index + 1}</div>
                                <div>ID: {item.id.substring(0, 8)}...</div>
                                <div>메시지: {item.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button
                onClick={testFirebaseConnection}
                style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                🔄 다시 테스트
            </button>
        </div>
    );
}

export default FirebaseTest;
