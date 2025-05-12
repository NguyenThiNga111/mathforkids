import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Siderbar from './component/Sidebar';
import DashboardPage from './page/Dashboard/dashboard';
import AccountUser from './page/AccountUser/accountuser';
import RewardPage from './page/Reward/reward';

import { injectColorsToRoot } from './assets/theme/colors';
import { injectFontsToRoot } from './assets/theme/fonts';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Siderbar />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="account-user" element={<AccountUser />} />
          <Route path="rewards" element={<RewardPage />} />

          {/* Add more routes inside the layout */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
injectColorsToRoot();
injectFontsToRoot();