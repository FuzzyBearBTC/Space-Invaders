"use strict";

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* kutsuttava funktio */ callback, /* elementti */ element){
        window.setTimeout(callback, 1000 / 60);
    };
})();  

var engine = (function() {
    var player = new Player();
    var score = new Score();
    var playerMissile;
    var invaderMissiles = [];
    
    var movement = {};
    var shootMissile = false;
    
    var gameOver = false;
    
    var walls = new MuuriVarasto();
    var invaders = new InvaderList();
    var invaderDirection = true; // jos true, muukalaiset liikkuvat oikealle, muuten vasemmalle
    
    function input() {
//        otetaan liikkeet ja toiminta talteen
        movement = keyhandler.getMovement();
        shootMissile = keyhandler.getAction();
    }

    // k�sitell��n pelaajan sy�tteet ja tietokoneen toiminta (tito) t��ll�
    function logic() {
        if (player.getLives() < 1 || invaders.getInvaders().length < 1)
            gameOver = true;
        
        playerLogic();
        playerMissileLogic();
        invadersLogic();
        invadersMissileLogic();
            
    }

    function endGame(context) {
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(180, 265, 180, 33);
        context.font = "bold 30px Courier New";
        context.fillStyle = "rgb(255,255,255)";
        context.fillText("GAME OVER", 190, 290);
    }
    
    function invadersLogic() {
        // kosketetaan sein�� => rivi alemmas ja suunnanvaihdos
        if (invaders.tormaakoSeinaan()) {
            if (invaderDirection)
                invaders.siirra(-1,25);
            else
                invaders.siirra(1,25);
            
            invaderDirection = !invaderDirection;
        } else if (!invaders.tormaakoSeinaan()) {
            if (invaderDirection)
                invaders.siirra(0.3,0);
            else
                invaders.siirra(-0.3,0);
        }
    }
    
    // suoritetaan pelaajaan liittyv� logiikka
    function playerLogic() {
        // onko liikkuminen ok
        if (player.tormaakoSeinaan()) {
            if (player.getX() > 514 && movement[0] < 0)
                player.siirra(movement[0]);
            else if (player.getX() < 0 && movement[0] > 0) // jos ollaan kiinni sein�ss�, mutta liikutaan poisp�in siit�, sallitaan liike
                player.siirra(movement[0]);
        }
        else if (!player.tormaakoSeinaan())
            player.siirra(movement[0]);
    }
    
    // ohjuksen logiikka
    function playerMissileLogic() {
        // vain yksi pelaajan ohjus saa olla kent�ll�
        if (shootMissile && playerMissile == null)
            playerMissile = player.ammu();
        
        if (playerMissile != null) {
            if (walls.tormaako(playerMissile) || invaders.tormaako(playerMissile, score)) // jos ohjus t�rm�� johonkin tai katoaa ruudulta, poistetaan se
                playerMissile = null;
            else if (playerMissile.getY() < 70)
                playerMissile = null;
            else 
                playerMissile.siirra(-10);
        }
    }
    
    function invadersMissileLogic() {
        $.each(invaders.getInvaders(), function(index, invader) {
            if (Math.random() < 0.002 && index > 43)
                invaderMissiles.push(invader.ammu());
        });
        
        // siirret��n ohjuksia / meneek� ohjukset ruudun ulkopuolelle
        if (invaderMissiles.length > 0) {
            for (var i=0; i < invaderMissiles.length; ++i) {
                var missile = invaderMissiles[i];
                
                if (player.tormaako(missile) || walls.tormaako(missile)) {
                    invaderMissiles.splice(i,1);
                    --i;
                } else if (missile.getY() > 535) {
                    invaderMissiles.splice(i, 1);
                    --i;
                } else
                    missile.siirra(1);
            }
        }
    }
    
    function render() {
        // get context and clear
        var context = $("#spaceinvaders")[0].getContext("2d");
        context.clearRect(0, 0, 540, 580);
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0,0,540,580);

        renderPlayer(context);
        
        if (playerMissile != null)
            playerMissile.piirra(context);
        
        if (invaderMissiles.length > 0) {
            $.each(invaderMissiles, function(index, missile) {
                missile.piirra(context);
            });
        }
        
        walls.piirra(context);
        renderInvaders(context);
        renderHUD(context);
        
        if (gameOver)
            endGame(context);
    }
    
    function renderHUD(context) {
        context.lineWidth = 2;
        context.strokeStyle = "rgb(0,255,0)";
        context.moveTo(0,540);
        context.lineTo(540, 540);
        context.stroke();
        
        var playerImg = player.getImg();
        var xLocation = 50;
        for (var i=0; i < player.getLives(); ++i) {
            context.drawImage(playerImg,0,12,80,72,xLocation,550,25,25);
            xLocation += 30;
        }
        
        context.font = "20px Courier New";
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillText(player.getLives()+"x", 20, 570);
        context.fillText("SCORE", 20,30);
        context.fillText(score.getScore(), 20, 50);
    }
    
    function renderInvaders(context) {
        invaders.piirra(context);
    }
    
    function renderPlayer(context) {
        if (movement[0] == -2)
            var srcX = 147;
        else if (movement[0] == 2)
            srcX = 78;
        else 
            srcX = 0;
        
        player.piirra(context, srcX);
    }
    
    function tick() {
        engine.input();
        engine.logic();
        engine.render();
        
        if (!gameOver)
            requestAnimFrame(engine.tick);
    }
    
    return {
        input: input,
        logic: logic,
        render: render,
        tick: tick
    };
    
})();

$(document).ready(function() {
    
    $(document).keydown(function(eventInformation) {
        keyhandler.keydown(eventInformation.which);
    });
    
    $(document).keyup(function(eventInformation) {
        keyhandler.keyup(eventInformation.which);
    });
    
    engine.tick();
});
