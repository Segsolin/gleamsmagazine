# GLEAMS design-fidelity update (screenshots + video)

## Scope and reference evidence

This revision was compared against **eight screenshots supplied by the user** of the GLEAMS home page, Explore drawer, Magazine, Awards, Studios, Conversations, Foundation and First Sound, plus the user's approximately 4-minute 23-second website video walkthrough. The screenshots govern visible typography, relative placement, card treatment, colors and section order; the video provides evidence of hover, transition and media controls.

The website `https://gleams.ai.studio/` was also opened, but its JavaScript-driven content and computed CSS were **not accessible for full inspection in this environment**. This revision is a screenshot/video-grounded high-fidelity reconstruction, **not a certified pixel-perfect replica** or a live-site source extraction. Exact image files, font file data, media URLs, every hidden interaction, and layout at unseen viewports remain unverified. Preview-quality WebP crops from the user's recording stand in for photographs until original assets are provided.

## Changes in this version

| Area | Implemented from the reference | CMS-managed data |
| --- | --- | --- |
| Header and Explore | Charcoal header, bold tracked wordmark, gold navigation states, search, right-hand Explore drawer with background blur, close button, backdrop click and Escape close | Navigation and **Site settings → Explore drawer** |
| Homepage | Cinematic hero, ecosystem tiles, magazine cover, awards teaser, Conversations, Foundation, First Sound, The Drive and Archive with a matching final footer | **Pages → home → Edit sections** and linked posts/collections |
| Magazine | Cream editorial hero, category chips, search input, large cover story and 3-column cards | **Pages**, **Posts & stories**, **Categories** |
| Awards | Contrast alternation, award-purpose/recognition tiles, category matrix, eligibility, nomination, selection process, fashion showcase and partnerships | **Pages → awards**, editable forms and cards |
| Studios | Dark introduction, capabilities, film reel gallery, hover playback button and video modal | **Pages → studios** and **Collection entries → films** |
| Conversations | Warm cream typography, format tiles, session filters, rows with media actions | **Pages → conversations** and **Collection entries → conversations** |
| Foundation | Dark intro, metric strip, three initiative cards and partnership form | **Pages → foundation**, **Collection entries → initiatives** |
| First Sound | Cream intro, 2-column spotlight artist cards with audio player controls and listening-desk submission form | **Pages → first-sound**, **Collection entries → first-sound** |
| Forms | Configurable public form fields, submissions persisted to a separate SQL table and admin inbox | **Admin → Form submissions** |
| Shared typography | Rebalanced serif headline weights, sizes, line heights, compact uppercase labels, cream/charcoal/gold palette, responsive grids and hover transitions | Page section headings and descriptions |

## Install into an existing GLEAMS project

**Back up the current project and MySQL database first.** Preserve the existing `server/.env`, admin account, and original uploads folder. Extract the ZIP over your project only after backing up edited code. Do **not** paste the MySQL password into this chat; put it privately in `server/.env`.

From the project root on Windows PowerShell:

```powershell
npm install
npm run db:setup
npm run design:seed
npm run dev
```

Open `http://localhost:5173` and `http://localhost:5173/admin`. For a fresh install, also run `npm run admin:create`.

- `npm run db:setup` creates or retains schema tables, including `form_submissions`. No current table is dropped by the schema file.
- `npm run design:seed` runs the **v2** reference seed once. The process **backs up the prior page-section rows** into `gleams_design_backups` and replaces the layouts of the named pages. It will add example posts and media-collection entries only if the same slugs do not already exist. Existing edited posts are not deleted. It also updates navigation and selected shared settings. **This modifies your displayed website content, so back up first.**
- For an already-v2-seeded install, the normal command skips. `npm run design:seed -- --force` replaces page-section layouts again and should **not** be used after adding custom page content unless you intend to restore/refine it.
- Admin **Form submissions** uses the new `form_submissions` table, separate from the existing Contact inbox. The public forms are link/text based; they do **not** upload source music/video files as attachments.

## Admin editing map

- **Pages / Edit page sections:** Add, remove, reorder, show/hide, and edit texts, calls to action, new reference-style panels, photo grids, split rows, awards and impact metrics, and form fields.
- **Posts & stories / Categories:** Write and publish magazine posts, select covers, feature stories, edit categories.
- **Collections / Collection entries:** Change films, artists, initiatives and conversation episodes; the content cards are populated from collection entries.
- **Media library:** Upload and choose images, video and audio; put public media URLs into a collection entry's media metadata. An empty media URL cannot play genuine audio/video.
- **Site settings / Navigation / Explore drawer / Footer:** Control branding, labels, header links, drawer links and newsletter/footer content.
- **Form submissions / Contact inbox / Subscribers:** Review new structured enquiries, contact requests and subscribers.

### Media metadata examples

Store the original playable file's URL/path in an appropriate collection entry's metadata. For example:

```json
{"media_url":"/uploads/gleams-film.mp4","category":"ORIGINAL FILM","duration":"86 MIN"}
```

```json
{"audio_url":"/uploads/first-sound-track.mp3","artist":"Artist name","label":"FIRST SOUND • CURATED"}
```

The visuals include media buttons; actual streaming depends on reachable media URLs and browser permissions. Do not mistake video-derived stills for full-resolution assets.

## Verification and outstanding gaps

- JSX syntax was checked with a TypeScript JSX parser; Node server files and seed scripts passed `node --check`. CSS parsing and ZIP integrity are also checked during packaging.
- A live React production build, browser visual regression testing and MySQL integration were **not completed** in this environment because local npm dependencies and production database access are not available.
- The installed font family names, exact pixel measurements and original image/audio/video assets cannot be proven from screenshots or the inaccessible JavaScript-rendered live CSS. Font and weight refinements are visually guided.
- Compare the updated local UI to the supplied screenshots at matching viewport widths and browser zoom; replace the cropped preview images with originals before calling the match final.

## Deployment notes

Use a Node.js-capable host for the Express API, secure DB credentials in environment variables, and a build of the React frontend for static delivery. Keep your actual `DB_HOST=195.35.53.74` and `DB_NAME=u853919099_gleams` values in the server environment as configured, subject to whether MySQL allows connections from your app host. Never put database credentials in the client/Vite environment.
