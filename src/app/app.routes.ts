import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CountdownComponent } from './countdown/countdown.component';
import { ReminderComponent } from './reminder/reminder.component';

export const routes: Routes = [
    { path: '', component: MainComponent},
    { path: 'countdown', component: CountdownComponent},
    { path: 'reminder', component: ReminderComponent}
];
