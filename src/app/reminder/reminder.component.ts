import { Component, inject } from '@angular/core';
import { BirthdayService } from '../birthday.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Birthday } from '../models/birthday.class';
import { Firestore, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-reminder',
  standalone: true,
  imports: [MatSelectModule,FormsModule],
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss'
})
export class ReminderComponent {
    firestore: Firestore = inject(Firestore);
    birthdayList: any = [];
    birthdayDates: any[] = [];
    unsubList;
    hours: number[] = Array.from({ length: 9 }, (_, i) => i + 10);  
    selectedTime: string = ''; 
    reminders = [
        { label: 'Am Geburtstag', isChecked: false },
        { label: '1 Tag vorher', isChecked: false }
    ];

    month: string[] = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

    constructor(public bDayService: BirthdayService) {
        this.unsubList = this.getBirthdayList(); 
    }

    ngOnDestroy(){
        this.unsubList();
    }

    getBirthdayList() {
        return onSnapshot(this.bDayService.getBirthdayRef(), (list) => {
            this.birthdayList = [];
            this.birthdayDates = [];
            list.forEach(element => {
                const birthday = new Birthday().setBirthdayObject(element.data(), element.id);
                this.birthdayList.push(birthday);
                this.birthdayDates.push({
                    day: birthday.day,
                    month: birthday.month
                });
            });
        });
    }

  

    getBirthdayDates(reminder: { label: string, isChecked: boolean }): void {
        if (reminder.isChecked) {
            this.checkNotifications(reminder.label, this.selectedTime); 
        } 
    }

    checkNotifications(reminderDate: string, selectTime: string): void {
        let timeParts = selectTime.split(':');
        let hours = parseInt(timeParts[0], 10);
        let minutes = parseInt(timeParts[1], 10);
    
        this.birthdayDates.forEach((birthday: any) => {
            let currentYear = new Date().getFullYear();
            let monthIndex = this.month.indexOf(birthday.month);
            let birthdayDate = new Date(currentYear, monthIndex, parseInt(birthday.day), hours, minutes);
            
            if (reminderDate === 'Am Geburtstag') {
                if (birthdayDate < new Date()) {
                    birthdayDate.setFullYear(currentYear + 1);
                }
                console.log(`Benachrichtigung Am Geburtstag:`, birthdayDate);
            } else if (reminderDate === '1 Tag vorher') {
                let oneDayBefore = new Date(birthdayDate.getTime());
                oneDayBefore.setDate(oneDayBefore.getDate() - 1);
                console.log(`Benachrichtigung 1 Tag davor:`, oneDayBefore);
            }
        });
    }
}