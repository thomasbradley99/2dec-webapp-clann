import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import CompanyDashboard from './pages/CompanyDashboard/index';
import SessionDetails from './pages/SessionDetails';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/company',
        element: <CompanyDashboard />,
    },
    {
        path: '/sessions',
        element: <Sessions />,
    },
    {
        path: '/profile',
        element: <Profile />,
    },
    {
        path: '/session/:sessionId',
        element: <SessionDetails />,
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }
});

export default router; 