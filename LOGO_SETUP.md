# Logo Setup — ARAZI Logistics Admin Dashboard

Your logo is already configured to load from the live site URL.

## To use a local logo file instead

1. Save your logo as `src/assets/logo.png` (PNG with transparent background recommended)

2. Open `src/components/Sidebar.jsx`

3. Find this line near the top:
   ```js
   const LOGO_URL = 'https://s3.wasabisys...'
   ```

4. Replace it with:
   ```js
   import logoSrc from './assets/logo.png'
   const LOGO_URL = logoSrc
   ```

5. Run `npm run build` and redeploy to Vercel

## Logo display notes

- **Sidebar open**: logo shows at 42px height, up to 160px wide
- **Sidebar collapsed**: logo shows at 32px height (icon-only mode)
- `filter: brightness(0) invert(1)` makes the logo white on the dark sidebar
  — remove this line if your logo is already white/light coloured

## To remove the white filter (if your logo is already white)

In `Sidebar.jsx`, find:
```js
filter: 'brightness(0) invert(1)',
```
And delete that line.
