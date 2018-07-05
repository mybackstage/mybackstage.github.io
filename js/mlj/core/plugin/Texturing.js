
var globalIndex = 0;
MLJ.core.plugin.Texturing = function (parameters, defaults) {

    MLJ.core.plugin.Plugin.call(this, parameters.name, parameters);

    var _this = this;
    MLJ.core.setDefaults(_this.getName(), defaults)
    var pane = new MLJ.gui.component.Pane();
    var guiBuilder = new MLJ.core.plugin.GUIBuilder(pane);
    var UID = MLJ.gui.generateUID();
    var texturePane = MLJ.widget.TabbedPane.getTexturePane();

    this._main = function () {    
        _this._init(guiBuilder);
        //The webgl texture canvas wrapper
        // pane.appendContent('<div id="texCanvasWrapper"></div>');
        pane.appendContent('<div class="contain" id="texCanvasWrapper"></div>');
        texturePane.append(pane.$);
        pane.$.hide();
    };


    this.getParam = function (paramKey) {
        return guiBuilder.params.getByKey(paramKey);
    }

    this._setOnParamChange = guiBuilder.setOnParamChange;

    this._setOnParamChange(function (paramProp, value) {
        console.log('BEG Texturing::_setOnParamChange');
        // console.log('value', value);
        
        globalIndex++;
        // console.log('globalIndex', globalIndex); 

        var blobs = MLJ.core.Scene.getBlobs();
        
        // if((globalIndex % 2) === 0)
        // {
        //     console.log('globalIndex is pair');
        //     var textureName = blobs["foo1a.png"];

        //     MLJ.core.File.loadTexture2FromFile(textureName);
        // }
        // else
        // {
        //     console.log('globalIndex is ODD'); 
        //     var textureName = blobs["foo1d.jpg"];

        //     MLJ.core.File.loadTexture2FromFile(textureName);
        // }
        
        // update parameter
        var layer = MLJ.core.Scene.getSelectedLayer();
        if (layer === undefined)
            return;

        //the selectedTexture param is layer-dependent and not texture-dependent
        console.log('paramProp', paramProp); 
        if (paramProp === "selectedTexture") {
            if (value <= layer.texturesNum) //Fix in case the other texture had more texture than the new one
                layer.selectedTexture = value;
            else
                layer.selectedTexture = 0;
        } else {
            console.log('layer.texture', layer.texture);
            console.log('layer.selectedTexture', layer.selectedTexture); 
            console.log('layer.texture[layer.selectedTexture]', layer.texture[layer.selectedTexture]);
            
        }
        if (jQuery.isFunction(paramProp)) { //is 'bindTo' property a function?
            paramProp(value);
        }
    });

    $(document).on("SceneLayerAdded", function (event, layer) {
        //The panel will be shown only when the first mesh is loaded
        //it is the only way to hide
        if (MLJ.core.Scene.getLayers().size() === 1)
            pane.$.show();

        update();
        _this._applyTo(layer, 1, $);
        // console.log('Texturing::END Received event "SceneLayerAdded"'); 
    });

    $(document).on("SceneLayerSelected", function (event, layer) {
        update();
        _this._applyTo(layer, 1, $);
    });

    $(document).on("SceneLayerRemoved", function (event, layer, layersNum) {
        update();
        _this._applyTo(layer, layersNum, $);
    });

    $(document).on("Texture2FileOpened", function (event, texture2) {

        var layer = MLJ.core.Scene.getSelectedLayer();
        if (layer === undefined)
            return;

        layer.texture[0] = texture2;
        console.log('layer.texture[0]', layer.texture[0]);
        
        console.log('Received event "Texture2FileOpened"'); 
        if (MLJ.core.Scene.getLayers().size() === 1)
        {
            pane.$.show();
        }

        update();
        _this._applyTo(layer, 1, $);
    });


    function update() {
        console.log('BEG Texturing::update'); 
    }
};
MLJ.extend(MLJ.core.plugin.Plugin, MLJ.core.plugin.Texturing);
