# Output locale (mandatory)

All agents reading `.cursor` instructions must follow this split. **Defaults live in [project.defaults.yaml](../../config/project.defaults.yaml)** — override there for team standards.

| Artifact | Language |
|----------|----------|
| Chat replies to the user | **From config** `locale.chat` (default English) |
| Brief / plan files | **From config** `locale.plan` (default English) |
| AskQuestion option labels | **From config** `locale.ask_question_labels` (default English) |
| i18n UI string values (non-default locale files) | **Match target locale** |
| Code — identifiers, types, file names, imports | **English** |
| Code comments (business logic) | **English** |
| JSON config keys (`columns[].key`, form `fields[].name`) | **English** |
| Git commit messages | Match user request; default **English** if unspecified |

Do not translate external specs when reading; summarize and plan in English.

Override: user explicitly requests another language for chat in the session.
