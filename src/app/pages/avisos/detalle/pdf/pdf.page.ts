import { DatosService } from './../../../../services/datos.service';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.page.html',
  styleUrls: ['./pdf.page.scss'],
})
export class PdfPage implements OnInit {

  url: any;
  pdf: string;
  online: boolean;

  constructor(
    private datos: DatosService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.online = navigator.onLine;
    if (this.online) {
      this.pdf = this.datos.avisoElegido.pdf;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.pdf}`);
    }
  }

}
