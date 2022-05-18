function qgs_builtins_if(args, feature) {
  if (args[0]) {
    return args[1];
  }
  return args[2];
}

function qgs_builtins_concat(args, feature) {
  let str = '';
  for (let i of args) {
    str += i;
  }
  return str;
}

function qgs_builtins_round(args, feature) {
  let scale = args[1];
  scale = scale ? scale : 0;
  scale = Math.pow(10, -scale);
  return Math.round(args[0] / scale) * scale;
}


function qgs_builtins_area(args, feature) {
  const geometry = feature.getGeometry();
  return geometry.getArea ? geometry.getArea() : 0;
}
