12 secteurs: aviculture (cycles, mortalité, aliment, vaccins), anacarde (ha, rendement, bord champ, transformation), agriculture, agro-industrie, commerce, import-export, restauration, BTP, transport, services, élevage autre, transformation agro.

Moteur dynamique: chaque secteur = JSON avec assumption_fields, revenue_rules avec formules, cost_rules, kpis, default_investments, risks, document_sections, charts.

Exemple formule aviculture: birds_per_cycle * (1 - mortality_rate) * average_weight * selling_price_per_kg * number_of_cycles_per_year
