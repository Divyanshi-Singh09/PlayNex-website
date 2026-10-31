# Shopify Admin: People / Perspectives section

This is the exact content model used by `lib/perspectives.ts` and `components/Perspectives.tsx`. It replaces the old browser-local testimonial editor. **All fields visible to customers are editable in Shopify Admin.** Both images and videos are optional; an image-only entry works with no video.

## 1. Create the individual story definition

In **Shopify Admin → Content → Metaobjects → Add definition**, create a merchant-managed definition named **PlayNex Perspective** with type **`playnex_perspective`**. Turn **Storefront API access** to **Public read** and enable **Publishable** capability (so a story can remain Draft). Create fields with these exact machine keys:

| Admin label | Key | Shopify field type | Usage |
|---|---|---|---|
| Person's name | `name` | Single line text | Required, shown under quote |
| Person's context | `role` | Single line text | Optional, e.g. 'Parent / Early supporter' |
| Card headline | `title` | Single line text | Optional, used on story tiles |
| Label | `eyebrow` | Single line text | Optional, e.g. 'Community perspective' |
| Approved recommendation | `quote` | Multi-line text | Required; transcribed and approved exact words |
| Still photo | `image` | **File** / File reference (images) | Optional: primary image and video thumbnail fallback |
| Video | `video` | **File** / File reference (videos) | Optional: Shopify-hosted video, not required |
| Video poster | `poster` | **File** / File reference (images) | Optional: cover image for video |
| Preferred media | `media_preference` | Single line text | Literal `image` or `video`; defaults to `image` |
| Permission confirmed | `consent_approved` | True/false | Must be `true` before showing |
| Include on homepage | `show_on_site` | True/false | Must be `true` before showing |

**Rule:** For a photograph-only story, populate `image` and leave `video` empty. For a video, populate `video`, ideally `poster`, set `media_preference` to `video`. If a story has *both* a photo and a video, `media_preference` selects whether the featured area plays the video or remains a still image. For video-only stories, the built-in video preview image acts as poster if available. If neither file is supplied, an abstract non-photographic graphic renders without a broken video button.

**Privacy:** Don't enter a quote or personal media in a publicly readable Shopify record without consent. Keep a new story **Draft** while it awaits approval, then set both booleans and publish it. A draft should never be referenced on the live section. Keep documentary evidence of media rights/consent in a private system outside storefront-public metaobjects. No reviews, awards, client logos or endorsements are invented by the code.

## 2. Create the homepage section definition

Create another metaobject definition named **PlayNex Perspectives Section** with type **`playnex_perspectives_section`**; enable **Public read** and publishability. These fields control the entire section:

| Admin label | Key | Type |
|---|---|---|
| Small eyebrow | `eyebrow` | Single line text |
| Heading line | `headline` | Single line text |
| Heading emphasis | `emphasis` | Single line text |
| Intro copy | `intro` | Multi-line text |
| Bottom editorial line | `footer` | Single line text |
| Gallery title | `wall_heading` | Single line text |
| Featured perspectives (ordered) | `stories` | **List of metaobject references** → PlayNex Perspective |

Create **one** metaobject entry with handle **`home`**. Add the approved stories to the `stories` list in your desired order. Drag / rearrange that list in Shopify Admin. The first is the large featured card; all appear as selectable tiles. You can choose 1–12 entries (query limit is 12; change limit in code for more). This is a merchant-managed *ordered* section—not data stored in the frontend.

## 3. Publishing workflow

1. Upload consented PNG/JPEG/WebP **or** MP4 to **Shopify Admin → Content → Files**. Add meaningful image alt text; for videos create an attractive 16:9 or 4:5 poster image.
2. Make a new `PlayNex Perspective` metaobject entry, initially Draft. Enter the quote exactly as approved, name, role and media.
3. Verify permissions, mark both `consent_approved` and `show_on_site` true, and publish.
4. Edit `PlayNex Perspectives Section` entry `home` → select the record in `stories` and choose display order. Publish the section.
5. Visit the homepage. Within five minutes the cache refreshes even without webhooks. A correctly signed content webhook can trigger faster revalidation.
6. To remove a voice: remove the reference from the section entry and unpublish that story. The homepage never caches quotes in the browser.

## 4. Example: photo-only versus video-only

| Story | Image | Video | Poster | Preferred media | Display |
|---|---|---|---|---|---|
| Written recommendation | Yes | No | No | `image` | Large portrait image + quote, no play button |
| Video testimonial | Optional | Yes | Recommended | `video` | Poster + click-to-play native video modal |
| Hybrid interview | Yes | Yes | Optional | `image` | Still is the hero; video not shown as playable unless preference switches to video |
| Text-only voice | No | No | No | `image` | Branded artwork + quote, no broken media |

When content is missing or no approved stories exist, PlayNex shows a tasteful empty state (unless `NEXT_PUBLIC_HIDE_EMPTY_VOICES=true`). It never fabricates supporters.

## 5. Permissions and caching

- For **both** definitions, set Storefront access to **Public read**. The headless app needs Storefront `unauthenticated_read_metaobjects` scope. Product listings/media access requires the appropriate Storefront product scope.
- Source keys and section handle must exactly match the defaults in `.env.example` or you must change the matching env variables.
- API fields `field.references.nodes` and `reference` return media union objects. The mapper normalizes `MediaImage` and `Video` safely. See Shopify's official [metaobject docs](https://shopify.dev/docs/api/storefront/latest/objects/metaobject) and [reference docs](https://shopify.dev/docs/api/storefront/latest/unions/MetafieldReference).
- Content fetched on the server caches for five minutes under the `shopify-perspectives` tag; the signed `/api/webhooks/shopify` endpoint invalidates this tag when configured with the matching webhook topic and secret.
- Do not copy Admin API tokens to `NEXT_PUBLIC_*` environment variables or browser code. Public Storefront data may be exposed; unpublished content must remain unpublished.

## 6. Production content checklist

- Consent and licensing recorded for each image, video, quote and name
- No media hosted on arbitrary untrusted domains: Shopify Files only
- All videos supplied with a practical poster and caption/transcript as needed
- Useful alt text, visible attribution and context
- Native video plays only after click, controls available, no autoplay audio
- No product/health/child-safety or emotion-recognition assertions without substantiation
- Test image-only, video-only, hybrid, hidden, draft and empty cases before launch
