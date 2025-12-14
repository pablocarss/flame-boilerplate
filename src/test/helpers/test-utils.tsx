import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

/**
 * Provider wrapper para testes de componentes
 */
function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Custom render que inclui providers necessários
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Helper para criar mock de fetch
 */
export function mockFetch(response: any, ok = true, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
}

/**
 * Helper para criar mock de fetch com erro
 */
export function mockFetchError(error: string, status = 500) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error }),
      text: () => Promise.resolve(JSON.stringify({ error })),
    } as Response)
  );
}

/**
 * Helper para limpar mocks de fetch
 */
export function clearFetchMocks() {
  if (global.fetch && typeof global.fetch === 'function' && 'mockClear' in global.fetch) {
    (global.fetch as any).mockClear();
  }
}

/**
 * Helper para aguardar promessas pendentes
 */
export function waitForPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Helper para criar mock de toast
 */
export function mockToast() {
  return {
    toast: vi.fn(),
    dismiss: vi.fn(),
  };
}

/**
 * Re-export de todas as utilities do testing-library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
