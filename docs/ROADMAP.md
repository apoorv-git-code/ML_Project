# ROADMAP: 20 days, 2 people

**Person A = Apoorv (game and data)** | **Person B = Kanav (ML)**
Tick the boxes in pull requests. Update `docs/LOG.md` every evening.

## Plan

| Days | Person A (game and data) | Person B (ML) |
|---|---|---|
| 1-2 | **Together:** `SCHEMA.md`, `CONTRACT.md`, `CONSENT.md` agreed, repo set up | same |
| 3-6 | Minimal game, rule-based CPU, logging; start recruiting players | Simulator for fake logs, full pipeline on fake data, dummy `predict_next_action` |
| 7 | **Checkpoint:** clean logging works | Pipeline ready for real data |
| 8-11 | Run player sessions (10 to 15 players, 3 to 5 matches each) and 2 or 3 scripted bot runs | EDA on real data, style classifier |
| 12-13 | Feature help, start dashboard | Next-move predictor |
| 14-15 | Bot detector and scripted bot generator | Finish and tune next-move predictor |
| 16-17 | Plug the predictor into the CPU (demo); stretch: adaptive difficulty | Stretch: win probability; final charts and tables |
| 18-19 | Report: intro, game design, data collection, consent, limitations; dashboard | Report: methods, baseline vs model results, discussion |
| 20 | **Together:** read each other's sections, README, rehearse viva | same |

## Checklist

### Days 1-2 (together)
- [ ] SCHEMA.md reviewed and agreed by both
- [ ] CONTRACT.md reviewed and agreed by both
- [ ] CONSENT.md reviewed
- [ ] Folders, `.gitignore`, `requirements.txt` pushed
- [ ] Kanav has cloned the repo and created `b/ml`

### Person A
- [ ] Game: two fighters, 8 actions from SCHEMA.md, health, meter, rule-based CPU
- [ ] Logger writes `M<id>.csv` exactly as in SCHEMA.md
- [ ] Consent screen shown before the first match
- [ ] `matches.csv` written, with the optional skill and style questions
- [ ] Day 7: one full match produces a clean CSV
- [ ] 10 to 15 players recruited and sessions booked
- [ ] 2 or 3 scripted bot sessions recorded
- [ ] CPU calls the predictor and falls back if the server is down
- [ ] Dashboard (Streamlit)
- [ ] Report sections written

### Person B
- [ ] Simulator generating fake logs in SCHEMA.md format
- [ ] Pipeline: load, clean, features, player-wise split
- [ ] Dummy `predict_next_action` delivered by day 6
- [ ] Style classifier: K-Means baseline, Random Forest, confusion matrix, silhouette
- [ ] Next-move predictor: majority and Markov baselines, XGBoost, top-1 and top-3
- [ ] Bot detector: z-score baseline, Isolation Forest, precision and recall
- [ ] FastAPI server (`ml/server.py`) running the three endpoints
- [ ] Stretch: win-probability model
- [ ] Report sections written

### Day 20 (together)
- [ ] README updated with real run commands
- [ ] Each person can explain all three models
- [ ] Viva questions rehearsed (see below)

## Rules

- **Day 7 checkpoint:** if logging is not clean by then, fall back to a standard dataset project rather than sinking more time into the game.
- **Game time cap:** about 6 hours. Rectangles are fine. No art, sound or animation.
- **If behind at day 11:** drop the stretch goals and keep the three core modules.
- **Always build the baseline first.** The comparison is what examiners ask about.

## Viva questions to rehearse

1. Why did you split by player and not by row?
2. Why is a majority-action baseline needed for the move predictor?
3. How does Isolation Forest work, and why did you fit it on humans only?
4. How did you choose the number of clusters?
5. What is the weakness of using a Random Forest on K-Means labels?
6. How did you handle class imbalance (IDLE dominating)?
7. What are the limits of a dataset made of friends and classmates?
8. What would you change with 10 times more data?
