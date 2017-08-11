import { SigninPage } from './../pages/signin/signin';
import { AuthProvider } from './../providers/auth/auth';
import { NavController, AlertController, App, MenuController } from 'ionic-angular';
import { OnInit } from "@angular/core";

export abstract class BaseComponent implements OnInit{

    protected navCtrl: NavController;

    constructor(
        public alertCtrl: AlertController,
        public authProvider: AuthProvider,
        public app: App,
        public menuCtrl: MenuController
    ) {
        
    }

    ngOnInit(): void {
        this.navCtrl = this.app.getActiveNav();
    }

    onLogout(): void {
        this.alertCtrl.create({
            message: 'Do you want to quit?',
            buttons: [
                {
                    text: 'Yes',
                    handler: () => {
                        this.authProvider.logout()
                            .then(() => {
                                this.navCtrl.setRoot(SigninPage);
                                this.menuCtrl.enable(false, 'user-menu');
                            });
                    }
                },
                {
                    text: 'No'
                }
            ]
        }).present();
    }
}