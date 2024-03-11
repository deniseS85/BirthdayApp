import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { collection, doc } from 'firebase/firestore';
import { Birthday } from './models/birthday.class';

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {
  firestore: Firestore = inject(Firestore);
  birthdayList: Birthday[] = [];

  constructor(private router: Router) { }

  getBirthdayRef() {
    return collection(this.firestore, 'birthdays');
  }

  getBirthdayID(birthdayID: string) {
      return doc(collection(this.firestore, 'birthdays'), birthdayID)
  }

  goBack(): void {
      this.router.navigate(['/']);
  }
}
