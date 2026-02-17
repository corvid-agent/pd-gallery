import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CollectionComponent } from './collection.component';
import { CollectionService } from '../../core/services/collection.service';

describe('CollectionComponent', () => {
  let fixture: ComponentFixture<CollectionComponent>;
  let component: CollectionComponent;
  let collectionService: CollectionService;

  beforeEach(() => {
    const mockStorage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({
      imports: [CollectionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    collectionService = TestBed.inject(CollectionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on favorites tab', () => {
    expect(component.activeTab()).toBe('favorites');
  });

  it('should switch tabs', () => {
    component.setTab('history');
    expect(component.activeTab()).toBe('history');
    component.setTab('curations');
    expect(component.activeTab()).toBe('curations');
  });

  it('should render tab buttons', () => {
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.collection__tab');
    expect(tabs.length).toBe(3);
  });

  it('should render empty state for favorites', () => {
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.collection__empty');
    expect(empty).toBeTruthy();
  });

  it('should create curation', () => {
    component.newCurationName.set('Test Curation');
    component.createCuration();
    expect(collectionService.curations().length).toBe(1);
    expect(component.newCurationName()).toBe('');
  });

  it('should not create curation with empty name', () => {
    component.newCurationName.set('   ');
    component.createCuration();
    expect(collectionService.curations().length).toBe(0);
  });

  it('should delete curation', () => {
    component.newCurationName.set('To Delete');
    component.createCuration();
    const id = collectionService.curations()[0].id;
    component.deleteCuration(id);
    expect(collectionService.curations().length).toBe(0);
  });
});
