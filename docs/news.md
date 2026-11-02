# News publishing

Public archive: `/news`; article pages: `/news/<slug>`. `/journal` redirects to
the archive. The navigation and shared footer link to the news archive.

Administrators can create, edit, publish and unpublish database-managed news at
`/admin/news` without redeploying; see `docs/admin.md` for account setup and
security requirements. There is currently no supplied news content. Existing
file-managed content in `content/news.mjs` remains supported and is deployed
with the application, but cannot be edited through the admin panel. Do not turn
the example below into a real announcement without an approved text and date.

Each record follows this schema (example is intentionally a draft):

```js
export default [
  {
    slug: 'approved-announcement-slug',
    status: 'draft', // change to 'published' only after editorial approval
    title: 'عنوان تأییدشده',
    excerpt: 'خلاصه کوتاه و تأییدشده مطلب',
    category: 'announcement',
    publishedAt: '2026-11-01T12:00:00+03:30',
    author: 'نام نویسنده یا واحد منتشرکننده', // optional
    image: { // optional; file must exist in public/news/
      src: '/news/approved-photo.jpg',
      alt: 'توضیح دقیق تصویر',
      width: 1600,
      height: 1000,
      caption: 'شرح تصویر و اعتبار عکاس', // optional
    },
    content: [
      {type: 'paragraph', text: 'متن مطلب'},
      {type: 'heading', text: 'عنوان بخش'},
      {type: 'list', items: ['مورد اول', 'مورد دوم']},
    ],
    source: {url: 'https://official-source.example/article', label: 'نام منبع'}, // optional
  },
];
```

Categories: `news` (اخبار), `announcement` (اطلاعیه‌ها), `press` (آگهی‌های خبری).
Slugs must be unique, lowercase Latin letters/digits separated by hyphens.
Dates require a timezone. Display dates use the Persian calendar in Asia/Tehran.
Content uses plain-text blocks; raw HTML is never rendered.

Only `published` records whose publication date has arrived are visible.
Drafts are absent from public pages and client-side article summaries. Unknown
or unpublished URLs return 404. Search supports Persian/Arabic letter variants
and category filtering. Results paginate in groups of nine.

Run `npm test` and `npm run build` after code or file-managed content changes.
Published articles with invalid fields or duplicate slugs fail validation.
Archive and article pages read approved content dynamically. The panel publishes
immediately and does not provide scheduled publishing.
