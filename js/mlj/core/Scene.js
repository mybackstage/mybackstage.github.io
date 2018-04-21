
MLJ.core.Scene = {};
MLJ.core.Scene.timeStamp = 0;

var firstTime2 = true;
var radius = 100, theta = 0;

var intersectionPrev = 0;

var doEnableOverlayImageBoundaries = true;
// var doEnableOverlayImageBoundaries = false;

(function () {
    var _layers = new MLJ.util.AssociativeArray();
    var _decorators = new MLJ.util.AssociativeArray();
    var _scene;
    var _group;
    var _camera;
    var _cameraPosition;
    var _scene2D;
    var _camera2D;
    var _controls;
    var _raycaster;
    var _mouse = new THREE.Vector2();
    var _renderer;
    var _this = this;
    var _wallsInfo;
    var _threedModelAttributes;
    var _selectedImageGeometry;    
    var _selectedImageLineSegments;
    var _blobs = {};
    
    function onDocumentMouseMove( event ) {
        // console.log("BEG onDocumentMouseMove");

        event.preventDefault();

        _mouse.x = ( ( event.clientX - get3DOffset().left - _renderer.domElement.offsetLeft ) /
                     _renderer.domElement.clientWidth ) * 2 - 1;
        
        _mouse.y = - ( ( event.clientY - get3DOffset().top - _renderer.domElement.offsetTop ) /
                       _renderer.domElement.clientHeight ) * 2 + 1;

        // console.log('_mouse.x, _mouse.y 2', _mouse.x, _mouse.y);
        
        MLJ.core.Scene.render();

    }

    function get3DSize() {
        var _3D = $('#_3D');

        return {
            width: _3D.innerWidth(),
            height: _3D.innerHeight()
        };
    }

    function get3DOffset() {
        var _3D = $('#_3D');

        return {
            left: _3D.offset().left,
            top: _3D.offset().top
        };
    }

    //SCENE INITIALIZATION  ________________________________________________________


    
    function animate() {
        requestAnimationFrame( animate );
        _controls.update();
        MLJ.core.Scene.render();
    }
    
    function initScene() {
        // console.log('BEG initScene');

        var _3DSize = get3DSize();

        _scene = new THREE.Scene();

        var fov = 70;
        var cameraFrustumAspectRatio = _3DSize.width / _3DSize.height;
        var cameraFrustumNearPlane = 0.1;
        var cameraFrustumFarPlane = 100000;
        _camera = new THREE.PerspectiveCamera(fov, cameraFrustumAspectRatio, cameraFrustumNearPlane, cameraFrustumFarPlane);

        _camera.position.z = -1500;
        _camera.position.x = 1500;
        _camera.position.y = 1500;

        
        // BEG from example2_objLoader_raycasting.js
        _camera.lookAt( _scene.position );
        _camera.updateMatrixWorld();
        // END from example2_objLoader_raycasting.js

        _group = new THREE.Object3D();
        _scene.add(_group);
        
        _scene2D = new THREE.Scene();
        _camera2D = new THREE.OrthographicCamera(0, _3DSize.width / _3DSize.height, 1, 0, -1, 1);
        _camera2D.position.z = -1;
        
        _raycaster = new THREE.Raycaster();
        
        // _renderer = new THREE.WebGLRenderer({
        //     antialias: true,
        //     alpha: true,
        //     preserveDrawingBuffer: true});
        // _renderer.context.getExtension("EXT_frag_depth");

        _renderer = new THREE.WebGLRenderer();

        _renderer.setPixelRatio(window.devicePixelRatio);
        _renderer.setSize(_3DSize.width, _3DSize.height);


        
        $('#_3D').append(_renderer.domElement);
        _scene.add(_camera);

        //INIT CONTROLS
        var container = document.getElementsByTagName('canvas')[0];
        _controls = new THREE.TrackballControls(_camera, container);
        _controls.rotateSpeed = 4.0;
        _controls.zoomSpeed = 1.2;
        _controls.panSpeed = 2.0;
        _controls.noZoom = false;
        _controls.noPan = false;
        _controls.staticMoving = true;
        _controls.dynamicDampingFactor = 0.3;
        _controls.keys = [65, 83, 68];


        $(document).keydown(function (event) {
            if ((event.ctrlKey || (event.metaKey && event.shiftKey)) && event.which === 72) {
                event.preventDefault();
                _controls.reset();
            }

        });


        if(doEnableOverlayImageBoundaries)
        {
            /////////////////////////////////////////////////////////////////
            // overlay images boundaries on 3d model
            /////////////////////////////////////////////////////////////////

            var materialYellow = new THREE.LineBasicMaterial({color: 0xffff00});
            _this.overlayWallsImagesBoundariesOn3dModel(materialYellow);
        }

        /////////////////////////////////////////////////////////////////
        // add selected image
        /////////////////////////////////////////////////////////////////

        _selectedImageGeometry = new THREE.Geometry();

        var geometry1 = new THREE.Geometry();
        geometry1.colorsNeedUpdate = true;
        geometry1.verticesNeedUpdate = true;
        geometry1.needsUpdate = true;

        var materialBlue = new THREE.LineBasicMaterial({color: 0x0000ff});
        _selectedImageLineSegments = new THREE.LineSegments(geometry1, materialBlue);
        _scene.add( _selectedImageLineSegments )

        
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

        var light = new THREE.AmbientLight("#808080");
        _scene.add(light);

        //INIT LIGHTS 
        _this.lights.AmbientLight = new MLJ.core.AmbientLight(_scene, _camera, _renderer);
        _this.lights.Headlight = new MLJ.core.Headlight(_scene, _camera, _renderer);

        //EVENT HANDLERS
        var $canvas = $('canvas')[0];
        $canvas.addEventListener('touchmove', _controls.update.bind(_controls), false);
        $canvas.addEventListener('mousemove', _controls.update.bind(_controls), false);
        $canvas.addEventListener('mousewheel', _controls.update.bind(_controls), false);
        $canvas.addEventListener('DOMMouseScroll', _controls.update.bind(_controls), false); // firefox

        _controls.addEventListener('change', function () {
            MLJ.core.Scene.render();
            $($canvas).trigger('onControlsChange');
        });

        $(window).resize(function () {
            var size = get3DSize();

            _camera.aspect = size.width / size.height;
            _camera.updateProjectionMatrix();
            _renderer.setSize(size.width, size.height);

            // MLJ.core.Scene.resizeWebGLRenderTarget(colorBuffer, size.width, size.height);
            // MLJ.core.Scene.resizeWebGLRenderTarget(targetBuffer, size.width, size.height);

            _camera2D.left = size.width / size.height;
            _camera2D.updateProjectionMatrix;

            MLJ.core.Scene.render();
        });

        $(document).on("MeshFileOpened",
                       function (event, layer) {
                           // console.log('Received event "MeshFileOpened"'); 
                           MLJ.core.Scene.addLayer(layer);
                       });

        $(document).on("MeshFileReloaded",
                function (event, layer) {
                    // Restore three geometry to reflect the new state of the vcg mesh
                    layer.updateThreeMesh();
                    $(document).trigger("SceneLayerReloaded", [layer]);
                });

        // console.log('END initScene');

        // if (typeof jQuery != 'undefined') {  
        //     // jQuery is loaded => print the version
        //     alert(jQuery.fn.jquery);
        // }

    }

    function sleep(miliseconds) {
        var currentTime = new Date().getTime();

        while (currentTime + miliseconds >= new Date().getTime()) {
        }
    }


    function _computeGlobalBBbox()
    {
        //console.time("Time to update bbox: ");
        _group.scale.set(1, 1, 1);
        _group.position.set(0, 0, 0);
        _group.updateMatrixWorld();

        if (_layers.size() === 0) // map to the canonical cube
            BBGlobal = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
        else {
            // Defining the starting bounding box as the one from the first layer
            BBGlobal = new THREE.Box3().setFromObject(_layers.getFirst().getThreeMesh());

            var iter = _layers.iterator();

            // Iterating over all the layers
            while (iter.hasNext()) {
                // Getting the bounding box of the current layer
                var bbox = new THREE.Box3().setFromObject(iter.next().getThreeMesh());

                // Applying the union of the previous bounding box to the current one
                BBGlobal.union(bbox);
            }
        }
        var scaleFac = 15.0 / (BBGlobal.min.distanceTo(BBGlobal.max));
        // var offset = BBGlobal.center().negate();
        var target = new THREE.Vector3();
        var offset = BBGlobal.getCenter(target).negate();
        offset.multiplyScalar(scaleFac);
        _group.scale.set(scaleFac, scaleFac, scaleFac);
        _group.position.set(offset.x, offset.y, offset.z);
        _group.updateMatrixWorld();
        return BBGlobal;
    }

    this.getBBox = function () {
        return _computeGlobalBBbox();
    }

    this.lights = {
        AmbientLight: null,
        Headlight: null
    };

    this.getCamera = function () {
        return _camera;
    };

    this.getThreeJsGroup = function () {
        return _group;
    }

    this.add = function (obj) {
	_scene.add( obj );
    };
    
    this.setLayerVisible = function (layerName, visible) {
        var layer = _layers.getByKey(layerName);
        layer.getThreeMesh().visible = visible;

        var iter = layer.overlays.iterator();

        while (iter.hasNext()) {
            iter.next().visible = visible;
        }
        MLJ.core.Scene.render();
    };

    this.addLayer = function (layer) {
        // console.log('BEG addLayer');
        
        if (!(layer instanceof MLJ.core.Layer)) {
            console.error("The parameter must be an instance of MLJ.core.Layer");
            return;
        }

        // Initialize the THREE geometry used by overlays and rendering params
        layer.initializeRenderingAttributes();
        _group.add(layer.getThreeMesh());

        //Add new mesh to associative array _layers            
        _layers.set(layer.name, layer);
        _selectedLayer = layer;

        _computeGlobalBBbox();

        // console.log('Trigger event "SceneLayerAdded"');
        $(document).trigger("SceneLayerAdded", [layer, _layers.size()]);
        _this.render();
        // console.log('END addLayer');
    };

    this.addOverlayLayer = function (layer, name, mesh, overlay2D) {
        // console.log('BEG addOverlayLayer'); 
        if (!(mesh instanceof THREE.Object3D)) {
            console.warn("mesh parameter must be an instance of THREE.Object3D");
            return;
        }

        layer.overlays.set(name, mesh);

        mesh.visible = layer.getThreeMesh().visible;
        if (overlay2D) {
            _scene2D.add(mesh);
        }
        else
        {
            layer.getThreeMesh().add(mesh);
        }

        _this.render();
        // console.log('END addOverlayLayer'); 
    };

    function disposeObject(obj) {
        if (obj.geometry)
            obj.geometry.dispose();
        if (obj.material)
            obj.material.dispose();
        if (obj.texture)
            obj.texture.dispose();
    }

    this.removeOverlayLayer = function (layer, name, overlay2D) {
        var mesh = layer.overlays.getByKey(name);

        if (mesh !== undefined) {
            mesh = layer.overlays.remove(name);
            if (overlay2D) {
                _scene2D.remove(mesh);
            } else {
                layer.getThreeMesh().remove(mesh);
            }

            mesh.traverse(disposeObject);
            disposeObject(mesh);

            _this.render();
        }
    };

    this.updateLayer = function (layer) {
        if (layer instanceof MLJ.core.Layer) {
            if (_layers.getByKey(layer.name) === undefined) {
                console.warn("Trying to update a layer not in the scene.");
                return;
            }
            layer.updateThreeMesh();
            _computeGlobalBBbox();
            //render the scene
            this.render();
            /**
             *  Triggered when a layer is updated
             *  @event MLJ.core.Scene#SceneLayerUpdated
             *  @type {Object}
             *  @property {MLJ.core.Layer} layer The updated mesh file
             *  @example
             *  <caption>Event Interception:</caption>
             *  $(document).on("SceneLayerUpdated",
             *      function (event, layer) {
             *          //do something
             *      }
             *  );
             */
            $(document).trigger("SceneLayerUpdated", [layer]);

        } else {
            console.error("The parameter must be an instance of MLJ.core.Layer");
        }
    };

    var lastID = 0;
    this.createLayer = function (name) {
        // console.log('BEG createLayer'); 
        var layerName = "MyLayer";
        var layer = new MLJ.core.Layer(lastID++, layerName);
        return layer;
    };

    this.addSceneDecorator = function (name, decorator) {
        if (!(decorator instanceof THREE.Object3D)) {
            console.warn("MLJ.core.Scene.addSceneDecorator(): decorator parameter not an instance of THREE.Object3D");
            return;
        }

        _decorators.set(name, decorator)
        _group.add(decorator);

        _this.render();
    };

    this.getBlobs = function () {
        return _blobs;
    };

    this.setBlobs = function (blobs) {
        _blobs = blobs;
    };
        
    this.getSelectedLayer = function () {
        return _selectedLayer;
    };

    this.getLayers = function () {
        return _layers;
    };

    this.get3DSize = function () {
        return get3DSize();
    };

    this.get3DOffset = function () {
        return get3DOffset();
    };
    
    this.getRenderer = function () {
        return _renderer;
    };

    this.getScene = function () {
        return _scene;
    };

    // /**
    //  * Utility function to resize a WebGL render target, since the implementation
    //  * of THREE.WebGLRenderTarget.setSize() method fails to do so in ThreeJS r71.
    //  * (This method should no longer be needed in later versions).
    //  */
    // this.resizeWebGLRenderTarget = function (renderTarget, width, height) {
    //     if (!(renderTarget instanceof THREE.WebGLRenderTarget)) {
    //         console.warn('MLJ.core.Scene.resizeWebGLRenderTarget(): renderTarget is	not an instance of THREE.WebGLRenderTarget');
    //         return;
    //     }
    //     if (renderTarget.width !== width || renderTarget.height !== height) {
    //         renderTarget.width = width;
    //         renderTarget.height = height;
    //         renderTarget.dispose();
    //     }
    // };

    var plane = new THREE.PlaneBufferGeometry(2, 2);
    var quadMesh = new THREE.Mesh(
        plane
    );

    var quadScene = new THREE.Scene();
    quadScene.add(quadMesh);

    quadMesh.material = new THREE.ShaderMaterial({
        vertexShader:
        "varying vec2 vUv; \
             void main(void) \
             { \
                 vUv = uv; \
                 gl_Position = vec4(position.xyz, 1.0); \
             }",
        fragmentShader:
        "uniform sampler2D offscreen; \
             varying vec2 vUv; \
             void main(void) { gl_FragColor = texture2D(offscreen, vUv.xy); }"
    });
    quadMesh.material.uniforms = {
        offscreen: {type: "t", value: null}
    };

    this.loadJson = function (json_filename) {
        var data;
        // https://blog-en.openalfa.com/how-to-read-synchronously-json-files-with-jquery
        $.ajax({ 
            url: json_filename, 
            dataType: 'json', 
            data: data, 
            async: false, 
            success: function(json){
                // console.log('BEG getJSON'); 
                data = json;
                return;
            }
        });

        // console.log('data2');
        // console.log(data);

        return data;
    };

    this.calcDistance = function (point1, point2) {
        
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;

        var dist = Math.sqrt( a*a + b*b );
        return dist;
    };
    
    this.calcNearestImage = function (faceIndex, materialIndex, intersectionUvCoord) {
        
        // console.log('materialIndex', materialIndex);
        // console.log('intersectionUvCoord', intersectionUvCoord);
        var minDist = 1E6;
        var wallIndex = -1;
        var imageIndex = -1;
        
        for (var i = 0; i < _wallsInfo.length; ++i) {
            // console.log('_wallsInfo[i].materialIndex', _wallsInfo[i].materialIndex);

            if(!_wallsInfo[i])
            {
                console.log('_wallsInfo[i] is not defined');
                continue;
            }
            
            if(materialIndex == _wallsInfo[i].materialIndex)
            {
                // console.log('_wallsInfo[i].materialName', _wallsInfo[i].materialName);
                
                wallIndex = i;
                for (var j = 0; j < _wallsInfo[i].imagesInfo.length; ++j) {
                    var imageInfo = _wallsInfo[i].imagesInfo[j];
                    // console.log('imageInfo.centerPoint.uvCoordsNormalized', imageInfo.centerPoint.uvCoordsNormalized);

                    dist = _this.calcDistance(intersectionUvCoord, imageInfo.centerPoint.uvCoordsNormalized);
                    if(dist < minDist)
                    {
                        minDist = dist;
                        // console.log('minDist', minDist);
                        imageIndex = j;
                    }
                }
            }
        }

        return {wallIndex : wallIndex, imageIndex : imageIndex}
    };


    this.addSegmentVertex = function (point) {
        var vector1 = new THREE.Vector3(point.worldcoords.x, point.worldcoords.y, point.worldcoords.z);
        return vector1;
    };

    
    this.addImageBoundaries = function (imageInfo) {
        var imageFileName = imageInfo.imageFileName;
        // console.log('imageFileName: ' + imageFileName);

        var vertices = [];
        var vertex1 = this.addSegmentVertex(imageInfo.tlPoint);
        vertices.push(vertex1);

        var vertex = this.addSegmentVertex(imageInfo.trPoint);
        vertices.push(vertex);
        vertices.push(vertex);

        vertex = this.addSegmentVertex(imageInfo.brPoint);
        vertices.push(vertex);
        vertices.push(vertex);

        vertex = this.addSegmentVertex(imageInfo.blPoint);
        vertices.push(vertex);
        vertices.push(vertex);

        vertices.push(vertex1);

        return vertices;
    };
    
    this.addImagesBoundaries = function (imagesInfo) {
        var vertices1 = [];
        // console.log('imagesInfo.length', imagesInfo.length); 
        for (var i = 0; i < imagesInfo.length; ++i) {
            var vertices2 = _this.addImageBoundaries(imagesInfo[i]);
            vertices1.push.apply(vertices1, vertices2)

            // // do only i images
            // if (i==2)
            // {
            //     break;
            // }
            
        }
        // console.log('vertices1'); 
        // console.log(vertices1); 
        return vertices1;
    };
    
    this.overlayWallImageBoundariesOn3dModel = function (imageInfo, material) {
        _scene.remove( _selectedImageLineSegments );

        _selectedImageGeometry = new THREE.Geometry();
        _selectedImageGeometry.vertices = _this.addImageBoundaries(imageInfo);
        _selectedImageGeometry.colorsNeedUpdate = true;
        _selectedImageGeometry.verticesNeedUpdate = true;
        _selectedImageGeometry.needsUpdate = true;

        // console.log("_selectedImageGeometry.vertices.length 2: " + _selectedImageGeometry.vertices.length);

        _selectedImageLineSegments = new THREE.LineSegments( _selectedImageGeometry, material );
        // _selectedImageLineSegments.geometry.vertices = _selectedImageGeometry.vertices;
        // _selectedImageLineSegments.material = material;
        _selectedImageLineSegments.material.needsUpdate = true;
        
        // console.log('_selectedImageLineSegments'); 
        // console.log(_selectedImageLineSegments); 

        // console.log('_selectedImageLineSegments.geometry.verticesNeedUpdate', _selectedImageLineSegments.geometry.verticesNeedUpdate);
        
        // console.log('_selectedImageLineSegments2'); 
        // console.log(_selectedImageLineSegments); 

        // console.log('_this'); 
        // console.log(_this); 
        // console.log('_scene'); 
        // console.log(_scene); 

        _scene.add( _selectedImageLineSegments )
        _renderer.render(_scene, _camera);
        
        // _selectedImageLineSegments.geometry.setDrawRange( 0, _selectedImageGeometry.vertices.length );
        // _selectedImageLineSegments.geometry.attributes.position.needsUpdate = true;
        // _selectedImageLineSegments.geometry.dynamic = true;
    };

    this.overlayWallsImagesBoundariesOn3dModel = function (material) {

        _threedModelAttributes = _this.loadJson("mesh/3543_W18_shimi_mainHouse.json");
        
        _wallsInfo = [];

        var wallInfo;
        
        wallInfo = _this.loadJson("mesh/room1/wall1/wall_image_attributes2.json");
        _wallsInfo.push(wallInfo);

        wallInfo = _this.loadJson("mesh/room1/wall3/wall_image_attributes2.json");
        _wallsInfo.push(wallInfo);

        wallInfo = _this.loadJson("mesh/room1/wall4/wall_image_attributes2.json");
        _wallsInfo.push(wallInfo);

        wallInfo = _this.loadJson("mesh/room1/wall5/wall_image_attributes2.json");
        _wallsInfo.push(wallInfo);

        wallInfo = _this.loadJson("mesh/room1/wall6/wall_image_attributes2.json");
        _wallsInfo.push(wallInfo);

        var vertices1 = [];
        var geometry = new THREE.Geometry();
        console.log('_wallsInfo.length'); 
        console.log(_wallsInfo.length); 
        for (var i = 0; i < _wallsInfo.length; ++i) {
            console.log('i: ' + i); 
            console.log('_wallsInfo[i]'); 
            console.log(_wallsInfo[i]); 
            var vertices2 = _this.addImagesBoundaries(_wallsInfo[i].imagesInfo);
            vertices1.push.apply(vertices1, vertices2)
        }
        geometry.vertices = vertices1;
        console.log("geometry.vertices.length: " + geometry.vertices.length);
        var lineSegments = new THREE.LineSegments( geometry, material );
        _scene.add( lineSegments )
    }


    this.findIntersections = function () {
        // BEG from example2_objLoader_raycasting.js
        if(firstTime2)
        {
            theta = 210;

            // _camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
            // _camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
            // _camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
            // _camera.lookAt( _scene.position );
            // 635.6918948146395, y: 1939.0039473649608, z: 379.935574444918
            _camera.position.z = 800;
            _camera.position.x = 1200;
            _camera.position.y = 3800;
            
            _camera.updateMatrixWorld();
            
            console.log("_camera: ");
            console.log(_camera);
            // str = JSON.stringify(_camera, null, 4); // (Optional) beautiful indented output.
            // console.log(str); // Logs output to dev tools console.
            
            firstTime2 = false;
        }
        
        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _scene.children, true );
        
        if ( intersects.length > 0 ) {

            var intersection = intersects[0];
            var faceIndex = intersection.faceIndex / 3;
            var materialIndex1 = Math.floor(faceIndex/2);
            var indexInMaterialIndices = faceIndex;
            var materialIndex = materialIndex1;
            var intersectionObj = intersection.object;

            // geom has "type: "BufferGeometry""
            var geom = intersectionObj.geometry;
            
            var groupIndex = Math.floor(intersection.faceIndex / 6);

            var intersectionUvCoord = intersection.uv;

            if(doEnableOverlayImageBoundaries)
            {
                /////////////////////////////////////////////////////////////
                // Calc the nearest image to the point
                /////////////////////////////////////////////////////////////

                var materialIndex2 = _threedModelAttributes.connectivity[0].materialIndices[indexInMaterialIndices];
                var retVal = _this.calcNearestImage(faceIndex, materialIndex2, intersectionUvCoord);
                var wallIndex = retVal.wallIndex;
                var imageIndex = retVal.imageIndex;
            }

            
            if ( ( intersectionPrev != intersectionObj ) ||
                 ((intersectionPrev != null) && (intersectionPrev.materialIndex != materialIndex)) )
            {

                if ( intersectionPrev  && intersectionPrev.material[intersectionPrev.materialIndex])
                {
                    intersectionPrev.material[intersectionPrev.materialIndex].emissive.setHex( intersectionPrev.currentHex );
                }

                intersectionPrev = intersectionObj;
                if(intersectionPrev.material[materialIndex])
                {
                    intersectionPrev.currentHex = intersectionPrev.material[materialIndex].emissive.getHex();
                }
                intersectionPrev.materialIndex = materialIndex;
                intersectionPrev.material[materialIndex].emissive.setHex( 0xff0000 );

                if(doEnableOverlayImageBoundaries)
                {
                    /////////////////////////////////////////////////////////////////
                    // overlay closest image boundaries on 3d model in blue
                    /////////////////////////////////////////////////////////////////

                    if(!_wallsInfo[wallIndex])
                    {
                        console.log('wallIndex', wallIndex);
                        console.log('undefined _wallsInfo[wallIndex]'); 
                        return;
                    }
                    
                    var imageInfo = _wallsInfo[wallIndex].imagesInfo[imageIndex];

                    // "room1/wall1/IMG_6841.JPG"
                    var fileName = imageInfo.imageFileName;

                    var materialName = _wallsInfo[wallIndex].materialName;
                    // console.log('materialName', materialName);

                    // |room1.*/|
                    // room1/wall1/wall_fused.jpg -> room1/wall1/

                    var reg = /room1.*\//g;
                    
                    var matches = materialName.match(reg);
                    console.log('matches', matches); 
                    var match0 = matches[0];
                    

                    fileName = match0 + imageInfo.imageFileName;
                    // console.log('fileName2', fileName); 

                    var blobs = MLJ.core.Scene.getBlobs();
                    // console.log('blobs', blobs); 
                    
                    console.log('blobs[fileName]', blobs[fileName]); 

                    if(blobs[fileName])
                    {
                        MLJ.core.File.loadTexture2FromFile(blobs[fileName]);
                    }
                    
                    var materialBlue = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 5});
                    _this.overlayWallImageBoundariesOn3dModel(imageInfo, materialBlue);
                }
                
            }
            
        } else {
            // console.log("NOT Found intersections");

            if ( intersectionPrev  && intersectionPrev.material[intersectionPrev.materialIndex])
            {
                intersectionPrev.material[intersectionPrev.materialIndex].emissive.setHex( intersectionPrev.currentHex );
            }
            intersectionPrev = null;
        }
    }

    this.render = function (fromReqAnimFrame) {

        /////////////////////////////////////////////////////////////////
        // find intersections
        /////////////////////////////////////////////////////////////////

        _this.findIntersections();

        // END from example2_objLoader_raycasting.js

        // console.log('scale', scale); 
        // console.log('_scene', _scene); 
        // console.log('_camera', _camera); 
        _renderer.render(_scene, _camera);

        // render the 2D overlays
        _renderer.autoClear = false;
        _renderer.render(_scene2D, _camera2D);
        _renderer.autoClear = true;
        
    };


    this.resetTrackball = function () {
        _controls.reset();
    };


    //INIT
    $(window).ready(function () {
        initScene();
        animate();
    });

    
}).call(MLJ.core.Scene);
