
MLJ.core.Scene = {};
MLJ.core.Scene.timeStamp = 0;

var firstTime2 = true;
var radius = 100, theta = 0;

var intersectionPrev = 0;

var doEnableOverlayImageBoundaries = true;
// doEnableOverlayImageBoundaries = false;

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
    var _selectedImageGeometry;    
    var _selectedImageLineSegments;
    var _blobs = {};
    var _zipFileArrayBuffer;
    var _zipLoaderPromiseObject = -1;
    
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
        console.log('BEG initScene');

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

        _controls.rotateSpeed = 2.0;
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

        $(document).on("MeshFileOpened", function (event, layer) {
            // console.log('Received event "MeshFileOpened"'); 

            if(doEnableOverlayImageBoundaries)
            {
                /////////////////////////////////////////////////////////////////
                // overlay images boundaries on 3d model
                /////////////////////////////////////////////////////////////////

                var materialYellow = new THREE.LineBasicMaterial({color: 0xffff00});
                _this.overlayWallsImagesBoundariesOn3dModel(layer, materialYellow);
            }
            MLJ.core.Scene.addLayer(layer);
        });

        $(document).on("MeshFileReloaded",
                function (event, layer) {
                    // Restore three geometry to reflect the new state of the vcg mesh
                    layer.updateThreeMesh();
                    $(document).trigger("SceneLayerReloaded", [layer]);
                });

        // console.log('END initScene');

        console.log('END initScene');
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
    
    this.selectLayerByName = function (layerName) {
        _selectedLayer = _layers.getByKey(layerName);
        $(document).trigger("SceneLayerSelected", [_selectedLayer]);
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
        console.log('BEG addLayer');
        
        if (!(layer instanceof MLJ.core.Layer)) {
            console.error("The parameter must be an instance of MLJ.core.Layer");
            return;
        }

        // Initialize the THREE geometry used by overlays and rendering params
        layer.initializeRenderingAttributes();
        _group.add(layer.getThreeMesh());
        console.log('_group uuid1', _group);

        //Add new mesh to associative array _layers            
        _layers.set(layer.name, layer);

        console.log('layer.threeMesh.uuid', layer.threeMesh.uuid);
        console.log('layer.threeMesh.parent.uuid', layer.threeMesh.parent.uuid);
        console.log('layer.threeMesh.geometry.uuid', layer.threeMesh.geometry.uuid);
        console.log('layer uuid1', layer);
        console.log('_layers.size()', _layers.size());
        console.log('_layers.getFirst() uuid2', _layers.getFirst());
        
        _selectedLayer = layer;
        
        _computeGlobalBBbox();

        // console.log('Trigger event "SceneLayerAdded"');
        $(document).trigger("SceneLayerAdded", [layer, _layers.size()]);
        _this.render();
        // console.log('END addLayer');
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
        console.log('name', name); 
        // console.log('BEG createLayer'); 
        // var layerName = "MyLayer";
        var layerName = name;
        
        var layer = new MLJ.core.Layer(lastID++, layerName);
        return layer;
    };

    this.removeLayerByName = function (name) {
        var layer = this.getLayerByName(name);

        if (layer !== undefined) {
            //remove layer from list
            _group.remove(layer.getThreeMesh());
            _layers.remove(layer.name);
            $(document).trigger("SceneLayerRemoved", [layer, _layers.size()]);

            if (_layers.size() > 0) {
                _this.selectLayerByName(_layers.getFirst().name);
            } else {
                _this._selectedLayer = undefined;
            }
            _computeGlobalBBbox();
            MLJ.core.Scene.render();
        }
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

    this.calcDistance = function (point1, point2) {
        
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;

        var dist = Math.sqrt( a*a + b*b );
        return dist;
    };
    
    this.calcNearestImage = function (layer, faceIndex, materialIndex, intersectionUvCoord) {
        
        // console.log('materialIndex', materialIndex);
        // console.log('intersectionUvCoord', intersectionUvCoord);
        var minDist = 1E6;
        var wallIndex = -1;
        var imageIndex = -1;
        if(!intersectionUvCoord)
        {
            console.log('intersectionUvCoord', intersectionUvCoord);
            return {wallIndex : -1, imageIndex : -1}
        }

        var wallsInfo = layer.getWallsInfo();

        for (var i = 0; i < wallsInfo.length; ++i) {
            // console.log('wallsInfo[i].materialIndex', wallsInfo[i].materialIndex);

            if(!wallsInfo[i])
            {
                console.log('wallsInfo[i] is not defined');
                continue;
            }
            
            if(materialIndex == wallsInfo[i].materialIndex)
            {
                // console.log('wallsInfo[i].materialName', wallsInfo[i].materialName);
                
                wallIndex = i;
                for (var j = 0; j < wallsInfo[i].imagesInfo.length; ++j) {
                    var imageInfo = wallsInfo[i].imagesInfo[j];

                    var centerPointUvCoordNormalized = imageInfo.centerPoint.uvCoordsNormalized;

                    // console.log('imageInfo.centerPoint.uvCoordsNormalized', imageInfo.centerPoint.uvCoordsNormalized);
                    // centerPointUvCoordNormalized.y = 1 - centerPointUvCoordNormalized.y;
                    // console.log('centerPointUvCoordNormalized.y', centerPointUvCoordNormalized.y);
                    
                    if(!(centerPointUvCoordNormalized))
                    {
                        console.log('centerPointUvCoordNormalized', centerPointUvCoordNormalized);
                        return {wallIndex : -1, imageIndex : -1}
                    }
                    
                    dist = _this.calcDistance(intersectionUvCoord, centerPointUvCoordNormalized);
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
        var imageFilename = imageInfo.imageFilename;
        // console.log('imageFilename: ' + imageFilename);

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

        console.log('BEG overlayWallImageBoundariesOn3dModel'); 
        console.log('imageInfo', imageInfo);
        
        _selectedImageGeometry.vertices = _this.addImageBoundaries(imageInfo);
        _selectedImageGeometry.colorsNeedUpdate = true;
        _selectedImageGeometry.verticesNeedUpdate = true;
        _selectedImageGeometry.needsUpdate = true;

        // console.log("_selectedImageGeometry.vertices.length 2: " + _selectedImageGeometry.vertices.length);

        _selectedImageLineSegments = new THREE.LineSegments( _selectedImageGeometry, material );
        // _selectedImageLineSegments.geometry.vertices = _selectedImageGeometry.vertices;
        // _selectedImageLineSegments.material = material;
        _selectedImageLineSegments.material.needsUpdate = true;

        _scene.add( _selectedImageLineSegments )
        _renderer.render(_scene, _camera);
        
        // _selectedImageLineSegments.geometry.setDrawRange( 0, _selectedImageGeometry.vertices.length );
        // _selectedImageLineSegments.geometry.attributes.position.needsUpdate = true;
        // _selectedImageLineSegments.geometry.dynamic = true;
    };

    this.overlayWallsImagesBoundariesOn3dModel = function (layer, material) {
        console.log('BEG overlayWallsImagesBoundariesOn3dModel');
        
        var vertices1 = [];
        var geometry = new THREE.Geometry();

        var wallsInfo = layer.getWallsInfo();

        console.log('wallsInfo.length'); 
        console.log(wallsInfo.length); 
        for (var i = 0; i < wallsInfo.length; ++i) {
            // console.log('i: ' + i); 
            // console.log('wallsInfo[i]'); 
            // console.log(wallsInfo[i]); 
            var vertices2 = _this.addImagesBoundaries(wallsInfo[i].imagesInfo);
            vertices1.push.apply(vertices1, vertices2)
        }
        geometry.vertices = vertices1;
        console.log("geometry.vertices.length: " + geometry.vertices.length);
        var lineSegments = new THREE.LineSegments( geometry, material );
        _scene.add( lineSegments )
    }

    this.getIntersectionLayer = function (intersectionSceneChildUuid) {

        // console.log('BEG getIntersectionLayer');


        // // find intersection layer - take1
        // for (var i = 0; i < _layers.size(); i++) {
        //     var layer = _layers[i];
        //     if(layer.wallsInfoUuid === intersectionSceneChildUuid)
        //     {
        //         console.log('find intersection layer - take1'); 
        //         return layer;
        //     }
        // }

        // find intersection layer - take2
        // console.log('_layers.size()', _layers.size());
        var iter = _layers.iterator();

        // console.log('intersectionSceneChildUuid', intersectionSceneChildUuid);
        var iterIndex = 0;
        // Iterating over all the layers
        while (iter.hasNext()) {
            // console.log('iterIndex', iterIndex);
            var layer = iter.next();
            var wallsInfoUuid = layer.getWallsInfoUuid();
            // console.log('wallsInfoUuid', wallsInfoUuid);
            
            if(wallsInfoUuid === intersectionSceneChildUuid)
            {
                // console.log('find intersection layer - take2'); 
                return layer;
            }
            iterIndex += 1;
        }
        
        // shouldn't reach here
        console.error("Did not find a layer for the intersection");
        return;
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
            // clone ??
            // console.log('intersection uuid1', intersection); 
            var faceIndex = intersection.faceIndex / 3;
            var materialIndex1 = Math.floor(faceIndex/2);
            var indexInMaterialIndices = faceIndex;
            var materialIndex = materialIndex1;
            var intersectionObj = intersection.object;
            
            if ( intersectionPrev != intersectionObj )
            {
                // floor0
                // { uuid: "EC06450B-6A4D-4AC9-9C83-BA362727B329", name: "", type: "Group

                // floor1
                // { uuid: "D32FBFF9-0040-4EB2-8DC2-DBB0661451FB", name: "", type: "Group",
                
                // compare
                // intersectionObj.parent.uuid vs
                // _scene.children array entries [Type Group] vs
                // object2.uuid
                //  to know which floor
                console.log('_scene.children', _scene.children);
                console.log('intersectionObj.parent.uuid', intersectionObj.parent.uuid);
            }
            
            var intersectionSceneChildUuid = intersectionObj.parent.uuid;
            // console.log('intersectionSceneChildUuid', intersectionSceneChildUuid);
            
            var intersectionLayer = _this.getIntersectionLayer(intersectionSceneChildUuid);
            if(intersectionLayer === undefined)
            {
                console.log('intersectionLayer is undefined');
                return;
            }
            
            // console.log('intersectionLayer', intersectionLayer);
            
            // geom has "type: "BufferGeometry""
            var geom = intersectionObj.geometry;
            
            var groupIndex = Math.floor(intersection.faceIndex / 6);

            var intersectionUvCoord = intersection.uv;

            if(doEnableOverlayImageBoundaries)
            {
                /////////////////////////////////////////////////////////////
                // Calc the nearest image to the point
                /////////////////////////////////////////////////////////////

                var retVal = _this.calcNearestImage(intersectionLayer, faceIndex, materialIndex, intersectionUvCoord);
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

                    var wallsInfo = intersectionLayer.getWallsInfo();
                    
                    if(!wallsInfo[wallIndex])
                    {
                        console.log('wallIndex', wallIndex);
                        console.log('undefined wallsInfo[wallIndex]'); 
                        return;
                    }
                    
                    var imageInfo = wallsInfo[wallIndex].imagesInfo[imageIndex];

                    // e.g. 
                    // "room1/wall1/IMG_6841.JPG"
                    // ./floor0/wall_9/flatten_canvas.resized.jpg
                    
                    // var fileName = imageInfo.imageFilename;
                    // console.log('fileName1', fileName);
                    
                    var materialName = wallsInfo[wallIndex].materialName;
                    // console.log('materialName', materialName);

                    // |room1.*/|
                    // room1/wall1/wall_fused.jpg -> room1/wall1/

                    // var reg = /room1.*\//g;
                    // var matches = materialName.match(reg);
                    // console.log('matches', matches); 
                    // var wallDir = matches[0];
                    
                    // Remove the filename in the directory (e.g. ./floor0/wall_9/flatten_canvas.resized.jpg -> ./floor0/wall_9)
                    //
                    // https://stackoverflow.com/questions/7601674/id-like-to-remove-the-filename-from-a-path-using-javascript?rq=1
                    // '/this/is/a/folder/'
                    // var urlstr = '/this/is/a/folder/aFile.txt';
                    var regexp1 = /[^\/]*$/;
                    var wallDir = materialName.replace(regexp1, '');
                    console.log('wallDir1', wallDir);
                    console.log('materialName2', materialName);


                    console.log('imageInfo'); 
                    console.log(imageInfo); 

                    // // Remove the leading "./" in the directory (e.g. ./floor0/wall_9 -> floor0/wall_9)
                    // var regexp2 = /^\.\//;
                    // wallDir = wallDir.replace(regexp2, '');
                    // console.log('wallDir2', wallDir);
                    // fileName = wallDir + imageInfo.imageFilename;

                    var imageFilename = imageInfo.imageFilename;
                    console.log('imageFilename', imageFilename); 

                    var blobs = MLJ.core.Scene.getBlobs();
                    // console.log('blobs', blobs); 
                    
                    console.log('blobs[imageFilename]', blobs[imageFilename]); 

                    // // REmoveME:
                    // imageFilename = 'floor2/wall_21/IMG_7464.JPG'; 
                    
                    // render the image
                    if(blobs[imageFilename])
                    {
                        console.log('blobs22[' + imageFilename + '] is defined'); 

                        MLJ.core.File.loadTexture2FromFile(blobs[imageFilename]);
                    }
                    else
                    {
                        console.log('blobs22[' + imageFilename + '] is UNDEFINED2'); 
                        console.log('MLJ.core.Scene._zipLoaderPromiseObject', MLJ.core.Scene._zipLoaderPromiseObject);
                        var zipLoaderPromiseObject = MLJ.core.Scene._zipLoaderPromiseObject;
                        console.log('zipLoaderPromiseObject', zipLoaderPromiseObject);
                        
                        console.log('zipLoaderPromiseObject.files[imageFilename].offset', imageFilename, zipLoaderPromiseObject.files[imageFilename].offset);
                        var offsetInReader = zipLoaderPromiseObject.files[imageFilename].offset;
                        
                        if(offsetInReader > 0)
                        {
                            // unzip the image files of specific wall (that were skipped in the initial load)

                            // console.log('MLJ.core.Scene._zipFileArrayBuffer', MLJ.core.Scene._zipFileArrayBuffer); 

                            var doSkipJPG = false;
                            ZipLoader.unzip( MLJ.core.Scene._zipFileArrayBuffer, doSkipJPG, offsetInReader ).then( function ( promiseObject ) {
                                console.log('promiseObject3', promiseObject);
                                promiseObject2 = MLJ.core.File.processFileInZipFile(promiseObject);
                                MLJ.core.File.loadTexture2FromFile(blobs[imageFilename]);
                            });

                            
                        }
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

        // console.log('_controls.isKeyDown', _controls.isKeyDown); 
        // if(_controls.isKeyDown)
        {
            /////////////////////////////////////////////////////////////////
            // find intersections
            /////////////////////////////////////////////////////////////////

            _this.findIntersections();
        }

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
