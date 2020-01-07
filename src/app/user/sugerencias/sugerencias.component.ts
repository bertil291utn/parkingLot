import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { ApirestserviceService } from 'src/app/services/apirestservice.service';

@Component({
  selector: 'app-sugerencias',
  templateUrl: './sugerencias.component.html',
  styleUrls: ['./sugerencias.component.scss'],
})
export class SugerenciasComponent implements OnInit {
  transaccionForm;
  clickButton = false;
  varInterval;
  updates = false;

  constructor(public modalController: ModalController, private fb: FormBuilder, public toastController: ToastController,
    public apirestservice: ApirestserviceService) { }

  ngOnInit() {
    this.formset();
    this.hideKeyboard();

  }


  private hideKeyboard() {
    var field = document.createElement('input');
    field.setAttribute('type', 'text');
    document.body.appendChild(field);

    setTimeout(function () {
      field.focus();
      setTimeout(function () {
        field.setAttribute('style', 'display:none;');
      }, 50);
    }, 50);
  }

  private formset() {

    this.transaccionForm = this.fb.group({
      comentario: ['', Validators.required],
      updates: ['', Validators.required],
      email: [''],
      whatsapp: [''],
      tipo_auto: ['']
    });


  }

  public dismissViewController() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  public async sendComment() {
    this.clickButton = true;
    console.log(this.transaccionForm);
    let response;
    if (this.transaccionForm.valid) {
      console.log('si paso');
      response = 0;
      response = await this.apirestservice.post_comment(this.transaccionForm.value).toPromise().catch((err) => { console.log(err); });
      if (response['status'] == 200) {
        this.dismissViewController();
        this.actionPresentToast('Enviado satisfactoriamente. Gracias por su colaboraci\xF3n', 4000);
        this.transaccionForm.reset();
        this.clickButton = false;
      }
    } else
      console.log('no paso');

    this.varInterval = setInterval(() => {
      this.clickButton = false;
    }, 2000);
  }//send comment


  ionViewDidLeave() {
    //pararla funcion de busqueda el momento que haya dejado el page
    clearInterval(this.varInterval);
  }

  private async actionPresentToast(mensaje: string, duration: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: duration
    });
    toast.present();
  }

  public getValueConcept(evento) {
    //console.log(evento.detail.value)
    if (evento.detail.value == 1) {
      console.log(this.transaccionForm.valid ? 'paso' : 'no paso');
      this.updates = true;
      console.log('update true');
      this.transaccionForm.get('email').setValidators([Validators.required]);//is required if some check is activated
      this.transaccionForm.get('email').updateValueAndValidity();
      this.transaccionForm.get('tipo_auto').setValidators([Validators.required]);
      this.transaccionForm.get('tipo_auto').updateValueAndValidity();
    }
    else {
      console.log(this.transaccionForm.valid ? 'paso' : 'no paso');
      this.updates = false;
      console.log('update false');
      this.transaccionForm.get('email').clearValidators();
      this.transaccionForm.get('email').updateValueAndValidity();
      this.transaccionForm.get('tipo_auto').clearValidators();
      this.transaccionForm.get('tipo_auto').updateValueAndValidity();
    }

  }
}//end class

export interface BooleanFn {
  (): boolean;
}