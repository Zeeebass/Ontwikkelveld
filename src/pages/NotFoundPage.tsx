import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Buiten de lijnen</h1><p>Deze pagina bestaat niet of is verplaatst.</p><Link className="button button--primary" to="/team"><ArrowLeft /> Terug naar het team</Link></div>
}
