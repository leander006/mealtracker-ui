# LogYourMeal - Frontend

React + TypeScript + Vite. See inline comments in `AuthContext.tsx` for the
documented token-storage tradeoff, and `client.ts` for the centralized
API/error-handling approach.

## Design concept

The visual identity is deliberately grounded in real nutrition-facts labels:
bold rule dividers, stacked large numbers for macros, high-contrast
paper/ink palette with a single hot red-orange accent, condensed display
type (Archivo Black) for numbers paired with Inter for body text. This
ties the UI directly to what the product does, rather than defaulting to
generic dark-mode SaaS styling.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Docker

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-backend.onrender.com -t meal-tracker-frontend .
docker run -p 8080:80 meal-tracker-frontend
```

Note: `VITE_API_BASE_URL` is baked in at build time, not read at runtime -
switching backend URLs requires rebuilding the image.
