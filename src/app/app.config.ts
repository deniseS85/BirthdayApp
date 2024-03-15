import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { initializeApp } from "firebase/app";
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  apiKey: "AIzaSyAINIttSGkndoCZOg1qE5drUZx-O7rDX24",
  authDomain: "birthday-3b28e.firebaseapp.com",
  projectId: "birthday-3b28e",
  storageBucket: "birthday-3b28e.appspot.com",
  messagingSenderId: "285404960491",
  appId: "1:285404960491:web:daab3724275e868c7f10ae",
  measurementId: "G-F2CBEHLSPC"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideAnimationsAsync(),
    importProvidersFrom([
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideFirestore(() => getFirestore()),
    ]), provideAnimationsAsync(), provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
]
};
