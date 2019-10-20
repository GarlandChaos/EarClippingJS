/* Triangle class */
function Triangle(x, y){
	this.vertices = [];
	this.id = -1;
}

Triangle.prototype = {
	constructor: Triangle
}
/* */

/* Data */
var canvas = document.getElementById("fixedPtsCanvas");
var ctx = canvas.getContext("2d");
var r = 0;
var g = 0;
var b = 0;
var a = 255;
var pxWidth = 1;
var pxHeight = 1;
var canvasWidth = 500;
var canvasHeight = 500;
var pixel = ctx.createImageData(pxWidth, pxHeight);
var dt = pixel.data;
var pixelOffset = 17;
var earBtn = document.getElementById("earBtn");
var points = new Array();
/* */

function clearCanvas(c){
    c.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawPoint(x, y, color, c){
	
	c.beginPath();
	c.arc(x, y, 10, 0, 2 * Math.PI, false);
	c.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]/255+")";
	c.fill();
}

function drawEdge(xStart, yStart, xEnd, yEnd, style, lineWeight = 1){
	ctx.beginPath();
	
	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	
	ctx.lineWidth = lineWeight;
	ctx.strokeStyle = style;
	ctx.stroke();
}

function drawPoints(P){
	var color = [0, 0, 255];
	var style = "#00FF00";
	var start, end;
	
	for(var i = 0; i < P.length; i++){
		drawPoint(P[i].x, P[i].y, color, ctx);
	
		if(i != P.length - 1){
			start = i;
			end = i + 1;
		}
		else {
			start = i;
			end = 0;				
		}
		
		drawEdge(P[start].x, P[start].y, P[end].x, P[end].y, style);
	}
}

function drawTriangles(triangles){
	var style = "#FF0000";
	for(var i = 0; i < triangles.length; i++)
	{
		drawEdge(triangles[i].vertices[0].x, triangles[i].vertices[0].y, triangles[i].vertices[1].x, triangles[i].vertices[1].y, style);
		drawEdge(triangles[i].vertices[1].x, triangles[i].vertices[1].y, triangles[i].vertices[2].x, triangles[i].vertices[2].y, style);
		drawEdge(triangles[i].vertices[2].x, triangles[i].vertices[2].y, triangles[i].vertices[0].x, triangles[i].vertices[0].y, style);
	}
}

function clip(P, triangles, convex, concave, lines) 
{
	for(var i = 0; i < P.length; i++)
	{
		var prev = i - 1;
		var next = i + 1;
		if(i == 0)
		{
			prev = P.length - 1;
		}
		else if(i == P.length - 1)
		{
			next = 0;
		}

		var v = ccw(P[prev], P[i], P[next]);
		if(v < 0) //convex
		{
			//check if it's a ear
			var convexLine = { 
				p0: 
				{ 
					x: P[next].x, 
					y: P[next].y, 
					id: P[next].id 
				}, 
				p1: 
				{ 
					x: P[prev].x, 
					y: P[prev].y, 
					id: P[prev].id 
				} 
			};
			
			var intersections = new Array();
			for(var n = 0; n < lines.length; n++)
			{
				if(lines[n].p0.id != convexLine.p0.id && 
					lines[n].p1.id != convexLine.p1.id &&
					lines[n].p0.id != convexLine.p1.id &&
					lines[n].p1.id != convexLine.p0.id)
				{				
						
					var detectIntersections = isect.bush([{
						from: {x:  convexLine.p0.x, y:  convexLine.p0.y},
						to:   {x: convexLine.p1.x, y: convexLine.p1.y}
						}, {
						from: {x:  lines[n].p0.x, y: lines[n].p0.y},
						to:   {x: lines[n].p1.x, y:  lines[n].p1.y}
					}]);
					
					var inter = detectIntersections.run();
		
					if(Object.entries(inter).length != 0)
					{
						intersections.push(inter);
					}
				}
			}
			
			if(intersections.length == 0) //it's an ear!
			{
				var tri = new Triangle();
				tri.vertices.push(P[prev]);
				tri.vertices.push(P[i]);
				tri.vertices.push(P[next]);
				triangles.push(tri);
				P.splice(i, 1);
				i--;				
			}
		}
	}

	if(P.length > 3)
	{
		clip(P, triangles, convex, concave, lines);
	}
}

function earClipping(P){
	var triangles = new Array();
	var convex = new Array();
	var concave = new Array();
	var copyOfP = P.slice();


	var lines = new Array();
	for(var z = 0; z < P.length; z++)
	{
		var next = z + 1;
		if(z == P.length - 1)
		{
			next = 0;
		}

		lines.push(
			{ 
				p0: 
				{ 
					x: P[z].x, 
					y: P[z].y, 
					id: P[z].id 
				}, 
				p1: 
				{ 
					x: P[next].x, 
					y: P[next].y, 
					id: P[next].id 
				} 
			}
		);
	}

	clip(copyOfP, triangles, convex, concave, lines);
	console.log("TRIANGLES: ");
	console.log(triangles);
	return triangles;
}

function presetPoints(){
	points.push({ x: 2.0, y: 17.0, id: 0});
	points.push({ x: 10.0, y: 23.0, id: 1 });
	points.push({ x: 19.5, y: 16.5, id: 2 });
	points.push({ x: 26.0, y: 20.0, id: 3 });
	points.push({ x: 28.0,  y: 8.0, id: 4 });
	points.push({ x: 20.0, y: 12.5, id: 5 });
	points.push({ x: 18.0,  y: 5.0, id: 6 });
	points.push({ x: 13.0, y: 17.0, id: 7 });
	points.push({ x: 7.0, y: 15.0, id: 8 });
	points.push({ x: 6.0,  y: 6.0, id: 9 });

	for(var i = 0; i < points.length; i++)
	{
		points[i].x *= 16;
		points[i].y *= 16;
	}
	drawPoints(points);
}

function ccw(p1, p2, p3) {
	// ccw < 0: counter-clockwise; ccw > 0: clockwise; ccw = 0: collinear
   return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

window.addEventListener("load", presetPoints());

earBtn.addEventListener("click", function(){ 
	var tris = earClipping(points);
	drawTriangles(tris);
});