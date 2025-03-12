const eventMap = {};

function updateEventMap(eventBatch) {
    const batch = JSON.parse(eventBatch);
    if (batch.length > 0) {
        batch.forEach(event => {
            eventMap[event.event.source] = event;
        });
    }
}

const getEventMap = (event) => {
    try {
        if (event) {
            return eventMap[event].event.max;
        }
        return eventMap;
    } catch (error) {
        console.log('Error: ', error, 'event:', event);
        return null;
    }
}

const formatValueForButton = (value, name, min, max, log) => {
    let newValue = value;
    if (log) {
        newValue = Math.log(value / min) / Math.log(max / min);
    } else {
        newValue = (value - min) / (max - min);
    }
    /* console.log(`formatted ${name}: ${value} into ${newValue}`); */
    return newValue;
}

const formatValueFromButton = (value, paramId, min, max, log) => {
    let newValue = log ? min * Math.pow(max / min, value) : value * (max - min) + min;

    if (paramId.includes('order') || paramId.includes('Freq')) {
        newValue = parseInt(newValue);
    }

    if (paramId.includes('ratio') || paramId.includes('env') || paramId.includes('atk') || paramId.includes('rel')) {
        newValue = Math.round(newValue * 10) / 10;
        if (newValue > 3) {
            newValue = Math.round(newValue);
        }
    }

    return newValue;
}

const formatValueForDisplay = (value, paramId) => {
    value = Math.round(value * 100) / 100;
    // Check if it's a frequency parameter and above 1KHz
    if (paramId.includes('freq') || paramId.includes('xover')) {

        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return `${Math.round(value)}`;
    }
    if (paramId.includes('order')) {
        if (value > 0) {
            return parseInt(value) * 24;
        }
        return "OFF"
    }
    if (paramId.includes('env') || paramId.includes('atk') || paramId.includes('rel')) {
        return `${Math.round(value * 10) / 10}ms`
    }
    if (paramId.includes('drywet')) {
        return `${Math.round(value * 100)}%`
    }
    if (paramId.includes('ratio')) {
        return `${Math.round(value * 10) / 10}:1`
    }
    if (paramId.includes('Gain') || paramId.includes('gain') || paramId.includes('knee') || paramId.includes('threshold')) {
        return `${Math.round(value * 10) / 10}dB`
    }
    if (paramId.includes('multiplier')) {
        return `x ${Math.round(value * 10) / 10}`
    }

    // For other cases, round to one decimal place
    return Math.round(value * 10) / 10;
};

export { updateEventMap, getEventMap, formatValueForButton, formatValueFromButton, formatValueForDisplay };