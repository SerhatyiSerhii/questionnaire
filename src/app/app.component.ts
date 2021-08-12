import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/services/http.service';
import { delay } from 'rxjs/operators'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public frameworks: string[] = ['angular', 'react', 'vue'];
  public selectedFramework: string[] | undefined;
  public versions: Map<string, string[]> = new Map([
    ['angular', ['1.1.1', '1.2.1', '1.3.3']],
    ['react', ['2.1.2', '3.2.4', '4.3.1']],
    ['vue', ['3.3.1', '5.2.1', '5.1.3']]
  ]);
  public userForm: FormGroup;
  public disabledFrame: boolean = false;
  public disabledVersion: boolean = false;
  public matchEmail: boolean = false;

  constructor(private httpService: HttpService, private datePipe: DatePipe) {

    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      birthday: new FormControl('', Validators.required),
      email: new FormControl('', Validators.email),
      frameWork: new FormControl('Select a framework', Validators.required),
      version: new FormControl('Select a version', Validators.required),
      hobbies: new FormArray([
        new FormGroup({
          hobby: new FormControl('', Validators.required),
          duration: new FormControl('', Validators.required)
        })
      ])
    });
  }

  public get hobbies(): FormArray {
    return this.userForm.get('hobbies') as FormArray;
  }

  public addHobby(): void {
    this.hobbies.push(new FormGroup({
      hobby: new FormControl('', Validators.required),
      duration: new FormControl('', Validators.required)
    }));
  }

  public onSelectFrame(event: any): void {
    this.selectedFramework = this.versions.get(event.target.value);
    this.disabledFrame = true;
    this.disabledVersion = false;
  }

  public onSelectVersion(): void {
    this.disabledVersion = true;
  }

  public onInput(event: any): void {
    this.httpService.getAddresses().pipe(delay(2000)).subscribe((data: any) => {
      for (let i of data.addresses) {
        if (i == event.target.value) {
          this.userForm.get('email')?.setErrors({});
          this.matchEmail = true;
        }
      }
    });

    this.matchEmail = false;
  }

  public onSubmit(): void {
      const hobbies = this.hobbies.controls.map(item => {
        return item.value;
      });

      const map = new Map();

      map.set('firstName', this.userForm.get('name')!.value);
      map.set('lastName', this.userForm.get('surname')!.value);
      map.set('dateOfBirth', this.datePipe.transform(this.userForm.get('birthday')!.value, 'dd/MM/yyyy'));
      map.set('frameWork', this.userForm.get('frameWork')!.value);
      map.set('version', this.userForm.get('version')!.value);
      map.set('email', this.userForm.get('email')!.value);
      map.set('hobbies', hobbies);

      const toObject = Object.fromEntries(map.entries());

      console.log(JSON.stringify(toObject));
  }
}
