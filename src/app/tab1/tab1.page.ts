import { Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { SugerenciasComponent } from '../user/sugerencias/sugerencias.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  data;
  constructor(public modalController: ModalController) { }


  ionViewWillEnter() {
    setTimeout(() => {
      this.data = {
        'heading': 'Normal text',
        'para1': 'Lorem ipsum dolor sit amet, consectetur',
        'para2': 'adipiscing elit.'
      };
    }, 3000);
  }

  goToRecargas() {

    console.log('Ir a revisar todas las recargas realizsadas');
  }

  public sendComments() {
    this.presentModal();
  }


  private async presentModal() {
    const modal = await this.modalController.create({
      component: SugerenciasComponent
    });
    return await modal.present();
  }


}//end class
