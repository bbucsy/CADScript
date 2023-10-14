grammar CadScript

entry Model: (sketch=SketchDefinition)?;

SketchDefinition:
    'define' 'Sketch' '(' (statements+=AbstractStatement)* ')';


AbstractStatement: Entity | Constraint | LengthMeasurement;

Entity: 'add' name=ID;

Constraint: 'constrain' e1=[Entity:ID];

LengthMeasurement: value=NUMBER LengthUnit;

LengthUnit returns string: MetricUnit | ImperialUnit;

MetricUnit returns string: 'mm' | 'cm' | 'dm' | 'm';
ImperialUnit returns string: 'th'  | 'in' | 'ft' | 'yd';


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
