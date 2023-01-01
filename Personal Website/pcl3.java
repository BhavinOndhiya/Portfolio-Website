1.Ans Æ
abstract public class GeometricObject {
private String colour;
private boolean filled;
private java.util.Date dateCreated;
protected GeometricObject() {}
protected GeometricObject(String col,boolean fill) {
colour=col;
filled=fill;
}
public String getColour() {
return colour;
}
public void setColour(String colour) {
this.colour = colour;
}
public boolean isfilled()
{
return filled;
}
public void setfilled(boolean b)
{
filled=b;
}
public java.util.Date getDateCreated() {
return dateCreated;
}
abstract public double getArea();
abstract public double getPerimeter();
}
public class Circle extends GeometricObject {
private double radius;
public Circle() {}
public Circle(double radius)
{
this.radius=radius;
}
public Circle(double radius,String Col,boolean filled)
{
this.radius=radius;
setColour(Col);
setfilled(filled);
}
public double getRadius() {
return radius;
21ce067_jatin
ASSIGNMENT 3 JAVA
}
public void setRadius(double radius) {
this.radius = radius;
}
public double getDiameter() {
return radius*2;
}
public double getArea()
{
double p=3.1415;
double ans=p*radius*radius;
return ans;
}
public double getPerimeter()
{
double p=3.1415;
double ans=p*2*radius;
return ans;
}
}
public class Rectangle extends GeometricObject {
private double height;
private double width;
public Rectangle() {}
public Rectangle(double height,double width)
{
this.height=height;
this.width=width;
}
public Rectangle(double height,double width,String Col,boolean filled)
{
this.height=height;
this.width=width;
setColour(Col);
setfilled(filled);
}
public double getHeight() {
return height;
}
public void setHeight(double height) {
this.height = height;
}
public double getWidth() {
return width;
}
public void setWidth(double width) {
21ce067_jatin
ASSIGNMENT 3 JAVA
this.width = width;
}
public double getArea()
{
double ans=height*width;
return ans;
}
public double getPerimeter()
{
double ans=2*(height+width);
return ans;
}
}
public class TestGeometricObject {
public static void main(String[] args) {
Circle c1 = new Circle(2.56);
System.out.println(c1.getArea());
System.out.println(c1.getPerimeter());
System.out.println(c1.getDiameter());
Rectangle r1=new Rectangle(3.14,4.69);
System.out.println(r1.getArea());
System.out.println(r1.getPerimeter());
}
}
2.Ans Æ
interface Iprinter {
 public int x=7;
 void display1();
 default void show1()
 {
 System.out.println("This is default in interface");
 }
}
interface Iscanner {
public int y=7;
void display2();
default void show2()
{
System.out.println("This is default in interface");
}
}
21ce067_jatin
ASSIGNMENT 3 JAVA
public class Concrete implements Iprinter,Iscanner {
public void display1()
{
System.out.println("Display1");
}
public void display2()
{
System.out.println("Display2");
}
public static void main(String[] args) {
Concrete c = new Concrete();
c.show1();
c.display1();
c.show2();
c.display2();
}
}
3.Ans Æ
interface p{
final int p=67;
void display1();
}
interface p1 extends p{
final int p1=68;
void display2();
}
interface p2 extends p {
final int p2=69;
void display3();
}
interface p12 extends p1,p2{
final int p12=70;
void display4();
}
public class implimentation implements p12 {
public void display1(){
System.out.println("Interface p "+p);
}
public void display2(){
System.out.println("Interface p1 "+p1);
}
21ce067_jatin
ASSIGNMENT 3 JAVA
public void display3(){
System.out.println("Interface p2 "+p2);
}
public void display4(){
System.out.println("Interface p12 "+p12);
}
}
public class mainClass {
public static void main(String arg[]) {
implimentation i=new implimentation();
i.display1();
i.display2();
i.display3();
i.display4()