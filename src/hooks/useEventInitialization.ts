import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventData } from './useEventData';

export const useEventInitialization = (
    eventCode: string | null,
    isAuthChecked: boolean,
    isAuthenticated: boolean | null,
    setCreatedCharacter: (character: any) => void
) => {
    const navigate = useNavigate();
    const { checkEventExistence, setIsVerifying } = useEventData(eventCode || '');

    useEffect(() => {
        const verifyAndRedirect = async () => {
            const eventExists = await checkEventExistence();
            if (!eventExists) {
                navigate('/'); // Redirect to home if event doesn't exist
            } else {
                const characterData = localStorage.getItem('createdCharacter');
                if (characterData) {
                    setCreatedCharacter(JSON.parse(characterData));
                } else if (isAuthChecked && !isAuthenticated) {
                    navigate('/event/register?code=' + eventCode);
                }
            }
            setIsVerifying(false); // End verification
        };

        verifyAndRedirect();
    }, [eventCode, isAuthChecked, isAuthenticated, navigate, checkEventExistence, setCreatedCharacter, setIsVerifying]);
};