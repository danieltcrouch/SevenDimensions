/*** DELETE ***/
DELETE m, s, mp, p
FROM meta m
LEFT JOIN state s ON s.gameId = m.id
LEFT JOIN map mp ON mp.gameId = m.id
LEFT JOIN player p ON p.gameId = m.id
WHERE m.id IN ('5359FD9628122E0E8B5060BC45CA730D');