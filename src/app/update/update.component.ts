import { Component, OnInit } from '@angular/core';
import { TreeService } from '../tree.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {
  items: MenuItem[];
  treeNodes: TreeNode[];
  dataList: TreeNode[] = [];
  selectedNode: TreeNode;
  display: boolean = false;
  categoryList: object[];
  statusList: object[];
  conList: object[];
  selectedStatus: any;
  selectedCategory: any;
  selectedCon: any;

  selectedChildStatus: any;
  selectedChildCategory: any;
  selectedChildCon: any;


  displayChild: boolean = false;
  childNode: any = {};
  childDetails: any = {};

  serviceLines: any[] = [];
  isView: boolean = false;
  updateServiceLine: any = {};
  updateSlMap: any = {};

  constructor(private treeService: TreeService, private router: Router, private messageService: MessageService) { }
  ngOnInit() {

    this.items = [
      {
        label: 'Home',
        items: [{
          label: 'View',
          icon: 'pi pi-fw pi-home',
          command: (event) => {
            this.router.navigate(['/display']);
          }
        }

        ]
      },
      {
        label: 'Upload',
        icon: 'pi pi-fw pi-upload',
        items: [
          {
            label: 'New', icon: 'pi pi-fw pi-upload', command: (event) => {
              // this.display = true;
            }
          }

        ]
      },
      {
        label: 'Update',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'New', icon: 'pi pi-fw pi-pencil', command: (event) => {
              if (this.isView) {
                this.isView = false;
              }
              this.router.navigate(['/update']);
            }
          }

        ]
      },

    ];

    this.categoryList = [
      { name: 'Business Process', code: 'CC000' },
      { name: 'PCF', code: 'CC001' },
      { name: 'Mule ESB', code: 'CC002' },
      { name: 'Mule API Gateway', code: 'CC003' },
      { name: 'Legacy BC', code: 'CC004' },
      { name: 'Legacy Modernized', code: 'CC005' },
      { name: 'Cross-Product', code: 'CC006' },
      { name: 'Cross-Portfolio', code: 'CC007' },
      { name: 'External', code: 'CC008' },
      { name: 'Not Defined Defined', code: 'CC009' }
    ];

    this.statusList = [
      { name: 'On Target', code: 'On Target' },
      { name: 'Off Target', code: 'Off Target' },
      { name: 'Not Defined', code: 'Not Defined' },
    ];


    this.conList = [
      { name: 'Group', code: 'IP000' },
      { name: 'PCF Internal (C-to-C)', code: 'IP001' },
      { name: 'REST Service - MQ ', code: 'IP002' },
      { name: 'ESB - MQ Integration', code: 'IP003' },
      { name: 'ESB - CTG Integration', code: 'IP004' },
      { name: 'ESB - REST Service', code: 'IP005' },
      { name: 'REST Service - ESB', code: 'IP006' },
      { name: 'REST Service - API', code: 'IP007' },
      { name: 'REST Service - SOAP Service', code: 'IP008' },
      { name: 'API - REST Service', code: 'IP009' },
      { name: 'BC Internal', code: 'IP010' }
    ];

    // all service lines
    this.treeService.getAllServiceLines().subscribe(
      data => {
        this.serviceLines = data;
      }
    )

  }

  onNodeSelect(event) {
    this.display = true;
    for (let cat of this.categoryList) {
      if (cat['code'] == this.selectedNode['category']) {
        this.selectedCategory = cat;
      }
    }

    for (let cat of this.statusList) {
      if (cat['code'] == this.selectedNode['etaStatus']) {
        this.selectedStatus = cat;
      }
    }

    for (let cat of this.conList) {
      if (cat['code'] == this.selectedNode['connectionType']) {
        this.selectedCon = cat;
      }
    }
  }


  updateNode() {
    console.log(this.selectedNode);
    console.log(this.updateServiceLine);
    this.updateServiceLine.data.category = this.selectedCategory.code;
    this.updateServiceLine.data.etaStatus = this.selectedStatus.code;
    this.updateServiceLine.data.connectionType = this.selectedCon.code;
    this.updateSlMap["data"] = this.updateServiceLine.data;
    this.updateSlMap["meta"] = this.updateServiceLine.meta;
    this.treeService.updateServiceLine(this.updateSlMap, this.updateServiceLine._id).subscribe(
      data => {
        this.display = false;
        this.displayChild = false;
        this.showUpdateGraph(this.updateServiceLine._id);
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data update sucessfully' });
      })
  }

  addChild() {
    this.childNode['details'] = this.childDetails;
    this.displayChild = true;
  }

  updateChild() {
    this.childNode.category = this.selectedChildCategory.code;
    this.childNode.etaStatus = this.selectedChildStatus.code;
    this.childNode.connectionType = this.selectedChildCon.code;
    this.selectedNode.children.push(this.childNode);
    this.displayChild = false;
    this.updateNode();
  }

  showUpdateGraph(lineId: any) {
    this.isView = true;
    this.dataList = [];
    this.treeService.getNodes(lineId).subscribe(
      data => {
        console.log(data);
        this.updateServiceLine = data;
        this.dataList.push(this.updateServiceLine.data);
      })
  }
  removeNode() {};
 /* removeNode() {
    if (this.updateServiceLine.data.name === this.selectedNode[name]) {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Parent can not be deleted' });
    } else {
      for (let node of this.updateServiceLine.data.children) {
        if (node.name === this.selectedNode[name]){
          if(node.children && node.children.length == 0){
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Node with child node can not be deleted' });
          }else{
            
          }
        }
        for (childNode of parent) {

        }
      }
    }

  }*/

}
