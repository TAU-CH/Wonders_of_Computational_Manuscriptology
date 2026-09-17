# Wonders of Computational Manuscriptology

Conference website — Tel Aviv University, 13–14 December 2026.
An international conference held at the midpoint of the ERC Synergy project
[MiDRASH](https://www.midrash.eu/).

## Running it

It is a static site with no build step. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Deploys as-is to GitHub Pages, Netlify, or any static host.

## Structure

```
index.html            Home — hero, key dates, scope, the "ink to text" demo
call-for-papers.html  Scope, topics, submission guidelines, proceedings
program.html          Provisional two-day schedule (tabbed by day)
committee.html        Organising and program committees
contact.html          Contact details, venue, travel
assets/css/site.css   The whole design system — colours, type, components
assets/js/site.js     Nav, scroll reveals, day tabs, the HTR animation
assets/img/           Manuscript images (see credits below)
```

## Still to fill in

Everything unconfirmed is marked in the page with a `To be announced` chip and a
`<!-- TODO -->` comment next to it. Search for `TODO` to find them all:

- Abstract deadline, notification date, full paper deadline
- The submission / general enquiry email address
- Organising committee and program committee members (`committee.html`)
- Final program: speakers, session titles, confirmed times
- Registration fee, poster dimensions, remote-participation policy

## Design notes

- Palette and type live as CSS custom properties at the top of `site.css`;
  changing the tokens there restyles the whole site.
- A dark variant follows the visitor's system setting, driven by the same tokens.
- Animations are gated behind `prefers-reduced-motion`, and every `.reveal`
  element is visible if JavaScript never runs.
- The "From ink to text" panel is a *scripted illustration* of an HTR pipeline,
  not a live model — the caption on the page says so, and it should keep saying so.

## Image credits

Manuscript images are from the Cairo Genizah Collection, Cambridge University
Library, via the [Cambridge Digital Library](https://cudl.lib.cam.ac.uk/collections/genizah/1),
reproduced under CC BY-NC 3.0. Shelfmarks used: T-S 12.184,
T-S 16.378, T-S 20.155. Each is credited beside the image where it appears.

## Next step

A submissions and registration database (abstracts, authors, reviews,
attendees) is planned as a separate piece of work.
