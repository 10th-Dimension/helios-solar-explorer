# Third-party notices and scientific credits

The [MIT license](LICENSE) covers original Helios code and original documentation. It does not override third-party rights, data licenses, attribution requirements or trademarks. No NASA, CDS, Caltech or OpenAI endorsement is implied.

## NASA Earth imagery

The three bundled texture JPEGs are unchanged source downloads. See [asset provenance](public/ASSET_PROVENANCE.md) for exact URLs, creators, dates, dimensions and SHA-256 hashes. They are historical composites, not live imagery.

NASA's [media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) generally permit educational/informational use of NASA-produced content, with acknowledgment and no implied endorsement. Third-party content on NASA websites can carry separate rights; protected marks are not granted by this repository. These textures are not offered under a new MIT copyright grant.

The earlier legacy Earth PNG is not redistributed because its precise original download record was not retained; the legacy CSS preview uses the credited July 2004 JPEG instead. The existing Helios share card and favicon are project assets. Application captures depict the original interface and credited imagery; the same third-party caveats apply.

## CDS/SIMBAD

This project uses the SIMBAD astronomical database, operated at CDS, Strasbourg, France. Credit **CDS/SIMBAD** when reusing catalog-derived records. Source identifiers, astrometry, bibliography, query metadata and the response snapshot are retained in `app/stellar.ts`, `app/nearbyCatalog.ts` and `data/simbad-snapshot.json`.

SIMBAD is described by Wenger et al. (2000), [The SIMBAD astronomical database](https://doi.org/10.1051/aas:2000332). See [CDS terms](https://cds.unistra.fr/legals/) and [SIMBAD documentation](https://simbad.cds.unistra.fr/guide/). CDS requires citation and compliance with applicable dataset licenses; its general terms list open licenses including Open Licence, ODbL and CC-BY, rather than one universal MIT grant. This repository does not assert a more specific license than the source establishes or relicense CDS database rights. Preserve these credits and the linked underlying literature when redistributing or refreshing data.

## NASA Exoplanet Archive

Planetary records and parameter references come from the NASA Exoplanet Archive Planetary Systems Composite Parameters table. The archive is operated by the California Institute of Technology under contract with NASA through the Exoplanet Exploration Program. See the archive's [acknowledgment guidance](https://exoplanetarchive.ipac.caltech.edu/docs/acknowledge.html), [PSCompPars documentation](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html) and [column meanings](https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html).

Credit the archive and the individual literature sources retained in `app/exoplanetExpansion.ts` and `data/archive-snapshot.json`. The archive currently recommends Christiansen et al. (2025) as its overview reference. Source data are not newly licensed as original Helios MIT code. Third-party papers linked for reference are not bundled.

## Other scientific references

- NASA/JPL NAIF [`pck00011.tpc`](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00011.tpc): source for derived J2000 body-pole and signed spin constants; full kernel is not bundled.
- [NASA Solar System Exploration](https://science.nasa.gov/solar-system/), [Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) and [Sun Science](https://science.nasa.gov/sun/): Solar System reference material.
- [NASA Hubble Sirius A/B](https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/) and [USNO visual-binary orbit catalog](https://crf.usno.navy.mil/data_products/WDS/orb6/orb6.html): Sirius architecture references.

## Software and fonts

React, Three.js, Next.js compatibility packages, Vinext, Vite, Tailwind, TypeScript, ESLint and transitive dependencies retain their respective upstream licenses. Their exact versions/integrities are recorded in `package-lock.json`; installed packages carry their own notices. They are not vendored into this source repository.

Geist/Geist Mono are requested through the existing font pipeline and are provided under the [SIL Open Font License in the upstream Geist project](https://github.com/vercel/geist-font). Do not treat font files as Helios MIT code. Font binaries are not included in this source release.
