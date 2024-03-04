grammar CadScript

entry Model:
    (sketches+=SketchDefinition)*;

SketchDefinition:
    'define' (partial?='partial')? 'Sketch' name=ID '(' (parameters+=ParameterDefinition)* (statements+=AbstractStatement)* ')';

// interpolated ids

InterpolatedId:
    parts+=(ID | ExpressionSubstitute)+;

ExpressionSubstitute:
    '&' '(' exp=Expression ')';

// Parameters

ParameterDefinition:
    LenghtParameter | AnglePArameter;

AnglePArameter:
    'angle' name=ID ',' 'defaults' 'to' value=AngleMeasurement;

LenghtParameter:
    'length' name=ID ',' 'defaults' 'to' value=LengthMeasurement;


// Statements

AbstractStatement:
    Entity | Constraint | LoopStatement | PartialStatement;

LoopStatement:
    count=NUMBER 'times' 'do' '|' loopParam=Param '|' (statements+=AbstractStatement)* 'end';


Entity:
    Point | Line | Circle | Arc;

PartialStatement:
    'import' partial=[SketchDefinition:ID] 'as' name=ID;

// Point entity
Point:
    'add' 'Point' ('as'name=InterpolatedId)? (place=PointPlace)?;

PointPlace:
    placeType=PointPlaceTerminal 'X' '=' xBase=LengthMeasurement 'Y' '=' yBase=LengthMeasurement;

PointPlaceTerminal returns string:
    'at' | 'around';

// Line entity

Line:
    'add' (length=LengthMeasurement)? (baseLineConstraint=BaseLineConstraint)? 'Line' 'from' p1=[Point:ReferencedName] 'to' p2=[Point:ReferencedName] ('as' name=InterpolatedId)?;

BaseLineConstraint returns string:
    'horizontal' | 'vertical';

// Circle

Circle:
    'add' (radius=LengthMeasurement)? 'Circle' ( 'at' center=[Point:ReferencedName])? ('as' name=InterpolatedId)?;

// Arc

Arc:
    'add' (radius=LengthMeasurement)? 'Arc' p1=[Point:ReferencedName] center=[Point:ReferencedName] p2=[Point:ReferencedName] ('as' name=InterpolatedId)?;

// Constraints
Constraint:
    AngleConstraint | DistanceConstraint | PerpendicularConstraint | SameLengthCosntraint |LineDirectionConstraint |RadiusCosntraint;

RadiusCosntraint:
    'constrain' radius=LengthMeasurement 'radius' 'to' (entity=[Entity:ReferencedName]);

LineDirectionConstraint:
    'constrain' baseLineConstraint=BaseLineConstraint l1=[Line:ReferencedName];

SameLengthCosntraint:
    'constrain' 'samelength' l1=[Line:ReferencedName] 'and' l2=[Line:ReferencedName];

PerpendicularConstraint:
    'constrain' 'perpendicular' l1=[Line:ReferencedName] 'and' l2=[Line:ReferencedName];

DistanceConstraint:
    'constrain' length=LengthMeasurement 'distance' 'to' p1=[Point:ReferencedName] 'and' p2=[Point:ReferencedName];

AngleConstraint:
    'constrain' angle=AngleMeasurement 'angle' 'to' l1=[Line:ReferencedName] 'and' l2=[Line:ReferencedName];



// Measurement Units
LengthMeasurement:
    value=Expression unit=LengthUnit;

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
    value=Expression 'rad';

Degree:
    value=Expression ('°' | 'deg');

DegreeWithMinutes:
    value=Expression '°' minutes=Expression "'";


// Expressions

Param:
    name=ID;

Expression:
    Add;

Add infers Expr:
    Mult ({infer BinExpr.e1=current} op=('+'|'-') e2=Mult)*;

Mult infers Expr:
    PrimExpr ({infer BinExpr.e1=current} op=('*'|'/') e2=PrimExpr)*;

PrimExpr:
    Lit | Ref | Group | NegExpr;

// literal int
Lit:
    val=NUMBER;
// cross-reference to a parameter
Ref:
    val=[Param:ID];
// grouped expression with parentheses
Group:
    '(' ge=Expression ')';
// negated expression
NegExpr:
    '-' ne=Expression;


ReferencedName returns string:
    ID ('->' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;


hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
