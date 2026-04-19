import { Link } from 'react-router-dom'
import PageHeader from '../../components/public/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader label="Error 404" title="Page Not Found" subtitle="The page you are looking for does not exist" />
      <div className="max-w-[900px] mx-auto py-16 px-8 text-center">
        <p className="text-gray-500 mb-8">This page may have been removed or is not yet available.</p>
        <Link to="/" className="btn-primary no-underline">&larr; Back to Home</Link>
      </div>
    </>
  )
}
