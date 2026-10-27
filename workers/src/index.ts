
export interface Env { SUPABASE_URL:string; SUPABASE_KEY:string; EXPORTS_BUCKET: R2Bucket }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if(url.pathname.startsWith('/api/exports/pdf')){
      const projectId = url.searchParams.get('project_id')
      // Génération PDF côté Worker avec jsPDF + données Supabase
      return new Response(JSON.stringify({status:'ok', project_id:projectId, type:'pdf'}),{headers:{'Content-Type':'application/json'}})
    }
    if(url.pathname.startsWith('/api/exports/excel')){
      return new Response(JSON.stringify({status:'ok', type:'excel'}),{headers:{'Content-Type':'application/json'}})
    }
    if(url.pathname.startsWith('/api/financial/recalculate')){
      // recalcul serveur pour versioning
      const body = await request.json()
      return new Response(JSON.stringify({recalculated:true, body}),{headers:{'Content-Type':'application/json'}})
    }
    return new Response('Business Plan Bénin Worker - OK')
  },
  async scheduled(event: ScheduledEvent, env: Env){
    // nettoyage liens expirés, calculs asynchrones
    console.log('scheduled', event.cron)
  }
}
