import { useNavigate } from 'react-router-dom';
import clannLogo from '../../assets/images/clann-logo.png';

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
        <div className="bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto flex justify-center">
                <div 
                    className="cursor-pointer" 
                    onClick={handleLogoClick}
                >
                    <img src={clannLogo} alt="Clann" className="h-20" />
                </div>
            </div>
        </div>
    );
}

export default Header; 