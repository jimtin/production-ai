# Question Register

Use separate question registers so the client is not asked to answer technical work that the delivery team can validate.

## Technical Validation - Owner: Us

Use this register for questions answered through inspection, API docs, sample data, prototypes, repo review, provider docs, or controlled tests.

Fields:

- question
- why it matters
- what it blocks
- validation method
- evidence needed
- target phase
- status

Examples:

- Can the API return only the required slice of data?
- Which endpoint exposes the status shown in the client UI?
- Do individual and grouped records behave differently?
- Can the output format be generated without losing required evidence?

## Client Questions - Phase 1

Use this register for questions the client must answer before the first proof can be accepted.

Fields:

- question
- why it matters
- client evidence needed
- decision options, if useful
- default recommendation, if safe
- what it blocks
- owner
- due phase

Examples:

- Provide a representative input file.
- Confirm required output columns.
- Confirm acceptable matching tolerance.
- Confirm whether names, references, or customer data may appear in the output.

## Later-Phase Client Questions

Use this register for decisions that should not block the first proof.

Examples:

- Notification recipients and message wording.
- Hosting, retention, backups, and support expectations.
- Dashboard or long-term reporting requirements.
- Human approval versus automatic action.
- Writeback to source systems.

## Deferred Decisions And Non-Goals

Use this register to prevent scope drift. A deferred item needs:

- description
- reason for deferral
- phase or trigger for reconsideration
- risk of not doing it now

## Question Quality Rules

- Ask what decision is needed, not just what information is missing.
- Explain why the answer matters.
- Separate examples/screenshots/data requests from policy decisions.
- Do not ask the client to validate API feasibility unless they own the system behavior.
- Mark answered questions with the answer and source instead of deleting them.
