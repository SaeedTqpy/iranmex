# Registration operations

Visitor registration: `/registration`. Booth enquiries: `/registration/booth`.
Both submit to the Node.js route `POST /api/registrations`.

## Storage and deployment

Records are stored in SQLite using `better-sqlite3`. The default private path is
`.data/registrations.sqlite`, outside `public` and excluded from Git. The database
is created on the first valid submission. Files use mode 0600 and newly created
directories use mode 0700. No public endpoint reads registrations.

For production, run a Node.js server with a persistent, local disk/volume and set:

```dotenv
REGISTRATION_DB_PATH=/var/lib/iranmex/registrations.sqlite
APP_ORIGIN=https://your-actual-domain.example
```

`APP_ORIGIN` must be the exact public origin (scheme, host and optional port,
without a trailing slash). Without it, the request URL origin is used, which is
suitable for local development. Configure proxy routing to preserve the public
origin or set this variable explicitly. The API accepts same-origin JSON POSTs
only and limits request bodies to 16 KiB.

This storage configuration is for a single server, with multiple Node workers
on the same disk supported by SQLite transactions and a busy timeout. Do not
deploy it to an ephemeral filesystem or share the database over a network
filesystem. For multiple application servers, replace storage with a shared
database before accepting live registrations. Back up the database using the
SQLite online backup API or while the application is stopped; do not copy only
the main file while WAL writes are active. Restrict access to the runtime user.

## Submission behavior

- Iranian and Arabic digits and +98/0098 mobile prefixes are normalized.
- Validation runs in the browser and again on the server. Only defined fields
  are saved; unknown fields are discarded.
- Each mobile can register once per event and request type. A visitor may also
  submit a separate booth enquiry.
- An unpredictable request UUID makes network retries idempotent. A reference
  is returned only after the database transaction commits.
- Booth status starts at `received`; this is not booth allocation or payment.
- Limits: five attempts per mobile in ten minutes and 120 attempts globally
  per minute, persisted in SQLite. Successful retry replays do not count again.
- The form shows a reference on screen. SMS delivery, mobile ownership
  verification and payment are not configured. Confirmation of receipt does
  not claim any of these operations. For the administrative dashboard, account
  setup and security requirements see `docs/admin.md`.
- Do not log request bodies or include database files in backups with public access.

## Private export

Run on the application server with filesystem access, targeting a new private
file outside the website's `public` directory:

```sh
node scripts/export-registrations.mjs /private/path/registrations.csv
```

The command refuses to overwrite files and writes a UTF-8 CSV with mode 0600.
It neutralizes spreadsheet formula prefixes. Experience and referral fields
use stable codes; display labels are in `lib/registration-validation.mjs`.
It prints the record count only; personal data is not printed to the terminal.

## Tests

```sh
node --test tests/registrations.test.mjs
npm run build
```

Tests use temporary databases and do not read or modify live registrations.
