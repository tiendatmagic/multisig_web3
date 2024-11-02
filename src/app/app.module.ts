import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MainComponent } from './layout/main/main.component';
import { HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE, MAT_RIPPLE_GLOBAL_OPTIONS, MatRippleModule, RippleGlobalOptions } from '@angular/material/core';
import { NotifyModalComponent } from './components/modal/notify-modal/notify-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HomeComponent } from './page/home/home.component';
import { Error404Component } from './page/error/error404/error404.component';
import { ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { QRCodeModule } from 'angularx-qrcode';

const globalRippleConfig: RippleGlobalOptions = {
  animation: {
    enterDuration: 300,
    exitDuration: 0
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent,
    NotifyModalComponent,
    HomeComponent,
    Error404Component
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatButtonModule,
    MatRippleModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    QRCodeModule
  ],
  providers: [
    {
      provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
