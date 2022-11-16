import { PascalKebabCasePipe } from './pascal-kebab.pipe';

describe('PascalKebabCasePipe', () => {
  // Ejemplo de que la cobertura de código es un dato, pero puede llevarnos a falsos positivos
  // Ya que si desde product-detail.component.spec importan el modulo de esta pipe
  // nos da 100% de cobertura, pero realmente no tiene ningún test
  const pipe = new PascalKebabCasePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should display correct format', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should transform string on Pasca-Kebab format', () => {
    expect(pipe.transform('pasca kebab')).toBe('Pasca-Kebab');
  });

  it('should transform white space on screenplay', () => {
    expect(pipe.transform(' ')).toBe('-');
  });
});
