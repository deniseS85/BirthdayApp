import { Component } from '@angular/core';
import { BirthdayService } from '../birthday.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-reminder',
  standalone: true,
  imports: [MatSelectModule,FormsModule],
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss'
})
export class ReminderComponent {

  hours: number[] = Array.from({ length: 9 }, (_, i) => i + 10);  
  selectedTime: string = ''; 
  reminders = [
    { label: 'Am Geburtstag', isChecked: false },
    { label: '1 Tag vorher', isChecked: false }
  ];

  constructor(public bDayService: BirthdayService) {}

}