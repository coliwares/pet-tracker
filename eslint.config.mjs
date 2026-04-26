import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', '.claude/**', 'playwright-report/**', 'test-results/**'],
  },
];

export default config;
