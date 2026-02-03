import React, { useEffect, useState } from 'react';
import { Screen } from '../App';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navigate: (screen: Screen) => void;
    menuItems: { label: string; icon: string; screen: Screen }[];
    userName?: string;
    userLogo?: string;
    userRole?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, navigate, menuItems, userName, userLogo, userRole }) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const handleNavigate = (screen: Screen) => {
        navigate(screen);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div className={`relative w-4/5 max-w-[300px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 bg-[#f6f8f7] border-b border-gray-100 flex flex-col gap-4 pt-10">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full border-2 border-[#10c65c] bg-cover bg-center"
                            style={{ backgroundImage: `url("${userLogo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='}")` }}>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">{userName?.split(' ')[0] || 'Usuário'}</h2>
                            <p className="text-xs font-semibold text-[#10c65c] uppercase">{userRole || 'Menu'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigate(item.screen)}
                            className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-l-4 border-transparent hover:border-[#10c65c]"
                        >
                            <span className="material-symbols-outlined text-[24px] text-gray-500">{item.icon}</span>
                            <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <button onClick={onClose} className="text-gray-400 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">close</span>
                        Fechar Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SideMenu;
