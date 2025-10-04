
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router'
import LoginPage from './components/Login/LoginPage'
import { Protected } from './Protected'
import ViewScenarios from './components/Administrator/ScenarioManager/ViewScenarios'
import SituationSetter from './components/Administrator/ScenarioManager/AddScenario/SituationSetter'
import ScenarioEditor from './components/Administrator/ScenarioManager/AddScenario/ScenarioEditor/ScenarioEditor'
import UserViewScenarios from './components/Trainee/ScenarioWalkthrough/UserViewScenarios'
import ScenarioWalkthrough from './components/Shared/ScenarioWalkthrough'
import ViewKnowledgeChecks from './components/Administrator/KnowledgeCheckManager/ViewKnowledgeChecks'
import AddExercise from './components/Administrator/KnowledgeCheckManager/AddExercise/AddExercise'
import AdminDashboard from './components/Administrator/Dashboard/AdminDashboard'
import CreateUserPage from './components/Administrator/Dashboard/components/CreateUserPage'
import ManageUsers from './components/Administrator/Dashboard/components/ManageUsers'
import ResourceManager from './components/Administrator/ResourceManager/ResourceManager'

function App() {

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<Protected />} >
         <Route index element={<AdminDashboard />} />
         <Route path="/scenario-manager" element={<Outlet />} >
            <Route index element={<ViewScenarios />} />
            <Route path="add-scenario" element={<SituationSetter />} />
            <Route path="edit-scenario" element={<ScenarioEditor  />} />
          </Route>
          <Route path="/scenario-walkthroughs" element={<Outlet />}>
            <Route index element={<UserViewScenarios />} />
            <Route path="view-scenario" element={<ScenarioWalkthrough />} />
          </Route>
          <Route path="/knowledge-checks" element={<Outlet />} >
            <Route index element={<ViewKnowledgeChecks />} />
            <Route path="add-exercise" element={<AddExercise />} />
          </Route>
          <Route path="/dashboard" element={<Outlet />} >
          <Route index element={<AdminDashboard />} />
          <Route path="create-user" element={<CreateUserPage />} />
          <Route path="manage-users" element={<ManageUsers/>} />
          </Route>
          <Route path="resource-manager" element={<ResourceManager />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
