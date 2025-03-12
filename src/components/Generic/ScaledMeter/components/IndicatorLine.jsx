import React from 'react';
import { calculatePosition } from '../utils/meterUtils';

function IndicatorLine({
    indicatorLine,
    indicatorType,
    indicatorRange,
    meterDimension,
    range,
    girth
}) {
    if (indicatorLine === undefined) return null;

    let lineColor = 'rgba(255,255,255,1)';
    let computedIndicator = Math.round(indicatorLine * 10) / 10;
    let indicatorLinePosition = 0;

    if (indicatorType === 'gain') {
        lineColor = computedIndicator === 0 ? 'hsla(20, 100%, 60%, 0.5)' : 'hsla(15, 100%, 70%, 1)';
        indicatorLinePosition = ((computedIndicator + range / 2) / range) * 100;
    } else {
        indicatorLinePosition = calculatePosition(computedIndicator, range);
    }

    // Calculate height for ranged indicator
    const isRanged = indicatorRange && indicatorRange > 1;
    const height = isRanged ? Math.max(2, (indicatorRange * meterDimension) / range) : 2;

    // Apply specific styles based on indicator type
    const lineStyle = {
        bottom: `${indicatorLinePosition}%`,
        borderColor: isRanged ? undefined : lineColor,
        height: isRanged ? `${height}px` : undefined
    };

    // Gain label styling
    const labelStyle = {
        bottom: `calc(${indicatorLinePosition}% + 1px)`,
        width: `${girth}px`,
        color: lineColor,
        opacity: computedIndicator === 0 ? 0 : 1
    };

    return (
        <>
            <div
                className={`indicator-line ${isRanged ? 'ranged' : 'normal'}`}
                style={lineStyle}
            ></div>
            {indicatorType === 'gain' && computedIndicator !== 0 && (
                <div className="gain-label" style={labelStyle}>
                    {computedIndicator > 0 ? `+${computedIndicator}` : computedIndicator}
                </div>
            )}
        </>
    );
}

export default React.memo(IndicatorLine);
