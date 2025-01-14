import { expect } from 'chai';
import safeStringify from 'fast-safe-stringify';
import * as hash from 'object-hash';
import { SingleScope } from '../../../common';
import { ModuleTokenFactory } from '../../injector/module-token-factory';

describe('ModuleTokenFactory', () => {
  let factory: ModuleTokenFactory;
  beforeEach(() => {
    factory = new ModuleTokenFactory();
  });
  describe('create', () => {
    class Module {}
    it('should force global scope when it is not set', () => {
      const scope = 'global';
      const token = factory.create(Module as any, [Module], undefined);
      expect(token).to.be.deep.eq(
        hash({
          module: Module,
          dynamic: '',
          scope,
        }),
      );
    });
    it('should returns expected token', () => {
      const type = SingleScope()(Module) as any;
      const token = factory.create(type, [Module], undefined);
      expect(token).to.be.deep.eq(
        hash({
          module: type,
          dynamic: '',
          scope: [Module.name],
        }),
      );
    });
    it('should include dynamic metadata', () => {
      const type = SingleScope()(Module) as any;
      const token = factory.create(type as any, [Module], {
        providers: [{}],
      } as any);
      expect(token).to.be.deep.eq(
        hash({
          module: type,
          dynamic: safeStringify({
            providers: [{}],
          }),
          scope: [Module.name],
        }),
      );
    });
  });
  describe('getDynamicMetadataToken', () => {
    describe('when metadata exists', () => {
      it('should return hash', () => {
        const metadata = { providers: ['', {}] };
        expect(factory.getDynamicMetadataToken(metadata as any)).to.be.eql(
          JSON.stringify(metadata),
        );
      });
      it('should return hash with class', () => {
        class Provider {}
        const metadata = { providers: [Provider], exports: [Provider] };
        expect(factory.getDynamicMetadataToken(metadata)).to.be.eql(
          '{"providers":["Provider"],"exports":["Provider"]}',
        );
      });
    });
    describe('when metadata does not exist', () => {
      it('should return empty string', () => {
        expect(factory.getDynamicMetadataToken(undefined)).to.be.eql('');
      });
    });
  });
  describe('getScopeStack', () => {
    it('should map metatypes to the array with last metatype', () => {
      const metatype1 = () => {};
      const metatype2 = () => {};
      expect(
        factory.getScopeStack([metatype1 as any, metatype2 as any]),
      ).to.be.eql([metatype2.name]);
    });
  });
});
