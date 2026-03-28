/** Shared styles for all NumerosClaros widgets */

export const sharedStyles = `
  :host {
    --nc-primary: #1a56db;
    --nc-bg: #ffffff;
    --nc-text: #111827;
    --nc-border: #e5e7eb;
    --nc-accent: #059669;
    --nc-error: #dc2626;
    --nc-surface: #f9fafb;
    --nc-muted: #6b7280;
    --nc-radius: 8px;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.1);

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--nc-text);
    background: var(--nc-bg);
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    padding: 1.5rem;
    box-sizing: border-box;
    line-height: 1.5;
  }

  :host([theme="dark"]) {
    --nc-bg: #1f2937;
    --nc-text: #f9fafb;
    --nc-border: #374151;
    --nc-surface: #111827;
    --nc-muted: #9ca3af;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  * { box-sizing: border-box; }

  .nc-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--nc-primary);
  }

  .nc-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 480px) {
    .nc-grid { grid-template-columns: 1fr 1fr; }
  }

  .nc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nc-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--nc-muted);
  }

  .nc-field input, .nc-field select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    font-size: 1rem;
    background: var(--nc-bg);
    color: var(--nc-text);
    transition: border-color 0.15s;
  }

  .nc-field input:focus, .nc-field select:focus {
    outline: none;
    border-color: var(--nc-primary);
    box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
  }

  .nc-results {
    margin-top: 1.25rem;
    padding: 1rem;
    background: var(--nc-surface);
    border-radius: var(--nc-radius);
    border: 1px solid var(--nc-border);
  }

  .nc-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-result-row:last-child { border-bottom: none; }

  .nc-result-label {
    font-size: 0.85rem;
    color: var(--nc-muted);
  }

  .nc-result-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--nc-text);
  }

  .nc-result-value.nc-highlight {
    color: var(--nc-primary);
    font-size: 1.3rem;
  }

  .nc-result-value.nc-accent {
    color: var(--nc-accent);
  }

  .nc-chart {
    margin-top: 1rem;
    width: 100%;
    overflow: hidden;
  }

  .nc-chart svg {
    width: 100%;
    height: auto;
  }

  .nc-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .nc-badge-primary {
    background: rgba(26,86,219,0.1);
    color: var(--nc-primary);
  }

  .nc-badge-accent {
    background: rgba(5,150,105,0.1);
    color: var(--nc-accent);
  }

  .nc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  .nc-table th {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 2px solid var(--nc-border);
    color: var(--nc-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .nc-table td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-table tbody tr:hover {
    background: var(--nc-surface);
  }

  .nc-table-scroll {
    max-height: 300px;
    overflow-y: auto;
  }

  .nc-full-width {
    grid-column: 1 / -1;
  }

  .nc-columns {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .nc-columns > * {
    flex: 1;
    min-width: 200px;
  }

  .nc-separator {
    height: 1px;
    background: var(--nc-border);
    margin: 1rem 0;
    grid-column: 1 / -1;
  }
`;
