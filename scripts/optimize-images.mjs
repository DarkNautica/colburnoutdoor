/*
 * Generates responsive AVIF/WebP derivatives for the site images.
 *
 * The source PNGs were 2.7–3.0 MB each and the hero one was preloaded, which
 * put LCP far past the 2.5s Core Web Vitals threshold on any real connection.
 *
 * Run with: npm run images
 * Outputs are committed, so the build and the Worker stay dependency-free.
 */

import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const IMAGES = "assets-src";
const OUT = "public/images/opt";

// Widths chosen from the real layout: the hero media column tops out around
// 660 CSS px on a 1440 viewport, and the property visual around 700.
const PHOTOS = [
  { file: "sprinkler-hero.png", widths: [480, 768, 1024, 1440] },
  { file: "hero-yard.png", widths: [480, 768, 1024, 1440] },
];

const MARKS = [{ file: "colburn-outdoor-mark-white.png", widths: [64, 128, 192] }];

async function emit(source, name, width, { alpha }) {
  const base = sharp(source).resize({ width, withoutEnlargement: true });

  await base
    .clone()
    .avif({ quality: alpha ? 60 : 58, effort: 6 })
    .toFile(path.join(OUT, `${name}-${width}.avif`));

  await base
    .clone()
    .webp({ quality: alpha ? 82 : 78, effort: 6 })
    .toFile(path.join(OUT, `${name}-${width}.webp`));
}

async function run() {
  await mkdir(OUT, { recursive: true });

  for (const { file, widths } of [...PHOTOS, ...MARKS]) {
    const source = path.join(IMAGES, file);
    const name = path.basename(file, ".png");
    const alpha = MARKS.some((m) => m.file === file);
    for (const width of widths) await emit(source, name, width, { alpha });

    // Final fallback for the <img> inside <picture>. Only ever fetched by a
    // browser that supports neither AVIF nor WebP, so it just needs to exist
    // at a sane weight rather than be pixel-perfect.
    const fallbackWidth = widths[widths.length - 1];
    const fallback = sharp(source).resize({ width: fallbackWidth, withoutEnlargement: true });
    if (alpha) {
      await fallback.png({ compressionLevel: 9, palette: true }).toFile(path.join(OUT, `${name}-${fallbackWidth}.png`));
    } else {
      await fallback.jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(OUT, `${name}-${fallbackWidth}.jpg`));
    }

    console.log(`${file} -> ${widths.length * 2 + 1} files`);
  }

  // Open Graph: platforms want 1200x630 and choke on multi-megabyte files.
  await sharp("assets-src/sprinkler-hero.png")
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile("public/og.jpg");
  console.log("og.jpg -> 1200x630");

  // Schema.org logo reference — square, modest weight.
  await sharp("assets-src/colburn-outdoor-logo-light.png")
    .resize(512, 512, { fit: "contain", background: { r: 10, g: 43, b: 33, alpha: 1 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile("public/images/colburn-outdoor-logo-512.png");
  console.log("colburn-outdoor-logo-512.png -> 512x512");

  let total = 0;
  for (const f of await readdir(OUT)) total += (await stat(path.join(OUT, f))).size;
  console.log(`\nderivatives total: ${(total / 1024).toFixed(0)} KB`);
}

await run();

// Favicon raster sizes. Google wants at least 48x48 and a multiple of 48 for
// the search-results favicon; iOS wants a 180x180 opaque PNG.
const favicon = await import("node:fs/promises").then((fs) => fs.readFile("public/favicon.svg"));
for (const size of [48, 96, 192, 512]) {
  await sharp(favicon, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(`public/icon-${size}.png`);
}
await sharp(favicon, { density: 384 })
  .resize(180, 180)
  .flatten({ background: "#071612" })
  .png({ compressionLevel: 9 })
  .toFile("public/apple-touch-icon.png");
console.log("favicons -> 48/96/192/512 + apple-touch-icon");
