import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import CompanyDashboard from './pages/CompanyDashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/company" element={<CompanyDashboard />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
