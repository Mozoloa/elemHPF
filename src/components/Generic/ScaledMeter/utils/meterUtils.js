/**
 * Configure canvas with proper pixel ratio
 */
export function configureCanvas(canvas, ctx) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    return devicePixelRatio;
}

/**
 * Compute meter values based on input and parameters
 */
export function computeMeterValues(raw, range, invert, decay, prevMeterValue) {
    let isOverloaded = false;
    if (raw > 1) {
        raw = 1;
        isOverloaded = true;
    }
    const logMax = Math.max(20 * Math.log10(raw || 0.000001), -range);
    let normalizedMax0 = (logMax + range) / range;
    let normalizedMax = raw > 0.000001 ? Math.max(normalizedMax0, 0.01) : normalizedMax0;
    if (invert) {
        normalizedMax = 1 - normalizedMax;
    }
    let newMeterValue = normalizedMax >= prevMeterValue ? normalizedMax : prevMeterValue * decay;
    return { newMeterValue, isOverloaded };
}

/**
 * Draw meter on canvas
 */
export function drawMeter(ctx, canvas, newMeterValue, type, devicePixelRatio) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    const height = (canvas.height / devicePixelRatio) * newMeterValue;
    if (type === 'gr') {
        ctx.fillRect(0, 0, canvas.width / devicePixelRatio, height);
    } else {
        ctx.fillRect(0, canvas.height / devicePixelRatio - height, canvas.width / devicePixelRatio, height);
    }
}

/**
 * Calculate position for decibel values
 */
export function calculatePosition(dBValue, range) {
    return (1 - Math.abs(dBValue) / range) * 100;
}
