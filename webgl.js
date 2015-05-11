function create3d() {

  var renderer, scene, camera, cubes = [[],[]];

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(600,400);
  document.body.appendChild(renderer.domElement);

  group = new THREE.Object3D();
  scene.add(group);

  var groupTicks = new THREE.Object3D();
  group.add(groupTicks);

  var light = new THREE.AmbientLight( 0x40f040 ); // soft white light
  scene.add( light );

  var pointLight =  new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;
  scene.add(pointLight);

  var maxHeight = 40;
  camera.position.y = maxHeight / 2;
  camera.position.z = 100;


  function generateTick(label) {

    // make dash
    var dashGeometry = new THREE.BoxGeometry(2, 0.3, 0.3);
    var dashMaterial = new THREE.MeshPhongMaterial({
      ambient: 0xffffff,
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 1,
      shading: THREE.SmoothShading
    } )
    var dash = new THREE.Mesh(dashGeometry, dashMaterial);

    var textMaterial = new THREE.MeshFaceMaterial([
      new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading}), // front
      new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.SmoothShading}) // side
    ] );
    var textGeometry = new THREE.TextGeometry(label, {
      size: 2,
      height: 1,
      curveSegments: 1,
      font: 'helvetiker',
      // weight: weight,
      // style: style,
      material: 0,
      extrudeMaterial: 1
    });
    textGeometry.computeBoundingBox();
    textGeometry.computeVertexNormals();

    var text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.x = 1;
    text.position.y = -1;

    var tick = new THREE.Object3D();
    tick.add(dash);
    tick.add(text);

    return tick;
  }

  function update(nsw, qld, max) {

    function renderYear(colour, teamIndex, height, yearIndex) {

      var cube;

      var h = height / max * maxHeight;

      var x = (teamIndex ? 1 : -1),
        y = h / 2,
        z = (-years.length / 2 + yearIndex) * 1.4;


      if (cubes[teamIndex][yearIndex]) { // already exists, let's re use it!

        cube = cubes[teamIndex][yearIndex];

      } else {

        if ( h > 0 ) {
          var geometry = new THREE.BoxGeometry(1,1,1);
          var material = new THREE.MeshPhongMaterial( {
            ambient: 0x030303,
            color: colour,
            specular: 0x404040,
            shininess: 1,
            shading: THREE.SmoothShading
          } )
          cube = new THREE.Mesh(geometry, material);
          cubes[teamIndex][yearIndex] = cube;
          group.add(cube);
        }

      }

      if (cube) {
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        cube.scale.y = h;
      } else {
        con.warn("could not render cube!", x,y,z,h)
      }

    }

    for (var i = 0, il = nsw.length; i < il; i++) {
      renderYear(0x4444ff, 0, nsw[i], i);
    }

    for (i = 0, il = qld.length; i < il; i++) {
      renderYear(0xa0163b, 1, qld[i], i);
    }

    for (var i = groupTicks.children.length - 1; i > -1; i--) {
      groupTicks.remove(groupTicks.children[i]);
    }


    var ticks = document.getElementsByClassName("y axis")[0].childNodes;
    for (i = 0, il = ticks.length; i < il; i++) {
      var tick = ticks[i];
      var tick3d;
      if (tick.className.baseVal === "tick") { // filter out the other svg elements.

        var transform = tick.getAttribute("transform");
        var y = Number(transform.replace(/[^0-9,.]/g, "").split(",")[1]);
        var text = tick.childNodes[1].innerHTML;

        var tickMesh = generateTick(text);
        groupTicks.add(tickMesh);
        tickMesh.position.y = (height - y) / height * maxHeight;

      }
    }

    groupTicks.position.x = 0;
    groupTicks.position.z = years.length / 2 * 1.4;


    // con.log("ticks", ticks)

  }


  var render = function () {

    // cube.rotation.x += 0.1;
    group.rotation.y += 0.01;

    groupTicks.rotation.y = -group.rotation.y;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  render();


  return {
    update: update
  }

}