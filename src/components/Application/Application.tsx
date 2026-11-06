import Login from '../Login'
import WorkspaceHome from '../WorkspaceHome'
import WorkspaceLayout from '../WorkspaceLayout'
import Patients from '../Patients'
import PatientRegistration from '../PatientRegistration'
import PatientRecord from '../PatientRecord'
import PatientEditing from '../PatientEditing'
import ConsultationRegistration from '../ConsultationRegistration'
import Consultations from '../Consultations'
import ConsultationRecord from '../ConsultationRecord'
import NotFound from '../NotFound'
import { Navigate, Route, Routes } from 'react-router-dom'

export default function Application() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<WorkspaceLayout />}>
      <Route index element={<Navigate to="inicio" replace />} />
      <Route path="inicio" element={<WorkspaceHome />} />
      <Route path="consultas" element={<Consultations />} />
      <Route path="consultas/:consultationId" element={<ConsultationRecord />} />
      <Route path="pacientes" element={<Patients />} />
      <Route path="pacientes/nuevo" element={<PatientRegistration />} />
      <Route path="pacientes/:patientId" element={<PatientRecord />} />
      <Route path="pacientes/:patientId/editar" element={<PatientEditing />} />
      <Route path="pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
}
