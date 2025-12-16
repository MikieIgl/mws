import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { appRoutes } from './app.routes';

const firebaseConfig = {
  apiKey: 'AIzaSyDvYOz2bIQUA8j4FAOhpe6h3BWbohun34g',
  authDomain: 'mws-ai.firebaseapp.com',
  projectId: 'mws-ai',
  storageBucket: 'mws-ai.firebasestorage.app',
  messagingSenderId: '202240356106',
  appId: '1:202240356106:web:e42a9b7ddd37b8e7b614f3',
  measurementId: 'G-4T6MVE4EPD',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
  ],
};
