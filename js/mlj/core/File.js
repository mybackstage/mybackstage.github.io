/**
 * MLJLib
 * MeshLabJS Library
 * 
 * Copyright(C) 2015
 * Paolo Cignoni 
 * Visual Computing Lab
 * ISTI - CNR
 * 
 * All rights reserved.
 *
 * This program is free software; you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation; either version 2 of the License, or (at your option) any later 
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE. See theGNU General Public License 
 * (http://www.gnu.org/licenses/gpl.txt) for more details.
 * 
 */

/**
 * @file Defines the functions to manage files
 * @author Stefano Gabriele
 */

/**
 * MLJ.core.File namespace
 * @namespace MLJ.core.File
 * @memberOf MLJ.core
 * @author Stefano Gabriele
 */
MLJ.core.File = {
    ErrorCodes: {
        EXTENSION: 1
    },
    SupportedExtensions: {
        OFF: ".off",
        OBJ: ".obj",
        PLY: ".ply",
        STL: ".stl",
        ZIP: ".zip"
    }, 

    SupportedSketchfabExtensions: {
        OBJ: ".obj",
        PLY: ".ply",
        STL: ".stl"
    },
    SupportedWebsites: {
        SKF: "Sketchfab"
    }
};

(function () {
    var _this = this;
    var _openedList = new MLJ.util.AssociativeArray();

    function isExtensionValid(extension) {

        switch (extension.toLowerCase()) {
            case ".off":
            case ".obj":
            case ".ply":
            case ".stl":
            case ".zip":
                return true;
        }

        return false;
    }

    var getFileExtention = function (filename2)
    {
        // http://www.jstips.co/en/javascript/get-file-extension/
        var fileExt = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        return fileExt;
    };

    this.loadTextureImage2 = function (textureFileName, onTextureLoaded) {
        // console.log('BEG loadTextureImage2'); 

        //let's create the layer-dependent texture array
        var texture2 = new THREE.TextureLoader().load( textureFileName, function ( texture2 ) {
	    // This anonymous function will be called when the texture2 has finished loading

            // three js THREE.TextureLoader load from blob
            // console.log('blobs["foo1a.png"]', blobs["foo1a.png"]); 
            // console.log('blobs["foo1d.jpg"]', blobs["foo1d.jpg"]); 

            
            // console.log('BEG THREE.TextureLoader().load'); 
            // console.log('texture2.image', texture2.image);
            
            var texWidth = texture2.image.width;
            var texHeight = texture2.image.height;
            var format = THREE.RGBFormat;
            var texComponentsTitle = "RGB";
            
            
            texture2.wrapS = THREE.ClampToEdgeWrapping;
            texture2.wrapT = THREE.ClampToEdgeWrapping;
            
            texture2.needsUpdate = true; //We need to update the texture2
            texture2.minFilter = THREE.LinearFilter;   //Needed when texture2 is not a power of 2

            
            // https://stackoverflow.com/questions/36668836/threejs-displaying-a-2d-image
            var material2 = new THREE.SpriteMaterial( { map: texture2, color: 0xffffff, fog: true } );
            var sprite2 = new THREE.Sprite( material2 );

            texture2 = {
                fileName: textureFileName,
                height: texHeight,
                width: texWidth,
                components: texComponentsTitle,
                format: format,
                data: sprite2
            };
            
            console.log("Loading texture 1 " + textureFileName + " " + texWidth + "x" + texHeight + " " + texComponentsTitle);

            
            onTextureLoaded(true, texture2);


            
            // console.log('END THREE.TextureLoader().load');
	});
        
        // console.log('END loadTextureImage2'); 
    };


    this.loadTextureImage = function (meshFile, onLoaded) {
        // console.log('BEG loadTextureImage'); 

        //let's create the layer-dependent texture array
        meshFile.texture = [];
        var textureIndex = 0;
        var textureName = "foo1a.png";
        
        var texture = new THREE.TextureLoader().load( textureName, function ( texture ) {
	    // This anonymous function will be called when the texture has finished loading
            
            // console.log('BEG THREE.TextureLoader().load'); 
            // console.log('texture.image', texture.image);
            
            var texWidth = texture.image.width;
            var texHeight = texture.image.height;
            var format = THREE.RGBFormat;
            var texComponentsTitle = "RGB";
            
            
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            
            texture.needsUpdate = true; //We need to update the texture
            texture.minFilter = THREE.LinearFilter;   //Needed when texture is not a power of 2

            
            // https://stackoverflow.com/questions/36668836/threejs-displaying-a-2d-image
             var material2 = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } );
            var sprite2 = new THREE.Sprite( material2 );

            meshFile.texture[textureIndex] = {
                fileName: textureName,
                height: texHeight,
                width: texWidth,
                components: texComponentsTitle,
                format: format,
                data: sprite2
            };
            
            textureIndex++;
            console.log("Loading texture " + 0 + " " + textureName + " " + texWidth + "x" + texHeight + " " + texComponentsTitle);

            onLoaded(true, meshFile);
            
            // console.log('END THREE.TextureLoader().load');
	});
        
        // console.log('END loadTextureImage'); 
    };
    
    this.loadZipFile = function (archiveFileName, meshFile, onLoaded) {

        // https://github.com/yomotsu/ZipLoader
        // console.log("BEG loadZipFile");

        // ok
        // var zipLoader = new ZipLoader( 'mesh/3543_W18_shimi_mainHouse.3.reduceVertices.zip' );
        // var zipLoader = new ZipLoader( 'mesh/3543_W18_shimi_mainHouse.4.reduceVertices.zip' );
        
        // console.log("archiveFileName: " + archiveFileName);
        // var zipLoader = new ZipLoader( archiveFileName );
        
        // ok
        // var zipLoader = new ZipLoader( 'mesh/3543_W18_shimi_mainHouse.4.reduceVertices.zip' );

        // ok
        // archiveFileName = 'mesh/3543_W18_shimi.SM.zip';

        // ok
        // archiveFileName = 'mesh/foo1.zip';

        // not ok - [oser of 3 (maybe not in sync with room1 json files, which will eventually get into the .zip file)
        // archiveFileName = 'mesh/3543_W18_shimi.SM2.zip';

        // ok when selecting the file via the "open file" button
        // if file is in /home/avner/avner/meshlabjs/branches/meshlabjs_avnerV1/3543_W18_shimi.SM.zip
        // (but not if the file is in /home/avner/avner/meshlabjs/branches/meshlabjs_avnerV1/mesh/3543_W18_shimi.SM.zip)
        // has to be in the same directory where index.html is ?
        
        console.log("archiveFileName: " + archiveFileName);

        var zipLoader = new ZipLoader( archiveFileName );
        
        zipLoader.on( 'load', function ( e ) {

            console.log( 'Loading file: ', archiveFileName );
            filenames = Object.keys(zipLoader.files);
            console.log( 'filenames: ' );
            console.log( filenames );
            
            // loop over keys
            var blobs = MLJ.core.Scene.getBlobs();
            
            var mtlFileName;
            var objFileName;
            for (var key in filenames)
            {
                filename = filenames[key];
                // console.log( 'filename: ' + filename );

                var fileExtention = getFileExtention(filename);

                switch(fileExtention) {
                    case "":
                        // e.g. skip directory names
                        break;
                    case "jpg":
                    case "JPG":
                        blobs[filename] = zipLoader.extractAsBlobUrl( filename, 'image/jpeg' );
                        // console.log('blobs[filename]', blobs[filename]); 
                        break;
                    case "png":
                        blobs[filename] = zipLoader.extractAsBlobUrl( filename, 'image/png' );
                        // console.log('blobs[filename]', blobs[filename]); 
                        break;
                    case "mtl":
                    case "pto":
                        blobs[filename] = zipLoader.extractAsBlobUrl( filename, 'text/plain' );
                        mtlFileName = filename;
                        break;
                    case "obj":
                        blobs[filename] = zipLoader.extractAsBlobUrl( filename, 'text/plain' );
                        objFileName = filename;
                        break;
                    default:
                        var msgStr = 'fileExtension: ' + fileExtention + 'in .zip file is not supported';
                        console.log( msgStr );
                        return;
                        throw msgStr;
                        break;
                }
            }

            // console.log('blobs', blobs);
            console.log( 'mtlFileName: ' + mtlFileName );
            console.log( 'objFileName: ' + objFileName );

            MLJ.core.Scene.setBlobs(blobs);
            
            var loadingManager = new THREE.LoadingManager();

            // Initialize loading manager with URL callback.
            var objectURLs = [];
            loadingManager.setURLModifier( ( url ) => {
	        url = blobs[ url ];
	        objectURLs.push( url );
	        return url;
            } );
            
            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.setMaterialOptions( {side: THREE.DoubleSide} );
            
	    mtlLoader.load( mtlFileName, function( materials ) {
	        materials.preload();

	        var objLoader = new THREE.OBJLoader(loadingManager);
	        objLoader.setMaterials( materials );

                objLoader.load( objFileName, function ( object ) {
                    object.traverse(function ( child ) {
                        if( child.material ) {
                            child.material.side = THREE.DoubleSide;
                        }
                        if ( child instanceof THREE.Mesh ) {
                            child.geometry.computeBoundingBox();
                            object.bBox = child.geometry.boundingBox;
                        }
                    });
                    object2 = object;
                    MLJ.core.Scene.add( object );

                    _this.loadTextureImage(meshFile, onLoaded);

	        } );

	    });

            MLJ.core.Scene.render();

        } );

        zipLoader.load();

        return 0;
    }
    
    /**
     * Loads 'file' in the virtual file system as an Int8Array and reads it into the layer 'mf'
     */
    this.loadMeshDataFromFile = function (file, mf, onLoaded) {
        // console.log('BEG loadMeshDataFromFile');
        
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onloadend = function (fileLoadedEvent) {
            console.log("Read file " + file.name + " size " + fileLoadedEvent.target.result.byteLength + " bytes");
            // console.timeEnd("Read mesh file");
            var resOpen = -1;
            if (file.name.split('.').pop() === "zip")
            {
                resOpen = _this.loadZipFile(file.name, mf, onLoaded);
            }
        };
        // console.log('END loadMeshDataFromFile');
    }


    
    /**
     * Opens a mesh file or a list of mesh files     
     * @param {(File | FileList)} toOpen A single mesh file or a list of mesh files
     * @memberOf MLJ.core.File
     * @fires MLJ.core.File#MeshFileOpened
     * @author Stefano Gabriele
     */
    this.openMeshFile = function (toOpen) {
        // console.log('BEG openMeshFile'); 
        // console.log('toOpen', toOpen); 

        // console.time("Read mesh file");

        $(toOpen).each(function (key, file) {

            if (!(file instanceof File)) {
                console.error("MLJ.file.openMeshFile(file): the parameter 'file' must be a File instace.");
                return;
            }

            //Add file to opened list
            _openedList.set(file.name, file);
            //Extract file extension
            var pointPos = file.name.lastIndexOf('.');
            var extension = file.name.substr(pointPos);

            //Validate file extension
            if (!isExtensionValid(extension)) {
                console.error("MeshLabJs allows file format '.off', '.ply', '.obj', 'zip' and '.stl'. \nTry again.");
                return;
            }

            var mf = MLJ.core.Scene.createLayer(file.name);

            mf.fileName = file.name;
            
            _this.loadMeshDataFromFile(file, mf, function (loaded, meshFile) {
                if (loaded) {
                    // console.log('Trigger "MeshFileOpened"');
                    
                    // Trigger event to indicate that the mesh file finished openning
                    // (this will cause to add a new layer via addLayer)
                    $(document).trigger("MeshFileOpened", [meshFile]);
                    
                    // console.timeEnd("Parsing Mesh Time");
                    // console.timeEnd("Read mesh file");
                }
            });
            
        });
    };

    this.loadTexture2FromFile = function (fileName) {
        console.log('BEG loadTexture2FromFile');
        console.log('fileName', fileName);

        this.loadTextureImage2(fileName, function (loaded, texture2) {
            if (loaded) {
                // console.log('Trigger "MeshFileOpened"');
                
                // Trigger event to indicate that the texture2 finished openning
                $(document).trigger("Texture2FileOpened", texture2);
                
            }
        });
    };

    /**
     * Reloads an existing layer, that is recovers the file linked to the layer
     * @param {MLJ.core.Layer} mf the MeshFile to be reloaded
     * @memberOf MLJ.core.File
     * @fires MLJ.core.File#MeshFileReloaded
     */
    this.reloadMeshFile = function (mf) {
        var file = _openedList.getByKey(mf.fileName);

        if (file === undefined) {
            console.warn("MLJ.file.reloadMeshFile(name): the scene not contains file '" + name + "'.");
            return;
        }

        _this.loadMeshDataFromFile(file, mf, function (loaded, meshFile) {
            if (loaded) {
                /**
                 *  Triggered when a mesh file is reloaded
                 *  @event MLJ.core.File#MeshFileReloaded
                 *  @type {Object}
                 *  @property {MLJ.core.Layer} meshFile The reloaded mesh file
                 *  @example
                 *  <caption>Event Interception:</caption>
                 *  $(document).on("MeshFileReloaded",
                 *      function (event, meshFile) {
                 *          //do something
                 *      }
                 *  );
                 */
                $(document).trigger("MeshFileReloaded", [meshFile]);
            }
        });
    };


}).call(MLJ.core.File);
