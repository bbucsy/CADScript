# The CAD Script language

CAD Script is a declarative language used to create 2D drafts with precision, without the need to describe the exact process of drawing. It uses basic entities and constraints to describe the desired geometry.

## Sketches

he main unit of work in CAD Script is a *Sketch*. It contains parameters, entities, and constraints. You can define a sketch like this:

```
Sketch Main {
 //
}
```

The language allows you to organize your code into reusable units. A reusable sketch can be defined with the  `partial` keyword. These sketches can have parameters that can be used in expressions. A partial sketch can be instantiated with the `import <sketch> <instance name> with <Parameter>=<value>` command.

A sketch can have parameters, which are numerical values that can be used in mathematical expressions. Every parameter must define a default value, which will be used if no value is provided in the import statement.

The entities of the imported sketch can be referenced in the parent sketch via the instance name like this: `<instance name>-><entity name>`

Example:

```mathematica
Sketch Main {
 // Regular triangle with side length 10
 import RegularTriangle RT1

 // Regular triangle with side length 10
 import RegularTriangle RT2 with SIDE_LENGTH = 20 
}

partial Sketch RegularTriangle{
 parameter SIDE_LENGTH default: 10

 // code for describing a regular triangle
}
```

**Rules for Sketches:** A valid document must have exactly one main sketch (a sketch that is not partial), and only partial sketches can be imported.

## Entities

There are four basic entities that can be described in CAD Script.

### Point

The most basic entity. It represents a point in space without an area. A point can be defined like this:  `Point <name>`

The name is optional, but without a name, it cannot be referenced by other entities.

You can define a position for the point in two ways with the `at:` keyword:

- **Exact coordinate**: `Point P at: {0,0}`  This locks the point's position, and the solver won't move it during the solving phase.

- **Suggested coordinate:** `Point P at:[0,0]` This suggests a position, but the point may be moved by constraints applied to connceted entities.

Coordinates can be expressions and can be suffixed with a measurement unit. If no unit is specified, it is implicitly interpreted as millimeters.

`Point P at: {2 * 10 cm, 3 *10}` is the same as `Point P at: {200mm, 30 mm}`

When a point is referenced, you can use a coordinate instead. This will create an anonymous point that can only be referenced by the entity it was created for.

```mathematica
Circle center: {0,0}
```

is the same as

```mathematica
Point CircleCenter at: {0,0}
Circle center: CircleCenter
```

### Line

A straight line that connects two points. Both the length and direction of the line can optionally be set without extra constraints.

```mathematica
Line <Name> from: <PointRef> to: <PointRef> length:<l> direction:<d>
```

Length, direction, and name are optional. Length must be a numerical expression and can be suffixed with a measurement unit. Direction must be either **horizontal** or **vertical**.

**NOTE**: The order of the attributes (from:, to:, length:, direction:) matters. They must be provided in this order.

### Circle

A circle entity describes a set of points equidistant from the center.

```mathematica
Circle <name> center: <PointRef> diameter: <Length> radius: <Length>
```

- Name, center, diameter, and radius are optional.
- If no center is provided, an anonymous point is implicitly created and cannot be referenced.
- **Only one** of either diameter or radius can be set for a single circle.

**NOTE**: Like with Lines the order of the attributes are fixed.

### Arc

Defines a partial circle with three points.

```mathematica
Arc <name> start: <PointRef> end:<PointRef> center: <PointRef>  diameter: <Length> radius: <Length>
```

- Similarly to a circle, if you don't give a point reference, a new one will be created implicitly.
- The same rules apply to diameter and radius as in circles.

**NOTE**: Like with Lines the order of the attributes are fixed.

## Constraints

To describe our geometries, we can define constraints on entities. All constraints start with the `Constrain` keyword.

### Same Length

 ```mathematica
 Constrain samelength <LineRef> <LineRef>
 ```

- Makes the two referenced lines equal in length.

### Perpendicular

 ```mathematica
 Constrain perpendicular <LineRef> <LineRef>
 ```

- Makes the two referenced lines perpendicular to each other.

### Parallel

 ```mathematica
 Constrain parallel <LineRef> <LineRef>
 ```

- Makes the two referenced lines parallel.

### Angle

 ```mathematica
 Constrain angle <LineRef> <LineRef> angle: <Angle>
 ```

- Constrains the angle between two lines.
- The angle can be given in radians or degrees.

### Distance

 ```mathematica
Constrain point2point <PointRef> <PointRef> distance: <Length>
```

- Constrains the distance between two points.

### Point to Line Distance

 ```mathematica
Constrain point2line point: <PointRef> line:<LineRef> distance: <Length>
```

- Controls the shortest distance between a point and a line.

### Coincident

 ```mathematica
  Constrain coincident <PointRef> <PointRef>
  ```

- Forces the two points to occupy the same position, as if they were the same point.

### TangentConstraint

 ```mathematica
 Constrain tangent line:<LineRef> arc: <ArcRef>
 ```

- Makes the end of the line tangential to the arc.

### Point on Line

 ```mathematica
 Constrain point on line point: <PointRef> line:<LineRef> [bisector]
 ```

- Constrains the point so that it lies on the line.
- The optional `[bisector]` flag forces the point to be at the midpoint of the line.

### Point on Circle

 ```mathematica
 Constrain point on cirlce point: <PointRef> circle:<CircleRef>
 ```

- Constrains the point so that it lies on the circle.

### Point on Arc

 ```mathematica
 Constrain point on arc point: <PointRef> arc:<ArcRef>
 ```

- Constrains the point so that it lies on the arc.

## Other language features

There are other features of the language making describing geometries easier

### Expressions

Basic mathematical expressions are evaluated. You can use basic operators: `+ - * / ()` and some mathematical functions:  `PI sin(x) cos(x) tan(x) pow(x,y) mod(x,y)` where `pow(x,y) = x^y` and `mod(x,y) = x % y`

### Automatic unit conversion

As mentioned before all units implicitly interpreted as milimeters or degrees, depending on if they are used as length or angle measurment.

If a unit is suffixed after the expression, the result will be converted to mm after processing.
ie `2cm` will be converted to `20mm`

the available length units are:

- mm millimeter
- cm
- dm
- m
- th ( one-thousandth of an inch. )
- in ( inch )
- ft ( feet )
- yd ( yard )

For angles `rad` suffix denotes radians

### For looop

CAD Script has a syntactic sugar for defining many similar entities.

```mathematica
for <variable> = START to N {
    // entity statement
}
```

START and N must be integers, and cannot be expressions, mening they are baked in. The variable name can be any valid ID and the value will be iterated through START to N inclusive.

Unlike programming languages the for loop in CAD Script has no inside scope. Every entity defined inside the loop will be accessible inside the containing Sketch. Because of this, the name of the entity must depend on the iteration variable, otherwie name duplication will occur.

This can be done with a string interpolated id. See example below

An example with 5 Points:

```mathematica
for i = 1 to 5 {
    Point `Point{i}` at: {0, (i * 10) cm}
}
```

is the same as writing

```mathematica
Point Point1 at: {0, 10 cm}
Point Point2 at: {0, 20 cm}
Point Point3 at: {0, 30 cm}
Point Point4 at: {0, 40 cm}
Point Point5 at: {0, 50 cm}
```

Note: You cannot use sketch parameters in an interpolated id

### Dynamic references

Because sometimes in a loop we want to reference a different point based on an iteration variable there is a feature called dynamic reference.

Similarly how you define an interpolated ID, you can reference an entitiy.
Be aware with this method the references are validated, but autocompletion won't work.

In the example you create 3 circles with different center points

```mathematica
for i = 0 to 5{
    Point `P_{i}`
    Circle center: `P_{i}`
}

```

This can be used outside a loop, but the main purpose is to be able to reference based on a variable.

You can dynamically reference entities outside of loops

```mathematica
    Point P2
    Point P3
    Point P4

    for t = 2 to 4{
        Circle center: `P{t}`
    }

```

### Helper Decorator

Some entities are only needed for reference by others, but displaying them in the final draft is not necessary. For these cases, a decorator can be applied to indicate that they should not be included in the final draft.

Example:

```mathematica
@helper
Point C at: {0,0}

Circle cetner: C
```

In this example, the circle's center point will be constrained to the origin, but only the circle itself will be drawn.
