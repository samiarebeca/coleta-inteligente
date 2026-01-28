import React, { useState, useRef, useEffect } from 'react';

interface Association {
    id: string;
    label: string;
    logo?: string;
}

interface AssociationSelectProps {
    value: string;
    onChange: (value: string) => void;
    associations: Association[];
    loading?: boolean;
}

const AssociationSelect: React.FC<AssociationSelectProps> = ({ value, onChange, associations, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedAssoc = associations.find(a => a.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative group" ref={containerRef}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none z-10">
                groups
            </span>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="block w-full pl-12 pr-4 py-3 h-12 bg-white border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all text-left flex items-center relative"
            >
                {loading ? (
                    <span className="text-gray-400">Carregando associações...</span>
                ) : selectedAssoc ? (
                    <div className="flex items-center gap-2">
                        {selectedAssoc.logo ? (
                            <div className="size-6 bg-cover bg-center rounded-full border border-gray-100 flex-shrink-0"
                                style={{ backgroundImage: `url("${selectedAssoc.logo}")` }}>
                            </div>
                        ) : (
                            <span className="material-symbols-outlined text-gray-400 text-lg">image</span>
                        )}
                        <span className="truncate">{selectedAssoc.label}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Selecione uma associação</span>
                )}

                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                </span>
            </button>

            {isOpen && !loading && associations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {associations.map((assoc) => (
                        <button
                            key={assoc.id}
                            type="button"
                            onClick={() => {
                                onChange(assoc.id);
                                setIsOpen(false);
                            }}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-50 ${value === assoc.id ? 'bg-[#10c65c]/5' : ''}`}
                        >
                            {assoc.logo ? (
                                <div className="size-8 bg-cover bg-center rounded-full border border-gray-200 flex-shrink-0"
                                    style={{ backgroundImage: `url("${assoc.logo}")` }}>
                                </div>
                            ) : (
                                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-lg">image</span>
                                </div>
                            )}
                            <span className={`text-sm font-bold ${value === assoc.id ? 'text-[#10c65c]' : 'text-gray-600'}`}>
                                {assoc.label}
                            </span>
                            {value === assoc.id && (
                                <span className="material-symbols-outlined ml-auto text-[#10c65c] text-sm">check</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssociationSelect;
