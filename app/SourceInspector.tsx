'use client';

import { claimsForContext, claimsById, confidenceExplanations, scientificSources, verificationExplanations, type EvidenceContext } from './science';

export type SourceInspectorProps = { context?: EvidenceContext; claimIds?: readonly string[]; label?: string };

export function SourceInspector({ context, claimIds, label = 'Sources & confidence' }: SourceInspectorProps) {
  const claims = claimIds
    ? claimIds.map(id => claimsById[id]).filter(Boolean)
    : context ? claimsForContext(context) : [];
  return <details className="source-inspector">
    <summary>{label} <span aria-label={claims.length + ' scientific claims'}>({claims.length})</span></summary>
    <div className="source-inspector-body">
      <p className="source-inspector-intro">A source link is evidence to inspect, not a guarantee that every value is current. Confidence and verification describe different things.</p>
      {!claims.length && <p role="status">No claim mapping is available for this selection. Treat its scientific provenance as not yet reviewed.</p>}
      {claims.map(claim => <article className="scientific-claim" key={claim.id}>
        <h4>{claim.title}</h4>
        <p className="scientific-claim-value">{claim.value === null ? 'Unknown — not supplied by the included evidence' : String(claim.value)}{claim.value !== null && claim.unit ? ' ' + claim.unit : ''}</p>
        <p><span className={'confidence confidence-' + claim.confidence} title={confidenceExplanations[claim.confidence]}>{claim.confidence.toUpperCase()}</span>{' '}<span className={'verification verification-' + claim.verification}>{claim.verification.replaceAll('-', ' ')}</span></p>
        <p>{confidenceExplanations[claim.confidence]}</p>
        <p>{verificationExplanations[claim.verification]}{claim.verifiedOn ? ' Reviewed ' + claim.verifiedOn + '.' : ''}</p>
        {claim.limitations.length > 0 && <ul>{claim.limitations.map(note => <li key={note}>{note}</li>)}</ul>}
        <details className="claim-source-list">
          <summary>Supporting references ({claim.sourceIds.length})</summary>
          <ul>{claim.sourceIds.map(id => {
            const source = scientificSources[id];
            return source ? <li key={id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗<span className="sr-only"> (opens in a new tab)</span></a>
              <p>{source.organization}. {source.scope}</p>
              <dl className="source-dates">
                <div><dt>Publication</dt><dd>{source.publishedOn ?? 'Not recorded'}</dd></div>
                <div><dt>Observation</dt><dd>{source.observedOn ?? 'Not one dated observation / not recorded'}</dd></div>
                <div><dt>Retrieved</dt><dd>{source.retrievedOn ?? 'Not recorded'}</dd></div>
                <div><dt>Source checked</dt><dd>{source.checkedOn ?? 'Not independently checked in this review'}</dd></div>
              </dl>
            </li> : <li key={id}>Missing source mapping: {id}</li>;
          })}</ul>
        </details>
        <small className="claim-id">Claim {claim.id}</small>
      </article>)}
    </div>
  </details>;
}

export default SourceInspector;

