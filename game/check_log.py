"""Validate game logs against docs/SCHEMA.md.  Usage: python game/check_log.py data/raw/M0001.csv [...]"""
import sys, pandas as pd
COLS = "match_id session_type player_id is_human tick t_ms action opp_action x y opp_x opp_y distance hp opp_hp meter opp_meter hit_landed hit_taken reaction_ms".split()
ACTS = {"IDLE", "MOVE_LEFT", "MOVE_RIGHT", "JUMP", "BLOCK", "PUNCH", "KICK", "GRAB"}
def check(path):
    d, errs = pd.read_csv(path), []
    if list(d.columns) != COLS: return ["columns differ from SCHEMA section 3"]
    if not d.action.isin(ACTS).all() or not d.opp_action.isin(ACTS).all(): errs.append("unknown action code")
    if (d.groupby("tick").size() != 2).any(): errs.append("a tick does not have exactly 2 rows")
    if sorted(d.tick.unique()) != list(range(d.tick.max() + 1)): errs.append("tick numbers not 0..n")
    if (d.t_ms != d.tick * 100).any(): errs.append("t_ms != tick*100")
    if ((d.x - d.opp_x).abs() - d.distance).abs().max() > 1e-6: errs.append("distance != abs(x-opp_x)")
    if not d[["hp", "opp_hp", "meter", "opp_meter"]].stack().between(0, 100).all(): errs.append("hp/meter outside 0-100")
    if d[COLS[:-1]].isna().any().any(): errs.append("missing values outside reaction_ms")
    if (d.reaction_ms.dropna() <= 0).any(): errs.append("reaction_ms must be positive or empty")
    return errs or ["OK  (%d ticks, %.1f s, reaction_ms filled on %d rows)" % (d.tick.nunique(), d.t_ms.max() / 1000, d.reaction_ms.notna().sum())]
for p in sys.argv[1:]: print(p, "->", *check(p), sep="\n  ")
