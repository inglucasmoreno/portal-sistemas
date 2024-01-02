import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  imports: [
    CommonModule
  ],
  styles: [
  ]
})
export class ModalComponent implements OnInit {
  
  @Input() showModal = false; // Control de modal

  constructor() { }
  ngOnInit(): void {}

}
