// yksitt�isen muukalaisen koordinaatit per rivi
var invaderData = [
    
    // x-coordinate, y-coordinate, row, column
    
    // 1. rivi    
    [60, 135,0,0], // 0
    [100, 135,0,1],
    [140, 135,0,2],
    [180, 135,0,3],
    [220, 135,0,4],
    [260, 135,0,5],
    [300, 135,0,6],
    [340, 135,0,7],
    [380, 135,0,8],
    [420, 135,0,9],
    [460, 135,0,10],

    // 2. rivi
    [60, 160,1,0], // 11
    [100, 160,1,1],
    [140, 160,1,2],
    [180, 160,1,3],
    [220, 160,1,4],
    [260, 160,1,5],
    [300, 160,1,6],
    [340, 160,1,7],
    [380, 160,1,8],
    [420, 160,1,9],
    [460, 160,1,10],

    // 3. rivi
    [60, 185,2,0], // 22
    [100, 185,2,1],
    [140, 185,2,2],
    [180, 185,2,3],
    [220, 185,2,4],
    [260, 185,2,5],
    [300, 185,2,6],
    [340, 185,2,7],
    [380, 185,2,8],
    [420, 185,2,9],
    [460, 185,2,10],

    // 4. rivi
    [60, 210,3,0], // 33
    [100, 210,3,1],
    [140, 210,3,2],
    [180, 210,3,3],
    [220, 210,3,4],
    [260, 210,3,5],
    [300, 210,3,6],
    [340, 210,3,7],
    [380, 210,3,8],
    [420, 210,3,9],
    [460, 210,3,10],

    // 5. rivi
    [60, 235,4,0], // 44
    [100, 235,4,1],
    [140, 235,4,2],
    [180, 235,4,3],
    [220, 235,4,4],
    [260, 235,4,5],
    [300, 235,4,6],
    [340, 235,4,7],
    [380, 235,4,8],
    [420, 235,4,9],
    [460, 235,4,10]
];

// 11 different columns, only 1 invader from 1 column can shoot 1 missile
var invaderColumnShot = [
    [false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false]
];

function InvaderManager() {
    var invaders = new Array();
    var numOfInvaders = 55;
    var invaderMissiles = [];
    var invadersSpeed = 3;
    
    var frameTime = 0.5; // vaihdetaan sprite-animaatiota 1 sekunnin v�lein
    var lastUpdateTime = 0;
    
    var directionRight = true;
    
    // invaderit on lueteltu sarakeittain
    $.each(invaderData, function(index, data) {
        var invader = new Invader(data[0], data[1], data[2], data[3]);
        var realIndex = (index % 11);
        
        if (!invaders[realIndex])
            invaders[realIndex] = [];
        
        var sprite = getSprite(data[2]);
        invader.createAnimation(sprite);
        invaders[realIndex].push(invader);
    });
    
//    // after certain time, change invaders' sprite
    function changeSprite() {
        var currentTime = new Date().getTime() / 1000;
        
        if ((currentTime - lastUpdateTime) > frameTime) {
            
            if (directionRight)
                siirra(invadersSpeed,0);
            else
                siirra(-invadersSpeed,0);
            
            for (var i=0; i < invaders.length; ++i) {
                for (var j=0; j < invaders[i].length; ++j) {
                    
                    invaders[i][j].animate();
                    lastUpdateTime = currentTime;
                }
            }
        }
    }
    
    function siirra(x,y) {
        $.each(invaders, function(index, invader) {
            for (var i=0; i < invader.length; ++i) {
                invader[i].siirra(x,y);
            }
        });
    }
    
    function piirra(context) {
        changeSprite();
        
        for (var i=0; i < invaders.length; ++i) {
            for (var j=0; j < invaders[i].length; ++j) {
                invaders[i][j].piirra(context);
            }
        }
    }
    
    function getSprite(row) {
        if (row == 0)
            return sprite = [0,4,30,25]; // srcX, srcY, width, height
        else if (row == 1 || row == 2)
            return sprite = [69,4,30,25];
        else
            return sprite = [143,4,30,25];     
    }
    
    // jos johonkin invaderiin osuu ohjus, vaihdetaan sen sprite r�j�hdykseen
    function tormaako(ohjus, score) {
        for (var column=0; column < invaders.length; ++column) {
            for (var row=0; row < invaders[column].length; ++row) {
                
                var invader = invaders[column][row];
                // check collision only if invader hasn't already collided
                if (!invader.hasCollided() && invader.tormaako(ohjus)) {
                    
                    score.raiseScore(invader.getRow()); // tuhottiin otus, kasvatetaan siis pisteit�
                    invader.explode(); // osuttiin joten invader r�j�ht��
                    deleteInvaderAfterExplosion(column,row);
                    
                    return true;
                }
            }
        }
        return false;
    }
    
    function tormaakoMuuriin(walls) {
        for (var column=0; column < invaders.length; ++column) {
            for (var row=0; row < invaders[column].length; ++row) {
                var invader = invaders[column][row];
                // check collision only if invader hasn't already collided
                if (!invader.hasCollided() && walls.tormaako(invader)) {
                    invader.explode(); // osuttiin joten invader r�j�ht��
                    deleteInvaderAfterExplosion(column,row);
                }
            }
        }
    }
    
    // after invader has been hit, he is allowed to explode (& live) for 100 milliseconds
    function deleteInvaderAfterExplosion(column, row) {
        setTimeout(function() {
            increaseSpeed();
            poistaInvader(column,row);
            --numOfInvaders;
        }, 100);
    }
    
    function shootLogic() {
        for (var column = 0; column < invaders.length; ++column) {
            if (!invaderColumnShot[column]) {
                if (shoot(invaders[column]))
                    invaderColumnShot[column] = true;
            }
        }
        
        return invaderMissiles;
    }
    
    function shoot(column) {
        
        // jos koko vihollissarake tuhottu, ei jatketa
//        if (column.length > 0) {
//            if (Math.random() < 0.01) {
//                invaderMissiles.push(column[column.length-1].ammu());
//                return true;
//            }
//        }
        
        return false;
    }
    
    
    function getNumOfInvaders() {
        return numOfInvaders;
    }
    
    function getInvaders() {
        return invaders;
    }
    
    function tormaakoSeinaan() {
        for (var i=0; i < invaders.length; ++i) {
            for (var j=0; j < invaders[i].length; ++j) {
            if (invaders[i][j].tormaakoSeinaan()) {
                directionRight = !directionRight;
                return true;
            }
            }
        }
    
        return false;
    }
    
    function poistaInvader(row, column) {
        invaders[row].splice(column, 1);
    }
    
    function increaseSpeed() {
        invadersSpeed += 0.06;
        frameTime -= 0.009;
    }
    
    function getSpeed() {
        return invadersSpeed;
    }
    
    return {
        getSpeed: getSpeed,
        piirra: piirra,
        tormaako: tormaako,
        tormaakoSeinaan: tormaakoSeinaan,
        tormaakoMuuriin: tormaakoMuuriin,
        siirra: siirra,
        getInvaders: getInvaders,
        getNumOfInvaders: getNumOfInvaders,
        shootLogic: shootLogic
    };
}

Invader.prototype = new Drawable();
Invader.prototype.constructor = Invader;

// sijainti ja monennella rivill� ja sarakkeella invader on
function Invader(x,y,row,column) {
    
    Drawable.call(this,x,y,25,20,column,row);

    this.sprite = [];
    this.collision = false;
    
    // sprite variables
    this.img = new Image();
    this.img.src = "img/invaders3.png";
    this.animation = {};
    
    Invader.prototype.piirra = function(context) {
        this.animation.draw(context, this.x, this.y, this.width, this.height)
//        context.drawImage(img, sprite[0], sprite[1], sprite[2], sprite[3], x,y,leveys,korkeus);
    }
    
    Invader.prototype.tormaakoSeinaan = function() {
        if (this.x > 514 || this.x < 0)
            return true;
        
        return false;
    }
    
    Invader.prototype.tormaako = function(ohjus) {   
//        if (img.src.indexOf("kaboom.png") != -1) // invader has been already hit because it's exploding, cannot be hit anymore
//            return false;
        
        if (intersects(this.x,this.y,25,25, ohjus.getX(), ohjus.getY(), ohjus.getWidth(), ohjus.getHeight()))
            return true;
        else
            return false;
    }
    
    function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
        w2 += x2;
        w1 += x1;
        if (x2 > w1 || x1 > w2) return false;
        h2 += y2;
        h1 += y1;
        if (y2 > h1 || y1 > h2) return false;
        return true;
    }
    
    Invader.prototype.createAnimation = function(invaderSprite) {
        this.sprite = invaderSprite;
        this.animation = new Animation(this.img, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3]);
    }
    
    Invader.prototype.animate = function() {
        this.animation.next(32, this.sprite[0]);
    }
    
    Invader.prototype.ammu = function() {
        return new Ohjus(this.x+10, this.y+5, this.column);
    }
    
    Invader.prototype.hasCollided = function() {
        return this.collision;
    }
    
    Invader.prototype.explode = function() {
        this.img.src = "img/kaboom.png"; // vaihdetaan kuva r�j�hdykseen
        this.animation = new Animation(this.img, 0,0,34,23); // animaatio vaihtuu my�s
        this.collision = true;
    }
}