'use strict';

// tiilien x ja y-koordinaatit jokaista nelj�� muuria varten
var wallData = [
    [[70, 455],
    [110, 455],
    [70, 435],
    [110, 435],
    [85, 435],
    [100, 435]],

    [[180, 455],
    [220, 455],
    [180, 435],
    [220, 435],
    [195, 435],
    [210, 435]],

    [[290, 455],
    [330, 455],
    [290, 435],
    [330, 435],
    [305, 435],
    [320, 435]],

    [[400, 455],
    [440, 455],
    [400, 435],
    [440, 435],
    [415, 435],
    [430, 435]]
];

// pelimoottorilla on lista muureista
function WallManager() {
    var walls = [];
    
    $.each(wallData, function(index, data) {
        var wall = new Wall(data);
        walls.push(wall);
    });
    
    function draw(context) {
        for (var i=0; i < walls.length; ++i) {
            walls[i].draw(context);
        }
    }
    
    function tormaako(missile) {
        for (var i=0; i < walls.length; ++i) {
            if (walls[i].tormaako(missile))
                return true;
        }
    
        return false;
    }
    
    return {
        draw: draw,
        tormaako: tormaako
    };
}

// wall protecting the player
function Wall(wallData) {
    var tiles = new Array();
    
    $.each(wallData, function(index, coordinates) {
        var tile = new Tile(coordinates[0], coordinates[1]);
        tiles.push(tile);
    });

    
    function draw(context) {
        for (var i=0; i < tiles.length; ++i) {
            tiles[i].draw(context);
        }
    }
    
    function getTiles() {
        return tiles;
    }
    
    // checks if random object hits the wall and removes single tile based on
    // where the wall was hit
    function tormaako(object) {
        for (var i=0; i < tiles.length; ++i) {
            if (tiles[i].tormaako(object)) {
                removeTile(i);
                return true;
            }
        }
        return false;
    }
    
    function removeTile(index) {
        tiles.splice(index, 1);
    }
    
    return {
        draw: draw,
        getTiles: getTiles,
        tormaako: tormaako
    };
}

Tile.prototype = new Drawable();
Tile.prototype.constructor = Tile;

// wall consists of tiles
function Tile(x,y) {
    
    Drawable.call(this,x,y,15,20);
    
    Tile.prototype.draw = function(context) {
        context.fillStyle = "rgb(0,255,0)";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}