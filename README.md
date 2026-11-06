# Adaptive Fighter AI

A small 2D fighting game that generates its own gameplay data, plus machine learning models that learn how people play. The models classify player style, predict the next move, and detect bots or macros. Built for the **Applied Machine Learning Lab** (UPES).

## What it does

| Module | Task | Baseline | Main model | Metrics |
|---|---|---|---|---|
| Style classifier | Classification / clustering | K-Means | Random Forest | Confusion matrix, silhouette score |
| Next-move predictor | Sequence prediction | Markov chain | XGBoost on a last-N window | Top-1 and top-3 accuracy |
| Bot detector | Anomaly detection | Z-score on reaction time | Isolation Forest | Precision, recall on scripted bots |
| *(Stretch)* Win probability and adaptive difficulty | Classification | Logistic regression | Gradient boosting | ROC-AUC, calibration |

All results are evaluated with a **split by player**, so models are tested on people they have never seen.

## Team

| Role | Person | Owns |
|---|---|---|
| Person A: Game and data engineering | Apoorv Mishra | `game/`, data collection, CPU demo, dashboard |
| Person B: ML lead | Kanav | `ml/`, pipeline, models, evaluation |

Both of us write the report and prepare the viva for the whole project.

## Repository structure

```
ML_Project/
├── README.md
├── docs/
│   ├── ROADMAP.md     # 20-day plan with checkboxes
│   ├── SCHEMA.md      # log columns, action codes, features
│   ├── CONTRACT.md    # predict_next_action(history) -> action, file formats
│   ├── CONSENT.md     # consent note and anonymization rules
│   └── LOG.md         # daily sync notes (done / blocked / changing)
├── game/              # Person A: game and event logging
├── data/
│   ├── sample/        # small fake sample, safe to commit
│   └── raw/           # real player logs, NOT committed
├── ml/                # Person B: pipeline, models, notebooks
├── report/
├── requirements.txt
└── .gitignore
```

## Quick start

```bash
git clone https://github.com/apoorv-git-code/ML_Project.git
cd ML_Project
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Run the game (once built):

```bash
python game/main.py
```

Run the ML pipeline on the sample data:

```bash
python ml/run_pipeline.py --data data/sample
```

## Shared contract

Two things must not change without a pull request that the other person reviews:

1. **Log schema**: defined in `docs/SCHEMA.md`.
2. **Prediction interface**: `predict_next_action(history) -> action`, defined in `docs/CONTRACT.md`. Person B writes it, Person A calls it from the game.

## Git workflow

- `main` always works and is updated only through pull requests.
- Person A works on `a/...` branches, Person B on `b/...` branches (for example `a/logging`, `b/style-classifier`).
- Each morning: `git pull origin main`, then merge `main` into your branch.
- Merge to `main` every 2 to 3 days. Tag milestones: `v0-schema`, `v1-data`, `v2-models`.
- Commit prefixes: `game:`, `ml:`, `docs:`, `data:`.
- Add a short entry to `docs/LOG.md` each evening.

## Data and privacy

- Only game events are logged: actions, timing, positions, health and meter. **No faces, images, names or personal identifiers.**
- Players get anonymous IDs (P01, P02, ...) and give consent before playing. See `docs/CONSENT.md`.
- This repository is public, so **real logs are never committed**. `data/raw/` is in `.gitignore` and shared privately between the two of us.

## Timeline

20 days, with a go or no-go checkpoint on day 7 (clean logging working). See `docs/ROADMAP.md` for the full plan.

| Days | Focus |
|---|---|
| 1-2 | Schema, contract, consent note, repo setup |
| 3-6 | Game and logging (A), simulator and pipeline on fake data (B) |
| 7 | Checkpoint |
| 8-11 | Data collection (A), EDA and style classifier (B) |
| 12-16 | Next-move predictor, bot detector |
| 17 | CPU demo, stretch goals |
| 18-19 | Report, dashboard |
| 20 | Viva prep and buffer |

## Status

- [ ] Schema and contract agreed
- [ ] Game logging clean
- [ ] Data collected
- [ ] Style classifier
- [ ] Next-move predictor
- [ ] Bot detector
- [ ] CPU demo
- [ ] Report and viva prep

## Course

Applied Machine Learning Lab, University of Petroleum and Energy Studies (UPES).
