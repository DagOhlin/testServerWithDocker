/**
 * Draw on Canvas
 */

/* global getWebGLContext initShaders */

window.onload = (function () {
    "use strict";
    // Vertex shader program
    var VSHADER_SOURCE =
        "attribute vec4 a_Position;\n" +
        "attribute float a_Size;\n" +
        "void main() {\n" +
        "   gl_Position = a_Position;\n" +
        "   gl_PointSize = a_Size;\n" +
        "}\n";

    // Fragment shader program
    var FSHADER_SOURCE =
        "precision mediump float;\n" +
        "uniform vec4 u_FragColor;\n" +
        "void main() {\n" +
        "   gl_FragColor = u_FragColor;\n" +
        "}\n";

    var canvas = document.getElementById("canvas1");

    var gl = getWebGLContext(canvas);

    if (!gl) {
        console.log("Failed to get rendering context for WebGL");
        return;
    }

    // init shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders!");
        return;
    }

    // Get storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    var a_Size = gl.getAttribLocation(gl.program, "a_Size");
    if (a_Size < 0) {
        console.log("Failed to get the storage location of a_Size");
        return;
    }

    // Get storage location of uniform variable
    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

    // Register eventhandler, mouse click
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position, u_FragColor);
    };

    gl.clear(gl.COLOR_BUFFER_BIT);

    var g_points = [];
    var g_colors = [];
    var g_size = [];
    //var xPosi;
    //var yPosi;

    function generatePointBasedOnPrevius(id, amount) {
        for (var i = 0; i < amount; i++) {
            g_points.push([Math.random() * 2 - 1, Math.random() * 2 - 1]);
            g_size.push(g_size[id]);
            g_colors.push(g_colors[id]);
        }

        g_points = g_points.toSpliced(id, 1);
        g_size = g_size.toSpliced(id, 1);
        g_colors = g_colors.toSpliced(id, 1);
    }

    function click(ev, gl, canvas, a_Position, u_FragColor) {
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();

        x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        var amountOfPints = g_points.length;
        var hit = false;
        for (var i = 0; i < amountOfPints; i++) {
            var HalfSizeX = g_size[i] / canvas.width;
            var halfSizeY = g_size[i] / canvas.height;

            if (
                x < g_points[i][0] + HalfSizeX &&
                x > g_points[i][0] - HalfSizeX &&
                y < g_points[i][1] + halfSizeY &&
                y > g_points[i][1] - halfSizeY
            ) {
                console.log("hit");
                generatePointBasedOnPrevius(i, 4);
                hit = true;
                break;
            }
        }
        if (hit == false) {
            g_points.push([x, y]);
            g_size.push(Math.random() * 15 + 5);
            g_colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
        }

        // Store the color in the array
        /*
        if (x < 0) {
            xPosi = -1 * x;
        } else {
            xPosi = x;
        }

        if (y < 0) {
            yPosi = -1 * y;
        } else {
            yPosi = y;
        }
        */
        /*
            if (x >= 0.0 && y >= 0.0) {
                g_colors.push([1.0, 1.0, 0.0, 1.0]);
            } else if (x >= 0.0 && y < 0.0) {
                g_colors.push([1.0, 0.0, 1.0, 1.0]);
            } else if (x < 0.0 && y < 0.0) {
                g_colors.push([0.0, 1.0, 1.0, 1.0]);
            } else {
                g_colors.push([1.0, 1.0, 0.0, 1.0]);
            }
            */
        gl.clear(gl.COLOR_BUFFER_BIT);

        var len = g_points.length;

        for (i = 0; i < len; i++) {
            var xy = g_points[i];
            var rgba = g_colors[i];
            var size = g_size[i];

            gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
            gl.vertexAttrib1f(a_Size, size);
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            // Draw the point
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    console.log("Everything is ready.");
})();
