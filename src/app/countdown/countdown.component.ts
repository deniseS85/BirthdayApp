import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Unsubscribe, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { Birthday } from '../models/birthday.class';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BirthdayService } from '../birthday.service';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [MatProgressBarModule,MatFormFieldModule,MatInputModule,FormsModule ],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss'
})
export class CountdownComponent implements OnInit, OnDestroy {

  firestore: Firestore = inject(Firestore);
    birthday = new Birthday();
    birthdayList: Birthday[] = []; 
    firstname!: string;
    lastname!: string;
    day!: number;
    month!: string;
    birthdayID: any;
    isConfirmDelete: boolean = false;
    isEditMode: boolean = false;
    loading = false;
    days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
    months: string[] = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
    private unsubscribeSnapshot: Unsubscribe | undefined;
    isMobile: boolean = false;
    countDownDateObject: Date | null = null;
    monthDiff!: number;
    dayDiff!: number;
    hours!: number;
    minutes!: number;
    seconds!: number;
    diffDays!: number;
    isSameDay: boolean = false;

    constructor(private route: ActivatedRoute, public bDayService: BirthdayService) {
        this.counting = this.counting.bind(this);
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.handleQueryParams(params);
          });
        this.isMobile = window.innerWidth < 636;
        this.countDown();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event:Event): void {
        this.isMobile = window.innerWidth < 636;
    }

    private handleQueryParams(params: any) {
        this.firstname = params['firstname'];
        this.lastname = params['lastname'];
        this.day = params['day'];
        this.month = params['month'];
        this.birthdayID = params['id'];
        this.handleBirthdaySnapshot();
    }

    private handleBirthdaySnapshot() {
        if (this.birthdayID) {
            this.unsubscribeSnapshot = onSnapshot(doc(collection(this.firestore, 'birthdays'), this.birthdayID), (element) => {
                this.birthday = new Birthday(element.data());
                this.birthday.id = this.birthdayID;
                this.birthday.month = this.getShortMonthName(this.birthday.month);
            });
        }
    }

    getShortMonthName(fullMonth: string): string {
        let monthIndex = this.months.findIndex(month => 
            new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(2000, this.months.indexOf(month), 1)) === fullMonth
        );
        return monthIndex !== -1 ? this.months[monthIndex] : '';
    }

    getFullMonthName(shortMonth: string): string {
        let monthIndex = this.months.indexOf(shortMonth);
        return new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(2000, monthIndex, 1));
    }

    ngOnDestroy(): void {
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }
    }

    openDeleteConfirm() {
        this.isConfirmDelete = true;
    }

    stopPropagation(event: MouseEvent): void {
        event.stopPropagation();
    }

    async deleteBirthday() {
        try {
            this.loading = true;
            await deleteDoc(this.bDayService.getBirthdayID(this.birthdayID));
            this.bDayService.goBack();
          } catch (err) {
            console.error(err);
          } finally {
            this.loading = false;
          }
    }

    openEditPopup() {
        this.isEditMode = true;
    }

    async editBirthday() {
        try {
          this.loading = true;
          const updateData = { ...this.birthday.toJSON() };
          updateData.month = this.getFullMonthName(updateData.month);
          await updateDoc(this.bDayService.getBirthdayID(this.birthdayID), updateData);
          ({ firstname: this.firstname, lastname: this.lastname, day: this.day, month: this.month } = updateData);
          this.isEditMode = false;
          this.countDown();
        } catch (err) {
          console.error(err);
        } finally {
          this.loading = false;
        }
    }

    countDown() {
        if (this.day && this.month) {
            const monthArray = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            const currentYear = new Date().getFullYear();
            const monthIndex = monthArray.indexOf(this.month);
            this.countDownDateObject = new Date(currentYear, monthIndex, this.day, 0, 0, 0);
            this.counting(); 
            setInterval(() => this.counting(), 1000); 
        }
    }

    counting(): void {
        const nowObject = new Date();
        if (this.countDownDateObject) {
          this.dateDiff(nowObject, this.countDownDateObject);
        } 
    }

    dateDiff(startingDate: Date, endingDate: Date): void {
        let diffTime = endingDate.getTime() - startingDate.getTime();
        this.diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (this.diffDays < 0) {
            endingDate = new Date(endingDate.getFullYear() + 1, endingDate.getMonth(), endingDate.getDate());
        }

        let startDate = new Date(new Date(startingDate).toISOString().substring(0, 10));

        if (!endingDate) {
            endingDate = new Date(); 
            endingDate.setFullYear(endingDate.getFullYear() + 1);
        } 

        let endDate = new Date(endingDate);

        if (startDate > endDate) {
            let swap = startDate;
            startDate = endDate;
            endDate = swap;
        }

        let startYear = startDate.getFullYear();
        let february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
        let daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let yearDiff = endDate.getFullYear() - startYear;
        let countDownDate = endingDate.getTime();
        let now = startingDate.getTime();  
        let distance = countDownDate - now;
        this.monthDiff = endDate.getMonth() - startDate.getMonth();
        
        if (this.monthDiff < 0) {
            yearDiff--;
            this.monthDiff += 12;
        }

        this.dayDiff = endDate.getDate() - startDate.getDate();

        if (this.dayDiff < 0) {
            if (this.monthDiff > 0) {
                this.monthDiff--;
            } else {
                yearDiff--;
                this.monthDiff = 11;
            }
            this.dayDiff += daysInMonth[startDate.getMonth()];
        }

        this.isSameDay = this.dayDiff == 0;
        this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }
}
