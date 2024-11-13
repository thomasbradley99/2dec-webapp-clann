const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await userService.validateUser(email, password);
        console.log('Token stored:', localStorage.getItem('token'));
        navigate('/dashboard');
    } catch (error) {
        setError(error.message);
    }
}; 