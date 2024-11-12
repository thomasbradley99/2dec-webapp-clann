import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/sessions',
        element: <Sessions />,
    },
    {
        path: '/profile',
        element: <Profile />,
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }
});

export default router; 