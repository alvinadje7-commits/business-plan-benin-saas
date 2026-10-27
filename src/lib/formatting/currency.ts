
export const formatFCFA = (n:number) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(n).replace('XOF','FCFA')
export const formatPercent = (n:number) => new Intl.NumberFormat('fr-FR',{style:'percent',minimumFractionDigits:1}).format(n)
export const formatNumber = (n:number) => new Intl.NumberFormat('fr-FR').format(n)
