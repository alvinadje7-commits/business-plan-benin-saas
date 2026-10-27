
export default function LoginPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white p-6">
      <div className="w-full max-w-md bg-white text-zinc-900 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-sm text-zinc-500 mt-1">OHADA / Bénin / FCFA</p>
        <div className="mt-6 space-y-3">
          <input placeholder="Email" className="w-full border rounded-xl px-4 py-3" />
          <input type="password" placeholder="Mot de passe" className="w-full border rounded-xl px-4 py-3" />
          <button className="w-full bg-[#0F172A] text-white rounded-xl py-3 font-semibold">Se connecter</button>
        </div>
      </div>
    </div>
  )
}
