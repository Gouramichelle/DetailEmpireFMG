// test/setup.js

// 1) Intenta registrar matchers oficiales
import '@testing-library/jasmine-dom';

// 2) Comprobación + fallback (por si 1) no surtió efecto en tu entorno)
beforeAll(() => {
  try {
    const probe = expect(document.createElement('div'));
    if (typeof probe.toBeInTheDocument !== 'function') {
      // Fallback mínimo para que no rompa (cubre a grandes rasgos el uso común)
      jasmine.addMatchers({
        toBeInTheDocument: () => ({
          compare: (el) => {
            const pass = !!el && !!document.documentElement && document.documentElement.contains(el);
            return {
              pass,
              message: pass
                ? 'Elemento está en el documento.'
                : 'Se esperaba que el elemento esté en el documento.'
            };
          },
        }),
      });
    }
  } catch (e) {
    // si por algún motivo 'expect' aún no existe, no hacemos nada
  }
});
