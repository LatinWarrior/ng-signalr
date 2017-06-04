import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStreamComponent } from './task-stream.component';

describe('TaskStreamComponent', () => {
  let component: TaskStreamComponent;
  let fixture: ComponentFixture<TaskStreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
