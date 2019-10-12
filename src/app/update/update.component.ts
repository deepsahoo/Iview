import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TreeService } from '../tree.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
  providers: [ConfirmationService],
  encapsulation: ViewEncapsulation.None
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
  isView: boolean = true;
  updateServiceLine: any = {};
  updateSlMap: any = {};
  currentNode: any = {};
  parentNode: any = {};
  displayUpload: boolean = false;
  displayConfirm: boolean = false;
  lineId: any;
  displaySaveAs: boolean = false;
  saveAsId: string;
  renameId: string;
  displayRename: boolean = false;
  disabled: boolean = true;


  constructor(private treeService: TreeService, private router: Router, private messageService: MessageService,
    private route: ActivatedRoute) {
    this.route.params.subscribe(
      param => {
        this.lineId = param['id'];
        this.renameId = param['id'];
        this.getServiceDetail(this.lineId);
      })

  }
  ngOnInit() {
    // this.parent = this.updateServiceLine.data;
    this.items = [
      {
        label: '',
        icon: 'pi pi-bars',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-upload',
            command: (event) => {
              this.displayUpload = true;
            }
          }
        ]
      },

      //add here
      {
        label: this.lineId,
        items: [
          {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: (event) => {
              this.router.navigate(['update', this.lineId]);
            }
          },
          {
            label: 'Save As',
            icon: 'pi pi-copy',
            command: (event) => {
              this.displaySaveAs = true;
              // this.router.navigate(['update', lineId]);
            }
          },
          {
            label: 'Rename',
            icon: 'pi pi-tags',
            command: (event) => {
              this.displayRename = true;
              // this.router.navigate(['update', lineId]);
            }
          },

          {
            label: 'Publish/Exit',
            icon: 'pi pi-sign-out',
            command: (event) => {
              this.displayUpload = false;
              this.unLockService(false);
              this.router.navigate(['/display']);
            }
          }
        ]
      }


    ];





    this.categoryList = [
      { name: 'Business Process', code: 'CC000' },
      { name: 'PCF', code: 'CC001' },
      { name: 'Mule ESB', code: 'CC002' },
      { name: 'Mule API Gateway', code: 'CC003' },
      { name: 'Legacy', code: 'CC004' },
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
      { name: 'Legacy Internal', code: 'IP010' }
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

    this.updateServiceLine.data.details['Time of Function/Call'] =
      Number(this.updateServiceLine.data.details['DB Calls (ms)']) + Number(this.updateServiceLine.data.details['Logic (ms)'])
      + Number(this.updateServiceLine.data.details['Rules (ms)']) + Number(this.updateServiceLine.data.details['Latency (ms)']);


    this.updateServiceLine.data.details['Total Process Time'] =
      Number(this.updateServiceLine.data.details['Count of Invocations']) * Number(this.updateServiceLine.data.details['Time of Function/Call']);

    this.updateServiceLine.data.details['Total Process NFR'] =
      Number(this.updateServiceLine.data.details['Count of Invocations']) * Number(this.updateServiceLine.data.details['Process NFR'])



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
    if (this.selectedNode.children) {
      this.selectedNode.children.push(this.childNode);
    } else {
      let childList = new Array();
      childList.push(this.childNode);
      this.selectedNode.children = childList;

    }
    this.displayChild = false;
    this.updateNode();
  }

  getServiceDetail(lineId: any) {


    this.isView = true;
    this.dataList = [];
    this.treeService.getNodes(lineId).subscribe(
      data => {
        // console.log(data);
        this.lineId = lineId;
        this.updateServiceLine = data;
        this.parentNode = this.updateServiceLine.data;
        this.currentNode = this.updateServiceLine.data;
        this.dataList.push(this.updateServiceLine.data);
        this.collapseAll();


        /**
         * lock feaute
         */

        this.lockService(true);

      })

  }

  lockService(isLocked: boolean) {
    this.updateSlMap["data"] = this.updateServiceLine.data;
    this.updateSlMap["meta"] = this.updateServiceLine.meta;
    this.updateSlMap["isLocked"] = isLocked;
    this.treeService.lockService(this.updateSlMap, this.lineId).subscribe(
      data => {
        this.updateSlMap = {};
        console.log('locked');
      }
    )
  }

  unLockService(isLocked: boolean) {
    this.updateSlMap["data"] = this.updateServiceLine.data;
    this.updateSlMap["meta"] = this.updateServiceLine.meta;
    this.updateSlMap["isLocked"] = isLocked;
    this.treeService.lockService(this.updateSlMap, this.lineId).subscribe(
      data => {
        let details = {};
        details['isLocked'] = false;
        this.updateServiceLine.details = details;
        this.updateSlMap["details"] = this.updateServiceLine.details;
        this.treeService.publish(this.updateSlMap, this.lineId).subscribe(
          data => {
            this.updateSlMap = {};
            console.log('sucess');
          }
        )
      }
    )
  }

  showUpdateGraph(lineId: any) {
    this.isView = true;
    this.dataList = [];
    this.treeService.getNodes(lineId).subscribe(
      data => {
        // console.log(data);
        this.lineId = lineId;
        this.updateServiceLine = data;
        this.parentNode = this.updateServiceLine.data;
        this.currentNode = this.updateServiceLine.data;
        this.dataList.push(this.updateServiceLine.data);
        this.collapseAll();
      })
  }


  removeNode() {
    // if (this.updateServiceLine.data.name === this.selectedNode[name]) {
    //   this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Parent can not be deleted' });
    // } else {
    // let isMatch = false;

    /* if(!this.currentNode.children){
      console.log("inside no children")
      if(this.currentNode['name'] === 'TestChild1'){
        console.log('deleteing record found');
        this.parentNode.children.splice(this.parentNode.children.indexOf(this.currentNode,1));
        //this.currentNode = null;
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node deleted' });
      }
      return;
    }*/
    if (!this.currentNode.children) {
      return;
    }
    let isMatch = false;
    for (let node of this.currentNode.children) {
      if (node['name'] === this.selectedNode['name']) {
        console.log('match found')
        isMatch = true;
        if (node.children) {
          // this.display = false;
          this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Node with child node can not be deleted' });
        } else {
          this.parentNode.children.splice(this.parentNode.children.indexOf(node), 1);
          this.display = false;
          this.updateNode();
        }
        return;
      }
    }
    if (!isMatch) {
      for (let node of this.currentNode.children) {
        console.log(node['name']);
        this.currentNode = node;
        this.parentNode = this.currentNode;
        this.removeNode();
      }
    }









    /* if(!this.currentNode.children){
       console.log("inside no children")
       if(this.currentNode['name'] === 'TestChild1'){
         console.log('deleteing record found');
         //this.parentNode.children.splice(this.parentNode.children.indexOf(this.currentNode,1));
         this.currentNode = null;
         this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node deleted' });
       }
       return;
     }
     if(this.currentNode['name'] === 'TestChild1'){
       console.log('match found');
       if (!this.currentNode.children) {
         this.parentNode.children.splice(this.parentNode.children.indexOf(this.currentNode,1));
         this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node deleted' });
       } else {
         this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Node with child node can not be deleted' });
       }
       return;
     }else{
       for(let node of this.currentNode.children){
         console.log(node['name']);
         if(node.children){
           this.parentNode = this.currentNode;
         }
         this.currentNode = node;
         this.removeNode();
       }
     }   */




    // this.updateServiceLine.data.children.forEach(function (node, index, object) {
    //   if (node.name === this.selectedNode[name]) {
    //     if (node.children && node.children.length == 0) {
    //       this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Node with child node can not be deleted' });
    //     } else {
    //       object.splice(index, 1);
    //     }
    //   }else{
    //     if(node.children && node.children)
    //   }
    // });
    // end of loop
    //}
  }

  // parent = this.updateServiceLine.data;
  removeNode1(parent) {

    if (!parent.children) {
      return;
    }

    var i = 0;
    while (i < parent.children.length) {
      var data = parent.children[i];
      if (data['name'] == this.selectedNode[name]) {
        // remove child - could save it in _children if you wanted to ever put it back
        if (!data.children || (data.children && data.children.length == 0)) {
          var child = parent.children.splice(i, 1);
          this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node deleted' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Node with child node can not be deleted' });
        }
        // length of child list reduced, i points to the next child
      }
      else {
        // not a bye - recurse
        this.removeNode1(parent.children[i]);
        // all the child's bye's are removed so go to the next child
        i++;
      }
    }
  }

  uploadNodeData(event, form) {
    //form.clear();
    this.treeService.uploadNodeData(event).subscribe(
      data => {
        form.clear();
        this.displayUpload = false;
        this.isView = false;
        this.treeService.getAllServiceLines().subscribe(
          data => {
            this.serviceLines = data;
          }
        )
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Uploaded sucessfully' });
      })
  }

  collapseAll() {
    this.dataList.forEach(node => {
      this.expandRecursive(node, false);
    });
  }

  expandAll() {
    this.dataList.forEach(node => {
      this.expandRecursive(node, true);
    });
  }


  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }


  confirmRemoveNode() {
    this.displayConfirm = true;
  }

  saveAs() {

    //unlock previous one


    this.updateSlMap["data"] = this.updateServiceLine.data;
    this.updateSlMap["meta"] = this.updateServiceLine.meta;
    this.updateSlMap["isLocked"] = false;
    this.treeService.lockService(this.updateSlMap, this.lineId).subscribe(
      data => {
        let details = {};
        details['isLocked'] = false;
        this.updateServiceLine.details = details;
        this.updateSlMap["details"] = this.updateServiceLine.details;
        this.treeService.publish(this.updateSlMap, this.lineId).subscribe(
          data => {
            this.updateSlMap = {};
            let oldId = this.updateServiceLine['_id'];
            this.updateServiceLine['_id'] = this.saveAsId;
            this.updateSlMap["data"] = this.updateServiceLine.data;
            this.updateSlMap["meta"] = this.updateServiceLine.meta;

            let details = {};
            details['isLocked'] = true;
            this.updateServiceLine.details = details;
            this.updateSlMap["details"] = this.updateServiceLine.details;


            this.treeService.saveAs(this.updateSlMap, this.saveAsId).subscribe(data => {
              //this.initialize('data1');
              this.displaySaveAs = false;
              this.showUpdateGraph(this.saveAsId);
              this.lineId = this.saveAsId;
              this.renameId = this.lineId;
              for (let item of this.items) {
                if (item.label === oldId) {
                  item.label = this.saveAsId;
                  break;
                }
              }
              this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Copy has been saved and set as current node' });
            })
          }
        )
      }
    )



  }

  rename() {
    let oldId = this.updateServiceLine['_id'];
    this.treeService.rename(this.updateServiceLine['_id'], this.renameId).subscribe(data => {
      this.showUpdateGraph(this.renameId);
      for (let item of this.items) {
        if (item.label === oldId) {
          item.label = this.renameId;
          break;
        }
      }
      this.displayRename = false;
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node renamed successfully' });
    })
  }
  onUploadNodeData(event: any) {

  }

  createTeample() {
    this.treeService.createTemplate().subscribe(data => {
      this.displayUpload = false;
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Successfully created a new Template document' });
    })
  }

}
