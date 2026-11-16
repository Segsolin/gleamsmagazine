# This guide is superseded by VISUAL_AUDIT_V2.md

This is the earlier video-only rebuild guide and may describe older section types and submission handling. Refer to [`VISUAL_AUDIT_V2.md`](VISUAL_AUDIT_V2.md) for the eight-screenshot + video update, form inbox, and v2 migration instructions.

---

# GLEAMS visual reference rebuild — November 2026

## What was inspected

- User-supplied recording `Gleams Ui Preview.mp4`, duration approximately 4:23, 1918×1074. Key screens were inspected at the beginning, the magazine page and editorial feature, the Awards category and nomination forms, the Studios work and reel modal, Conversations and audio overlay, the footer, and the FIRST SOUND listening desk.
- The supplied site URL `https://gleams.ai.studio/` was opened through a web-reading tool. It responded, but the JavaScript-driven page exposed no readable DOM/text and the environment could not fetch the site's assets or perform an interactive live-browser comparison.

This is a **video-grounded reconstruction**, NOT a verified pixel-perfect copy of the live site. Exact original assets, font files/font-family names, responsiveness at unseen breakpoints, complete article bodies, and video/audio sources cannot be established from the walkthrough alone.

## Design details implemented from the reference

- Sticky charcoal navigation with outlined gold GLEAMS logo placeholder, wide-tracked wordmark, compact uppercase links, search overlay and Explore action.
- Green cinematic home hero, huge white serif wordmark, italic gold tagline, two rounded buttons, story/recognition/foundation/film/dialogue/sound/academy quick links.
- Deep charcoal ecosystem grid with gold-bordered hover lift and connected six divisions plus Creative Academy.
- Compact dark editorial-project showcase strip.
- Warm ivory magazine hero, editorial-style photography, cover feature and three-column story grid, news dispatch.
- Long-form magazine article view with metadata, cover and readable editorial body.
- Dark awards hero, nomination category cards, nominations and partnership forms.
- Studios hero, film gallery with playable modal when a file or provider URL is set, production initiative cards.
- Ivory conversations show tiles, session listing and audio detail modal.
- Ivory FIRST SOUND spotlight cards and fixed floating audio dock that supports seeking, pause/play, mute and close (only when an audio source is provided).
- Responsive tablet/mobile layouts and reduced-motion preferences.

## Media reference quality and limitations

The six bundled WebP images in `web/public/assets/reference/` are crops derived from the uploaded walkthrough to capture the reference *subject matter*. They are **not** original-res photographs. They should be replaced from the media library when the source pictures are available. No playable film/audio file was supplied; no fake media was generated. On a collection entry, edit **metadata** as JSON:

Film example:

```json
{"media_url":"/uploads/<video-file>.mp4","category":"ORIGINAL FILM","duration":"86 MIN"}
```

Audio example:

```json
{"audio_url":"/uploads/<audio-file>.mp3","artist":"Artist name","label":"EPISODE / RELEASE"}
```

The admin supports uploading image, MP4/WebM video, and MP3/WAV/OGG audio files up to 80 MB, then copying their `/uploads/...` path. For larger files use a suitable CDN or compatible hosting, and provide the public media URL in the metadata. The media modal also supports YouTube or Vimeo playback URLs.

## Setting up the redesigned frontend and CMS

For an existing project, **back up MySQL and your project directory first**, then replace project source files with the ones in the new ZIP. Keep your working `server/.env` secure and do not overwrite it with a template. From the project root:

```powershell
npm install
npm run db:setup
npm run design:seed
npm run dev
```

**Important:** `npm run design:seed` is an **explicit one-time migration**. It replaces the *visible page-section layouts* of nine named pages with the new editable reference-inspired layouts. Before deletion, it inserts JSON backups of their old sections into `gleams_design_backups`. It does **not** delete existing posts or collections, but it seeds examples from the recorded website and updates navigation labels. Existing editors can continue to create, reorder, edit, hide, or delete all sections from `/admin/pages` → **Edit page sections**. The first run records `reference_design_seeded_v1`; later runs skip unless explicitly given `npm run design:seed -- --force`.

For a **fresh** database, run `npm run db:setup`, then `npm run design:seed` and `npm run admin:create` before starting the app. Both DB migrations require configured MySQL credentials and a working database connection.

## How to edit everything after installation

| Content | Admin area |
| --- | --- |
| Text, headings, descriptions, page sections, buttons, home hero and their order | Pages → Edit page sections |
| Ecosystem cards, award categories, conversation feature tiles | Page sections → **Editable cards** |
| Nomination / First Sound / partnership form fields | Page sections → **Editable form fields** |
| Videos, audio, film entries, artists, initiatives and ordering | Collections + Collection entries → Extra fields (JSON) |
| Film / audio / photo uploads | Media library (copy generated path into appropriate fields) |
| Magazine cover story and articles, category filters | Posts & stories → Featured/Publish |
| Editorial categories | Categories |
| Navigation links | Navigation |
| Logo, footer statement, footer link-column JSON, social links, contact info and SEO | Site settings |
| Incoming nominations and music/contact submissions | Contact inbox (subject labels each type) |
| Newsletter | Subscribers |

### Caution about forms

Website submissions currently enter the existing **Contact inbox** rather than separate nomination/audio database tables. Uploaded file attachments are not accepted via these public forms; artists supply a link to their audio. This is an intentional safe interim design: no promise of a file-upload workflow that the API does not yet implement.

## Remaining accuracy and verification gaps

1. Cannot verify computed CSS/font family from the original web app, as it exposes no readable document data and this environment cannot load its scripts. Closest visual approximations use Cormorant Garamond + DM Sans/Montserrat with Georgia fallbacks.
2. Original photos and videos must be supplied to achieve original image fidelity; current crops are preview-quality.
3. Source was validated with Node syntax checks and a JSX parser, but a real React production build and end-to-end browser tests require installing npm dependencies and a working MySQL server. No live site deployment was attempted.
4. Some recorded pages and hidden interactions were not shown in the walkthrough; these are implemented by a consistent template rather than falsely inferred exact screenshots.

### Footer column links

In Admin → Site settings → Footer content, `Footer link columns JSON` accepts a JSON array of column objects. For example:

```json
[{"title":"EDITORIAL","links":[["Gleams Magazine","/magazine"],["Culture & Society","/magazine"]]}]
```

Each link may be a `[label, url]` pair or an object `{ "label": "...", "url": "..." }`. Leave the field empty to use the reference-inspired four-column footer.
