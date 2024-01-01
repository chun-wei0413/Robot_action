
var canvas;
var gl;
var program;
//重製
var isReset = false;
//跑步
var isRunning = false;
//深蹲
var isSquat = false;
//走路
var isWalk = false;
//功夫
var isJump = false;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;
var nodeColors = []; // 新增一個陣列用於存儲每個節點的顏色
var modelViewMatrixLoc;

var vertices = [
    vec4( -1, -1,  0.5, 1.0 ),
    vec4( -1,  0.5,  0.5, 1.0 ),
    vec4( 1,  0.5,  0.5, 1.0 ),
    vec4( 1, -0.5,  0.5, 1.0 ),
    vec4( -1, -0.5, -0.5, 1.0 ),
    vec4( -1,  0.5, -0.5, 1.0 ),
    vec4( 1,  0.5, -0.5, 1.0 ),
    vec4( 1, -0.5, -0.5, 1.0 ),
];
/*
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 ) 
*/


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

 
var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 4.0;
var upperLegHeight = 4.0;
var headHeight = 2;
var headWidth = 1.0;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0];
//for reset angle
const reset = [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {
    
    case torsoId:
    
    m = rotate(theta[torsoId], 0, 1, 0 );
    figure[torsoId] = createNode( m, torso, null, headId );

    break;

    case headId: 
    case head1Id: 
    case head2Id:
    

    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));

    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;
    
    
    case leftUpperArmId:
    
    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    
    break;

    case rightUpperArmId:
    
    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;
    
    case leftUpperLegId:
    
    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    
    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;
    
    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;
    
    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;
    
    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;
    
    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    }

}

function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
 
function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight+0.25, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

var currentTorso = 0;
function turnTorso(){
    switch (currentTorso){
        case 0:
        if(theta[torsoId] <= 100){
            theta[torsoId] += 0.5;
            initNodes(torsoId);
        } else {
            currentTorso = 1;
        }
        break;
        case 1:
        if(theta[torsoId] >= -100){
            theta[torsoId] -= 0.5;
            initNodes(torsoId);
        } else {
            currentTorso = 0;
        }
    }
}
var currentLeftArm= 0;
var currentRightLeg= 0;
var currentRightArm= 0;
var currentLeftLeg= 0;
//把有關跑步的動作封裝到物件RUN中
var RUN ={
    runLeftArm: function() {
        if (theta[leftLowerArmId] >= -70) {   
            theta[leftLowerArmId] -= 2.0;
            initNodes(leftLowerArmId); 
        }
        
        switch (currentLeftArm) {
            case 0: 
            if (theta[leftUpperArmId] >= 120) {   
                theta[leftUpperArmId] -= 3.0;
                initNodes(leftUpperArmId);
            } else {
                currentLeftArm = 1; 
            }
            break;
            case 1: 
            if (theta[leftUpperArmId] <= 240) {   
                theta[leftUpperArmId] += 3.0;
                initNodes(leftUpperArmId);
            } else {
                currentLeftArm = 0; 
            }
            break;
            default:
                break;
        }
    },
    runRightArm: function() {
        if (theta[rightLowerArmId] >= -70) {   
            theta[rightLowerArmId] -= 2.0;
            initNodes(rightLowerArmId);
        }
        switch (currentRightArm) {
            case 0:
            if (theta[rightUpperArmId] <= 240) {   
                theta[rightUpperArmId] += 3.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 1; 
            }
            break;
            case 1: 
            if (theta[rightUpperArmId] >= 120) {   
                theta[rightUpperArmId] -= 3.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 0; 
            }
            break;
        }
    },
    runRightLeg: function() {
        if (theta[rightLowerLegId] <= 70) {   
            theta[rightLowerLegId] += 2.0; 
            initNodes(rightLowerLegId);
        }
        switch(currentRightLeg){
            case 0:
                if(theta[rightUpperLegId] >= 120){ 
                    theta[rightUpperLegId] -= 3.0;
                    initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 1;
                }
            break;
            case 1:
                if(theta[rightUpperLegId] <= 240){ 
                    theta[rightUpperLegId] += 3.0;
                    initNodes(rightUpperLegId); 
                } else {
                    currentRightLeg = 0;
                }
            break;
        }
    },
 
    runLeftLeg: function() {
        if(theta[leftLowerLegId]<=70){
            theta[leftLowerLegId] += 2.0;
            initNodes(leftLowerLegId);
        }
        switch(currentLeftLeg){
            case 0:
                if(theta[leftUpperLegId] <= 240){ 
                    theta[leftUpperLegId] += 3.0;
                    initNodes(leftUpperLegId); 
                } else {
                    currentLeftLeg = 1;
                }
            break;
            case 1:
                if(theta[leftUpperLegId] >= 120){ 
                    theta[leftUpperLegId] -= 3.0;
                    initNodes(leftUpperLegId);
                } else {
                    currentLeftLeg = 0;
                }
            break;
        }
    }
};
var SQUAT ={
    squatLeftArm: function() {
        switch (currentLeftArm) {
            case 0: // 执行动作3
            if (theta[leftUpperArmId] >= 100) {   
                theta[leftUpperArmId] -= 1.15;
                initNodes(leftUpperArmId);
            } else {
                currentLeftArm = 1; //  回到第一个动作
            }
            break;
            case 1: // 执行动作3 
            if (theta[leftUpperArmId] <= 180) {   
                theta[leftUpperArmId] += 1.15;
                initNodes(leftUpperArmId);
            } else {
                currentLeftArm = 0; // 回到第一个动作
            }
            break;
            default:
                break;
        }

    },
    squatRightArm: function() {
        switch (currentRightArm) {
            case 0: // 执行动作3
            if (theta[rightUpperArmId] >= 100) {   
                theta[rightUpperArmId] -= 1.15;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 1; // 回到第一个动作
            }
            break;
            case 1: // 执行动作3
            if (theta[rightUpperArmId] <= 180) {   
                theta[rightUpperArmId] += 1.15;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 0; // 回到第一个动作
            }
            break;
        }
    },
    squatRightLeg: function() { 
        switch(currentRightLeg){
            case 0:
                if (theta[rightLowerLegId] <= 70) {   
                    theta[rightLowerLegId] += 1; 
                    initNodes(rightLowerLegId);
                } else {
                    currentRightLeg = 1;
                }
            break;
            case 1:
                if (theta[rightLowerLegId] >= 0) {   
                    theta[rightLowerLegId] -= 1; 
                    initNodes(rightLowerLegId);
                }else {
                    currentRightLeg = 0;
                }
                break;
        }
        switch(currentRightLeg){
            case 0: 
                if(theta[rightUpperLegId] >= 100){ 
                    theta[rightUpperLegId] -= 1;
                    initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 1;
                }
            break;
            case 1: 
                if(theta[rightUpperLegId] <= 180){ 
                    theta[rightUpperLegId] += 1;
                    initNodes(rightUpperLegId); 
                } else {
                    currentRightLeg = 0;
                }
            break;
        }
        // 新增下蹲時調整torso座標的邏輯
        if (currentRightLeg === 0 && torsoHeight >= 0.5) {
            torsoHeight -= 0.01; // 調整座標的步進值，可以根據需要調整
            initNodes(torsoId);
            headHeight -= 0.01;
            initNodes(head1Id);
        } else if (currentRightLeg === 1 && torsoHeight <= 5.0) {
            torsoHeight += 0.01; // 調整座標的步進值，可以根據需要調整
            initNodes(torsoId);
            headHeight += 0.01;
            initNodes(head1Id);
        }
    },
 
    squatLeftLeg: function() {
        switch(currentLeftLeg){
            case 0:
            if(theta[leftLowerLegId]<=70){
                theta[leftLowerLegId] += 1;
                initNodes(leftLowerLegId);
            } else {
                currentLeftLeg=1;
            }
            break;
            case 1:
            if(theta[leftLowerLegId] >= 0){
                theta[leftLowerLegId] -= 1;
                initNodes(leftLowerLegId);
            } else {
                currentLeftLeg=0;
            }
            break;
        }
        switch(currentLeftLeg){
            case 0: 
                if(theta[leftUpperLegId] >= 100){ 
                    theta[leftUpperLegId] -= 1;
                    initNodes(leftUpperLegId);
                } else {
                    currentLeftLeg = 1;
                }
            break;
            case 1: 
                if(theta[leftUpperLegId] <= 180){ 
                    theta[leftUpperLegId] += 1;
                    initNodes(leftUpperLegId); 
                } else {
                    currentLeftLeg = 0;
                }
            break;
        }
 
    }
};
var WALK ={
    walkLeftArm: function() {
        switch (currentLeftArm) {
            case 0: 
            if (theta[leftUpperArmId] >= 150) {   
                theta[leftUpperArmId] -= 1.0;
                initNodes(leftUpperArmId); 
            } else {
                currentLeftArm = 1; 
            }
            break;
            case 1:
            if (theta[leftUpperArmId] <= 210) {   
                theta[leftUpperArmId] += 1.0;
                initNodes(leftUpperArmId);
            } else {
                currentLeftArm = 0; 
            }
            break;
            default:
                break;
        }
    },  

    walkRightArm: function() {
        switch (currentRightArm) {
            case 0: 
            if (theta[rightUpperArmId] <= 210) {   
                theta[rightUpperArmId] += 1.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 1; 
            }
            break;
            case 1: 
            if (theta[rightUpperArmId] >= 150) {   
                theta[rightUpperArmId] -= 1.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 0; 
            }
            break;
        }
    },

    walkRightLeg: function() {
        switch(currentRightLeg){
            case 0: 
            if(theta[rightUpperLegId] >= 150){ 
                theta[rightUpperLegId] -= 1.0;
                initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 1;
                }
            break;
            case 1:
                if(theta[rightUpperLegId] <= 210){ 
                    theta[rightUpperLegId] += 1.0;
                    initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 0;
                }
            break;
        }
    },
    walkLeftLeg: function() {
        switch(currentLeftLeg){
            case 0: 
                if(theta[leftUpperLegId] <= 210){ 
                    theta[leftUpperLegId] += 1.0;
                    initNodes(leftUpperLegId); 
                } else {
                    currentLeftLeg = 1;
                }
            break;
            case 1: 
                if(theta[leftUpperLegId] >= 150){ 
                    theta[leftUpperLegId] -= 1.0;
                    initNodes(leftUpperLegId);
                } else {
                    currentLeftLeg = 0;
                }
            break;
        }
    }
};
var JUMP ={
    jumpLeftArm: function() {
        switch (currentLeftArm) {
            case 0:
            if (theta[leftLowerArmId] >= -90) {   //彎手
                theta[leftLowerArmId] -= 2.0;
                initNodes(leftLowerArmId); 
            }else {
                currentLeftArm = 1; 
            }
            case 1:
            if (theta[leftUpperArmId] >= 60) {   //手抬高
                theta[leftUpperArmId] -= 1.0;
                initNodes(leftUpperArmId); 
            } else {
                currentLeftArm = 2; 
            }
            break;
            case 2:
            if (theta[leftUpperArmId] <= 180) {   //手放下
                theta[leftUpperArmId] += 1.0;
                initNodes(leftUpperArmId); 
            } else {
                currentLeftArm = 3; 
            }
            break;
            case 3:
            if (theta[leftLowerArmId] <= 0) {   //彎回來
                theta[leftLowerArmId] += 2.0;
                initNodes(leftLowerArmId); 
            } else {
                currentLeftArm = 0;
            }
            break;
        }
    },  
    jumpRightArm: function() {
        switch (currentRightArm) {
            case 0:
            if (theta[rightLowerArmId] >= -70) {   //彎手
                theta[rightLowerArmId] -= 2.0;
                initNodes(rightLowerArmId);
            }   else {
                currentRightArm = 1; 
            }
            case 1: 
            if (theta[rightUpperArmId] >= 60) {   //手抬高
                theta[rightUpperArmId] -= 1.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 2; 
            }
            break;
            case 2: 
            if (theta[rightUpperArmId] <= 180) {   //手放下
                theta[rightUpperArmId] += 1.0;
                initNodes(rightUpperArmId);
            } else {
                currentRightArm = 3; 
            }
            break;
            case 3: 
            if (theta[rightLowerArmId] <= 0) {   //彎回來
                theta[rightLowerArmId] += 2.0;
                initNodes(rightLowerArmId);
            } else {
                currentRightArm = 0; 
            }
            break;
        }
    },

    jumpRightLeg: function() {
        switch(currentRightLeg){
            case 0:
            if (theta[rightLowerLegId] <= 70) {   
                theta[rightLowerLegId] += 2.0; 
                initNodes(rightLowerLegId);
            }else {
                currentRightLeg = 1;
            }
            break;
            case 1: 
            if(theta[rightUpperLegId] >= 80){ 
                theta[rightUpperLegId] -= 1.0;
                initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 2;
                }
            break;
            case 2:
                if(theta[rightUpperLegId] <= 180){ 
                    theta[rightUpperLegId] += 1.0;
                    initNodes(rightUpperLegId);
                } else {
                    currentRightLeg = 3;
                }
            break;
            case 3:
                if (theta[rightLowerLegId] >= 0) {   
                    theta[rightLowerLegId] -= 2.0; 
                    initNodes(rightLowerLegId);
                } else {
                    currentRightLeg = 0;
                }
            break;
        }
    },
    jumpLeftLeg: function() {

        switch(currentLeftLeg){
            case 0:
                if(theta[leftLowerLegId]<=70){
                    theta[leftLowerLegId] += 2.0;
                    initNodes(leftLowerLegId);
                } else {
                    currentLeftLeg = 1;
                }
            break;
            case 1: 
                if(theta[leftUpperLegId] >= 80){ 
                    theta[leftUpperLegId] -= 1.0;
                    initNodes(leftUpperLegId); 
                } else {
                    currentLeftLeg = 2;
                }
            break;
            case 2: 
                if(theta[leftUpperLegId] <= 180){ 
                    theta[leftUpperLegId] += 1.0;
                    initNodes(leftUpperLegId);
                } else {
                    currentLeftLeg = 3;
                }
            break;
            case 3:
                if(theta[leftLowerLegId]>=0){
                    theta[leftLowerLegId] -= 2.0;
                    initNodes(leftLowerLegId);
                } else {
                    currentLeftLeg = 0;
                }
            break;
        }
    }
};

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]); 
     pointsArray.push(vertices[c]);     
     pointsArray.push(vertices[d]);    
}
function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
 
   
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.8, 1.0, 0.8, 1.0);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();

    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("resetButton").onclick = function() {
        isReset = !isReset;
    };
    //runButton
    document.getElementById("runButton").onclick = function() {
        isRunning = !isRunning;
    };
    //squatButton
    document.getElementById("squatButton").onclick = function() {
        isSquat = !isSquat;
    };
    //walkButton
    document.getElementById("walkButton").onclick = function() {
        isWalk = !isWalk;
    };
    //jumpButton
    document.getElementById("jumpButton").onclick = function() {
        isJump = !isJump;
    };

    for(i=0; i<numNodes; i++) initNodes(i);
    
    render();
}
 

var render = function() {
 
        gl.clear( gl.COLOR_BUFFER_BIT ); 
        if(isReset){
            //重製分體各部位角度
            for (var i = 0; i < numNodes; i++) { 
                theta[i] = reset[i];
                initNodes(i); 
            }
            //reset variable
            currentLeftArm= 0;
            currentRightLeg= 0;
            currentRightArm= 0;
            currentLeftLeg= 0;
            isRunning = false;
            isSquat = false;
            isReset = false;
            isWalk = false;
            isJump = false;
            torsoHeight = 5.0;
            torsoWidth = 1.0;
            upperArmHeight = 3.0;
            lowerArmHeight = 2.0;
            upperArmWidth  = 0.5;
            lowerArmWidth  = 0.5;
            upperLegWidth  = 0.5;
            lowerLegWidth  = 0.5;
            lowerLegHeight = 4.0;
            upperLegHeight = 4.0;
            headHeight = 2;
            headWidth = 1.0;
        } 
        //跑步狀態
        if (isRunning) {
            // 如果正在運行，則更新角度
            turnTorso();
            
            RUN.runLeftArm();
            RUN.runRightLeg();
            RUN.runRightArm();
            RUN.runLeftLeg();
        }  
        //深蹲狀態
        if(isSquat){
            // 如果正在運行，則更新角度
            turnTorso();
            SQUAT.squatLeftArm();
            SQUAT.squatRightArm();
            SQUAT.squatLeftLeg();
            SQUAT.squatRightLeg();
        }
        //走路狀態
        if (isWalk) {

            // 如果正在運行，則更新角度
            turnTorso();
            WALK.walkLeftArm();
            WALK.walkRightLeg();
            WALK.walkRightArm();
            WALK.walkLeftLeg();

        }  
        //打拳狀態
        if(isJump){
            // 如果正在運行，則更新角度
            turnTorso();
            JUMP.jumpLeftArm();
            JUMP.jumpRightArm();
            JUMP.jumpRightLeg();
            JUMP.jumpLeftLeg();
        }

        traverse(torsoId);

        requestAnimFrame(render);
}
