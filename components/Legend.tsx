import React from 'react';

const LegendRow: React.FC<{ icon: string; colorClass?: string; label: string; sublabel: string; }> = ({ icon, colorClass, label, sublabel }) => (
    <div className="flex gap-3 items-center">
        <span className={`material-icons text-lg ${colorClass || 'text-gray-600'}`}>{icon}</span>
        <div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-xs text-gray-500">{sublabel}</div>
        </div>
    </div>
);

const MarkerLegendRow: React.FC<{ colorClass: string; label: string; }> = ({ colorClass, label }) => (
    <div className="flex gap-3 items-center">
        <span className={`w-4 h-4 rounded-full flex-shrink-0 ${colorClass}`}></span>
        <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
);


const Legend: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h4 className="text-base font-semibold mt-0 mb-3">Legend</h4>
            <div className="space-y-3">
                <LegendRow icon="location_on" colorClass="text-blue-500" label="locationBias" sublabel="blue shape" />
                <LegendRow icon="block" colorClass="text-red-500" label="locationRestriction" sublabel="red shape" />
                <LegendRow icon="my_location" colorClass="text-blue-600" label="Origin marker" sublabel="blue origin dot" />
            </div>

            <hr className="my-3 border-gray-200" />
            
            <h4 className="text-base font-semibold mt-2 mb-3">Marker colors</h4>
            <div className="space-y-2">
                <MarkerLegendRow colorClass="bg-green-500" label="Inside restriction" />
                <MarkerLegendRow colorClass="bg-amber-500" label="Inside bias only" />
                {/* FIX: Corrected typo in component name from MarkerLegend-row to MarkerLegendRow. */}
                <MarkerLegendRow colorClass="bg-gray-500" label="Outside both" />
            </div>
        </div>
    );
};

export default Legend;