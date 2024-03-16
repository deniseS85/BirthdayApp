import { Component, OnInit, inject } from '@angular/core';
import { BirthdayService } from '../birthday.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Birthday } from '../models/birthday.class';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-reminder',
  standalone: true,
  imports: [MatSelectModule,FormsModule],
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss'
})
export class ReminderComponent implements OnInit {
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

    private readonly VAPID_PUBLIC_KEY = 'BMY-zIhG5oXDNYHetg_TBZ_AJ6Pnxfi8gLphglG6Iyo_bWAERH-UW_r-X1B_dzVFxl061S6MgslNXXVdLklPczo';

    month: string[] = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

    constructor(public bDayService: BirthdayService, private swPush: SwPush) {
        this.unsubList = this.getBirthdayList(); 
    }

    ngOnInit(): void {
       this.swPush.messages.subscribe((message: any) => {
          console.log(message);
       })
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
                    month: birthday.month,
                    firstname: birthday.firstname,
                    lastname: birthday.lastname
                });
            });
        });
    }

    getBirthdayDates(reminder: { label: string, isChecked: boolean }): void {
        if (reminder.isChecked) {
            this.checkNotifications(reminder.label, this.selectedTime); 
            this.requestSubscription();
        } 
    }

  

    checkNotifications(reminderDate: string, selectTime: string): void {
        let today = new Date();
        let currentYear = today.getFullYear();
        let currentMonth = today.getMonth();
        let currentDay = today.getDate();
        let selectedHour = parseInt(selectTime.split(':')[0], 10);
        let selectedMinute = parseInt(selectTime.split(':')[1], 10);
        let selectedDateTime = new Date(currentYear, currentMonth, currentDay, selectedHour, selectedMinute);
        
        // Check if selected time is in the future
        if (selectedDateTime > today) {
            this.isSelectedTimeInFuture(reminderDate, currentYear, currentMonth, currentDay);
        } else {
            this.isSelectedTimePassed(currentDay);
        }
    }
  
    isSelectedTimeInFuture(reminderDate: string, currentYear: number, currentMonth: number, currentDay: number): void {
        this.birthdayDates.forEach((birthday: any) => {
            let monthIndex = this.month.indexOf(birthday.month);
            let birthdayDay = parseInt(birthday.day);
            
            if (currentDay === birthdayDay && currentMonth === monthIndex && reminderDate === 'Am Geburtstag') {
                let birthdayName = birthday.firstname + (birthday.lastname && birthday.lastname.length > 1 ? ' ' + birthday.lastname : '');
                console.log(`${birthdayName} hat heute Geburtstag!`);
                this.sendNotification(`${birthdayName} hat heute Geburtstag!`);
            }
        });
    
        if (reminderDate === '1 Tag vorher') {
            const nextDay = new Date(currentYear, currentMonth, currentDay + 1);
            this.checkTomorrowBirthday(nextDay);
        }
    }
  
    isSelectedTimePassed(currentDay: number): void {
        let tomorrow = new Date();
        tomorrow.setDate(currentDay + 1);
        this.checkTomorrowBirthday(tomorrow);
    }
    
    checkTomorrowBirthday(tomorrow: Date): void {
        let nextDayMonth = tomorrow.getMonth();
        let nextDayDate = tomorrow.getDate();
    
        this.birthdayDates.forEach((birthday: any) => {
            let monthIndex = this.month.indexOf(birthday.month);
            let birthdayDay = parseInt(birthday.day);
    
            if (nextDayDate === birthdayDay && nextDayMonth === monthIndex) {
              let birthdayName = birthday.firstname + (birthday.lastname && birthday.lastname.length > 1 ? ' ' + birthday.lastname : '');
                console.log(`${birthdayName} hat morgen Geburtstag!`);
                this.sendNotification(`${birthdayName} hat morgen Geburtstag!`);
            }
        });
    }
  
  
  
  

    public requestSubscription() {
        if (!this.swPush.isEnabled) {
          console.log('Notification not enabled.');
          return;
        }
      
        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY,
        })
          .then((subscription) => {
            console.log('Subscription successful:', subscription);
            const message = `Vielen Dank fürs Abonnieren! Sie erhalten jetzt Benachrichtigungen.`;
            this.sendNotification(message);
          })
          .catch((error) => console.log(error));
    }
      
    private sendNotification(message: string): void {
        if (!('Notification' in window)) {
          console.log('This browser does not support desktop notification');
          return;
        }
    
        if (Notification.permission === 'granted') {
            this.displayNotification(message);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                this.displayNotification(message);
              }
            });
        }
    }
    
    private displayNotification(message: string): void {
        const options: NotificationOptions = {
          body: message,
          icon: './assets/icons/party-icon.png'
        };
    
        new Notification('Neue Benachrichtigung', options);
    }
}


 /*  checkNotifications(reminderDate: string, selectTime: string): void {
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
    } */