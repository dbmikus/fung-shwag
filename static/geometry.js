// Various geometry related functions and tools

var G = (function () {

var G = {};

G.point = function (x, y) {
    var point = {"x": x, "y": y};

    point.toString = function () {
        return ("(" + this.x + ", " + this.y + ")");
    }

    point.equals = function (other) {
        return (this.x === other.x && this.y === other.y);
    }

    return point;
}


// Checks if a point is between two other points, not counting the endpoints
// of p2 and p3. That is, if p1 is on p2 or p3, we are fine
G.pbetween = function (p1, p2, p3) {
    if (p1.equals(p2) || p1.equals(p3)) {
        return false;
    }

    var xbetween = (p1.x >= p2.x && p1.x <= p3.x)
        || (p1.x <= p2.x && p1.x >= p3.x);

    var ybetween = (p1.y >= p2.y && p1.y <= p3.y)
        || (p1.y <= p2.y && p1.y >= p3.y);

    return (xbetween && ybetween);
}


// p1 and p2 constitutes a line vector directed from p1 to p2
// p3 and p4 constitutes a line vector directed from p3 to p4
// We want to see whether the line p1<-->p2 intersects line p3<-->p4
G.lineIntersection = function(p1, p2, p3, p4) {
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
            return null;
        }
    }

    // One or both of the lines are vertical
    if (p2.x - p1.x === 0 || p4.x - p3.x === 0) {
        if (p2.x - p1.x !== 0) {
            return oneVertical(p1, p2, p3, p4);
        }
        if (p4.x - p3.x != 0) {
            return oneVertical(p3, p4, p1, p2);
        }
        // Both lines are vertical lines
        if (p2.x - p1.x === 0 && p4.x - p3.x === 0) {
            if (p1.x === p3.x) {
                // If either p1 or p2 lies between p3 and p4, it is not allowed
                if (G.pbetween(p1, p3, p4)) {
                    return p1;
                }
                if (G.pbetween(p2, p3, p4)) {
                    return p2;
                }
                return null;
            }
            // lines are parallel but have different x coordinates, so they
            // can never intersect
            else {
                return null;
            }
        }
    }
    // The lines are non-vertical, so they are cartesian functions
    else {
        // Solving for slope
        var a1 = (p2.y - p1.y) / (p2.x - p1.x);
        var a2 = (p4.y - p3.y) / (p4.x - p3.x);

        // Solving for y-axis intersection
        var b1 = p1.y - a1*p1.x;
        var b2 = p3.y - a2*p3.x;

        // if slopes are equal, then just check if y offsets are equal
        if (a1 === a2) {
            if (b1 === b2) {
                // If either p1 or p2 lies between p3 and p4, it is not allowed
                if (G.pbetween(p1, p3, p4)) {
                    return p1;
                }
                if (G.pbetween(p2, p3, p4)) {
                    return p2;
                }
                return null;
            }
            // Lines are parallel but do not have same y offset, so they can never
            // intersect
            else {
                return null;
            }
        }
        // If slopes aren't equal, we set y1 = y2 and solve for x
        // this is: x = (b2 - b1) / (a1 - a2)
        else {
            var xInter = (b2 - b1) / (a1 - a2);
            var yInter = a1*xInter + b1;
            var pInter = G.point(xInter, yInter);

            // This found point must be within both line segments
            if (G.pbetween(pInter, p1, p2)
                && G.pbetween(pInter, p3, p4)) {
                return pInter;
            }
            // The point lies along the lines, but not along the line segments
            else {
                return null;
            }
        }
    }
}

return G;

})();
