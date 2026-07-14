import type { Metadata } from 'next'
import { ClientRequirementsForm } from '../../components/client-requirements-form'

export const metadata: Metadata = {
  title: 'Client Requirements | EURO TROUSERS',
  description: 'Final configuration and data migration questionnaire for the Customs & Warehouse Management System.',
}

export default function ClientRequirementsPage() {
  return <ClientRequirementsForm />
}
