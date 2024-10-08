# CAD Script examples

## Triangle with given sides

![Triangle](./assets/task1.png)

```mathematica
Sketch Triangle {
 
 Point A at:{0,0}
 Point B at:[10,10]
 Point C at: [0,10]

 Line AB from: A to: B length: 5cm
 Line BC from: B to: C length: 1in
 Line CA from: A to: C

 Constrain angle AB CA angle: 30 deg

 @helper
 Point H1
 
 @helper
 Line from: A to: H1 direction: horizontal

 @helper
 Line from: H1 to: B length: 20 mm direction: vertical 
}
```
