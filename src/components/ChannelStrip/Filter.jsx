import React from 'react';
import ValueCTRL from '../Generic/ValueCTRL';
import * as Util from '../../Utilities';
import ToggleBTN from '../Generic/ToggleBTN';
import Knob from '../Generic/Knob';
import './Filter.css';

function Filter({ manifest, paramValues, handleValueChange }) {
    const eqSlope = manifest.find(param => param.paramId === "eq_slope");

    const renderControl = (param) => {
        const value = Util.formatValueForButton(
            paramValues[param.paramId],
            param.paramId,
            param.min,
            param.max,
            param.log
        );
        const defaultValue = Util.formatValueForButton(
            param.defaultValue,
            param.paramId,
            param.min,
            param.max,
            param.log
        );
        const accentColor = param.hue ? `hsl(${param.hue}, 100%, 60%)` : '#ccc';
        return (
            <div key={param.paramId} className="group-param-hor">
                <div className="offset-name">{param.name}</div>
                <ValueCTRL
                    paramId={param.paramId}
                    value={value}
                    actualValue={paramValues[param.paramId]}
                    defaultValue={defaultValue}
                    onChange={(val) => handleValueChange(param, val)}
                    accentColor={accentColor}
                />
            </div>
        );
    };

    const renderKnob = (param) => {
        const value = Util.formatValueForButton(
            paramValues[param.paramId],
            param.paramId,
            param.min,
            param.max,
            param.log
        );
        const defaultValue = Util.formatValueForButton(
            param.defaultValue,
            param.paramId,
            param.min,
            param.max,
            param.log
        );
        const accentColor = param.hue ? `hsl(${param.hue}, 100%, 60%)` : '#ccc';
        return (
            <div key={param.paramId} className="group-param">
                <div className="offset-name">{param.name}</div>
                <Knob
                    paramId={param.paramId}
                    value={value}
                    actualValue={paramValues[param.paramId]}
                    defaultValue={defaultValue}
                    onChange={(val) => handleValueChange(param, val)}
                    accentColor={accentColor}
                />
                <ValueCTRL
                    paramId={param.paramId}
                    value={value}
                    actualValue={paramValues[param.paramId]}
                    defaultValue={defaultValue}
                    onChange={(val) => handleValueChange(param, val)}
                    accentColor={accentColor}
                />
            </div>
        );
    };

    return (
        <div id="filter-container">
            <div id="filter-ctrls">
                {manifest.filter(param => param.paramId.startsWith("eq") && param.paramId !== "eq_slope")
                    .map(renderKnob)}
                {eqSlope && (
                    <div key="eq_slope" className="group-param-hor">
                        <div className="offset-name">Slope</div>
                        <ToggleBTN
                            paramId="eq_slope"
                            defaultValue={Util.formatValueForButton(
                                eqSlope.defaultValue,
                                eqSlope.paramId,
                                eqSlope.min,
                                eqSlope.max,
                                eqSlope.log
                            )}
                            value={paramValues.eq_slope}
                            onChange={(val) => handleValueChange(eqSlope, val)}
                            name={paramValues.eq_slope ? "24" : "12"}
                        />
                    </div>
                )}
            </div>
            <div id="master-ctrls">
                {manifest.filter(param => param.paramId.startsWith("mix"))
                    .map(renderControl)}
            </div>
        </div>
    );
}

export default React.memo(Filter);