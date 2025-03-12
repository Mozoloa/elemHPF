import React, { useRef, useState } from 'react';
import useMeterCanvas from '../hooks/useMeterCanvas';

function DecibelMeter({
    event,
    type,
    range = 60,
    invert,
    girth,
    safeLevel,
    highLevel,
    toolColor,
    clipColor,
    lowColor,
    safeLowColor,
    safeHighColor,
    warnColor,
    dangerColor
}) {
    const canvasRef = useRef(null);
    const [overload, setOverload] = useState(false);

    // Set decay based on meter type
    let decay = type === 'gr' ? 0.9 : 0.9;
    invert = type === 'gr' ? true : invert;

    // Pass setOverload as callback to update overload state
    useMeterCanvas(canvasRef, event, type, range, invert, decay, setOverload);

    // Generate overlay gradient based on meter type
    let overlayStyle = {};
    if (safeLevel != null && highLevel != null && type === 'level') {
        const safePercent = ((range + safeLevel) / range) * 100;
        const highPercent = ((range + highLevel) / range) * 100;
        overlayStyle.background = `linear-gradient(to top, 
            ${lowColor || 'var(--meter-low-color)'} 0%, 
            ${safeLowColor || 'var(--meter-safe-low-color)'} ${safePercent}%, 
            ${safeHighColor || 'var(--meter-safe-high-color)'} ${safePercent}%, 
            ${safeHighColor || 'var(--meter-safe-high-color)'} ${highPercent}%, 
            ${warnColor || 'var(--meter-warn-color)'} ${highPercent}%, 
            ${dangerColor || 'var(--meter-danger-color)'} 100%)`;
    } else if (type === 'gr') {
        overlayStyle.background = `linear-gradient(to top, red 0%, ${toolColor || 'var(--meter-tool-color)'} 100%)`;
    }

    // Apply overload styling based on state
    const overloadStyle = overload ? {
        backgroundColor: clipColor || 'var(--meter-clip-color)',
        boxShadow: `0px 0px 5px 1px ${clipColor || 'var(--meter-clip-color)'}`
    } : {};

    return (
        <div
            className="meter-container"
            style={{ width: `${girth}px` }}
        >
            <canvas ref={canvasRef} className="meter-canvas" />
            <div className="meter-overlay" style={overlayStyle}></div>
            <div
                className={`meter-overload ${overload ? 'active' : 'inactive'}`}
                style={overloadStyle}
            ></div>
        </div>
    );
}

export default React.memo(DecibelMeter);
