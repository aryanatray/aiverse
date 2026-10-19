# Security

## Reporting concerns

Report security concerns privately to the repository owner. Include affected versions, reproduction steps, impact, and a minimal example. Do not publish active credentials, private documents, or exploit details in a public issue.

## Application boundaries

AIverse is a static browser application. It does not execute uploaded code or call an inference service. Text uploads and imported experiment settings are treated as untrusted input, bounded, and validated before use.

Experiment exports may include document text entered into the retrieval lab. Browser storage is a convenience feature, not an encrypted secrets vault. Do not use production credentials or confidential customer data in shared experiments.

Dependency updates should pass type checks, numerical tests, integration tests, linting, and a production build before merging.
