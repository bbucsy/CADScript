grammar CadScript

entry Model:
    (partials=PartialDefinition)*
    (sketch=SketchDefinition)?;

PartialDefinition:
    'define' 'Partial' name=ID '(' (parameters+=ParameterDefinition)* (statements+=AbstractStatement)* ')';

ParameterDefinition:
    LenghtParameter | AnglePArameter;

AnglePArameter:
    'angle' name=ID ',' 'defaults' 'to' value=LengthMeasurement {infer AnglePArameter};

LenghtParameter:
    'length' name=ID ',' 'defaults' 'to' value=AngleMeasurement {infer LenghtParameter};

SketchDefinition:
    'define' 'Sketch' name=ID'(' (statements+=AbstractStatement)* ')';


AbstractStatement:
    Entity | Constraint | LoopStatement;

LoopStatement:
    count=NUMBER 'times' 'do' '|' LoopVariable=ID '|' (statements+=AbstractStatement)* 'end';


// interpolated IDs. To-be used with loop statements
StringID:
    '"' (parts+=ID | parts+=InterpolatedExpression)+  '"';

InterpolatedExpression:
    '&{' exp=NUMBER '}';

Entity:
    Point | Line | Circle | Arc;

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

// Circle

Circle:
    'add' (radius=LengthMeasurement)? 'Circle' ( 'at' center=[Point:ID])? ('as' name=ID)?;

// Arc

Arc:
    'add' (radius=LengthMeasurement)? 'Arc' p1=[Point:ID] center=[Point:ID] p2=[Point:ID] ('as' name=ID)?;

// Constraints
Constraint:
    AngleConstraint | DistanceConstraint | PerpendicularConstraint | SameLengthCosntraint;

SameLengthCosntraint:
    'constrain' 'samelength' l1=[Line:ID] 'and' l2=[Line:ID];

PerpendicularConstraint:
    'constrain' 'perpendicular' l1=[Line:ID] 'and' l2=[Line:ID];

DistanceConstraint:
    'constrain' length=LengthMeasurement 'distance' 'to' p1=[Point:ID] 'and' p2=[Point:ID];

AngleConstraint:
    'constrain' angle=AngleMeasurement 'angle' 'to' l1=[Line:ID] 'and' l2=[Line:ID];


// Measurement Units
LengthMeasurement:
    value=NUMBER (unit=LengthUnit)?;

LengthUnit returns string:
    MetricUnit | ImperialUnit;

MetricUnit returns string:
    'mm' | 'cm' | 'dm' | 'm';
ImperialUnit returns string:
    'th'  | 'in' | 'ft' | 'yd';

// AngleUnits
AngleMeasurement:
    Degree | DegreeWithMinutes | Radian;

Radian:
    value=NUMBER 'rad';

Degree:
    value=NUMBER ('°')?;

DegreeWithMinutes:
    value=NUMBER '°' minutes=NUMBER "'";

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;


hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
