/*
Global definitions
*/
inlets = 1;
outlets = 1;
var arr_x = [];
var arr_y = [];
var timecount = 0;
var tTable = [0, 1.376, 1.061, 0.978];
var result = {};
var predictable = false;

function loadbang() {
  reset();
}

function reset(vel) {
  if(predictable) {
    predictable=false;
    timecount = 0;
    arr_x = [];
    arr_y = [];
  }
  outlet(0, vel);
}

/*
Ordinary Least Squares -
Computes Ordinary Least Squares for linear regression.
X and Y should be in the same length >= 3
Runs at O(n) speed

Arguments:
xList : list of integers (MIDI velocity 0-127)
yList : list of integers (time in miliseconds)

Output:
An object {m: float, b: float, sumTable: object}

*/
function ols (xList, yList){
  if (xList.length != yList.length) {
    error("x values and y values differ in number\n");
    return;
  }
  var len = xList.length;
  var sums = xList.reduce( function(total, xVal, i) {
    yVal = yList[i];
    total.x   += xVal;
    total.y   += yVal;
    total.xy  += xVal*yVal;
    total.x_2 += xVal*xVal;
    total.y_2 += yVal*yVal;
    return total;
  }, {x: 0, y: 0, xy: 0, x_2: 0, y_2: 0});
  var xMean = sums.x/len;
  var yMean = sums.y/len;

  var slope = (sums.xy - sums.x*sums.y/len) / (sums.x_2 - sums.x*sums.x/len);
  var intercept = yMean - (slope * xMean);

  var sst = sums.y_2 - (sums.y*sums.y)/len; // sum of squares total
  var ssr = slope * (sums.xy - sums.x*sums.y/len); //sum of squares residual
  var sse = sst - ssr;
  var s_epsilon = Math.sqrt(sse/(len-2));
  post("se:", s_epsilon, "\n");

  result = {
    m: slope,
    b: intercept,
    N: len,
    x_: xMean,
    y_: yMean,
    x_sum: sums.x,
    x2_sum: sums.x_2,
    se: s_epsilon
  }
}

/*
legatofy() - According to the regression model, check if it needs to be legato

arguments:
velocity : int
time (in milliseconds) : int

output:
The same velocity if it conforms with the regression model, or if there's no regression model available.
If the velocity is outside the prediction range, it is shifted to the nearest max/min velocity, whichever closest

routine:
1. Check if the prediction model exists.
  -> if yes, continue, if no goto the step 5
2. Compute the prediction range
3. Check if the velocity falls outside the range
  -> if yes, continue, if no, goto the step 5
4. Change the velocity to the neartest min/max of the prediction range
5. Push the new velocity and time into the regression model, (and update the prediction model)
6. Output the velocity and return
*/

function legatofy() {
  if(arguments.length != 2) {
    error("Exactly two arguments required\n");
    return;
  }
  var vel = arguments[0];
  timecount += arguments[1];
  var t = timecount;
  if (predictable) {
    var range = predict(t);
    var maxVal = range.max;
    var minVal = range.min;
    maxVal = maxVal > 120 ? 120 : maxVal;
    minVal = minVal < 10 ? 10 : minVal;
    if (vel > maxVal || vel < minVal) { // if velocity out of prediction range
      vel = Math.abs(vel-maxVal) < Math.abs(vel-minVal) ? maxVal : minVal;
      //vel = range.p;
      post("new vel:", vel, "\n");
    } else {
      post("Velocity falls in the prediction range\n");
    }
  } else {
    post("No prediction can be made at this point\n");
  }
  //push the new velocity and time
  update(t, vel);
  outlet(0, vel);
  return;
}

/*
update(int, int) - update the arr_x, arr_y list and perform ols
1. add values at the end of the arrays
2. if the array is longer than 5, remove the first element
3. call ols()
*/
function update(t, vel) {
  arr_x.push(t);
  arr_y.push(vel);
  if (arr_x.length > 5 && arr_y.length > 5) {
    arr_x.shift();
    arr_y.shift();
  }
  if (arr_x.length == arr_y.length && arr_x.length >= 3) {
    ols(arr_x, arr_y);
    predictable = true;
  }
  return;
}

/*
predict(int) predict y with a prediction interval

*/
function predict(x) {
  var minVal, maxVal;
  var len = result.N;
  if (len < 3) {
    post("Prediction can't be made because the elements are less than three\n");
  }

  // Compute prediction interval based on x
  // I hate writing math formular in computer language
  // It's so ugly and difficult to debug
  var prediction = x * result.m + result.b;
  var step1 = 1 + 1/len + Math.pow(x-result.x_, 2)/(result.x2_sum-Math.pow(result.x_sum, 2)/len);
  var interval = tTable[len-2] * result.se * Math.sqrt(step1);
  minVal = prediction-interval;
  maxVal = prediction+interval;
  post("prediction range:", minVal, maxVal, "\n");
  return {min: minVal, max: maxVal, p: prediction};
}
