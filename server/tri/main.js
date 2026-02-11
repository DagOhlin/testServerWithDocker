/**
 * Draw on Canvas
 */
/* global WebGLUtils, Matrix4 */

window.onload = function loadGLSLFiles() {
    var scripts = [
        {
            filename: "vertex.glsl",
            type: "x-vertex",
            id: "vertex-shader",
        },
        {
            filename: "fragment.glsl",
            type: "x-fragment",
            id: "fragment-shader",
        },
    ];

    var container = document.getElementById("shader-container");

    Promise.all(
        scripts.map((script) =>
            fetch(script.filename).then((resp) => resp.text()),
        ),
    )
        .then(function (result) {
            scripts.forEach(function (script, i) {
                var scriptElement = document.createElement("script");

                scriptElement.type = "x-shader/" + script.type;
                scriptElement.id = script.id;
                scriptElement.textContent = result[i];

                container.appendChild(scriptElement);
            });
        })
        .then(runAnimation);
};

function runAnimation() {
    "use strict";

    var canvas;
    var gl;
    var program;
    var buffer;

    canvas = document.getElementById("canvas");
    gl = WebGLUtils.getWebGLContext(canvas);
    if (!gl) {
        return;
    }

    program = WebGLUtils.createProgramFromScripts(gl, [
        "vertex-shader",
        "fragment-shader",
    ]);
    gl.useProgram(program);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    var u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");

    var u_FragColor = gl.getUniformLocation(program, "u_FragColor");

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    var data = setGeometryTriangle(gl);

    var world = {
        objects: [],
    };

    world.add = function (angle, speed, color) {
        color = new Float32Array(color);

        this.objects.push({
            angle: angle,
            speed: speed,
            color: color,
        });
    };

    world.add(0, 10, [0.0, 1.0, 0.0, 1.0]);

    var speed = 1;

    function update(td) {
        var i;
        var object;

        for (i = 0; i < world.objects.length; i++) {
            object = world.objects[i];
            object.angle = (object.angle + object.speed * speed * td) % 360;
        }
    }

    function draw() {
        var i;
        var object;
        var modelMatrix = new Matrix4();

        gl.clear(gl.COLOR_BUFFER_BIT);

        for (i = 0; i < world.objects.length; i++) {
            object = world.objects[i];

            modelMatrix.setRotate(object.angle, 0, 0, 1);

            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            gl.uniform4fv(u_FragColor, object.color);

            gl.drawArrays(data.mode, 0, data.n);
        }
    }

    var lastTick = null;
    var request = null;

    var fps_time = 0;
    var fps_Frames = 0;

    function gameLoop() {
        var now = Date.now();
        var teltaDime = (now - (lastTick || now)) / 1000;

        fps_time += teltaDime;
        fps_Frames++;
        lastTick = now;
        if (fps_time > 1) {
            var fps = fps_Frames / fps_time;
            document.getElementById("fps").innerHTML = Math.round(fps);
            fps_time = fps_Frames = 0;
        }
        request = window.requestAnimFrame(gameLoop);
        update(teltaDime);
        draw();
    }

    var playElement = document.getElementById("play");
    playElement.addEventListener("click", function () {
        if (request === null) {
            gameLoop();
        }
    });

    var pauseElement = document.getElementById("pause");
    pauseElement.addEventListener("click", function () {
        if (request) {
            window.cancelRequestAnimFrame(request);
            request = null;
            lastTick = null;
        }
    });

    var addElement = document.getElementById("add");
    addElement.addEventListener("click", function () {
        var angle = Math.random() * 360;
        var speed = Math.random() * 20;
        var color = [Math.random(), Math.random(), Math.random(), 1.0];

        world.add(angle, speed, color);
    });

    var speedElement = document.getElementById("speed");
    speedElement.addEventListener("change", function () {
        speed = parseFloat(speedElement.value);
    });

    console.log("Everything is ready.");
    gameLoop();
}

function setGeometryTriangle(gl) {
    var data = {
        n: 3,
        mode: gl.TRIANGLES,
    };

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]),
        gl.STATIC_DRAW,
    );

    return data;
}
