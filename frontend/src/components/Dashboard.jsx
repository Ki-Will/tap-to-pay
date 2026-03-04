import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

function Dashboard({ onLogout, backendUrl, socket, userRole }) {
  const [currentSection, setCurrentSection] = useState(userRole === 'admin' ? 'topup' : 'marketplace')

  return (
    <div className="dashboard">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLogout={onLogout}
        userRole={userRole}
      />
      <MainContent
        currentSection={currentSection}
        backendUrl={backendUrl}
        socket={socket}
        userRole={userRole}
      />
    </div>
  )
}

export default Dashboard
