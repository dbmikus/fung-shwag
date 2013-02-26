// Various geometry related functions and tools

var G = (function () {

var G = {};

G.point = function (x, y) {
    var point = {"x": x, "y": y};
    point.toString = function () {
        return ("(" + this.x + ", " + this.y + ")");
    }

    return point;
}


// Checks if a point is between two other points, not counting the endpoints
// of p2 and p3. That is, if p1 is on p2 or p3, we are fine
G.pbetween = function (p1, p2, p3) {
    console.log('between: ' + p1.toString() + ' ' + p2.toString() + ' ' + p3.toString());

    var xbetween = (p1.x >= p2.x && p1.x <= p3.x)
        || (p1.x <= p2.x && p1.x >= p3.x);
    console.log("xbetween " + xbetween);

    var ybetween = (p1.y >= p2.y && p1.y <= p3.y)
        || (p1.y <= p2.y && p1.y >= p3.y);
    console.log("ybetween " + ybetween);

    return (xbetween && ybetween);
}


// p1 and p2 constitutes a line vector directed from p1 to p2
// p3 and p4 constitutes a line vector directed from p3 to p4
// We want to see whether the line p1<-->p2 intersects line p3<-->p4
G.lineIntersection = function(p1, p2, p3, p4) {
    console.log("\n\ndoing intersection");
    console.log("checking if " + p1.toString() + "<-->" + p2.toString()
                + "intersects " + p3.toString() + "<-->" + p4.toString());

    // Solve equations y1 = a1*x1 + b1
    //                 y2 = a2*x2 + b2

    // p3<-->p4 must be a vertical line
    // p1<-->p2 is a cartesian function
    function oneVertical(p1, p2, p3, p4) {
        var a1 = (p2.y - p1.y) / (p2.x - p1.x);
        // Solving for y-axis intersection
        var b1 = p1.y - a1*p1.x;
        var yInter = a1*p3.x + b1;
        var interPoint = G.point(p3.x, yInter);

        if (G.pbetween(interPoint, p3, p4)) {
            return interPoint;
        } else {
            return undefined;
        }
    }

    // One or both of the lines are vertical
    if (p2.x - p1.x === 0 || p4.x - p3.x === 0) {
        console.log("at least one line vertical");
        if (p2.x - p1.x !== 0) {
            console.log("one vertical");
            return oneVertical(p1, p2, p3, p4);
        }
        if (p4.x - p3.x != 0) {
            console.log("one vertical");
            return oneVertical(p3, p4, p1, p2);
        }
        // Both lines are vertical lines
        if (p2.x - p1.x === 0 && p4.x - p3.x === 0) {
            console.log("both vertical");
            if (p1.x === p3.x) {
                // If either p1 or p2 lies between p3 and p4, it is not allowed
                if (G.pbetween(p1, p3, p4)) {
                    return p1;
                }
                if (G.pbetween(p2, p3, p4)) {
                    return p2;
                }
                return undefined;
            }
            // lines are parallel but have different x coordinates, so they
            // can never intersect
            else {
                return undefined;
            }
        }
    }
    // The lines are non-vertical, so they are cartesian functions
    else {
        console.log("the lines are not vertical");
        // Solving for slope
        var a1 = (p2.y - p1.y) / (p2.x - p1.x);
        var a2 = (p4.y - p3.y) / (p4.x - p3.x);

        // Solving for y-axis intersection
        var b1 = p1.y - a1*p1.x;
        var b2 = p3.y - a2*p3.x;

        // if slopes are equal, then just check if y offsets are equal
        if (a1 === a2) {
            console.log("slopes equal");
            if (b1 === b2) {
                console.log("b values equal");
                // If either p1 or p2 lies between p3 and p4, it is not allowed
                if (G.pbetween(p1, p3, p4)) {
                    return p1;
                }
                if (G.pbetween(p2, p3, p4)) {
                    return p2;
                }
                return undefined;
            }
            // Lines are parallel but do not have same y offset, so they can never
            // intersect
            else {
                return undefined;
            }
        }
        // If slopes aren't equal, we set y1 = y2 and solve for x
        // this is: x = (b2 - b1) / (a1 - a2)
        else {
            console.log("eq1: y = x * (" + a1 + ") + (" + b1 + ")");
            console.log("eq2: y = x * (" + a2 + ") + (" + b2 + ")");

            console.log("slopes aren't equal");
            var xInter = (b2 - b1) / (a1 - a2);
            var yInter = a1*xInter + b1;
            var pInter = G.point(xInter, yInter);
            console.log("pInter = " + pInter.toString());

            // This found point must be within both line segments
            console.log("testing between");
            console.log(p1.toString() + "<-->" + p2.toString() + " = " + G.pbetween(pInter, p1, p2));
            console.log(p3.toString() + "<-->" + p4.toString() + " = " + G.pbetween(pInter, p3, p4));

            if (G.pbetween(pInter, p1, p2)
                && G.pbetween(pInter, p3, p4)) {
                console.log("lines intersect");
                return pInter;
            }
            // The point lies along the lines, but not along the line segments
            else {
                console.log("don't intersect");
                return undefined;
            }
        }
    }
}

return G;

})();
