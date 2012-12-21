'use strict';

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
    var score = new ScoreManager();
    var walls = new WallManager();
    var invaders = new InvaderManager();
    
    var level = 1;
    
    var playerMissile;
    var invaderMissiles = [];
    
    var movement;
    var shootMissile = false;
    
    var gameOver = false;
    
    function input() {
        movement = keyhandler.getMovement();
        shootMissile = keyhandler.getAction();
    }

    // k�sitell��n pelaajan sy�tteet ja tietokoneen toiminta (tito)
    function logic() {
        if (player.lives < 1 || invaders.getNumOfInvaders() < 1)
            gameOver = true;
        
        $.each(invaders.getInvaders(), function(index, invader) {
            for (var i=0; i < invader.length; ++i) {
                if (invader[i].getY() > 460) {
                    player.lives = 0;
                    gameOver = true;
                    return;
                }
            }
        });
        
        if (gameOver)
            return;
        
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
        context.fillText("GAME OVER", 190, 280);
        
        renderScoreList(context);
        
        $("#spaceinvaders").on('click.endGame', function(eventInfo) {
            $("#spaceinvaders").off('click.endGame');
            resetData();
            menu();
        });
    }
    
    function renderScoreList(context) {
        if (gameOver)
            score.update();
        
        score.showScores(context);
    }
    
    function playerLogic() {
        // onko liikkuminen ok
        if (player.tormaakoSeinaan()) {
            if (player.getX() > 514 && movement < 0)
                player.siirra(movement, 0);
            else if (player.getX() < 0 && movement > 0) // jos ollaan kiinni sein�ss�, mutta liikutaan poisp�in siit�, sallitaan liike
                player.siirra(movement, 0);
        }
        else if (!player.tormaakoSeinaan())
            player.siirra(movement, 0);
    }
    
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
                playerMissile.siirra(0,-10);
        }
    }
    
    function invadersLogic() {
        invaders.update(walls);
    }
    
    function invadersMissileLogic() {
        invaderMissiles = invaders.shootLogic();
        
        // siirret��n ohjuksia / meneek� ohjukset ruudun ulkopuolelle
        if (invaderMissiles.length > 0) {
            for (var i=0; i < invaderMissiles.length; ++i) {
                var missile = invaderMissiles[i];
                
                if (player.tormaako(missile)) {
                    player.lives -= 1;
                    invaderColumnShot[missile.getColumn()] = false;
                    invaderMissiles.splice(i,1);
                    --i;
                    
                } else if (walls.tormaako(missile) || missile.getY() > 535) {
                    invaderColumnShot[missile.getColumn()] = false;
                    invaderMissiles.splice(i,1);
                    --i;
                } else
                    missile.siirra(0,1);
            }
        }
    }
    
    function render() {
        var context = $("#spaceinvaders")[0].getContext("2d");
        context.clearRect(0, 0, 540, 580); // clear canvas
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0,0,540,580);

        renderPlayer(context);
        renderMissiles(context);
        walls.piirra(context);
        renderInvaders(context);
        renderHUD(context);
        renderScore(context);
        
        if (gameOver) {
            if (player.lives > 0)
                newGame(context);
            else
                endGame(context);
        }
        
        context = null;
    }
    
    // start new game with increased difficulty after 3 seconds
    // if player still has lives
    function newGame(context) {
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(180, 265, 180, 33);
        context.font = "20px Courier New";
        context.fillStyle = "rgb(255,255,255)";
        context.fillText("CONGRATULATIONS!", 178, 250);
        context.fillText("Proceeding to the next level...", 80, 280);
        
        setTimeout(function() {
            resetData();
            ++level;
            
            invaders.setSpeed(3+(level/10));
            if (level % 3 == 0)
                invaders.setChance(0.01+(level/50));
            
            tick();
        }, 3000);
    }
    
    function resetData() {
        if (player.lives < 1)
            player = new Player();
        
        invaders = new InvaderManager();
        walls = new WallManager();
        playerMissile = null;
        invaderMissiles = null;
        spritemanager.resetFrametime();
        shootMissile = false;
        gameOver = false;
    }
    
    // player lives & current level
    function renderHUD(context) {
        context.lineWidth = 2;
        context.strokeStyle = "rgb(0,255,0)";
        
        context.beginPath();
        context.moveTo(0,540);
        context.lineTo(540, 540);
        context.stroke();
        
        var playerImg = player.getImg();
        var xLocation = 50;
        for (var i=0; i < player.lives; ++i) {
            context.drawImage(playerImg,0,12,80,72,xLocation,550,25,25);
            xLocation += 30;
        }
        
        context.font = "20px Courier New";
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillText(player.lives+"x", 20, 570);
        
        context.fillText("LEVEL", 340, 30);
        context.fillText(level, 340, 50);
    }
    
    // current score and high score
    function renderScore(context) {
        context.fillText("SCORE", 20,30);
        context.fillText(score.getScore(), 20, 50);
        context.fillText("HIGH SCORE", 140, 30);
        context.fillText(score.getHighScore(), 140,50);
    }
    
    function renderInvaders(context) {
        invaders.piirra(context);
    }
    
    function renderPlayer(context) {
        if (movement == -2)
            var srcX = 147;
        else if (movement == 2)
            srcX = 78;
        else 
            srcX = 0;

        player.piirra(context, srcX);
    }
    
    function renderMissiles(context) {
        if (playerMissile != null)
            playerMissile.piirra(context);
        
        if (invaderMissiles.length > 0) {
            $.each(invaderMissiles, function(index, missile) {
                missile.piirra(context);
            });
        }
    }

    function tick() {
        engine.input();
        engine.logic();
        engine.render();
        
        if (!gameOver)
            requestAnimFrame(engine.tick);
    }
    
    function menu() {
        var context = $("#spaceinvaders")[0].getContext("2d");
        context.clearRect(0,0,540,580);
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0,0,540,580);
        
        context.fillStyle = "rgb(255,255,255)";
        context.font = "bold 30px Courier New";
        context.fillText("START GAME", 180, 270);
        
        context.fillText("HIGH SCORES", 180, 320);
        
        var logo = new Image();
        logo.src = "img/logo.png";

        var menuImg = new Image();
        menuImg.src = "img/invaderlogo4.png";
        var menuImg2 = new Image();
        menuImg2.src = "img/invaderlogo5.png";
        
        menuImg2.onload = function() {
            context.drawImage(logo, 51, 20);
            context.drawImage(menuImg, 20, 300);
            context.drawImage(menuImg2, 30, 470);
            context = null;
        };
        
    
        $("#spaceinvaders").on('click.menu', function(eventInfo) {
            var x = Math.floor((eventInfo.pageX-$(this).offset().left));
            var y = Math.floor((eventInfo.pageY-$(this).offset().top));

            if ( (x >= 176 && x <= 361) && (y >= 251 && y <= 273)) {
                $("#spaceinvaders").off('click.menu');
                score = new ScoreManager();
                engine.tick();
            } else if ((x >= 176 && x <= 379) && (y >= 299 && y <= 322)) {
                $("#spaceinvaders").off('click.menu');
                engine.highscore();
            }
        });
    }
    
    function highscore() {
        var context = $("#spaceinvaders")[0].getContext("2d");

        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0,250,540,580);
        context.fillStyle = "rgb(255,255,255)";
        
        renderScoreList(context);
        
        $("#spaceinvaders").on('click.highscore', function(eventInfo) {
            $("#spaceinvaders").off('click.highscore');
            menu();
        });
    }
    
    return {
        input: input,
        logic: logic,
        render: render,
        tick: tick,
        menu: menu,
        highscore: highscore
    };
    
})();

$(document).ready(function() {
    createCookie();
    
    $(document).keydown(function(eventInformation) {
        keyhandler.keydown(eventInformation.which);
    });
    
    $(document).keyup(function(eventInformation) {
        keyhandler.keyup(eventInformation.which);
    });
    
    engine.menu(); // show menu first
});

function createCookie() {
    if (localStorage.getItem("userId")) {
        $.cookie('userId', localStorage.getItem("userId"), {expires: 30});
        return;
    }
    
    if ($.cookie('userId') != null)
        return;
    
    var uniqueID = makeId(); // unique id for user-specific scores
    localStorage.setItem("userId", uniqueID);
    $.cookie('userId', uniqueID, { expires: 30});
}
    
function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}