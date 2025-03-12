import { useEffect, useRef } from 'react';
import { getEventMap } from '../../../../Utilities';
import { configureCanvas, computeMeterValues, drawMeter } from '../utils/meterUtils';

export function useMeterCanvas(canvasRef, event, type, range, invert, decay = 0.9, onOverloadChange) {
    const prevValueRef = useRef(0);
    const lastDrawTimeRef = useRef(0);
    const frameRateLimit = 1000 / 60; // 60fps limit

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const devicePixelRatio = configureCanvas(canvas, ctx);
        let animationFrameId;

        function draw(timestamp) {
            if (timestamp - lastDrawTimeRef.current < frameRateLimit) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }
            lastDrawTimeRef.current = timestamp;
            const eventValue = getEventMap(event);

            if (eventValue !== undefined && eventValue !== null) {
                const { newMeterValue, isOverloaded } =
                    computeMeterValues(eventValue, range, invert, decay, prevValueRef.current);

                prevValueRef.current = newMeterValue;
                drawMeter(ctx, canvas, newMeterValue, type, devicePixelRatio);
                // update overload state if callback provided
                if (typeof onOverloadChange === 'function') {
                    onOverloadChange(isOverloaded);
                }
                return isOverloaded;
            } else if (prevValueRef.current !== 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                prevValueRef.current = 0;
                if (typeof onOverloadChange === 'function') {
                    onOverloadChange(false);
                }
                return false;
            }

            return false;
        }

        let isOverloaded = false;
        const runAnimation = (timestamp) => {
            isOverloaded = draw(timestamp);
            animationFrameId = requestAnimationFrame(runAnimation);
        };

        runAnimation(0);
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, event, range, invert, type, decay, onOverloadChange]);

    return prevValueRef;
}

export default useMeterCanvas;
