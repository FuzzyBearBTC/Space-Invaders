// yksitt�isen muukalaisen koordinaatit per rivi
var invaderData = [
    
    // 1. rivi    
    [60, 135,0], // 0
    [100, 135,0],
    [140, 135,0],
    [180, 135,0],
    [220, 135,0],
    [260, 135,0],
    [300, 135,0],
    [340, 135,0],
    [380, 135,0],
    [420, 135,0],
    [460, 135,0],

    // 2. rivi
    [60, 160,1], // 11
    [100, 160,1],
    [140, 160,1],
    [180, 160,1],
    [220, 160,1],
    [260, 160,1],
    [300, 160,1],
    [340, 160,1],
    [380, 160,1],
    [420, 160,1],
    [460, 160,1],

    // 3. rivi
    [60, 185,2], // 22
    [100, 185,2],
    [140, 185,2],
    [180, 185,2],
    [220, 185,2],
    [260, 185,2],
    [300, 185,2],
    [340, 185,2],
    [380, 185,2],
    [420, 185,2],
    [460, 185,2],

    // 4. rivi
    [60, 210,3],
    [100, 210,3],
    [140, 210,3],
    [180, 210,3],
    [220, 210,3],
    [260, 210,3],
    [300, 210,3],
    [340, 210,3],
    [380, 210,3],
    [420, 210,3],
    [460, 210,3],

    // 5. rivi
    [60, 235,4],
    [100, 235,4],
    [140, 235,4],
    [180, 235,4],
    [220, 235,4],
    [260, 235,4],
    [300, 235,4],
    [340, 235,4],
    [380, 235,4],
    [420, 235,4],
    [460, 235,4]
];

function InvaderList() {
    var invaders = new Array();
    
    $.each(invaderData, function(index, data) {
        var invader = new Invader(data[0], data[1], data[2]);
        invaders.push(invader);
    });
    
    function siirra(x,y) {
        $.each(invaders, function(index, invader) {
            invader.siirra(x,y);
        });
    }
    
    function piirra(context) {
        for (var i=0; i < invaders.length; ++i) {
            var row = invaders[i].getRow(); // oikea kuva p��tell��n invaderin sijaitseman rivin perusteella
            var sprite = getSprite(row);
            invaders[i].piirra(context, sprite);
        }
    }
    
    function getSprite(row) {
        if (row == 0)
            return sprite = [1,4,30,25]; // srcX, srcY, width, height
        else if (row == 1 || row == 2)
            return sprite = [70,4,30,25];
        else
            return sprite = [176,4,30,25];
            
    }
    
    // jos johonkin invaderiin osuu ohjus, poistetaan se listalta
    function tormaako(ohjus) {
        for (var i=0; i < invaders.length; ++i) {
            if (invaders[i].tormaako(ohjus)) {
                poistaInvader(i);
                return true;
            }
        }
    
        return false;
    }
    
    function getInvaders() {
        return invaders;
    }
    
    function tormaakoSeinaan() {
        for (var i=0; i < invaders.length; ++i) {
            if (invaders[i].tormaakoSeinaan())
                return true;
        }
    
        return false;
    }
    
    function poistaInvader(index) {
        invaders.splice(index, 1);
    }
    
    return {
        piirra: piirra,
        tormaako: tormaako,
        tormaakoSeinaan: tormaakoSeinaan,
        siirra: siirra,
        getInvaders: getInvaders
    };
}

// sijainti ja monennella rivill� invader on
function Invader(x,y,row) {
    var leveys = 25;
    var korkeus = 20;
    
    var img = new Image();
    img.src = "invaders.png";
    
    function siirra(dx, dy) {
        x += dx;
        y += dy;
    }
    
    function piirra(context, sprite) {
        context.drawImage(img, sprite[0], sprite[1], sprite[2], sprite[3], x,y,leveys,korkeus);
    }
    
    function tormaakoSeinaan() {
        if (x > 514 || x < 0)
            return true;
        
        return false;
    }
    
    function tormaako(ohjus) {
        if (intersects(x,y,25,25, ohjus.getX(), ohjus.getY(), 3, 5))
            return true;
        else
            return false;
    }
    
    function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
        w2 += x2-1;
        w1 += x1-1;
        if (x2 > w1 || x1 > w2) return false;
        h2 += y2-1;
        h1 += y1-1;
        if (y2 > h1 || y1 > h2) return false;
        return true;
    }
    
    function ammu() {
        return new Ohjus(x+10, y+5);
    }
    
    function getX() {
        return x;
    }
    
    function getY() {
        return y;
    }
    
    function getRow() {
        return row;
    }
    
    return {
        getX: getX,
        getY: getY,
        getRow: getRow,
        siirra: siirra,
        piirra: piirra,
        tormaakoSeinaan: tormaakoSeinaan,
        tormaako: tormaako,
        ammu: ammu
    };
}