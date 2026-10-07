# WattWise™ React Web Application (`apps/web`)

Industrial SCADA control room and energy intelligence web application built with React 19, TypeScript, and Vite.

## Quickstart

1. **Copy configuration:**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure `VITE_API_BASE_URL` and `VITE_WS_URL`.*

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Development server:**
   ```bash
   npm run dev
   ```

4. **Lint and Typecheck:**
   ```bash
   npm run lint
   npm run build
   ```

5. **Playwright E2E Tests:**
   ```bash
   npx playwright test
   ```
