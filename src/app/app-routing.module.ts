import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DisplayComponent } from './display/display.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  { path: 'display', component: DisplayComponent },
  { path: '', component: DisplayComponent },
  { path: "update/:id", component: UpdateComponent }
 ];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }
