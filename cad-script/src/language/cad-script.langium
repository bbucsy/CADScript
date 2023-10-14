grammar CadScript

entry Model:
    (sketch=SketchDefinition)?;

SketchDefinition:
    'define' 'Sketch' '(' (statements+=AbstractStatement)* ')';


AbstractStatement:
    Entity | Constraint;

Entity:
    Point | Line;

// Point entity
Point:
    'add' 'Point' ('as'name=ID)? (place=PointPlace)?;

PointPlace:
    placeType=PointPlaceTerminal ('X' '=' xBase=LengthMeasurement)? ('Y' '=' yBase=LengthMeasurement)?;

PointPlaceTerminal returns string:
    'at' | 'around';

// Line entity

Line:
    'add' (length=LengthMeasurement)? (baseLineConstraint=BaseLineConstraint)? 'Line' 'from' p1=[Point:ID] 'to' p2=[Point:ID] ('as' name=ID)?;

BaseLineConstraint returns string:
    'horizontal' | 'vertical';

// Constraint Entity
Constraint:
    'constrain' e1=[Entity:ID];


// MEasurement Units
LengthMeasurement:
    value=NUMBER (unit=LengthUnit)?;

LengthUnit returns string:
    MetricUnit | ImperialUnit;

MetricUnit returns string:
    'mm' | 'cm' | 'dm' | 'm';
ImperialUnit returns string:
    'th'  | 'in' | 'ft' | 'yd';


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
