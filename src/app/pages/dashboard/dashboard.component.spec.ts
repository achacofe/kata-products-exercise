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

      it('should Q of a product is never greater than 50 except the Immutable that neither degrade nor modify their R.', fakeAsync(() => {
        testClickButton(30, closeButton);
        flush();
        fixture.detectChanges();

        Array.from(component.products).forEach((product, index) => {
          if(product.type === ProductType.immutable) {
            expect(product.quality).toBe(mockProducts[index].quality);
            expect(product.sellIn).toBe(mockProducts[index].sellIn);
          } else {
            expect(product.quality).not.toBeGreaterThan(50);
          }
        });
      }));

      describe('Cured products increase their Q as they age', () => {

        it('should Q increases by 2 when less than 10 days remain', fakeAsync(() => {
          component.products.map((product) => {
            if(product.type === ProductType.cured) {
              product.sellIn = 10;
            }
          });
          testClickButton(1, closeButton);
          flush();
          fixture.detectChanges();

          Array.from(component.products).forEach((product, index) => {
            if(product.type === ProductType.cured) {
              expect(product.quality).toBe(mockProducts[index].quality + 2);
            }
          });
        }));

        it('should Q increases by 3 when there are 5 days or less', fakeAsync(() => {
          component.products.map((product) => {
            if(product.type === ProductType.cured) {
              product.sellIn = 5;
            }
          });
          testClickButton(1, closeButton);
          flush();
          fixture.detectChanges();

          Array.from(component.products).forEach((product, index) => {
            if(product.type === ProductType.cured) {
              expect(product.quality).toBe(mockProducts[index].quality + 3);
            }
          });
        }));

        it('should Q increases by 1 when more are missing', fakeAsync(() => {
          component.products.map((product) => {
            if(product.type === ProductType.cured) {
              product.sellIn = 20;
            }
          });
          testClickButton(1, closeButton);
          flush();
          fixture.detectChanges();

          Array.from(component.products).forEach((product, index) => {
            if(product.type === ProductType.cured) {
              expect(product.quality).toBe(mockProducts[index].quality + 1);
            }
          });
        }));

        it('should Q falls to 0 when R falls from 0', fakeAsync(() => {
          component.products.map((product) => {
            if(product.type === ProductType.cured) {
              product.sellIn = 0;
            }
          });
          testClickButton(1, closeButton);
          flush();
          fixture.detectChanges();

          Array.from(component.products).forEach(product => {
            if(product.type === ProductType.cured) {
              expect(product.quality).toBe(0);
            }
          });
        }));
      });
    // TODO: complete functional test

  });
});
