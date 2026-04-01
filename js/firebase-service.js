import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDjZYQ6S3xiVRoi3knOIuI9VByUTXD0uOQ",
    authDomain: "harleythegame.firebaseapp.com",
    projectId: "harleythegame",
    storageBucket: "harleythegame.firebasestorage.app",
    messagingSenderId: "1046930684228",
    appId: "1:1046930684228:web:2e38d3b6c17e8e06d57f11"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SCORES_COLLECTION = 'highscores';

export async function submitGlobalScore(name, score) {
    try {
        await addDoc(collection(db, SCORES_COLLECTION), {
            name: String(name || 'Anoniem').trim() || 'Anoniem',
            score: Number(score),
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.warn('Firebase submitGlobalScore failed:', e);
    }
}

export async function getTopScores(limitCount = 50) {
    try {
        const q = query(
            collection(db, SCORES_COLLECTION),
            orderBy('score', 'desc'),
            limit(Math.min(limitCount, 50))
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return { name: d.name || '—', score: d.score != null ? d.score : 0 };
        });
    } catch (e) {
        console.warn('Firebase getTopScores failed:', e);
        return [];
    }
}