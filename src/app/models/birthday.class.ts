export class Birthday {
    id: string;
    firstname: string;
    lastname: string;
    day: number;
    month: string;
    birthdayTotalDays?: string; 
    birthdayTotalHours?: number; 
    birthdayTotalMinutes?: number; 
    birthdayTotalSeconds?: number;
    weekday?: string;


    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.firstname = obj && obj.firstname ? obj.firstname : '';
        this.lastname = obj && obj.lastname ? obj.lastname : '';
        this.day = obj && obj.day ? obj.day : 1;
        this.month = obj && obj.month ? obj.month : 'Jan';
    }

    public toJSON() {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            day: this.day,
            month: this.month
        }
    }

    setBirthdayObject(obj:any, id:string) {
        return new Birthday({
            id: id || "",
            firstname: obj.firstname || "",
            lastname: obj.lastname || "",
            day: obj.day || 1,
            month: obj.month || ""
        });
    } 
}