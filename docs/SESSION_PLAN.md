# SESSION PLAN: recruiting and running player sessions (Person A)

Target (from ROADMAP): 10 to 15 players, 3 to 5 matches each, plus 2 or 3 scripted bot sessions.
One session is about 10 to 15 minutes (a match lasts at most 60 s).

## Before a session
- [ ] `git pull`, then `python -m http.server 8080 --directory game`, open `http://localhost:8080` in Chrome (same browser and address every time, so match numbering and `matches.csv` carry on)
- [ ] Next free player ID noted (P01, P02, ...). Hand the player a slip with only their ID, so they can ask for deletion later
- [ ] Player is 18 or older and has read the on-screen consent note (CONSENT.md)
- [ ] Do not write the player's name next to their ID anywhere

## During
- Player enters their ID, ticks "I agree", picks Human vs CPU. Say the keys once (A/D, W, S, J/K/L). Do not coach strategy: it changes their style.
- Let them play 3 to 5 matches. Matches under 20 s are dropped later, so a quick KO is fine.
- Optional skill (1-5) before and style after are voluntary.

## After
- [ ] Move `M000x.csv` files and the latest `matches.csv` from Downloads into `data/raw/`
- [ ] `python game/check_log.py data/raw/M000x.csv` shows OK for each file
- [ ] Back up `data/raw/` privately to Kanav (never commit it, never post it in a public place)
- [ ] Add the session to `docs/LOG.md`

## Scripted bot sessions
In the game choose "Scripted bot vs CPU", ID `BOT01` (no consent needed, no real participant). Odd IDs (BOT01, BOT03) are macros with a punch every 6 ticks; even IDs (BOT02, BOT04) block instantly and kick every 8 ticks. Record 2 or 3 sessions, a few matches each, then check and copy files as for players. Bot files never enter style or next-move training.
