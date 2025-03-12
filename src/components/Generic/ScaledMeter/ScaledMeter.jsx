import React, { useRef, useState, useEffect } from 'react';
import DecibelMeter from './components/DecibelMeter';
import IndicatorLine from './components/IndicatorLine';
import MeterScale from './components/MeterScale';
import './ScaledMeter.css';

function ScaledMeter(props) {
    // Destructure props with defaults
    const {
        event,
        type,
        girth = 14,
        range = 60,
        safeLevel = -20,
        highLevel = -6,
        subdivisions = 6,
        invert,
        decay = 0,
        indicatorLine,
        indicatorRange,
        indicatorType,
        scaled = false,
        // Color props with defaults
        lowColor,
        safeLowColor,
        safeHighColor,
        warnColor,
        dangerColor,
        clipColor,
        toolColor,
    } = props;

    const containerRef = useRef(null);
    const [meterDimension, setMeterDimension] = useState(100);

    // Group color props for easier passing
    const colorProps = {
        toolColor,
        clipColor,
        lowColor,
        safeLowColor,
        safeHighColor,
        warnColor,
        dangerColor
    };

    useEffect(() => {
        if (containerRef.current) {
            setMeterDimension(containerRef.current.clientHeight);
        }
    }, []);

    // Render stereo meter channels directly
    const renderStereoMeter = () => {
        return (
            <div className="stereo-container">
                {['left', 'right'].map((side, idx) => (
                    <React.Fragment key={side}>
                        <DecibelMeter
                            event={event[side]}
                            type={type}
                            range={range}
                            safeLevel={safeLevel}
                            highLevel={highLevel}
                            girth={(girth - 1) / 2}
                            invert={invert}
                            decay={decay}
                            {...colorProps}
                        />
                        {idx === 0 && <div className="stereo-spacer"></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="scaled-meter" ref={containerRef} style={{ width: `${girth}px` }}>
            {event ? (
                <>
                    {renderStereoMeter()}
                    <IndicatorLine
                        indicatorLine={indicatorLine}
                        indicatorType={indicatorType}
                        indicatorRange={indicatorRange}
                        meterDimension={meterDimension}
                        range={range}
                        girth={girth}
                    />
                    {scaled && <MeterScale
                        range={range}
                        subdivisions={subdivisions}
                    />}
                </>
            ) : (
                <>
                    <IndicatorLine
                        indicatorLine={indicatorLine}
                        indicatorType={indicatorType}
                        indicatorRange={indicatorRange}
                        meterDimension={meterDimension}
                        range={range}
                        girth={girth}
                    />
                    <MeterScale
                        range={range}
                        subdivisions={subdivisions}
                    />
                </>
            )}
        </div>
    );
}

export default React.memo(ScaledMeter);
