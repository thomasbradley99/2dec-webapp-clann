import { useNavigate } from 'react-router-dom';
import lukeLogo from '../../assets/images/luke-logo.png';

function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogoClick = () => {
        if (user?.role === 'COMPANY_MEMBER') {
            navigate('/company');
        } else {
            navigate('/sessions');
        }
    };

    return (
        <div className="bg-gray-900 p-3">
            <div className="max-w-7xl mx-auto flex justify-center">
                <div
                    className="cursor-pointer"
                    onClick={handleLogoClick}
                >
                    <img src={lukeLogo} alt="LUKE" className="h-16" />
                </div>
            </div>
        </div>
    );
}

export default Header; 