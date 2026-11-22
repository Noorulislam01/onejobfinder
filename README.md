# One Job Finder

One Job Finder is a responsive India-focused technology job search portal built with Vite and vanilla JavaScript, plus server-side API functions for provider credentials. It displays listings from configured feeds and does not scrape job boards or invent listings.

## Technology

- HTML, CSS, and ES modules (vanilla JavaScript)
- Vite for local development and production builds
- Fetch API for Remote OK, Jooble, and LinkedIn jobs
- Server-side API functions to keep provider keys private
- Installable Progressive Web App with app icons and an offline app shell
- LocalStorage for saved jobs and theme preference
- Inline CSS-drawn icon treatments; no icon runtime dependency

## Project structure

```text
public/                 Logo and favicon
src/
  app.js                Application state, view composition, navigation
  main.js               Entry point
  components/           Navbar, filters, cards, search, empty state, pagination
  config/               Central application configuration
  data/                 Categories and filter choices
  services/api/         Provider adapters and normalized job feed service
  services/storage/     Saved jobs and preferences
  styles/               Global theme and responsive rules
  utils/                Normalization, categorization, validation, formatting
```

## Install and run

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview it with `npm run preview`.

## Install on a phone or computer

The site is a Progressive Web App (PWA). On a deployed HTTPS site, open it in a supported browser and choose **Install app** or **Add to Home Screen** from the browser menu. During local development, `localhost` and `127.0.0.1` are secure origins; opening the dev server through a LAN IP on plain HTTP is not installable. This creates a browser-installed app, not an App Store or Google Play listing. The service worker caches the app shell, while job searches still need an internet connection.

## Job data and API security

The app shows India-based technology listings from Remote OK and, when configured, Jooble. Remote OK permits credited job aggregators; the app uses its name (not its logo), links each listing to its original post, and preserves the original application URL. Listings with non-India locations are filtered out. Remote OK results are cached for 24 hours; each Jooble keyword and location search is cached for one hour.

Indeed and LinkedIn are available as direct search links under the search box: the entered keywords open on the provider's own site. Their job listings are not mixed into the portal feed. Indeed's search integration is a partner Publisher JavaScript Plugin and access is provisioned by Indeed; LinkedIn's documented Jobs API is for creating and managing postings, not searching their public listings. Adding either as an in-app feed requires written/provider-approved access and credentials. Those credentials must be kept in a secure server-side integration, not frontend code.

Jooble requests pass through `api/jooble.js`, a Vercel serverless function. It validates search input, limits page size, keeps credentials out of browser code, and returns provider results. India searches require an India-specific key and `JOOBLE_API_HOST=in.jooble.org`; the default `jooble.org` key serves the US market. Jooble's free plan allows up to 100 requests per day per country key. For local development, copy `.env.example` to `.env.local`, then set `JOOBLE_API_KEY` and `JOOBLE_API_HOST`. `.env.local` is gitignored. Never prefix the key with `VITE_`. Adzuna remains server-side only until its credentials are configured.

Type an employer name such as IBM, Infosys, TCS, Wipro, HCLTech, or Accenture in the job search box to use Jooble's company-name search mode for India. This searches Jooble's index; it does not guarantee a complete mirror of an employer's careers site. The search input offers supported employer names as suggestions.

The feed adapter validates the response shape, normalizes records into the shared job model, and removes duplicates. Provider descriptions are rendered as text, not HTML. Details and application links preserve the provider's original URL.

## Add another provider

LinkedIn Job Search API (RapidAPI) is supported through `api/linkedin-jobs.js`. Configure `LINKEDIN_JOBS_RAPIDAPI_KEY` and `LINKEDIN_JOBS_RAPIDAPI_HOST` in `.env.local` for local development and as server environment variables in deployment. The browser calls the local server endpoint; the RapidAPI key is never sent to frontend code. Searches use the API's `title` or `organization`, `location`, `time_frame=7d`, and `limit=100` parameters. Results are normalized, attributed to LinkedIn, deduplicated, and filtered to India.

1. Read the provider's official terms and confirm browser access is authorized.
2. Add an adapter under `src/services/api/` that fetches and validates its response. If it requires a secret or disallows browser requests, call it only from a secure server-side integration.
3. Convert records with `normalizeJob` or a provider-specific mapping into the common schema (id, title, company, location, description, category, experience/salary bounds, employment type, remote, source, application URL, posted/fetched dates, and active flag).
4. Register the adapter in `jobService.js`, handle failures, and preserve the provider's attribution requirements.

## Extend categories and filters

- Add category labels and icon keys in `src/data/categories.js`; add keyword rules in `src/utils/jobCategorizer.js`.
- Add filter choices in `src/data/filterOptions.js` and corresponding matching logic in `filteredJobs()` in `src/app.js`. Filters are combined with AND across groups and OR within a group.
- Current experience and salary data remain unknown unless supplied by a provider; the UI does not infer these values. Filters for unspecified data are conservative and do not claim a match.

## Modify the UI

Edit reusable components in `src/components/` and styles in `src/styles/`. Theme colors use CSS custom properties in `global.css`; mobile breakpoints are in `responsive.css`. Views are composed in `src/app.js` and use DOM text nodes for untrusted listing content.

## Deploy to Vercel

1. Push the project to a GitHub repository.
2. Import the repository into Vercel and use the Vite preset. The build command is `npm run build` and output directory is `dist`.
3. In Vercel Project Settings → Environment Variables, add `JOOBLE_API_KEY` and `JOOBLE_API_HOST` for each deployment environment. Use the Jooble host associated with the country-specific key. Do not use `VITE_` names. Redeploy after saving the settings.

`vercel.json` includes an SPA fallback rewrite. The Remote OK feed requires no environment variable. No deployment has been performed from this repository.
