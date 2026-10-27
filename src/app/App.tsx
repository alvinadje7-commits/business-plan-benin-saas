
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import AppLayout from './layouts/AppLayout'
import Dashboard from '../modules/projects/pages/Dashboard'
import ProjectList from '../modules/projects/pages/ProjectList'
import ProjectWizard from '../modules/projects/pages/ProjectWizard'
import FinancialStatementsPage from '../modules/financial-statements/pages/FinancialStatementsPage'
import ProfitabilityPage from '../modules/profitability/pages/ProfitabilityPage'
import LoginPage from '../modules/auth/pages/LoginPage'

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route element={<AppLayout/>}>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/projects" element={<ProjectList/>} />
            <Route path="/projects/:id" element={<ProjectWizard/>} />
            <Route path="/projects/:id/financials" element={<FinancialStatementsPage/>} />
            <Route path="/projects/:id/profitability" element={<ProfitabilityPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
