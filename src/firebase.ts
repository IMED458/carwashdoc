/**
 * Firebase ინიციალიზაცია — მთელი აპლიკაციის მონაცემები ინახება Firestore-ზე.
 * ლოკალურად (localStorage-ში) ინახება მხოლოდ აქტიური სესიის მომხმარებლის ID.
 */
import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDf3ZpDjMnQxvfxxfNEeYPhvaVvIiTIuOE',
  authDomain: 'carwashdocflow.firebaseapp.com',
  projectId: 'carwashdocflow',
  storageBucket: 'carwashdocflow.firebasestorage.app',
  messagingSenderId: '680786871183',
  appId: '1:680786871183:web:735619d89549d8c7b5c1fa',
  measurementId: 'G-84WQ1C51MN',
};

export const app = initializeApp(firebaseConfig);

// auto-detect long-polling — უფრო საიმედოა proxy-ების/ქსელური შეზღუდვების პირობებში,
// სადაც Firestore-ის streaming (WebChannel) იბლოკება.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);
