# LOG: daily sync

One entry per person per day, 3 lines. Newest at the top.

Format:

```
## Day N (YYYY-MM-DD) - Name
- Done:
- Blocked:
- Changing tomorrow:
```

---

## Day 8 (2026-11-17) - Apoorv
- Done: sample logs in `data/sample/` (CPU vs CPU, same format as real logs), `docs/SESSION_PLAN.md`, bot mode (headless tested only); SCHEMA section 8 bot exemption proposed (PR, needs Kanav approval); first raw data to Kanav by the night of Nov 20
- Blocked: Kanav has not yet confirmed his fork and `b/ml`; collaborator invite did not work, so he forks and opens PRs to `main`
- Changing tomorrow: run `check_log.py` on a real match, fill the contact line in `docs/CONSENT.md` section 4, book the first player sessions

## Day 3 (2026-11-12) - Apoorv
- Done: browser game with 8 actions, rule-based CPU and consent screen; logger writes `M<id>.csv` and `matches.csv`; playtested
- Blocked: none
- Changing tomorrow: run `check_log.py` on real matches, start booking players

## Day 1 (2026-11-10) - Apoorv
- Done: repo created, README and docs files written (SCHEMA, CONTRACT, CONSENT, ROADMAP, LOG)
- Blocked: waiting for Kanav to review SCHEMA.md and CONTRACT.md
- Changing tomorrow: start the game skeleton on branch `a/game`
