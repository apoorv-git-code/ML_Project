# CONSENT and data handling

Applies to everyone who plays the game for our Applied Machine Learning Lab project (students, teachers, anyone else).

## 1. Note shown to every player before the first match

> **Adaptive Fighter AI: data notice**
>
> We are two students at UPES building a fighting game for our Applied Machine Learning Lab. While you play, the game records **only game events**: which buttons you press and when, where the fighters are, health and meter.
>
> - We do **not** record your face, voice, screen, name, email, SAP ID or any other personal detail.
> - You are given an anonymous ID (for example P07). Your name is not linked to it in any file we keep.
> - The data is used only for this course project (training and testing models, and the project report). Summary charts and results may appear in the report. Individual matches will not be shown with your name.
> - Playing is voluntary. You can stop at any time, and you can ask us to delete your data by giving us your anonymous ID.
>
> Tick the box to confirm you have read this and agree to play.
>
> [ ] I agree

## 2. Rules we follow

1. **No personal data in the logs.** Only the columns in `SCHEMA.md`. Player IDs are `P01, P02, ...`.
2. **Consent first.** The game shows the note above and does not start logging until the box is ticked. Players under 18 do not take part.
3. **Keep the ID list private.** If we need to remember who is P07 (for example to send a deletion confirmation), that list stays in a private note held by Apoorv only. It is never committed to GitHub and never shared with the report or the models.
4. **Public repo, private data.** `data/raw/` is in `.gitignore`. Only fake sample data goes on GitHub. Real logs are shared between Apoorv and Kanav through a private folder.
5. **Deletion on request.** If a player asks, delete all matches with their ID from `data/raw/` and from any derived files, and note the deletion (without the player name) in `docs/LOG.md`.
6. **Scripted bot sessions** are recorded by us with the IDs `BOT01, BOT02, ...`. They involve no real participant.
7. **Retention.** Raw logs are deleted after the course evaluation is finished, unless a player agrees otherwise.

## 3. Wording for the report (limitations section)

> Data was collected from N volunteer players (students and a small number of teachers) who gave informed consent. Only anonymized in-game events were recorded. The sample is small and drawn from one university, so results may not generalize to other populations.

## 4. Contact

Players can reach us at: *(add your university email or a WhatsApp number here before sharing)*
