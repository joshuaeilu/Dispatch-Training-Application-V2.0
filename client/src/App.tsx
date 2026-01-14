
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router'
import LoginPage from './components/Login/LoginPage'
import { Protected } from './Protected'
import ViewScenarios from './components/Administrator/ScenarioManager/ViewScenarios'
import SituationSetter from './components/Administrator/ScenarioManager/AddScenario/SituationSetter'
import ScenarioEditor from './components/Administrator/ScenarioManager/AddScenario/ScenarioEditor/ScenarioEditor'
import UserViewScenarios from './components/User/ScenarioWalkthrough/UserViewScenarios'
import ScenarioWalkthrough from './components/Shared/ScenarioWalkthrough'
import ViewKnowledgeChecks from './components/Administrator/KnowledgeCheckManager/ViewKnowledgeChecks'
import AddExercise from './components/Administrator/KnowledgeCheckManager/AddExercise/EditExercise'
import AdminDashboard from './components/Administrator/Dashboard/AdminDashboard'
import CreateUserPage from './components/Administrator/Dashboard/components/CreateUserPage'
import ManageUsers from './components/Administrator/Dashboard/components/ManageUsers'
import ResourceManager from './components/Administrator/ResourceManager/ResourceManager'
import UserViewKnowledgeChecks from './components/User/KnowledgeChecks/UserViewKnowledgeChecks'
import ViewKnowledgeCheck from './components/User/KnowledgeChecks/ViewKnowledgeCheck'
import UserResourcesPage from './components/Shared/Resources/UserResourcesPage'
import { getUser } from './contexts/AuthProvider'
import SettingsPage from './components/Administrator/Dashboard/components/SettingsPage'
import UserProgressPage from './components/Administrator/Dashboard/components/UserProgressPage'
import UsersPage from './components/Administrator/Dashboard/components/UsersPage'

function App() {

  const user = getUser();
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />
        {/* Protected Routes */}
        <Route element={<Protected />} >

          <Route index element={user?.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/resources" replace />} />


          {/* Administrator Routes */}


          <Route path="/dashboard" element={<Outlet />} >
            <Route index element={<AdminDashboard />} />
            <Route path="create-user" element={<CreateUserPage />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="dispatchers" element={<UsersPage role="dispatcher" />} />
            <Route path="trainees" element={<UsersPage role="trainee" />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="user-progress" element={<UserProgressPage />} />
            
          </Route>

          <Route path="/scenario-manager" element={<Outlet />} >
            <Route index element={<ViewScenarios />} />
            <Route path="add-scenario" element={<SituationSetter />} />
            <Route path="edit-scenario" element={<ScenarioEditor />} />
          </Route>


        

          <Route path="/knowledge-checks" element={<Outlet />} >
            <Route index element={<ViewKnowledgeChecks />} />
            <Route path="edit-exercise" element={<AddExercise />} />
          </Route>
          <Route path="resource-manager" element={<ResourceManager />} />


          {/* User Routes */}

            <Route path="/scenario-walkthroughs" element={<Outlet />}>
            <Route index element={<UserViewScenarios />} />
            <Route path="view-scenario" element={<ScenarioWalkthrough />} />
          </Route>

          <Route path="/user-knowledge-checks" element={<Outlet />} >
            <Route index element={<UserViewKnowledgeChecks />} />
            <Route path="view-exercise" element={<ViewKnowledgeCheck />} />
          </Route>


          <Route path="/resources" element={<UserResourcesPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
