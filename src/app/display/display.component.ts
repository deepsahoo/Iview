import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreeService } from '../tree.service';
import { MenuItem } from 'primeng/api';
import { Detaildata } from '../Detaildata';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject, Injectable } from '@angular/core'
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

declare var d3: any;

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class DisplayComponent implements OnInit {

  @ViewChild('graphcontainer') elementView: ElementRef;

  display: boolean = false;
  items: MenuItem[];
  detailList: Detaildata[] = [];
  statisticsList: Detaildata[] = [];
  conItem: any[] = [];
  etaItem: any[] = [];;
  catItem: any[] = [];

  title = 'service-visualization-ui';
  totalNodes = 0;
  maxLabelLength = 0;
  // variables for drag/drop
  selectedNode = null;
  draggingNode = null;
  // panning variables
  panSpeed = 200;
  panBoundary = 20; // Within 20px from edges will pan when dragging.
  // Misc. variables
  i = 0;
  duration = 750;
  root: any;
  viewerWidth: any;
  viewerHeight: any;
  tree: any;
  diagonal: any;
  etaStatusEnum: any = {};
  categoryEnum: any = {};
  connectionTypeEnum: any = {};
  visibleSidebar2 = false;
  nodeDetail: any = {};

  isView: boolean = false;
  serviceLines: any[] = [];
  displaySaveAs = false;
  selectedServiceLine: any = {};
  saveAsId: string;
  updateSlMap: any = {};
  displayRename: boolean = false;
  renameId: string;

  constructor(private treeService: TreeService, @Inject(DOCUMENT) private document: any,
    private messageService: MessageService, private router: Router) {

  }


  ngOnInit(): void {

    this.initialize('data');
    /*this.items = [
      {
        label: '',
        icon: 'pi pi-bars',
        items: [{
          label: 'View',
          icon: 'pi pi-fw pi-sitemap',
          command: (event) => {
            if (this.isView) {
              this.isView = false;
            }
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
              this.display = true;
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
              this.router.navigate(['/update']);
            }
          }

        ]
      },

    ];*/


    this.items = [
      {
        label: '',
        icon: 'pi pi-bars',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-upload',
            command: (event) => {
              this.display = true;
            }
          }
        ]
      }
    ];
  }

  constructGraph(treeData) {


    // size of the diagram
    this.viewerHeight = window.innerHeight;
    this.viewerWidth = window.innerWidth;

    this.tree = d3.layout.tree().size([this.viewerHeight, this.viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    this.diagonal = d3.svg.diagonal().projection(function (d) {
      return [d.y, d.x];
    });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
      if (!parent) return;

      visitFn(parent);

      var children = childrenFn(parent);
      if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
          visit(children[i], visitFn, childrenFn);
        }
      }
    }

    // Call visit function to establish maxLabelLength
    let this1 = this;
    let treeData1 = treeData;
    visit(
      treeData1,
      function (d) {
        this1.totalNodes++;
        this1.maxLabelLength = Math.max(d.name.length, this1.maxLabelLength);
      },
      function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
      }
    );

    // sort the tree according to the node names

    function sortTree() {
      this1.tree.sort(function (a, b) {
        return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
      });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    /*function pan(domNode, direction) {
      var speed = this.panSpeed;
      if (panTimer) {
        clearTimeout(panTimer);
        translateCoords = d3.transform(svgGroup.attr('transform'));
        if (direction == 'left' || direction == 'right') {
          translateX =
            direction == 'left'
              ? translateCoords.translate[0] + speed
              : translateCoords.translate[0] - speed;
          translateY = translateCoords.translate[1];
        } else if (direction == 'up' || direction == 'down') {
          translateX = translateCoords.translate[0];
          translateY =
            direction == 'up'
              ? translateCoords.translate[1] + speed
              : translateCoords.translate[1] - speed;
        }
        scaleX = translateCoords.scale[0];
        scaleY = translateCoords.scale[1];
        scale = zoomListener.scale();
        svgGroup
          .transition()
          .attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')');
        d3.select(domNode)
          .select('g.node')
          .attr('transform', 'translate(' + translateX + ',' + translateY + ')');
        zoomListener.scale(zoomListener.scale());
        zoomListener.translate([translateX, translateY]);
        panTimer = setTimeout(function () {
          pan(domNode, speed, direction);
        }, 50);
      }
    }*/

    // Define the zoom function for the zoomable tree

    function zoom() {
      svgGroup.attr(
        'transform',
        'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')'
      );
    }

    // define the zoomListener which calls the zoom function on the "zoom" event varrained within the scaleExtents
    var zoomListener = d3.behavior
      .zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3
      .select('#graphcontainer')
      .append('svg')
      .attr('width', this.viewerWidth)
      .attr('height', this.viewerHeight)
      .attr('class', 'overlay tree-wrapper')
      .call(zoomListener);

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
      }
    }

    var overCircle = function (d) {
      this.selectedNode = d;
      this.detailList = [];
      this.statisticsList = [];
      this.nodeDetail = this.selectedNode.details;
      this.createNodeDetail(this.nodeDetail);
      updateTempConnector();
    };
    var outCircle = function (d) {
      this.selectedNode = null;
      this.nodeDetail = null;
      updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function () {
      var data = [];
      if (this.draggingNode !== null && this.selectedNode !== null) {
        // have to flip the source coordinates since we did this for the existing connectors on the original tree
        data = [
          {
            source: {
              x: this.selectedNode.y0,
              y: this.selectedNode.x0
            },
            target: {
              x: this.draggingNode.y0,
              y: this.this.draggingNode.x0
            }
          }
        ];
      }
      var link = svgGroup.selectAll('.templink').data(data);

      link
        .enter()
        .append('path')
        .attr('class', 'templink')
        .attr('d', d3.svg.diagonal())
        .attr('pointer-events', 'none');

      link.attr('d', d3.svg.diagonal());

      link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
      let scale = zoomListener.scale();
      let x = -source.y0;
      let y = -source.x0;

      // x = 200;
      x = x * scale + this1.viewerWidth / 2;
      // x = x * scale + this.viewerWidth / 4;

      // console.log('x: ', x);
      // console.log('this.viewerWidth: ', this.viewerWidth);
      // console.log('scale: ', scale);

      y = y * scale + this1.viewerHeight / 2;
      d3.select('g')
        .transition()
        .duration(this1.duration)
        .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
      zoomListener.scale(scale);
      zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      return d;
    }

    //var this1 = this;
    function update(source) {
      // Compute the new height, function counts total children of root node and sets tree height accordingly.
      // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
      // This makes the layout more consistent.
      var levelWidth = [1];
      var childCount = function (level, n) {
        if (n.children && n.children.length > 0) {
          if (levelWidth.length <= level + 1) levelWidth.push(0);

          levelWidth[level + 1] += n.children.length;
          n.children.forEach(function (d) {
            childCount(level + 1, d);
          });
        }
      };
      childCount(0, this1.root);
      var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
      this1.tree = this1.tree.size([newHeight, this1.viewerWidth]);

      // Compute the new tree layout.
      var nodes = this1.tree.nodes(this1.root).reverse(),
        links = this1.tree.links(nodes);

      // Set widths between levels based on maxLabelLength.
      nodes.forEach(function (d) {
        d.y = d.depth * (this1.maxLabelLength * 10); //this.maxLabelLength * 10px
        // alternatively to keep a fixed scale one can set a fixed depth per level
        // Normalize for fixed-depth by commenting out below line
        // d.y = (d.depth * 500); //500px per level.
      });

      // Update the nodes…
      let node = svgGroup.selectAll('g.node').data(nodes, function (d) {
        return d.id || (d.id = ++this1.i);
      });

      function displayDetails(data) {
        this1.selectedNode = data;
        this1.detailList = [];
        this.statisticsList = [];
        this1.nodeDetail = this1.selectedNode.details;
        this1.createNodeDetail(this1.nodeDetail);

      }

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        // .call(dragListener)
        .attr('class', 'node')
        .attr('transform', function (d) {
          return 'translate(' + source.y0 + ',' + source.x0 + ')';
        })
        .on('click', displayDetails);

      nodeEnter
        .append('circle')
        .attr('class', 'nodeCircle')
        .attr('r', 0)
        .style('fill', function (d) {
          return d._children ? 'darkslategray' : '#fff';
        })
        .on('click', function (d) {
          // Toggle children on click.

          if (d3.event.defaultPrevented) return; // click suppressed
          d = toggleChildren(d);
          update(d);
          centerNode(d);
        });

      nodeEnter
        .append('text')

        .attr('x', function (d) {
          return d.children || d._children ? -10 : 10;
        })
        .attr('dy', '.35em')
        .attr('class', 'nodeText')
        .attr('text-anchor', function (d) {
          return d.children || d._children ? 'end' : 'start';
        })
        .text(function (d) {
          return d.name;
        })
        .style('fill-opacity', 0);
      // Update the text to reflect whether node has children or not.
      node
        .select('text')
        //.attr("font-variant","small-caps")
        .style('fill', function (d) {
          return d.children || d._children ? 'lavenderblush' : 'azure';
        })
        .attr('x', function (d) {
          return d.children || d._children ? -10 : 10;
        })
        .attr('text-anchor', function (d) {
          return d.children || d._children ? 'end' : 'start';
        })
        .text(function (d) {
          return d.name;
        });

      // Change the circle fill depending on whether it has children and is collapsed
      node
        .select('circle.nodeCircle')
        .attr('r', 6)
        .style('fill', function (d) {
          // Important
          return this1.getNodeBackgroundColor(d.etaStatus);
        })
        .style('stroke', function (d) {
          // Important
          return this1.getNodeBoderColor(d.category);
        });

      // Transition nodes to their new position.
      var nodeUpdate = node
        .transition()
        .duration(this1.duration)
        .attr('transform', function (d) {
          return 'translate(' + d.y + ',' + d.x + ')';
        });

      // Fade the text in
      nodeUpdate.select('text').style('fill-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node
        .exit()
        .transition()
        .duration(this1.duration)
        .attr('transform', function (d) {
          return 'translate(' + source.y + ',' + source.x + ')';
        })
        .remove();

      nodeExit.select('circle').attr('r', 0);

      nodeExit.select('text').style('fill-opacity', 0);

      // Update the links…
      var link = svgGroup.selectAll('path.link').data(links, function (d) {
        return d.target.id;
      });

      // Enter any new links at the parent's previous position.
      link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function (d) {
          var o = {
            x: source.x0,
            y: source.y0
          };
          return this1.diagonal({
            source: o,
            target: o
          });
        })
        .attr('stroke-width', function (d) {
          return 1;
        })
        .attr('stroke', function (d) {
          // http://bl.ocks.org/shubhgo/80323b7f3881f874c02f
          // Important
          return this1.getConnectorColor(d.target.connectionType);
        });

      // Transition links to their new position.
      link
        .transition()
        .duration(this1.duration)
        .attr('d', this1.diagonal);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition()
        .duration(this1.duration)
        .attr('d', function (d) {
          var o = {
            x: source.x,
            y: source.y
          };
          return this1.diagonal({
            source: o,
            target: o
          });
        })
        .remove();

      // Stash the old positions for transition.
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append('g');

    // Define the root
    this1.root = treeData;
    this1.root.x0 = this.viewerHeight / 2;
    this1.root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(this1.root);
    // });

    // https://stackoverflow.com/questions/28754273/d3-js-tree-expand-all-and-collapse-all
    function collapseAll() {
      this1.root.children.forEach(collapse);
      collapse(this1.root);
      update(this1.root);
    }

    collapseAll();
    centerNode(this1.root);

  }

  /*displayDetails(data,this1) {
    this1.selectedNode = data;
    this1.detailList = [];
    this1.nodeDetail = this1.selectedNode.details;
    this1.createNodeDetail(this1.nodeDetail);

  }*/

  getNodeBackgroundColor(status) {
    const res = this.etaStatusEnum.items[status] || this.etaStatusEnum.items['000'];
    return res.color;
  }

  getNodeBoderColor(category) {
    const res = this.categoryEnum.items[category] || this.categoryEnum.items['000'];
    return res.color;
  }

  getConnectorColor(type) {
    const res = this.connectionTypeEnum.items[type] || this.connectionTypeEnum.items['000'];
    // console.log('res: ', res);
    return res.color;
  }

  createNodeDetail(nodeDetail) {
    for (let key of Object.keys(nodeDetail)) {
      let det1 = new Detaildata();
      det1.name = key;
      det1.value = nodeDetail[key];

      if (key === 'Process'
        || key === 'Group' || key === 'Owner' || key === 'Hosted Name' || key === 'Provider'
        || key === 'Consumer'
        || key === 'Integration Pattern' || key === 'Confidence Factor'
      ) {
        this.detailList.push(det1);
      }else{
        this.statisticsList.push(det1);
      }

    }
  }

  initialize(name) {

    // let parent = this.document.getElementById('graphcontainer');
    // let child = this.document.getElementsByTagName('svg').item(0);
    // if (child) {
    //   parent.removeChild(child);
    // }

    // call all the service lines

    this.treeService.getAllServiceLines().subscribe(
      data => {
        this.serviceLines = data;
        // console.log(data);
      }
    )

    // this.treeService.getNodes(name).subscribe(
    //   // the first argument is a function which runs on success
    //   data => {
    //     this.connectionTypeEnum = data.meta.connectionType;
    //     this.etaStatusEnum = data.meta.etaStatus;
    //     this.categoryEnum = data.meta.category;


    //     let this1 = this;

    //     this.conItem = Object.keys(this1.connectionTypeEnum.items).map(function (index) {
    //       let item = this1.connectionTypeEnum.items[index];
    //       return item;
    //     });

    //     this.etaItem = Object.keys(this1.etaStatusEnum.items).map(function (index) {
    //       let item = this1.etaStatusEnum.items[index];
    //       return item;
    //     });

    //     this.catItem = Object.keys(this1.categoryEnum.items).map(function (index) {
    //       let item = this1.categoryEnum.items[index];
    //       return item;
    //     });

    //     this.selectedNode = data.data;
    //     this.nodeDetail = this.selectedNode.details;
    //     this.createNodeDetail(this.nodeDetail);
    //     this.constructGraph(data.data);
    //   })
  }

  uploadNodeData(event, form) {
    //form.clear();
    this.treeService.uploadNodeData(event).subscribe(
      data => {
        form.clear();
        this.display = false;
        this.initialize('data');
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Uploaded sucessfully' });
      })

    /**,
    error =>{
      this.display = false;
      form.clear();
      this.messageService.add({severity:'error', summary: 'Error Message', detail:'Upload failed'});
    }**/

  }

  onUploadNodeData(event) {
    // alert('sucess');
  }

  showGraph(lineId: any) {
    this.isView = true;
    let isDelete = false;

    if (this.items.length > 1) {
      this.items.splice(-1, 1)
    }
    let newItem = {
      label: lineId,
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-fw pi-pencil',
          command: (event) => {
            this.router.navigate(['update', lineId]);
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
          label: 'Exit',
          icon: 'pi pi-sign-out',
          command: (event) => {
            this.isView = false;
            this.items.splice(this.items.indexOf(newItem, 0), 1);
            this.initialize('data');
          }
        }
      ]
    }

    this.items.push(newItem);



    //this.initialize('data');

    this.resetDOM();

    this.treeService.getNodes(lineId).subscribe(
      // the first argument is a function which runs on success
      data => {
        this.prepareMetaAndGraph(data);
      })


  }


  prepareMetaAndGraph(data: any) {
    this.connectionTypeEnum = data.meta.connectionType;
    this.etaStatusEnum = data.meta.etaStatus;
    this.categoryEnum = data.meta.category;
    let this1 = this;
    this.conItem = Object.keys(this1.connectionTypeEnum.items).map(function (index) {
      let item = this1.connectionTypeEnum.items[index];
      return item;
    });
    this.etaItem = Object.keys(this1.etaStatusEnum.items).map(function (index) {
      let item = this1.etaStatusEnum.items[index];
      return item;
    });
    this.catItem = Object.keys(this1.categoryEnum.items).map(function (index) {
      let item = this1.categoryEnum.items[index];
      return item;
    });
    this.selectedServiceLine = JSON.parse(JSON.stringify(data));
    this.selectedNode = data.data;
    this.nodeDetail = this.selectedNode.details;
    this.createNodeDetail(this.nodeDetail);
    this.constructGraph(data.data);
  }

  resetDOM() {
    let parent = this.document.getElementById('graphcontainer');
    let child = this.document.getElementsByTagName('svg').item(0);
    if (child) {
      parent.removeChild(child);
    }
  }

  saveAs() {
    //let oldId = this.selectedServiceLine['_id'];
    this.selectedServiceLine['_id'] = this.saveAsId;
    this.updateSlMap["data"] = this.selectedServiceLine.data;
    this.updateSlMap["meta"] = this.selectedServiceLine.meta;
    this.treeService.saveAs(this.updateSlMap, this.saveAsId).subscribe(data => {
      this.initialize('data1');
      this.displaySaveAs = false;
      this.showGraph(this.saveAsId);
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Copy has been saved and set as current node' });
    })
  }

  rename() {
    this.treeService.rename(this.selectedServiceLine['_id'], this.renameId).subscribe(data => {
      this.initialize('data1');
      this.displayRename = false;
      this.showGraph(this.renameId);
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Node renamed successfully' });
    })
  }
  createTeample(){
    this.treeService.createTemplate().subscribe(data => {
      this.display = false;
      this.initialize('data1');
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Successfully created a new Template document' });
    })
  }
}
