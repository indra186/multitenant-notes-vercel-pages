import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function api(path, opts={}){
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return fetch('/api'+path, { ...opts, headers: { 'Content-Type':'application/json', ...(opts.headers||{}), ...(token?{ Authorization: 'Bearer '+token }: {}) } })
}

export default function NotesPage(){
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [plan, setPlan] = useState('FREE')
  const router = useRouter()

  useEffect(()=>{ load() }, [])

  async function load(){
    const r = await api('/notes')
    if (r.status === 401) return router.push('/login')
    const data = await r.json().catch(()=>null)
    if (r.ok && Array.isArray(data)) {
      setNotes(data)
    } else {
      setError(data?.error || null)
    }

    const t = await fetch('/api/tenants/me', { headers: { Authorization: 'Bearer '+localStorage.getItem('token') } })
    if (t.ok) {
      const td = await t.json().catch(()=>null)
      if (td && td.plan) setPlan(td.plan)
    }
  }

  async function createNote(e){
    e.preventDefault()
    setError('')
    const r = await api('/notes', { method: 'POST', body: JSON.stringify({ title, content }) })
    const data = await r.json().catch(()=>({ error: 'Server error' }))
    if (!r.ok) return setError(data.error || 'Error')
    setTitle(''); setContent(''); load()
  }

  async function del(id){ await api('/notes/'+id, { method: 'DELETE' }); load() }

  function logout(){ localStorage.removeItem('token'); router.push('/login') }

  async function upgrade(){
    const slugs = ['acme','globex']
    for (const s of slugs){
      const r = await api('/tenants/'+s+'/upgrade', { method: 'POST' })
      if (r.ok){ alert('Upgraded to Pro'); load(); return }
    }
    alert('Upgrade failed — must be tenant Admin.')
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Notes</h2>
        <div>
          <span style={{marginRight:12}}>Plan: {plan === 'PRO' ? 'Pro (unlimited)' : 'Free (max 3)'}</span>
          <button onClick={upgrade}>Upgrade to Pro</button>
          <button onClick={logout} style={{marginLeft:8}}>Logout</button>
        </div>
      </div>

      <section>
        <h3>Create note</h3>
        <form onSubmit={createNote}>
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} rows={4} />
          <button type="submit">Create</button>
        </form>
        {error && <p style={{color:'red'}}>{error}</p>}
      </section>

      <hr />

      <section>
        <h3>Your notes</h3>
        {notes.map(n => (
          <div key={n.id} className="note">
            <strong>{n.title}</strong>
            <p>{n.content}</p>
            <button onClick={()=>del(n.id)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  )
}
