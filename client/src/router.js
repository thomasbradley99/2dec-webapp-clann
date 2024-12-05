import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import CompanyDashboard from './pages/CompanyDashboard/index';
import SessionDetails from './pages/SessionDetails';
import Success from './pages/Success';

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
    },
    {
        path: '/success',
        element: <Success />,
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_skipActionErrorRevalidation: true
    }
});

export default router; 