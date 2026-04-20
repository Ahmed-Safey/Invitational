import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

export default function Scoring() {
  const [scoring, setScoring] = useState([])

  const load = async () => {
    const { data } = await supabase.from('scoring_table').select('*').order('place')
    setScoring(data || [])
  }
  useEffect(() => { load() }, [])

  const save = async (row) => {
    const { error } = await supabase.from('scoring_table').update({
      individual_points: row.individual_points, relay_points: row.relay_points
    }).eq('id', row.id)
    if (error) toast.error(error.message)
    else toast.success('Scoring updated')
  }

  const content = (
    <div className="admin-card max-w-lg">
      <table className="admin-table">
        <thead><tr><th>Place</th><th>Individual</th><th>Relay</th><th></th></tr></thead>
        <tbody>
          {scoring.map(s => (
            <tr key={s.id}>
              <td className="font-bold">{s.place}</td>
              <td><input type="number" value={s.individual_points} onChange={e => setScoring(scoring.map(x => x.id === s.id ? {...x, individual_points: parseInt(e.target.value) || 0} : x))} className="admin-input w-20" /></td>
              <td><input type="number" value={s.relay_points} onChange={e => setScoring(scoring.map(x => x.id === s.id ? {...x, relay_points: parseInt(e.target.value) || 0} : x))} className="admin-input w-20" /></td>
              <td><button onClick={() => save(s)} className="admin-btn text-xs">Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Scoring</h1>
      <p className="text-sm text-gray-500 mb-6">Edit point tables</p>
      {content}
    </AdminLayout>
  )
}
