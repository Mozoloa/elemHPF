import React from 'react';
import "./ToggleBTN.css";

function ToggleBTN({ name, value, onChange, hue }) {
    let sat = "100%";
    let lum = "60%";
    switch (name) {
        case 'L':
            hue = 100;
            break;
        case 'B':
            hue = 0;
            sat = "0%";
            lum = "100%";
            break;
        case 'M':
            hue = 0;
            break;
        case 'S':
            hue = 35;
            break;
        case '24':
            hue = 20;
            break;
        case '48':
            hue = 30;
            lum = "50%";
            break;
        default:
            hue = 100;
            lum = "100%";
            break;
    }
    const toggleBGColor = `hsl(${hue},${sat},${lum})`;
    const unToggleBGColor = `hsl(${hue},${sat}, 20%)`;
    const toggleColor = `hsl(${hue},${sat}, 10%)`;
    const unToggleColor = `hsl(${hue},${sat}, 70%)`;
    const handleClick = () => {
        onChange(value > 0.5 ? 0 : 1);
    };

    const toggleKnobStyle = {
        backgroundColor: value ? toggleBGColor : unToggleBGColor,
        boxShadow: value ? `0 0 7px 1px ${toggleBGColor}` : 'none',
        color: value ? toggleColor : unToggleColor,
    };

    return (
        <div
            className={`toggle-knob`}
            style={toggleKnobStyle}
            onClick={handleClick}
        >
            <div className='toggle-name'>{name}</div>
        </div>
    );
}

export default React.memo(ToggleBTN);