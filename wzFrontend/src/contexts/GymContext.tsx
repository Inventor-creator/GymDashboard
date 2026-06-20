import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    type FC,
} from "react";
import api from "../api";

interface GymContextType {
    activeGymId: number | null;
    setActiveGymId: (id: number | null) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [activeGymId, setActiveGymId] = useState<number | null>(null);

    useEffect(() => {
        if (activeGymId) {
            api.defaults.headers.common["X-Gym-Id"] = activeGymId.toString();
        } else {
            delete api.defaults.headers.common["X-Gym-Id"];
        }
    }, [activeGymId]);

    return (
        <GymContext.Provider value={{ activeGymId, setActiveGymId }}>
            {children}
        </GymContext.Provider>
    );
};

export const useGym = () => {
    const context = useContext(GymContext);
    if (context === undefined) {
        throw new Error("useGym must be used within a GymProvider");
    }
    return context;
};
