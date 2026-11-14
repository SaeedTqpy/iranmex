# Administration

The management panel is `/admin`; it redirects unauthenticated users to
`/admin/login`. The application never ships a default user or password.

## Create the first administrator

Run on the application server from the project directory, as the same operating
system user and with the same `REGISTRATION_DB_PATH` as the application:

```sh
npm run admin:create -- admin
```

Choose a different username if needed (3–40 lowercase Latin letters, digits,
dots, hyphens or underscores). Enter the password twice in the interactive
terminal. Input is not echoed and cannot be supplied as a command argument or
environment variable. Use a unique, randomly generated passphrase of at least
16 characters and keep it in a password manager. The command can create more
than one account; there is no self-service public signup.

To reset an administrator password and revoke all that account's sessions:

```sh
npm run admin:reset -- admin
```

The reset clears recorded recent attempts for that account. A server operator
needs filesystem access to perform either operation.

## Production requirements

The application must run on one Node.js server (multiple workers on the same
local volume are supported) with persistent, private storage; see
`docs/registrations.md`. Back up the whole SQLite database correctly, including
news, media, administrator accounts and audit records. Do not put it in `public`.

Set `REGISTRATION_DB_PATH` to the persistent database and `APP_ORIGIN` to the
exact public **HTTPS** origin, for example `https://example.com` (no trailing
slash). Production admin mutations reject requests when `APP_ORIGIN` is absent,
is not HTTPS, or does not match the request Origin. TLS must terminate at a
properly configured reverse proxy. Never expose the Next.js development server.

Passwords are hashed with salted scrypt. Login uses the username and password.
Existing administrator passwords remain valid. Session tokens are random and only
their hashes are stored. The cookie is HttpOnly, SameSite=Strict and, in
production, Secure with the `__Host-` prefix. Sessions expire after eight hours,
logout revokes them, and a password reset revokes all of the account's sessions.
Authentication and authorization are checked for every protected page and API.
Login attempts are limited per trusted client IP, independently of username. Protected responses
are not cached and cannot be framed. The database records audit events without
passwords or registration payloads.

There is no two-factor authentication or account recovery by email/SMS; a
trusted server operator can reset the password with the command above. For an
internet-facing deployment, restrict panel access at the reverse proxy or VPN.
Apply normal server hardening, updates and private backups. `APP_ORIGIN` and
the database path must be set in the runtime and in the account-creation shell.

## Trusted proxy for administrator login

Production login fails closed with HTTP 503 unless `ADMIN_TRUST_PROXY=1` and a
valid `X-Real-IP` header is supplied. Set this flag only after configuring a
trusted reverse proxy that overwrites `X-Real-IP` using its actual client address
and prevents direct network access to Next.js. The header is not authentication:
if an attacker can reach the application directly or control the proxy header,
rate limiting can be bypassed. Run Next.js bound to loopback, for example:

```sh
ADMIN_TRUST_PROXY=1 APP_ORIGIN=https://example.com npm run start -- -H 127.0.0.1
```

`deploy/nginx-iranmex.conf.example` shows one direct-internet Nginx configuration;
replace the domain and certificate paths. Configure TLS and port 80 redirects
for the actual host. If using a CDN or load balancer, configure Nginx real-IP
handling only for verified provider CIDRs; never trust arbitrary forwarding
headers. Test externally that the application port is unreachable, spoofed
headers are overwritten, and different clients are distinguished before launch.
The example does not configure a CDN, firewall, TLS renewal or HTTP redirect.

The application permits five failed or in-flight login attempts per client IP
in 15 minutes, regardless of username. A successful attempt removes only its
own reservation, preserving prior failures. Expired attempts are purged during
later login attempts. IPv4-mapped IPv6 addresses share a bucket. A client behind
the same NAT shares its limit with other users on that IP; distributed attacks,
address rotation, or a saturated service can still interrupt access. Use proxy
rate limits and restrict admin access by VPN or IP allowlist where practical.
A password reset clears the affected username's stored attempts. In development
without an explicitly configured proxy, all attempts use a shared loopback bucket;
never expose the development server to the internet.

## Workflows

- Overview shows visitor, booth and managed-news totals.
- The registration pages show paginated records and details. Booth statuses
  can be changed; confirmation of presence is not a payment or allocation.
- An authenticated CSV download exports all current registrations. It contains
  personal information; keep it private. Spreadsheet formula prefixes are
  neutralized and mobile numbers are exported as text.
- News can be created as a draft, edited, published or returned to draft.
  Only drafts can be deleted. Existing file-managed news is visible on the site
  but not editable in the panel. Database-managed articles become visible
  immediately without a rebuild; only published articles are public.
- One optional image per article can be uploaded (JPEG/PNG/WebP, maximum 3 MiB
  and 16 million pixels). The server decodes, strips metadata and stores a WebP
  image in the private database. Draft images require a valid admin session.
  Uploaded images that are removed from drafts are not automatically purged.
- The editor handles paragraphs, a category, optional author/source and an image.
  It preserves existing structured text when the body is unchanged; editing the
  body saves it as paragraphs. Any required externally hosted media or advanced
  formatting needs a separate editorial workflow.

Run `npm test` and `npm run build` before deployment.

## Company directory

Administrators can manage companies at `/admin/companies`. The existing directory
entries remain visible and editable without importing them. New and edited records
can be saved as drafts or published; drafts are private, and changing an existing
entry to draft removes it from public listings. Publication is not booth allocation.
Names, a stable Latin slug, description, products and services (one per line),
website, phone, email and a logo are supported. A logo is required for publication.
Companies can be deleted from their edit page, including published and original
file-managed entries. Deleted entries leave a minimal deletion marker so original entries do not
reappear on the Node server and stale edits cannot restore them; deleted slugs
remain reserved. The static
preview still uses the original file-managed directory. Uploaded logos are not
automatically deleted. Company logos use the same
private media storage, validation and backup requirements as news images. Public
company data updates without a rebuild on the Node server; the static preview
contains only the original file-managed directory.

## Site page views

`/admin/analytics` shows daily page views in the Tehran time zone for 7, 30 or
90 days. Collection starts with the first recorded view; prior days have no
data and the first day may be partial. Each public page load or client-side path
change sends an anonymous event. Admin paths are excluded. This measures page
views, not unique people: repeated views count, JavaScript blockers and disabled
JavaScript prevent collection, and automated traffic may be counted. UTM campaign values may be stored as described below; full URLs, IP addresses
and visitor identifiers are not stored in the analytics tables. The public endpoint is an approximate counter, not a source
of fraud-resistant traffic reporting. Data is stored as daily totals in the
same persistent SQLite database and included in its backups. Static previews do
not collect analytics.

### UTM attribution

The tracker accepts `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` and
`utm_content`. A pageview is attributed to the most recent nonempty UTM set in
the same browser tab; it expires after 30 minutes without a tracked public page
view. A new UTM set replaces the old one. Attribution is held in sessionStorage
when available; if storage is blocked, only the tagged page itself is attributed.
The report counts attributed page views, not visitors, sessions or conversions.
The history begins with deployment of this feature and cannot be reconstructed.
Values are limited to 100 characters each; do not put personal information or
secrets in UTM parameters. Only aggregated daily combinations are stored, not
full URLs. The report shows the top 100 combinations in the selected period.
At most 5,000 distinct combinations per day are recorded; beyond this, the
overall pageview counter continues but additional new combinations are omitted.

The analytics panel includes a UTM link builder. It generates a link locally in
the browser for a public page on the same site, preserving unrelated query
parameters and replacing any existing UTM parameters. Generated links are not
saved as records; copy the link for use in the campaign. Source, medium and
campaign are required in the builder. Campaign reports reflect page views after
the links are opened, rather than the number of links generated.

## Company display order

At `/admin/companies`, drag the three-line handle beside a company up or down
with a mouse or touch. Drop to save automatically; Escape cancels the drag.
The list scrolls near the top and bottom of the viewport while dragging.
Keyboard users can focus the handle and use ArrowUp/ArrowDown or Home/End.
Each move is saved immediately and applies to the public directory and home
carousels in all languages on the Node server. Drafts retain their place but
are hidden from public listings. New companies are appended; editing company
details preserves its position. Concurrent changes to the list are rejected
and the administrator should refresh before retrying. Moves are audited.
The order is stored in the shared SQLite database and included in its backups.
The static preview does not use database-managed ordering.
