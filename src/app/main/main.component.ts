import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddBirthdayComponent } from '../add-birthday/add-birthday.component';
import { Firestore } from '@angular/fire/firestore';
import { onSnapshot } from 'firebase/firestore';
import { Birthday } from '../models/birthday.class';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BirthdayService } from '../birthday.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

    firestore: Firestore = inject(Firestore);
    unsubList;
    birthdayList: any = [];
    isBirthday: boolean = false;
    weekday: any = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    month: any = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    currentDate: Date = new Date();
    currentYear = new Date().getFullYear();
    groupedBirthdays: { month: string, birthdays: Birthday[] }[] = [];

    constructor(public dialog: MatDialog, private sanitizer: DomSanitizer, private router: Router, private bDayService: BirthdayService) {
        this.unsubList = this.getBirthdayList(); 
    }

    ngOnDestroy(){
        this.unsubList();
    }

    addNewBirthday() {
        this.dialog.open(AddBirthdayComponent);
    }

    getBirthdayList() {
        return onSnapshot(this.bDayService.getBirthdayRef(), (list) => {
            this.birthdayList = [];
            list.forEach(element => {
                const birthday = new Birthday().setBirthdayObject(element.data(), element.id);
                this.calculateDays(birthday);
                this.birthdayList.push(birthday);
            });
            this.sortBirthdayList();
            this.groupedBirthdays = this.groupBirthdaysByMonthAndYear(this.birthdayList);
            this.isBirthday = this.birthdayList.length > 0;
        });
    }

    calculateDays(birthday: Birthday): void {
        let monthIndex = this.month.indexOf(birthday.month);
        let birthdayOfPerson = new Date(this.currentYear, monthIndex, birthday.day);
        let dayDifference = birthdayOfPerson.getTime() - this.currentDate.getTime(); 
        let days = dayDifference / (1000 * 3600 * 24);
        let hours = dayDifference / (1000 * 3600);
        let minutes = dayDifference / (1000 * 60);
        let seconds = dayDifference / 1000;
        let birthdayTotalDays = Math.ceil(days);

        if (Math.floor(days) < 0) {
            this.isBirthdayAlreadyPassed(birthday, this.currentYear, monthIndex);
        } else if (Math.floor(days) === 0) {
            this.isBirthdayToday(birthday, days, birthdayOfPerson);
        } else {
            this.birthdayIsThisYear(birthday, birthdayOfPerson, birthdayTotalDays);
        }
        this.assignTimeValues(birthday, hours, minutes, seconds);
    }

    isBirthdayAlreadyPassed(birthday: Birthday, currentYear: number, monthIndex: number): void {
        let nextBirthdayOfPerson = new Date(currentYear + 1, monthIndex, birthday.day);
        let nextDayDifference = Math.abs(nextBirthdayOfPerson.getTime() - this.currentDate.getTime());
        let remainingDays = Math.ceil(nextDayDifference / (1000 * 3600 * 24));
      
        birthday.birthdayTotalDays = remainingDays === 365 ? '0' : remainingDays.toString();
        birthday.weekday = this.weekday[nextBirthdayOfPerson.getDay()];
    }

    isBirthdayToday(birthday: Birthday, days: number, birthdayOfPerson: Date): void { 
        birthday.birthdayTotalDays = Math.floor(days).toString();
        birthday.weekday = this.weekday[birthdayOfPerson.getDay()];
    }

    birthdayIsThisYear(birthday: Birthday, birthdayOfPerson: Date, birthdayTotalDays: number): void {
        birthday.birthdayTotalDays = birthdayTotalDays.toString();
        birthday.weekday = this.weekday[birthdayOfPerson.getDay()];
    }

    assignTimeValues(birthday: Birthday, hours: number, minutes: number, seconds: number): void {
        birthday.birthdayTotalHours = hours;
        birthday.birthdayTotalMinutes = minutes;
        birthday.birthdayTotalSeconds = seconds;
    }

    sortBirthdayList(): void {
        this.birthdayList.sort((a: any, b: any) => {
            let daysA = parseInt(a.birthdayTotalDays || '0', 10);
            let daysB = parseInt(b.birthdayTotalDays || '0', 10);
            let monthIndexA = this.month.indexOf(a.month);
            let monthIndexB = this.month.indexOf(b.month);
            let minutesA = a.birthdayTotalMinutes || 0;
            let minutesB = b.birthdayTotalMinutes || 0;
            let secondsA = a.birthdayTotalSeconds || 0;
            let secondsB = b.birthdayTotalSeconds || 0;
    
            return daysA !== daysB
                ? daysA - daysB
                : monthIndexA !== monthIndexB
                ? monthIndexA - monthIndexB
                : minutesA !== minutesB
                ? minutesA - minutesB
                : secondsA - secondsB;
        });
    }

    groupBirthdaysByMonthAndYear(birthdayList: Birthday[]): { month: string, birthdays: Birthday[] }[] {
        let groupedBirthdays: { month: string, birthdays: Birthday[] }[] = [];
        let currentGroup: { month: string, birthdays: Birthday[] } = { month: '', birthdays: [] };
    
        birthdayList.forEach(birthday => {
            if (birthday.month !== currentGroup.month) {
                if (currentGroup.birthdays.length > 0) {
                    groupedBirthdays.push({ ...currentGroup });
                }
    
                currentGroup.month = birthday.month;
                currentGroup.birthdays = [];
            }
    
            currentGroup.birthdays.push(birthday);
        });
    
        if (currentGroup.birthdays.length > 0) {
            groupedBirthdays.push({ ...currentGroup });
        }
    
        return groupedBirthdays;
    }
    
    getRemainingTime(birthday: Birthday): string {
        if (birthday.birthdayTotalDays) {
            let remainingDays = +birthday.birthdayTotalDays;
    
            if (remainingDays >= 1) {
                return remainingDays.toString();
            } else {
                let remainingHours = Math.floor(birthday.birthdayTotalHours || 0);
                let remainingMinutes = Math.floor(birthday.birthdayTotalMinutes || 0);
                let remainingSeconds = Math.floor(birthday.birthdayTotalSeconds || 0);
    
                if (remainingHours >= 1) {
                    return remainingHours.toString();
                } else if (remainingMinutes >= 1) {
                    return remainingMinutes.toString();
                } else if (remainingSeconds >= 1) {
                    return remainingSeconds.toString();
                } else {
                    return 'Heute';
                }
            }
        }
        return '';
    }

    getRemainingTimeUnit(birthday: Birthday): SafeHtml {
        if (birthday.birthdayTotalDays) {
          let remainingDays = +birthday.birthdayTotalDays;
      
          if (remainingDays > 0) {
            return 'Tage';
          } else {
            let remainingHours = Math.floor(birthday.birthdayTotalHours || 0);
            let remainingMinutes = Math.floor(birthday.birthdayTotalMinutes || 0);
            let remainingSeconds = Math.floor(birthday.birthdayTotalSeconds || 0);
      
            if (remainingHours > 0) {
              return 'Stunden';
            } else if (remainingMinutes > 0) {
              return 'Minuten';
            } else if (remainingSeconds > 0) {
              return 'Sekunden';
            } else {
                return this.sanitizer.bypassSecurityTrustHtml('<img style="width: 20px" src="../../assets/icons/party-icon.png">');
            }
          }
        }
        return '';
    }

    openCountdown(birthday: Birthday): void {
        this.router.navigate(['/countdown'], {
            queryParams: {
              firstname: birthday.firstname,
              lastname: birthday.lastname,
              day: birthday.day,
              month: birthday.month,
              id: birthday.id
            }
        });
    }

    openReminder(): void {
        this.router.navigate(['/reminder']);
    }
}