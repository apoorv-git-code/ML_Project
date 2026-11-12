# CONTRACT: interface between game (Person A) and ML (Person B)

Version 1.0. Person B implements these functions, Person A calls them from the game.
Changes need a pull request that the other person approves. Log columns and action codes come from `SCHEMA.md`.

## 1. Python API: `ml/api.py`

```python
def predict_next_action(history, top_k=3) -> dict:
    """Predict the human fighter's next action."""

def classify_style(match_df) -> dict:
    """Classify a player's style from one full match."""

def score_session(match_df) -> dict:
    """Score how bot-like a session is."""
```

### 1.1 `predict_next_action`

**Input `history`:** the last N = 10 ticks of the **human fighter's** perspective, oldest first. A `pandas.DataFrame` or a list of dicts with these keys:

`action, opp_action, distance, hp, opp_hp, meter, opp_meter`

If fewer than 10 ticks exist (start of the match), the function must **not crash**. It returns a fallback prediction (Markov or most common action) with `"model": "fallback"`.

**Output:**

```json
{
  "action": "PUNCH",
  "probs": {"PUNCH": 0.41, "BLOCK": 0.22, "MOVE_RIGHT": 0.15},
  "confidence": 0.41,
  "model": "xgb_v1"
}
```

- `action` is one of the codes in `SCHEMA.md`.
- `probs` holds the top `top_k` actions and sums to at most 1.
- `confidence` is the probability of `action`.

### 1.2 `classify_style`

**Input:** a full match DataFrame in the tick-log format (`SCHEMA.md` section 3), filtered to one `player_id`.

**Output:**

```json
{"style": "rusher", "scores": {"rusher": 0.7, "defensive": 0.1, "combo": 0.15, "counter": 0.05}}
```

### 1.3 `score_session`

**Input:** a full match (or several matches) of one `player_id`.

**Output:**

```json
{"bot_score": 0.93, "is_bot": true}
```

`bot_score` is between 0 and 1, higher means more bot-like. `is_bot` uses the threshold chosen on validation data.

## 2. HTTP bridge for a browser game: `ml/server.py`

If the game is JavaScript, it cannot import Python, so Person B wraps the API with FastAPI.

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/health` | GET | none | `{"status": "ok", "model": "xgb_v1"}` |
| `/predict_next` | POST | `{"history": [ {tick dict}, ... ]}` | same JSON as 1.1 |
| `/style` | POST | `{"ticks": [ ... ]}` | same JSON as 1.2 |
| `/bot_score` | POST | `{"ticks": [ ... ]}` | same JSON as 1.3 |

- Runs on `http://localhost:8000`, with CORS enabled for localhost.
- **The game must keep working if the server is down or slower than 50 ms.** In that case it falls back to the rule-based CPU. The game never blocks on the model.
- Start with: `uvicorn ml.server:app --port 8000`

## 3. Files and locations

| What | Where | Owner |
|---|---|---|
| Real logs | `data/raw/` (not committed) | A creates, B reads |
| Fake sample logs | `data/sample/` | B generates |
| Trained models | `ml/models/` (`next_action.joblib`, `style.joblib`, `bot.joblib`) | B |
| Logger | `game/` | A |
| Feature code | `ml/features.py` | B |

## 4. Rules for working together

1. **Dummy first.** By day 6, Person B delivers `predict_next_action` returning the most common action. Person A can integrate it immediately, and the real model replaces it later without changing the interface.
2. **Never silently change** a column, an action code or a function signature. Open a pull request, tag the other person, update this file and `SCHEMA.md` together.
3. **Version everything.** The `model` field in every response names the model version, so results in the report can be traced.
4. **No real data in git.** The repo is public.

## 5. Definition of done for integration (day 17)

- The game calls `/predict_next` every tick (or every few ticks) and the CPU visibly counters the human.
- Disconnecting the server does not crash the game.
- A scripted bot session scores clearly higher than every human session on `/bot_score`.
