# Codra Supabase schema proposal

This is a migration design only. The current application continues to use `localStorage`.

## Tables

| Table | Purpose / main columns | Relations | RLS policy | Migration source |
|---|---|---|---|---|
| `users` | Auth identity: `id`, `email`, `created_at` | Supabase Auth user | A user can read/update only their own row | `codra_profile` identity fields |
| `profiles` | Student profile: `user_id`, `nickname`, `grade`, `industries`, `job_types`, `locations`, `strengths`, `skills`, preference scores | `user_id -> users.id` | Own row only | `codra_profile` |
| `companies` | Canonical company catalog: `id`, `name`, `category`, `industries`, `job_types`, scores, source status | Referenced by user tables | Public read for published records; admin write | In-app mock `companies` |
| `company_sources` | Source evidence: `company_id`, `source_type`, `url`, `updated_at`, `confidence` | `company_id -> companies.id` | Public read for published sources; admin write | Company notices/source metadata |
| `saved_companies` | User saved companies: `user_id`, `company_id`, `created_at` | User + company | Own rows only | `codra_saved_companies` |
| `applications` | Selection status: `user_id`, `company_id`, `status`, `deadline`, `next_action`, `priority` | User + company | Own rows only | `codra_apps` |
| `application_tasks` | Application tasks: `application_id`, `title`, `due_at`, `completed_at` | `application_id -> applications.id` | Own application rows only | Derived from `codra_apps` tasks |
| `es_documents` | ES drafts: `user_id`, `company_id`, `type`, `question`, `draft`, `ai_feedback`, `status`, `updated_at` | User + company | Own rows only | `codra_es_documents` |
| `interview_answers` | Interview notes: `user_id`, `company_id`, `question_key`, `answer`, `updated_at` | User + company | Own rows only | `codra_interview_answers` |
| `interview_ai_feedback` | Normalized AI result: `user_id`, `company_id`, `question_key`, `source`, `payload`, `created_at` | User + company + answer | Own rows only; never expose provider secrets | `codra_interview_ai_feedback` |
| `company_research_notes` | User notes: `user_id`, `company_id`, `note`, `updated_at` | User + company | Own rows only | `codra_company_research_notes` |
| `recommendation_scores` | Versioned recommendation result: `user_id`, `company_id`, `score`, `breakdown`, `algorithm_version`, `created_at` | User + company | Own rows only | Computed from profile/company data |
| `ai_generation_logs` | Operational metadata: `user_id`, `kind`, `model`, `status`, `latency_ms`, `token_usage`, `created_at` | User optional | User may see own aggregate logs; service role writes | New server-side records only |

## Migration notes

- Use `auth.users.id` as the stable `user_id`; do not migrate a browser identity as trusted authentication.
- Import local data only after validating company IDs and associating it with the authenticated user.
- Store AI feedback as JSONB after schema validation. Do not store raw prompts or raw personal answers in operational logs by default.
- Use `created_at`/`updated_at` timestamps and an `algorithm_version` for reproducible recommendation history.
- RLS should be enabled on every user-owned table before the client is allowed to use Supabase.
