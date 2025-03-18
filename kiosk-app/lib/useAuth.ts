import { useEffect, useState } from "react";

export default function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [userType, setUserType] = useState<string | null>(null);

    useEffect(() => {
        const t = localStorage.getItem('kiosk-token'),
            ut = localStorage.getItem('kiosk-user-type') || 'member';

        setToken(t);
        setUserType(ut);
    }, [])

    function logout() {
        localStorage.removeItem('kiosk-token');
        localStorage.removeItem('kiosk-user-type');
        setToken(null);
        setUserType(null);
    }

    return { token, setToken, userType, setUserType, isLogedIn: token != null, logout }
}