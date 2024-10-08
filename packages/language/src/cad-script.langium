grammar CadScript

entry Model:
    (sketches+=SketchDefinition)*;



SketchDefinition:
    (partial?='partial')? 'Sketch' name=ID '{' (paramDefs+=ParameterDefinition)* (statements+=AbstractStatement)* '}';


// IDS

CadLangID: 
  InterpolatedStringID | NormalID;

InterpolatedStringID:
     '`' (parts+=(ID | InterpolatedStringPart))+ '`';

NormalID:
    id=ID;

InterpolatedStringPart:
    '{' exp=Expression '}';



// Statements

StatementDecorator:
    '@' type=(HelperDecorator );

HelperDecorator returns string:
   'helper';


AbstractStatement: 
    EntityStatement | Constraint | Loop | PartialImport;

ParameterDefinition:
    'parameter' param=Parameter 'default:' defVal=Expression;

PartialImport:
    'import' partial=[SketchDefinition:ID] name=ID  ('with'  args+=ImportArg ( args+=ImportArg)* )?;

ImportArg:
    param=[Parameter] '=' value=Expression;

Loop:
   'for' loopParam=Parameter '=' start=NUMBER 'to' end=NUMBER '{' (statements+=AbstractStatement)+ '}';

interface Entity {
    name?: CadLangID
    decorators: StatementDecorator[]
}


EntityStatement returns Entity:
   (decorators+=StatementDecorator)*  (Point | Line | Circle | Arc);
 
// Point

Point:
    'Point' (name=CadLangID)? ('at:' coordinates=Coordinates)? ;

Coordinates:
    ExactCoordinate | SuggestedCoordinate;

SuggestedCoordinate:
    '[' x=LengthMeasurement ',' y=LengthMeasurement ']';

ExactCoordinate:
    '{' x=LengthMeasurement  ',' y=LengthMeasurement '}';

PointRef:
    (regularRef=[Point: ReferencedName]) | ( dynamicRef=InterpolatedStringID ) | (coordinates=Coordinates);


// Line

Line:
    'Line' (name=CadLangID)? ('from:' from=PointRef)  ('to:' to=PointRef)  ('length:' length=LengthMeasurement)? ('direction:' direction=BaseLineConstraint)?;

LineRef:
    (regularRef=[Line:ReferencedName]) | (dynamicRef=InterpolatedStringID);

BaseLineConstraint returns string:
    'horizontal' | 'vertical';

// Circle

Circle:
    'Circle' (name=CadLangID)? ('center:' center=PointRef)? (dimension=LinearDimension)?  ;

CircleRef:
     (regularRef=[Circle:ReferencedName]) | (dynamicRef=InterpolatedStringID);

LinearDimension:
    Radius | Diameter;

Diameter:
    'diameter:' d=LengthMeasurement;

Radius:
    'radius:' r=LengthMeasurement;

// Arc

Arc:
    'Arc' (name=CadLangID)? ('start:' start=PointRef)? ('end:' end=PointRef)? ('center:' center=PointRef)? (dimension=LinearDimension)?;


ArcRef:
     (regularRef=[Arc:ReferencedName]) | (dynamicRef=InterpolatedStringID);

// Measurement Units
LengthMeasurement:
    value=Expression (unit=LengthUnit)?;

LengthUnit returns string:
    MetricUnit | ImperialUnit;

MetricUnit returns string:
    'mm' | 'cm' | 'dm' | 'm';
ImperialUnit returns string:
    'th'  | 'in' | 'ft' | 'yd';

// AngleUnits
AngleMeasurement:
    value=Expression (unit=AngleUnit);

AngleUnit returns string: 'rad' | 'deg';


// Constraints

Constraint:
  'Constrain' (AngleConstraint | DistanceConstraint | LineDistanceConstraint | PerpendicularConstraint | ParallelConstraint | SameLengthCosntraint | PointOnConstraint | CoincidentConstraint | TangentConstraint);

SameLengthCosntraint:
    'samelength'  l1=LineRef  l2=LineRef;

PerpendicularConstraint:
   'perpendicular'  l1=LineRef   l2=LineRef;

ParallelConstraint:
    'parallel'  l1=LineRef   l2=LineRef;

AngleConstraint:
    'angle'  l1=LineRef  l2=LineRef 'angle:' angle=AngleMeasurement;

DistanceConstraint:
    'point2point'   p1=PointRef p2=PointRef 'distance:' distance=LengthMeasurement;


CoincidentConstraint:
    'coincident' p1=PointRef p2=PointRef;

LineDistanceConstraint:
    'point2line' 'point:' p=PointRef 'line:' l=LineRef  'distance:' distance=LengthMeasurement;

TangentConstraint:
    'tangent' 'line:' l=LineRef 'arc:' a=ArcRef;

PointOnConstraint:
   'point' 'on' ptConstrain = (PointOnLine  | PointOnCircle | PointOnArc);

PointOnCircle:
   'circle' 'point:' p=PointRef 'circle:' c=CircleRef;

PointOnArc:
   'arc' 'point:' p=PointRef 'arc:' a=ArcRef;

PointOnLine:
    'line' 'point:' p=PointRef 'line:' l=LineRef (bisect='[bisector]')?;





// Expressions

Parameter:
    name=ID;

Expression:
    Add;

Add infers Expression:
    Mult ({infer BinExpr.e1=current} op=('+'|'-') e2=Mult)*;

Mult infers Expression:
    PrimaryExpression ({infer BinExpr.e1=current} op=('*'|'/') e2=PrimaryExpression)*;

PrimaryExpression:
    Lit | Ref  | Group | NegExpr | FuncExpr;

// literal int
Lit:
    val=NUMBER;
// cross-reference to a parameter
Ref:
    val=[Parameter:ID];
// grouped expression with parentheses
Group:
    '(' ge=Expression ')';
// negated expression
NegExpr:
    '-' ne=Expression;
// function call
FuncExpr:
    {infer FuncExpr} func=FunctionName ('(' args+=Expression (',' args+=Expression)* ')')?;

FunctionName returns string:
  'sin' | 'cos' | 'tan' | 'pow' | 'PI' | "mod";


// Terminals
ReferencedName returns string:
        ID ('->' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;


hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;


