# Gemini Integration Audit Command

Audit the specified service or integration against the Chedr Gemini standards.

$file:agent-gemini.md

## Target: $ARGUMENTS

If no target specified, audit `services/geminiService.ts` and `services/documentClassifier.ts`.

## Audit Checklist

### Data Integrity
- [ ] Monetary values stored as integer cents
- [ ] Dates are ISO 8601 strings (YYYY-MM-DD)
- [ ] All extracted fields have confidence scores
- [ ] All fields have source references (documentId, page, boundingBox)

### Schema Validation
- [ ] TypeScript interfaces defined for all API responses
- [ ] Responses validated against schemas before processing
- [ ] Malformed responses rejected (not "fixed")
- [ ] Schema matches actual Gemini output structure

### Error Handling
- [ ] Rate limits handled with exponential backoff
- [ ] Server errors trigger retry with cap
- [ ] Auth errors fail fast with user-friendly message
- [ ] Timeouts return partial results when possible
- [ ] No raw API errors exposed to users

### Security
- [ ] No SSN/EIN/passwords in logs
- [ ] No sensitive data in Gemini prompts
- [ ] API keys not hardcoded in source
- [ ] No plaintext storage of sensitive fields

### Pipeline Stages
- [ ] Lineage stages update correctly (source → classification → extraction → verification → applied)
- [ ] Each stage has clear status (pending, active, completed, error)
- [ ] Failed stages don't block entire pipeline
- [ ] Partial results preserved on failure

### Testing
- [ ] Unit tests mock Gemini responses
- [ ] Error branches have test coverage
- [ ] Schema validation tests exist
- [ ] Integration tests use sample documents

### Cost & Performance
- [ ] Using appropriate model (flash vs pro)
- [ ] Prompts are concise (no unnecessary context)
- [ ] Structured outputs preferred over free-form
- [ ] Response times within budget (< 5s extraction)

## Output

Produce a ranked list of issues (max 10) with:
1. Severity (critical / major / minor)
2. Location (file:line or function name)
3. Issue description
4. Recommended fix
5. Test to add (if applicable)
