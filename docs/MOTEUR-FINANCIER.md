Moteur dans src/lib/calculations/financial-engine.ts

Calcule:
- Compte résultat: CA, achats, marge brute, EBE, RE, RF, RAI, IS 30%, RN, CAF
- Bilan: immo net, stocks 30% achats, créances 5% CA, trésorerie, capitaux, dettes fin/fourn/fisc, total actif=passif
- Trésorerie: encaissements 95%, décaissements, solde, cumul
- Plan financement, VAN, TRI, délai récup, seuil rentabilité, DSCR

Cohérence vérifiée:
- Actif = Passif
- Trésorerie bilan = trésorerie fin
- Amortissements dans CR et bilan
- Remboursement capital dans plan financement et flux
- Alerte trésorerie négative, endettement >70%

Recalcul réactif: toute modif hypothèse -> useMemo -> recalc instantané
