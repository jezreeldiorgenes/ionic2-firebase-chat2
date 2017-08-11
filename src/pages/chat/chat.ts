import { ChatProvider } from './../../providers/chat/chat';
import { FirebaseObjectObservable } from 'angularfire2';
import { MessageProvider } from './../../providers/message/message';
import { FirebaseListObservable } from 'angularfire2';
import { UserProvider } from './../../providers/user/user';
import { AuthProvider } from './../../providers/auth/auth';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { User } from "../../models/user";
import { Message } from "../../models/messageModel";

import firebase from 'firebase';
import { Chat } from "../../models/chatModel";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;

  messages: FirebaseListObservable<Message[]>;
  pageTitle: string;
  sender: User;
  recipient: User;

  private chatSender: FirebaseObjectObservable<Chat>;
  private chatRecipient: FirebaseObjectObservable<Chat>;

  constructor(
    public authProvider: AuthProvider,
    public chatProvider: ChatProvider,
    public messageProvider: MessageProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authProvider.authenticated;
  }

  ionViewDidLoad() {
    this.recipient = this.navParams.get('recipientUser');
    this.pageTitle = this.recipient.name;

    this.userProvider.currentUser
      .first()
      .subscribe((currentUser: User) => {
        this.sender = currentUser;

        this.chatSender = this.chatProvider.getDeepChat(this.sender.$key, this.recipient.$key);
        this.chatRecipient = this.chatProvider.getDeepChat(this.recipient.$key, this.sender.$key);

        if (this.recipient.photo) {
          this.chatSender
            .first()
            .subscribe((chat: Chat) => {
              this.chatProvider.updatePhoto(this.chatSender, chat.photo, this.recipient.photo);
            });
        }
        
        let doSubscription = () => {
          this.messages
            .subscribe((Messages: Message[]) => {
              this.scrollToBotton();
            });
        };

        this.messages = this.messageProvider
          .getMessages(this.sender.$key, this.recipient.$key);

        this.messages
          .first()
          .subscribe((messages: Message[]) => {
            if (messages.length === 0) {
              this.messages = this.messageProvider
                .getMessages(this.recipient.$key, this.sender.$key);

              doSubscription();

            } else {
              doSubscription();
            }
          });
      });

  }

  sendMessage(newMessage: string): void {

    if (newMessage) {
      let currentTimestamp: Object = firebase.database.ServerValue.TIMESTAMP;

      this.messageProvider.create(
        new Message(
          this.sender.$key,
          newMessage,
          currentTimestamp
        ),
        this.messages
      ).then(() => {

        this.chatSender
          .update({
            lastMessage: newMessage,
            timestamp: currentTimestamp
          });

        this.chatRecipient
          .update({
            lastMessage: newMessage,
            timestamp: currentTimestamp
          });

      });

    }

  }

  private scrollToBotton(duration?: number): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(duration || 300);
      }
    }, 50);
  }

}
