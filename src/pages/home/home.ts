import { ChatProvider } from './../../providers/chat/chat';
import { ChatPage } from './../chat/chat';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { SignupPage } from './../signup/signup';
import { FirebaseListObservable } from "angularfire2";
import { User } from "../../models/user";
import { UserProvider } from "../../providers/user/user";
import { Chat } from "../../models/chatModel";

import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  chats: FirebaseListObservable<Chat[]>;
  users: FirebaseListObservable<User[]>;
  view: string = 'chats';

  constructor(
    public authProvider: AuthProvider,
    public chatProvider: ChatProvider,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    public userProvider: UserProvider) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authProvider.authenticated;
  }

  ionViewDidLoad() {
    this.chats = this.chatProvider.chats;
    this.users = this.userProvider.users;
    
    this.menuCtrl.enable(true, 'user-menu');
}

  filterItems(event: any): void {
    let searchTerm: string = event.target.value;

    this.chats = this.chatProvider.chats;
    this.users = this.userProvider.users;

    if(searchTerm) {
      switch(this.view) {

        case 'chats':
          this.chats = <FirebaseListObservable<Chat[]>>this.chats
            .map((chats: Chat[]) => chats.filter((chat: Chat) => 
              (chat.title.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) > -1)));
          break;

        case 'users':
        this.users = <FirebaseListObservable<User[]>>this.users
            .map((users: User[]) => users.filter((user: User) => 
              (user.name.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) > -1)));
          break;
      }
    }
  }

  onChatCreate(recipientUser: User): void {

    this.userProvider.currentUser
      .first()
      .subscribe((currentUser: User) => {

        this.chatProvider.getDeepChat(currentUser.$key, recipientUser.$key)
          .first()
          .subscribe((chat: Chat) => {

            if (chat.hasOwnProperty('$value')) {
              let timestamp: Object = firebase.database.ServerValue.TIMESTAMP;

              let chat1 = new Chat('', timestamp, recipientUser.name, '');
              this.chatProvider.create(chat1, currentUser.$key, recipientUser.$key);

              let chat2 = new Chat('', timestamp, currentUser.name, '');
              this.chatProvider.create(chat2, recipientUser.$key, currentUser.$key);
            }

          });

      });

    this.navCtrl.push(ChatPage, {
      recipientUser: recipientUser
    });
  }

  onChatOpen(chat: Chat): void {

    let recipientUserId: string = chat.$key;

    this.userProvider.get(recipientUserId)
      .first()
      .subscribe((user: User) => {
        this.navCtrl.push(ChatPage, {
          recipientUser: user
        });
      });

  }

  onSignup(): void {
    this.navCtrl.push(SignupPage);
  }
}
