
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router'
import LoginPage from './components/Login/LoginPage'
import { Protected } from './Protected'
import ViewScenarios from './components/Administrator/ScenarioManager/ViewScenarios'
import SituationSetterCard from './components/Administrator/ScenarioManager/AddScenario/SituationSetter'
import SituationSetter from './components/Administrator/ScenarioManager/AddScenario/SituationSetter'
import ScenarioEditor from './components/Administrator/ScenarioManager/AddScenario/ScenarioEditor/ScenarioEditor'

function App() {

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<Protected />} >
         <Route index element={<div>Welcome to the Dispatch Training Application!</div>} />
         <Route path="/scenario-manager" element={<Outlet />} >
            <Route index element={<ViewScenarios />} />
            <Route path="add-scenario" element={<SituationSetter />} />
            <Route path="edit-scenario" element={<ScenarioEditor  />} />

          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
