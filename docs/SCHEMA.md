# SCHEMA: log format, action codes and features

Version 1.0. Owner: Person A (Apoorv) writes the logger, Person B (Kanav) consumes it.
Any change to this file needs a pull request that the other person approves.

## 1. Conventions

- The game logs one row per fighter every **100 ms tick**.
- `t_ms` is milliseconds since the match started.
- Arena: `x` runs from 0 to 1000, `y` is height above the ground (0 to 200).
- `distance = abs(x - opp_x)`.
- Player IDs are anonymous: humans `P01, P02, ...`, the built-in CPU `CPU`, scripted bots `BOT01, BOT02, ...`.
- Match IDs: `M0001, M0002, ...`.
- No names, emails, SAP IDs, faces or images are ever stored.

## 2. Action codes

| Code | Meaning |
|---|---|
| IDLE | no input |
| MOVE_LEFT | walk left |
| MOVE_RIGHT | walk right |
| JUMP | jump |
| BLOCK | guard |
| PUNCH | fast, low damage |
| KICK | slower, higher damage |
| GRAB | short range, breaks block |

If the game needs a super move, log it as `SUPER` and add it here through a pull request.

## 3. Tick log: `M<id>.csv` (two rows per tick, one per fighter)

| Column | Type | Description |
|---|---|---|
| match_id | str | e.g. M0001 |
| session_type | str | `human_vs_cpu`, `human_vs_human` or `scripted_bot` |
| player_id | str | fighter this row describes (the "self" in the row) |
| is_human | int | 1 for a human, 0 for CPU and bots |
| tick | int | 0, 1, 2, ... |
| t_ms | int | tick x 100 |
| action | str | this fighter's action in this tick (code from section 2) |
| opp_action | str | the other fighter's action in the same tick |
| x, y | float | this fighter's position |
| opp_x, opp_y | float | other fighter's position |
| distance | float | abs(x - opp_x) |
| hp, opp_hp | int | health, 0 to 100 |
| meter, opp_meter | int | super meter, 0 to 100 |
| hit_landed | int | 1 if this fighter hit the opponent this tick |
| hit_taken | int | 1 if this fighter was hit this tick |
| reaction_ms | int or empty | ms from the opponent starting PUNCH, KICK or GRAB to this fighter changing action in response. Filled on the tick the response happens, empty otherwise. |

## 4. Match summary: `matches.csv` (one row per match)

| Column | Description |
|---|---|
| match_id | e.g. M0001 |
| date | YYYY-MM-DD |
| session_type | as above |
| p1_id, p2_id | player IDs |
| winner_id | player ID or DRAW |
| duration_ms | match length |
| p1_final_hp, p2_final_hp | health at the end |
| group | `student`, `teacher` or `bot` |
| self_rated_skill | 1 (new) to 5 (expert), asked before the first match, optional |
| self_described_style | `rusher`, `defensive`, `combo`, `counter` or `unsure`, asked after the match, optional |

## 5. Files and where they live

- Real logs: `data/raw/M0001.csv`, `data/raw/matches.csv`. **Never committed** (the repo is public). Shared privately between Apoorv and Kanav.
- Fake sample for development: `data/sample/` (safe to commit). Kanav generates it with his simulator, in exactly this format.

## 6. Features per model

### 6.1 Style classifier (one row per player per match)

| Feature | Definition |
|---|---|
| attack_rate | (PUNCH + KICK + GRAB ticks) / match seconds |
| block_ratio | BLOCK ticks / total ticks |
| idle_ratio | IDLE ticks / total ticks |
| jump_rate | JUMP starts per second |
| mean_distance | mean of `distance` |
| approach_ratio | share of moving ticks that reduce `distance` |
| combo_rate | attacks that follow another attack within 500 ms, per second |
| damage_dealt, damage_taken | from `hit_landed`, `hit_taken` |
| meter_usage | mean of `meter` |
| mean_reaction_ms | mean of non-empty `reaction_ms` |

Labels: K-Means clusters first, named by inspecting centroids. Random Forest then predicts the cluster from features and reports feature importance. Validate the clusters against `self_described_style` where available, and be honest in the report that the Random Forest result is partly circular.

### 6.2 Next-move predictor (one row per tick)

- **Input:** the last N = 10 ticks of the human fighter: `action`, `opp_action`, `distance` (binned), `hp - opp_hp`, `meter`, `opp_meter`.
- **Target:** the human fighter's action in the next tick.
- **Baseline:** Markov chain on the previous action (order 1, then order 2).
- **Model:** XGBoost on the flattened window; optional LSTM if time allows.
- **Metrics:** top-1 and top-3 accuracy. Compare against "always predict the most common action", because IDLE and movement dominate and inflate accuracy.

### 6.3 Bot detector (one row per player per session)

| Feature | Definition |
|---|---|
| reaction_mean, reaction_std, reaction_min | from `reaction_ms` |
| action_interval_std | std of time between action changes |
| inputs_per_second | action changes per second |
| repeat_ratio | share of 4-action n-grams that repeat exactly |
| timing_regularity | coefficient of variation of action intervals (bots are too regular) |

Fit on human sessions only. Test on held-out humans plus scripted bot sessions.

### 6.4 Stretch: win probability

Input: `hp`, `opp_hp`, `meter`, `opp_meter`, `distance` at each tick. Target: winner of the match. Metrics: ROC-AUC and calibration curve.

## 7. Splitting rule (important for the viva)

- **Always split by `player_id`, never by row.** Test players are never seen in training.
- Teachers (and any very different players) form an extra held-out group if we have them.
- Scripted bot sessions never enter style or next-move training.

## 8. Data quality rules

- Drop matches shorter than 20 seconds.
- Drop rows with missing positions, `hp` or `action`.
- `reaction_ms` may be empty; do not fill it with zeros.
- Report the number of matches and players used after cleaning.
