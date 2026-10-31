# Social previews

The static `index.html` contains Open Graph, Twitter card, description, and
canonical tags. Keep these in the HTML head so crawlers do not need JavaScript.

- Canonical page: https://cryptoninja-cube.earthkey.workers.dev/
- Preview image: `/assets/ogp-sakuya-1031-v1.jpg` (1200 × 630, JPEG)
- Artwork: user-adopted Sakuya game title illustration. The complete square
  illustration is centered; blurred copies fill the side margins. Do not crop
  Sakuya, the logo, or the tagline, or use a gameplay reward image instead.
- The image is an explicitly tracked runtime asset in `.gitignore`.

When replacing the artwork, use a new versioned filename, update both
`og:image` and `twitter:image` (including dimensions and alt text), and verify
that the deployed image returns an actual image rather than the SPA fallback.
Previously shared links may retain a platform's cached preview.

Deployment uses the existing Cloudflare Git integration from GitHub `main`.
Before pushing, check the complete `origin/main..HEAD` range so unrelated local
development commits are not published. After the build, check the raw public
HTML with a normal and social-crawler user agent and fetch the image URL.
