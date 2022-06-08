import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  @ViewChild('editModal') editModal: TemplateRef<any>;

  selectedProductId: string = "";
  selectedProductName: string = "";
  showForm: boolean = false;
  products: any[] = [];
  oldData: any[] = [];
  form: FormGroup;
  submitType: string = 'Add';
  modalType: string;
  passHidden: boolean = true;
  showDropDown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      category: ['', [Validators.required]],
      isSub: ['', []],
      refId: ['', []],
      password: ['', [Validators.required]],
      fees: ['', [Validators.required]],
      feesPercent: ['', [Validators.required]],
    })
    this.products = this.getFromLocalStorage();
    this.oldData = JSON.parse(JSON.stringify(this.products));
  }

  setTolocalStorage(value: any) {
    localStorage.setItem('products', JSON.stringify(value));
  }

  getFromLocalStorage() {
    const arr = JSON.parse(localStorage.getItem('products')!) || [];
    return arr;
  }

  addProduct() {
    this.showDropDown = false;
    this.showForm = true;
    this.submitType = 'Add';
    this.selectedProductId = '';
    this.selectedProductName = '';
    this.form.reset();
  }

  deleteProduct() {
    const index = this.products.findIndex(item => item.id == this.selectedProductId);
    this.products.splice(index, 1);
    this.setTolocalStorage(this.products);
    this.resetForm();
    this.toastr.success('Product deleted successfully')
  }

  selectionChange(product: any) {
    this.selectedProductId = product.id;
    this.selectedProductName = product.name;
    this.showDropDown = false;
    this.showForm = true;
    this.submitType = 'Edit';
    const selected = this.products.find(item => item.id == this.selectedProductId);
    this.selectedProductName = selected.name;
    this.setFormValues(selected);

  }

  setFormValues(obj: any) {
    Object.keys(this.form.controls).forEach(key => {
      if (key !== 'id') {
        this.form.controls[key].setValue(obj[key]);
      }
    });
  }

  resetForm() {
    this.showForm = false;
    this.selectedProductId = '';
    this.selectedProductName = '';
    this.form.reset();
  }

  openModal(type: string) {
    this.modalType = type;
    this.modalService.open(this.editModal, { centered: true }).result.then(
      result => {
        if (type === 'submit') {
          this.submitForm();
        } else {
          this.deleteProduct();
        }
      }, reason => { }
    );
  }

  search(e: any) {
    const value = e.target.value;
    this.products = this.oldData.filter(function (item) {
      if ((item.name?.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1) || !value) {
        return true;
      }
    });
  }

  submitForm() {
    const formValue = this.form.value;
    if (this.submitType === 'Add') {
      const id = this.products.length + 1;
      this.form.value['id'] = id;
      this.selectedProductId = String(id);
      this.selectedProductName = formValue.name;
      this.products.push(formValue);
      this.submitType = 'Edit';
    } else {
      const index = this.products.findIndex(item => item.id == this.selectedProductId);
      formValue.id = this.selectedProductId;
      this.selectedProductName = formValue.name;
      this.products[index] = formValue;
    }
    this.setTolocalStorage(this.products);
    this.toastr.success('Changes saved successfully')
  }

}
