import { Component, Input } from '@angular/core';
import { User } from "../../models/user";

@Component({
  selector: 'user-info',
  templateUrl: 'user-info.html'
})
export class UserInfoComponent {

  @Input() user: User;
  @Input()isMenu: boolean = false;

  constructor() {
  }

}
