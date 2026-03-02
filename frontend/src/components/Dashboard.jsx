import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

function Dashboard({ onLogout, backendUrl, socket }) {
  const [currentSection, setCurrentSection] = useState('topup')

  return (
    <div className="dashboard">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLogout={onLogout}
      />
      <MainContent
        currentSection={currentSection}
        backendUrl={backendUrl}
        socket={socket}
      />
    </div>
  )
}

export default Dashboard
