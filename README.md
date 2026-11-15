# GLEAMS WORLD — Website + CMS

A full-stack content-managed website starter for GLEAMS, built with **React + Vite** (public website and CMS interface), **Node.js + Express** (REST API), and **MySQL**. All editable website content is stored in MySQL rather than hardcoded into React.

## What's included

- Public website with a premium responsive design for GLEAMS: Home, About, Awards, Magazine, FIRST SOUND, Foundation, Studios, Contact and Stories.
- Dynamic page sections: hero banners, editorial text, image/text split layouts, cards, metrics, calls to action, embedded collections, newsletter and contact forms.
- Admin login at `/admin`, password visibility toggle and role-based access (`super_admin` / `editor`).
- CMS dashboard with page management, section editor + reorder/hide, draft/publish posts, story categories, SEO fields, menus, media uploads, collection management (events, initiatives, partners, etc.), contact inbox, subscriber export, settings, team access and audit history.
- Security basics: bcrypt password hashing, HTTP-only signed session cookies, Origin/custom-header checks, route guards, login rate limiting, input validation, restricted image uploads, parameterized MySQL queries.
- A non-destructive, repeatable schema+content seed (will not overwrite existing content).
- Public API endpoints and an optional production build served by Express.

**Note on content:** Existing publicly available GLEAMS profile information was used to create the initial structure. Some descriptive copy and all stock photo URLs are **editable starter content**. The original site's full source/design and media assets were not accessible; this is a new implementation, not an exact one-to-one migration. No existing MySQL records are fetched or overwritten by this package until you configure the DB and run setup.

## Project structure

```text
  gleams-cms/
    package.json                   # workspace scripts
    web/                           # React + Vite website and /admin CMS
      src/components/              # public site
      src/admin/                   # CMS dashboard/editor
    server/
      .env.example                 # database / server configuration template
      src/server.js                # Express server
      src/routes-public.js         # public website API
      src/routes-admin.js          # authenticated CMS API
      db/schema.sql                # MySQL schema (CREATE TABLE IF NOT EXISTS)
      scripts/setup-db.js          # schema + starter content
      scripts/create-admin.js      # initial super admin user
      uploads/                     # local media storage (configure persistence in production)
```

## Requirements

- Node.js 20 or newer, npm 10 or newer
- An accessible **MySQL 8+** database (MySQL 5.7 may work, but MySQL 8+ is preferred)
- Your actual MySQL **username** and **password** (not contained in this project)
- MySQL database: `u853919099_gleams`
- Server hostname as supplied: `195.35.53.74` (only use this if it is the **MySQL** host; verify with your provider)

## Windows / PowerShell — local setup

```powershell
# 1. Unzip and open the project folder
cd .\gleams-cms

# 2. Install dependencies in root, server and web (automated via postinstall)
npm install

# 3. Create the private server configuration
Copy-Item .\server\.env.example .\server\.env

# 4. Edit server/.env in your editor:
# DB_HOST=195.35.53.74
# DB_PORT=3306
# DB_NAME=u853919099_gleams
# DB_USER=<the actual database username>
# DB_PASSWORD=<the actual database password>
# SESSION_SECRET=<64+ random characters>
# PUBLIC_ORIGIN=http://localhost:5173

# Generate a strong SESSION_SECRET if desired:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 5. Initialize tables and starter pages. Does not remove existing tables.
npm run db:setup

# 6. Create the first super admin, using environment variables.
# Replace these values with your own, strong credentials.
$env:ADMIN_NAME="Website Administrator"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="replace-with-a-strong-unique-password"
npm run admin:create
Remove-Item Env:ADMIN_PASSWORD

# 7. Verify DB configuration / schema, then start both servers
npm run doctor
npm run dev
```

Open:

- Website: **http://localhost:5173**
- Admin dashboard: **http://localhost:5173/admin**
- API health check: **http://localhost:5100/api/health**

### If the database connection fails

- `ECONNREFUSED` or `ETIMEDOUT`: verify DB host, port 3306, firewall and **remote MySQL access allowlisting** for the IP of the computer or server that initiates the connection.
- `ER_ACCESS_DENIED_ERROR`: verify full MySQL username/password and host-specific privileges.
- `ER_BAD_DB_ERROR`: verify database `u853919099_gleams` already exists and the user has privileges.
- When Node and MySQL are hosted on the same Hostinger shared/managed hosting service, their docs recommend testing `DB_HOST=127.0.0.1` **instead of** your public IP. The IP you provided remains the initial local-development setting.

If you don't have the database username/password, obtain them privately from your hosting dashboard. **Do not post passwords in chat or commit `.env` to a git repository.**

## How to edit your website

1. Sign in at `/admin` with the account created by `npm run admin:create`.
2. **Pages** > select a page > **Sections** icon to edit hero titles, text, cards, images, visibility and order. Use `Add section` for new website sections.
3. **Posts & stories** > Add new > write in Markdown, upload/copy a media image and select `published` when ready. Drafts are not visible publicly; published articles show in `/stories` and the `latest_posts` homepage block.
4. **Navigation** manages header and footer links, order and visibility.
5. **Collections** defines lists (events, initiatives, partners, etc.), and **Collection entries** holds their items. Place a collection section on a page with its slug (e.g. `events`).
6. **Media library** accepts JPEG, PNG, WebP and GIF up to 8 MB; click `Copy path` to reuse a photo in page fields.
7. **Site settings** controls logo, tagline, footer, social links, contact details, SEO defaults and announcement bar.
8. **Contact inbox** reads submissions. **Subscribers** can be exported as CSV. **Team & permissions** is restricted to super admins.

**Email delivery:** The contact form stores messages in the CMS inbox. The newsletter form stores subscriber addresses. Actual transactional email sending or mailing-list broadcasts require a separate SMTP / email service integration and are **not** included.

## Production / hosting

Build the public site:

```powershell
npm run build
npm start
```

Express can serve the `web/dist` production build and same-origin `/api` and `/uploads` endpoints. Configure a reverse proxy or Hostinger Web App to route your domain to this Node process. Set environment variables:

```dotenv
NODE_ENV=production
PORT=5100
PUBLIC_ORIGIN=https://gleams.ai.studio
DB_HOST=195.35.53.74
DB_PORT=3306
DB_NAME=u853919099_gleams
DB_USER=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD
SESSION_SECRET=YOUR_LONG_RANDOM_SECRET
```

For deployment on the same Hostinger account as the MySQL server, you may need to set `DB_HOST=127.0.0.1`. Check the actual MySQL hostname in hPanel first.

### Hostinger managed Node hosting

Where supported by your plan, upload the project as a Node web application or deploy from GitHub. Use the root `package.json`, install command `npm install`, build command `npm run build`, and startup command `npm start` if the platform allows custom commands. The root `postinstall` automatically installs server and web dependencies. Set environment variables securely in hPanel.

**Important:** User-uploaded media is written to disk. On hosts where each deployment replaces the app directory, uploaded files may disappear on redeploy. Prefer stable persistent storage; set `UPLOAD_DIR` to a persistent, writable folder **outside** build releases where your hosting permits it. For high-traffic production, migrate uploads to S3-compatible object storage / CDN.

Make sure the domain runs under HTTPS in production; auth cookies use the `Secure` flag automatically in production mode. Back up your database before migrations, do not expose Node port 5100 directly, and configure automated database and media backups.

### VPS reverse proxy example (Nginx)

```nginx
server {
    server_name gleams.ai.studio;
    listen 80;
    location / {
        proxy_pass http://127.0.0.1:5100;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Configure HTTPS using your host's certificate manager / Let's Encrypt before accepting administrator logins. In a production HTTPS proxy setup, you may set `TRUST_PROXY=true` when appropriate for your own trusted proxy.

## API summary

Public: `GET /api/site`, `GET /api/pages/:slug`, `GET /api/posts`, `GET /api/posts/:slug`, `GET /api/categories`, `GET /api/collections/:slug`, `POST /api/contact`, `POST /api/subscribe`.

Admin: `POST /api/admin/auth/login`, `GET /api/admin/auth/me`, `POST /api/admin/auth/logout`, `POST /api/admin/auth/password`, `/api/admin/data/{pages,sections,posts,categories,navigation,collections,collection_items}`, `/api/admin/settings`, `/api/admin/media`, `/api/admin/messages`, `/api/admin/subscribers`, `/api/admin/users`, `/api/admin/audit`, `/api/admin/dashboard`.

## Operational and security notes

- The project is a functional application scaffold, not a claim of deployment or database integration: no credentials were supplied and the remote DB has not been connected or inspected in this workspace.
- Initial site content is original starter copy; revise all mission statements, images, and contact details in the dashboard to match the authoritative existing website.
- Do not change your domain's DNS until the new app has been validated in a staging environment.
- MySQL access credentials, JWT secret, TLS, backups, remote access, mail delivery, and persistent uploads must be set up before production launch.
- For additional hardening before broad public launch, add CAPTCHA/anti-spam to forms, image optimization and object storage, automated tests, backup/restore drills, and moderation workflow.
