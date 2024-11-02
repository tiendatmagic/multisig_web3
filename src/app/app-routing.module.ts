import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './page/home/home.component';
import { Error404Component } from './page/error/error404/error404.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'address/:addresscontract',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'deploy',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: '**',
    pathMatch: 'full',
    component: Error404Component,
    data: { title: 'Trang không tồn tại' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
