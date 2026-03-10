# Assumptions for MVP

1. Corruption gain timing: each core-die skull rolled during any roll/reroll immediately adds +1 corruption.
2. Initiative bag composition: one token per hero and one shared enemy token each round.
3. Enemy tie-break priority "player choice": unresolved ties are auto-resolved by deterministic sort (distance then HP), not a modal prompt yet.
4. Floor 1 layout: linear intro route Start -> Normal Combat -> Merchant -> Elite+Exit.
5. Merchant stock: fixed set of 3 item offers for MVP.
6. Elite reward outcomes: only Treasure has immediate numeric effect; Upgrade/New Power are implemented as UI placeholders.
7. Repositioning/pull movement in powers uses closest valid orthogonal tile and ignores advanced pathing hazards (none in MVP).
8. Item ownership model: run inventory items are globally usable by the active hero in combat UI for quick iteration.
9. Enemy group behavior roll: each enemy unit rolls intent from its definition scripts at round start.
