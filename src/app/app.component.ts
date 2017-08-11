import { FirebaseAuthState } from 'angularfire2';
import { UserProvider } from './../providers/user/user';
import { AuthProvider } from './../providers/auth/auth';
import { SigninPage } from './../pages/signin/signin';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { User } from "../models/user";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = SigninPage;

  currentUser: User;

  constructor(
    authProvider: AuthProvider,
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    userProvider: UserProvider
    ) {

      authProvider
        .auth
        .subscribe((authState: FirebaseAuthState) => {
          if(authState) {
            userProvider.currentUser
              .subscribe((user: User) => {
                this.currentUser = user;
              })
          }
        });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

