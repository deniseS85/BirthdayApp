import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Birthday } from '../models/birthday.class';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { addDoc } from "firebase/firestore"; 
import { BirthdayService } from '../birthday.service';


@Component({
  selector: 'app-add-birthday',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule, MatInputModule, MatDialogModule, ReactiveFormsModule, MatNativeDateModule, MatProgressBarModule, MatSelectModule],
  templateUrl: './add-birthday.component.html',
  styleUrl: './add-birthday.component.scss'
})
export class AddBirthdayComponent {

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months: string[] = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
  hideRequired = "true";
  loading = false;
  birthday = new Birthday();
  firestore: Firestore = inject(Firestore);
  
  constructor(public dialogRef: MatDialogRef<AddBirthdayComponent>, private bDayService: BirthdayService) {}

  async saveBirthday() {
      this.loading = true;

      const birthdayData = {
        ...this.birthday.toJSON(),
        month: this.getFullMonthName(this.birthday.month)
      };
    
      let docRef = await addDoc(this.bDayService.getBirthdayRef(), birthdayData);
      await updateDoc(doc(this.bDayService.getBirthdayRef(), docRef.id), { id: docRef.id });
    
      this.loading = false;
      this.dialogRef.close({ ...birthdayData, id: docRef.id });
  }

    
  getFullMonthName(shortMonth: string): string {
      let monthIndex = this.months.indexOf(shortMonth);
      return new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(2000, monthIndex, 1));
  }

}