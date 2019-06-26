import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-list-ubigeos',
  templateUrl: './list-ubigeos.component.html',
  styleUrls: ['./list-ubigeos.component.css']
})
export class ListUbigeosComponent implements OnInit {

  districts:any = [];
  provinces:any = [];
  departaments:any = [];
  file:boolean = false;
  fileContent:string = '';
  @ViewChild('alert') alert: ElementRef;

  constructor(private http: HttpClient) {
    $(document).ready(function(){
      $('#alert').hide();
    })
  }

  ngOnInit() {
    this.file = false;
    this.loadLocalData();
  }

  onChange(fileList: FileList): void {
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    let fileContent;
    fileReader.onloadend = (e) => {
      fileContent = fileReader.result;
      this.saveData(fileContent);
    }
    fileReader.readAsText(file);
    this.file = true;
  }

  loadLocalData(){
    if(!this.file){
      this.http.get('assets/ubigeo.txt', {responseType: 'text'}).subscribe(data => {
        this.fileContent = data;
        this.saveData();
      })
    }
  }

  saveData(file=''){
    if(file)this.fileContent=file;
    for (const line of this.fileContent.split(/[\r\n]+/)){ // read line by line
      let templine = line.replace(/['“]+/g, '').replace(/['”]+/g, ''); // delete quotation marks
      let ubigeos = templine.split("/",3); // split the line in 3 parts by '/'

      let pos = ubigeos[0].indexOf(' '); // first space position
      let depaCode = ubigeos[0].slice(0,pos);
      let depaName = ubigeos[0].slice(pos+1);
      if(!ubigeos[1])$('#alert').show();

      pos = ubigeos[1].slice(1).indexOf(' '); // first space position
      let provCode = ubigeos[1].slice(1,100).slice(0,pos);
      let provName = ubigeos[1].slice(1,100).slice(pos+1);

      pos = ubigeos[2].slice(1).indexOf(' '); // first space position
      let distCode = ubigeos[2].slice(1,100).slice(0,pos);
      let distName = ubigeos[2].slice(1,100).slice(pos+1);

      let exists = false;

      //Departamets
      for(let index of this.departaments){
        if(index.code === depaCode){
          exists = true;
          break;
        }
      }
      if(!exists)
        this.departaments.push({code:depaCode, name:depaName});
      
      //Provinces
      exists = false;
      for(let index of this.provinces){
        if(index.code === provCode){
          exists = true;
          break;
        }
      }
      if(!exists && provCode)
        this.provinces.push({code:provCode, name:provName, parentCode:depaCode, parentName:depaName});
      
      //Districts
      exists = false;
      for(let index of this.districts){
        if(index.code === distCode){
          exists = true;
          break;
        }
      }
      if(!exists && distCode)
        this.districts.push({code:distCode, name:distName, parentCode:provCode, parentName:provName});
    }
  }

  closeAlert() {
    this.alert.nativeElement.classList.remove('show');
  }
}
