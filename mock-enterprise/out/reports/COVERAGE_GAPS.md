# Coverage gaps (synthetic demo)

## Runnable system gaps
| Topic | Coverage |
| --- | --- |
| Intake structural gate on mixed mandatory-field failures | partially covered — stock layout blocks whole-file structural validation; demo uses cohort CSV + adapter |
| Single sealed snapshot spanning clean + failing rows | not covered — `collectIntakeSnapshotBlockedReasons` blocks seal if any row has mapping issues |
| Job architecture cross-check (assignment vs catalog) | not covered in engines — `job-architecture` normalizes intake fields only; does not ingest `job_architecture.csv` |
| Reconciliation engine (H04) | not implemented as code — governance docs only |
| Confidence engine (H05) | not implemented as code — adapter computes proxy rates from rules |

## Workflow / feature gaps
| Topic | Coverage |
| --- | --- |
| Enterprise HTTP/API intake of multi-file HRIS+payroll | not exercised — demo uses filesystem CSV + runner |
| Country pack (Ireland statutory overlay) | not implemented — Wave 6 paused |
| SCN-012 / SCN-013 run-level FC-R1 breach demonstration | not exercised — zero cohort in manifest for this baseline pack |

## Legal coverage gaps
| Topic | Coverage |
| --- | --- |
| Statutory pay transparency compliance proof | not covered — synthetic demo only |
| Lawful basis / DPIA / approvals | not covered — no real privacy workflow |

## Real-evidence gaps
| Topic | Coverage |
| --- | --- |
| Real payroll reconciliation to controlled extracts | not covered |
| Real join integrity measurement on production keys | not covered |
| Real methodology sign-off / Legal sign-off | not covered |

