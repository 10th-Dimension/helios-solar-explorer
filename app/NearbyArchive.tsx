import snapshot from '../data/nearby-hosts-roadmap.json';
import { scholarlyReference, formatCatalogError } from './catalogEvidence';
export function NearbyArchive() {
  return (
    <section
      className="nearby-archive"
      aria-label="Additional sourced nearby systems"
    >
      <h3>Two additional nearby host systems</h3>
      <p>
        NASA Exoplanet Archive PSCompPars snapshot · retrieved{' '}
        {snapshot.retrievedAt.slice(0, 10)}. These new records are
        reference-only until the astrometric epoch/frame is verified; no
        incorrect moving marker is added to the 3D atlas.
      </p>
      {['TRAPPIST-1', 'GJ 1132'].map((host) => {
        const rows = snapshot.rows.filter(
            (row) => row.hostname === host && row.pl_controv_flag === 0,
          ),
          first = rows[0];
        return (
          <details key={host}>
            <summary>
              {host} · {rows.length} noncontroversial catalog rows
            </summary>
            {first && (
              <p>
                Distance:{' '}
                {formatCatalogError(
                  first.sy_dist,
                  first.sy_disterr1,
                  first.sy_disterr2,
                  'pc',
                )}
                .
              </p>
            )}
            <div className="archive-table-wrap">
              <table>
                <caption>
                  Catalog parameters; not current orbital phase or surface
                  measurements
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Planet</th>
                    <th scope="col">Period</th>
                    <th scope="col">Semimajor axis</th>
                    <th scope="col">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.pl_name}>
                      <th scope="row">{row.pl_name}</th>
                      <td>
                        {formatCatalogError(
                          row.pl_orbper,
                          row.pl_orbpererr1,
                          row.pl_orbpererr2,
                          'days',
                        )}
                      </td>
                      <td>
                        {formatCatalogError(
                          row.pl_orbsmax,
                          row.pl_orbsmaxerr1,
                          row.pl_orbsmaxerr2,
                          'AU',
                        )}
                      </td>
                      <td>
                        {scholarlyReference(row.pl_orbper_reflink) ? (
                          <a
                            href={scholarlyReference(row.pl_orbper_reflink)!}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Period paper
                          </a>
                        ) : (
                          'No period reference'
                        )}
                        {scholarlyReference(row.pl_orbsmax_reflink) !==
                          scholarlyReference(row.pl_orbper_reflink) &&
                          scholarlyReference(row.pl_orbsmax_reflink) && (
                            <a
                              href={scholarlyReference(row.pl_orbsmax_reflink)!}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Axis paper
                            </a>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Composite parameters may come from different publications. Errors
              are reported scalar bounds, not a joint covariance or a complete
              fitted system. No surface or habitability claim follows from a
              catalog entry.
            </p>
          </details>
        );
      })}
      <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">
        Reproducible archive query and complete captured rows
      </a>
    </section>
  );
}
