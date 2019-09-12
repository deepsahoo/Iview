import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AccordionModule } from 'primeng/components/accordion/accordion';
import { PanelModule } from 'primeng/components/panel/panel';
import { ButtonModule } from 'primeng/components/button/button';
import { RadioButtonModule } from 'primeng/components/radioButton/radioButton';
import {SidebarModule} from 'primeng/sidebar';
import {MenuModule} from 'primeng/menu';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import {MenubarModule} from 'primeng/menubar';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {FileUploadModule} from 'primeng/fileupload';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import { AppRoutingModule } from './app-routing.module';
import { DisplayComponent } from './display/display.component';
import { UpdateComponent } from './update/update.component';
import {TreeModule} from 'primeng/tree';
import {OrganizationChartModule} from 'primeng/organizationchart';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {TooltipModule} from 'primeng/tooltip';
import {BreadcrumbModule} from 'primeng/breadcrumb';



@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent,
    UpdateComponent
     ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    TableModule,
    AccordionModule,
    PanelModule,
    ButtonModule,
    RadioButtonModule,
    SidebarModule,
    MenuModule,
    ReactiveFormsModule,
    MenubarModule,
    TabViewModule,
    FileUploadModule,
    DialogModule,
    ToastModule,
    HttpClientModule,
    AppRoutingModule,
    TreeModule,
    OrganizationChartModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    TooltipModule,
    BreadcrumbModule
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
