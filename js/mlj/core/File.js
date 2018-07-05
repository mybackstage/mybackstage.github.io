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

        //let's create the layer-dependent texture array
        var texture2 = new THREE.TextureLoader().load( textureFileName, function ( texture2 ) {
	    // This anonymous function will be called when the texture2 has finished loading
            
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

            console.log('texWidth', texWidth);

            // background-size: contain,
            // object-fit: contain,
            var objectFitVal = "contain";
                // object-fit: objectFitVal,
            
            texture2 = {
                fileName: textureFileName,
                height: texHeight,
                width: texWidth,
                components: texComponentsTitle,
                format: format,
                data: sprite2
            };
            
            console.log("Loading texture 2 " + textureFileName + " " + texWidth + "x" + texHeight + " " + texComponentsTitle);

            
            onTextureLoaded(true, texture2);


            
            // console.log('END THREE.TextureLoader().load');
	});
        
    };


    this.loadTextureImage1 = function (layer, onLoaded) {

        //let's create the layer-dependent texture array
        layer.texture = [];
        var textureIndex = 0;
        var textureName = "foo1a.png";
        console.log('textureName', textureName); 
        
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

            layer.texture[textureIndex] = {
                fileName: textureName,
                height: texHeight,
                width: texWidth,
                components: texComponentsTitle,
                format: format,
                data: sprite2
            };
            
            textureIndex++;
            console.log("Loading texture " + 0 + " " + textureName + " " + texWidth + "x" + texHeight + " " + texComponentsTitle);

            onLoaded(true, layer);
            
            // console.log('END THREE.TextureLoader().load');
	});
        
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

    this.processFileInZipFile = function (promiseObject) {
        filenames = Object.keys(promiseObject.files);

        // loop over keys
        var blobs = MLJ.core.Scene.getBlobs();
        console.log('blobs.length1', Object.keys(blobs).length);
        
        for (var key in filenames)
        {
            filename = filenames[key];
            console.log( 'filename3: ' + filename );

            var fileExtention = getFileExtention(filename);

            switch(fileExtention) {
                case "JPG":
                    blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'image/jpeg' );
                    console.log('blobs[filename]', blobs[filename]); 

                    break;

                default:
                    break;
            }
        }

    };

    this.processZipFiles = function (promiseObject, layer, onLoaded, doSkipJPG) {
        filenames = Object.keys(promiseObject.files);
        console.log( 'filenames: ' );
        console.log( filenames );
        
        // loop over keys
        var blobs = MLJ.core.Scene.getBlobs();
        console.log('blobs.length1', Object.keys(blobs).length);
        

        
        var mtlFileName;
        var objFileName;

        var wallsInfo = [];

        for (var key in filenames)
        {
            filename = filenames[key];
            console.log( 'filename3: ' + filename );

            var fileExtention = getFileExtention(filename);

            switch(fileExtention) {
                case "":
                    // e.g. skip directory names
                    break;
                    // case "zip":
                    //     console.log( 'create layer with name: ' + filename );
                    //     var layer1 = MLJ.core.Scene.createLayer(filename);
                    //     layer1.fileName = filename;
                    
                    //     var zipLoader1 = new ZipLoader( filename );
                    //     console.log('zipLoader1', zipLoader1);
                    
                    //     _this.loadZipFile3(zipLoader1, filename, layer1, onLoaded);
                    //     break;
                case "jpg":
                case "jpeg":
                case "JPG":
                    if(doSkipJPG)
                    {
                        var re1 = /flatten_canvas/;
                        var regex1_matched = filename.match(re1);
                        if(regex1_matched)
                        {
                            console.log('regex1_matched');
                            blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'image/jpeg' );
                        }
                    }
                    else
                    {
                        blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'image/jpeg' );
                    }

                    // console.log('blobs[filename]', blobs[filename]); 
                    break;
                case "mtl":
                    blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'text/plain' );
                    mtlFileName = filename;
                    break;
                case "obj":
                    blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'text/plain' );
                    objFileName = filename;
                    break;
                case "pto":
                    break;
                case "json":
                    blobs[filename] = promiseObject.extractAsBlobUrl( filename, 'text/plain' );

                    // e.g.
                    // floor0/wall_24/wall_image_attributes2.json
                    // console.log( 'filename: ' + filename );

                    var re1 = /wall_image_attributes2/;
                    var regex1_matched = filename.match(re1);
                    if(regex1_matched)
                    {
                        // console.log('regex1_matched');
                        // console.log('filename4', filename); 
                        // console.log('blobs[filename]', blobs[filename]);
                        var wallInfo = _this.loadJson(blobs[filename]);

                        wallsInfo.push(wallInfo);
                    }
                    else
                    {
                        // should not reach here
                        console.error('Found json file that is not wall info');
                    }
                    
                    break;
                default:
                    var msgStr = 'fileExtension: ' + fileExtention + ' in .zip file is not supported';
                    console.log( msgStr );
                    return;
                    throw msgStr;
                    break;
            }
        }

        MLJ.core.Scene.setBlobs(blobs);
        console.log('blobs.length2', Object.keys(blobs).length);

        if(objFileName === undefined)
        {
            console.log('objFileName is undefined');
            return 0;
        }

        console.log('wallsInfo4', wallsInfo);
        console.log('layer.name4', layer.name);
        
        layer.setWallsInfo(wallsInfo);
        
        // console.log('blobs', blobs);
        console.log( 'mtlFileName: ' + mtlFileName );
        console.log( 'objFileName: ' + objFileName );

        var loadingManager = new THREE.LoadingManager();

        // Initialize loading manager with URL callback.
        var objectURLs = [];
        loadingManager.setURLModifier( ( url ) => {
            // console.log('url1', url); 
            if(!blobs[ url ])
            {
                url = url.replace(/\.\//i, '');
                // console.log('url3', url); 
            }

	    url = blobs[ url ];
            // console.log('url2', url); 
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
                console.log('object.uuid', object.uuid);
                MLJ.core.Scene.add( object );
                
                layer.setWallsInfoUuid(object.uuid);

                // _this.loadTextureImage1(layer, onLoaded);
                layer.texture = [];
                onLoaded(true, layer);
                
	    } );

	});

        MLJ.core.Scene.render();

        console.log('END this.processZipFiles');         
        return promiseObject;
    };

    this.loadZipFile = function (arrayBuffer, layer, onLoaded, doSkipJPG) {
        console.log('BEG loadZipFile');

        ZipLoader.unzip( arrayBuffer, doSkipJPG ).then( function ( promiseObject ) {
            console.log('promiseObject', promiseObject);
            MLJ.core.Scene._zipLoaderPromiseObject = _this.processZipFiles(promiseObject, layer, onLoaded, doSkipJPG);
            console.log('MLJ.core.Scene._zipLoaderPromiseObject', MLJ.core.Scene._zipLoaderPromiseObject);
            
        });
    };

    
    /**
     * Loads 'file' in the virtual file system as an Int8Array and reads it into the layer 'layer'
     */
    this.loadMeshDataFromFile = function (file, layer, onLoaded) {
        console.log('BEG loadMeshDataFromFile'); 

        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onloadend = function (fileLoadedEvent) {
            console.log("Read file " + file.name + " size " + fileLoadedEvent.target.result.byteLength + " bytes");
            // console.timeEnd("Read mesh file");
            var resOpen = -1;
            if (file.name.split('.').pop() === "zip")
            {
                var doSkipJPG = true;
                console.log("file.name: " + file.name);

                MLJ.core.Scene._zipFileArrayBuffer = fileLoadedEvent.target.result;
                resOpen = _this.loadZipFile(MLJ.core.Scene._zipFileArrayBuffer, layer, onLoaded, doSkipJPG);
            }
        };


    }

    
    /**
     * Opens a mesh file or a list of mesh files     
     * @param {(File | FileList)} toOpen A single mesh file or a list of mesh files
     * @memberOf MLJ.core.File
     * @fires MLJ.core.File#MeshFileOpened
     * @author Stefano Gabriele
     */
    this.openMeshFile = function (toOpen) {
        console.log('BEG openMeshFile'); 
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

            var layer = MLJ.core.Scene.createLayer(file.name);
            layer.fileName = file.name;
            _this.loadMeshDataFromFile(file, layer, function (loaded, layer) {
                if (loaded) {
                    console.log('Trigger "MeshFileOpened"');
                    console.log('layer.name', layer.name); 

                    // Trigger event to indicate that the mesh file finished openning
                    // (this will cause to add a new layer via addLayer)
                    $(document).trigger("MeshFileOpened", [layer]);
                    
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


}).call(MLJ.core.File);
