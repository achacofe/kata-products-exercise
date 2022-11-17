import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { Product, ProductType } from 'src/app/models/product';
import { mockProducts } from 'src/app/models/product.mock';
import { ProductService } from 'src/app/services/product.service';
import { DashboardComponent } from './dashboard.component';

export function testClickButton(numClick: number, buttonElement: HTMLButtonElement) {
    Array.from({length: numClick}).forEach((element) => {
      buttonElement.click();
    });
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let productService: ProductService;
  let serviceSpy: jasmine.Spy<() => Observable<Product[]>>;
  let spySimulation: jasmine.Spy<() => void>;
  let closeButton: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [CommonModule, HttpClientTestingModule, RouterTestingModule],
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance; // DashboardComponent test instance
    productService = TestBed.inject(ProductService);
    serviceSpy = spyOn(productService, 'getProducts').and.returnValue(
      of(mockProducts)
    );
    spySimulation = spyOn(component, 'simulation').and.callThrough();

    fixture.detectChanges();
    closeButton = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;
  });

  it('should exist', () => {
    expect(component).toBeTruthy();
  });

  xdescribe('should manage products', () => {
    it('should retrieve products onInit', () => {
      expect(component.products.length).toBe(5);
      fixture.detectChanges();

      expect(serviceSpy).toHaveBeenCalled();
      expect(component.products.length).toBe(mockProducts.length);
      expect(component.products[0].constructor.name).toBe('Product');
    });

    it('should draw as many product cards as it retrieve', () => {
      //spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('.product-card'));
      expect(component.products.length).toBe(cards.length);
    });
  });
  describe('Product simulation', () => {
      it('should be a button that subtracts in one the R of all products listed products', fakeAsync(() => {
        const [breadR, cheeseR, yogurtR, salR, hamR] = component.products.map((product) => product.sellIn - 1);
        testClickButton(1, closeButton);
        flush();

        expect(spySimulation).toHaveBeenCalled();

        const [bread, cheese, yogurt, sal, ham] = component.products.map((product) => product.sellIn);
        fixture.detectChanges();
        // Expect the R of all products now to be an amount less than they had initially
        expect(bread).toBe(breadR);
        expect(cheese).toBe(cheeseR);
        expect(yogurt).toBe(yogurtR);
        expect(sal).not.toBe(salR);
        expect(ham).toBe(hamR);
      }));

      it('should degrades at twice the speed the Q product when once the R drops below', fakeAsync(() => {
        // Esta condición la cumple el pan, cuando la R es menor a 0 la Q degrada el doble
        const [breadQuality] = component.products.filter((product) => { return product.id === 11 }).map((product) => product.quality - 7);
        testClickButton(6, closeButton);
        flush();

        const bread = component.products[0].quality;
        expect(bread).toBe(breadQuality);
      }));

      it('should lowers the Q 1 unit per day when R is greater or equal to 0', fakeAsync(() => {
        const [breadQuality] = component.products.filter((product) => { return product.id === 11 }).map((product) => product.quality - 5);
        testClickButton(5, closeButton);
        flush();

        const bread = component.products[0].quality;
        expect(bread).toBe(breadQuality);
      }));

      it('show your tab in red when a product drops its quality to 0', fakeAsync(() => {
        const cardYogurt: DebugElement[] = fixture.debugElement.queryAll(By.css('.product-card'));
        testClickButton(6, closeButton);
        flush();

        fixture.detectChanges();

        expect(cardYogurt[2].nativeElement.className).toBe('product-card bad');
      }));

      it('should be quality is never negative', fakeAsync(() => {
        testClickButton(12, closeButton);
        flush();

        Array.from(component.products).forEach(product => {
          expect(product.quality).toBe(Math.abs(product.quality));
        });
      }));

      describe('Antique type products increase in quality as they age', () => {
        it('should increase Q 1 unit each day when antique type products increase in quality as they age', fakeAsync(() => {
          const [breadQuality] = component.products.filter((product) => { return product.id === 12 }).map((product) => product.quality + 2);
          testClickButton(2, closeButton);
          flush();

          const bread = component.products[1].quality;
          expect(bread).toBe(breadQuality);
        }));

        it('should its after R increases 2 units per day when antique type products increase in quality as they age', fakeAsync(() => {
          const [breadQuality] = component.products.filter((product) => { return product.id === 12 }).map((product) => product.quality + 4);
          testClickButton(3, closeButton);
          flush();

          const bread = component.products[1].quality;
          expect(bread).toBe(breadQuality);
        }));
      });

      it('should appear in green when a product reaches the highest quality of its kind it', fakeAsync(() => {
        const cardYogurt: DebugElement[] = fixture.debugElement.queryAll(By.css('.product-card'));
        testClickButton(26, closeButton);
        flush();
        fixture.detectChanges();

        expect(cardYogurt[1].nativeElement.className).toBe('product-card good');
        expect(cardYogurt[3].nativeElement.className).toBe('product-card good');
      }));

      xit('should Q of a product is never greater than 50 except the Immutable', fakeAsync(() => {
        const cardYogurt: DebugElement[] = fixture.debugElement.queryAll(By.css('.product-card'));
        testClickButton(26, closeButton);
        flush();
        fixture.detectChanges();

        expect(cardYogurt[1].nativeElement.className).toBe('product-card good');
        expect(cardYogurt[3].nativeElement.className).toBe('product-card good');
      }));


    // it('should be accessible through the template', () => {
    //   // is it a good idea to call the function?
    //   // Not really, as we just want to check that it can be accessed.

    //   serviceSpy.and.returnValue(of(mockProducts));
    //   fixture.detectChanges();

    //   const btn = fixture.debugElement.query(By.css('.btn-primary'));
    //   btn.nativeElement.click();

    //   expect(spySimulation).toHaveBeenCalled();
    // });

    // it('should be accessible through the template', () => {
    //   // is it a good idea to call the function?
    //   mockProducts[4].sellIn = 5;
    //   fixture.detectChanges();

    //   serviceSpy.and.returnValue(of(mockProducts));
    //   fixture.detectChanges();

    //   expect(mockProducts[4].quality).toBe(20);

    //   mockProducts[4].sellIn = 0;
    //   fixture.detectChanges();

    //   serviceSpy.and.returnValue(of(mockProducts));
    //   fixture.detectChanges();

    //   expect(mockProducts[4].quality).toBe(20);
    // });

    // it('should be accessible through the template', () => {
    //   // is it a good idea to call the function?
    //     mockProducts[0].sellIn = 1;
    //     fixture.detectChanges();

    //     serviceSpy.and.returnValue(of(mockProducts));
    //     fixture.detectChanges();

    //     console.log('mockProducts[0]: ', mockProducts[0]);
    //     // Random 10 or 22 - 10
    //     expect(mockProducts[0].quality).toBe(22);
    // });

    // it('should be accessible through the template', () => {
    //   // is it a good idea to call the function?
    //   mockProducts[1].sellIn = 0;
    //   fixture.detectChanges();

    //   serviceSpy.and.returnValue(of(mockProducts));
    //   fixture.detectChanges();


    //   expect(mockProducts[1].quality).toBe(1);
    // });

    // TODO: complete functional test

  });
});
