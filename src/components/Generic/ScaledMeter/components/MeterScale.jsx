import React from 'react';

function MeterScale({ range, subdivisions }) {
    const subdivisionValue = Math.round((range / subdivisions) * 10) / 10;

    return (
        <div className="decibel-scale">
            {Array.from({ length: subdivisions + 1 }, (_, i) => (
                <div key={i} className="scale-element-container">
                    {(i !== 0 && i !== subdivisions) && (
                        <div className="scale-element">
                            <div className="scale-dot"></div>
                            <div className="scale-mark">
                                {range - i * subdivisionValue}
                            </div>
                            <div className="scale-dot"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default React.memo(MeterScale);
