var NumRain = function(params){
	var svg = this.svg = params.svg;
	var audio =this.audio = document.getElementById("audio");

	var numbers = this.numbers = [];
	var rowNum = this.rowNum = 25;
	var colNum = this.colNum = 30;

	this.plateSize = 1;
	this.plateLeft = 15;
	this.plateRight = this.plateLeft + this.plateSize - 1;

	this.zeroRatio = 0.9;

	this.score = 0;

	this.timeInterval = 100;

	this.dx = 20, this.dy = 20;

	this.isOver = 0;
};

NumRain.prototype.initGame = function() {
	var svg = this.svg;
	var dx = this.dx, dy = this.dy;

	var textScore = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	textScore.setAttribute("id", "textScore");
	textScore.setAttribute("x", dx*(1+1));
	textScore.setAttribute("y", dy*(26+1));
	textScore.setAttribute("fill", "white"); // red
	textScore.setAttribute("font-size", 30);
	textScore.setAttribute("font-family", "consolas"); // consolas, courier new
	textScore.innerHTML = "Count: ";
	svg.appendChild(textScore);
}

NumRain.prototype.updateNumbers = function() {
	var svg = this.svg;

	var numbers = this.numbers;
	var rowNum = this.rowNum;
	var colNum = this.colNum;

	if( !numbers.length ) {
		for( var i = 0; i < rowNum; i++ ) {
			numbers[i] = [];
			for( var j = 0; j < colNum; j++ ) {
				if( Math.random() > this.zeroRatio )  numbers[i][j] = 1;
				else  numbers[i][j] = 0;
			}
		}
	}


	// scroll
	for( var i = rowNum - 1; i > 0; i-- ) {
		for( var j = 0; j < colNum; j++ ) {
			numbers[i][j] = numbers[i-1][j];
		}
	}

	// random first line
	for( var j = 0; j < colNum; j++ ) {
		if( Math.random() > this.zeroRatio )  numbers[i][j] = 1;
		else  numbers[i][j] = 0;
	}	
}


NumRain.prototype.drawNumbers = function() {
	var svg = this.svg;

	var numbers = this.numbers;
	var rowNum = this.rowNum;
	var colNum = this.colNum;

	var plateLeft = this.plateLeft;
	var plateRight = this.plateRight;

	var dx = this.dx, dy = this.dy;

	var numberSize = 20;



	var gNumbers = document.getElementById("gNumbers");
	if( gNumbers ) svg.removeChild(gNumbers);

	gNumbers = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	gNumbers.setAttribute("id", "gNumbers")

	for( var i = 0; i < rowNum; i++ ) {
		for( var j = 0; j < colNum; j++ ) {

		var textNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		textNumber.setAttribute("id", "textNumber"+i+","+j);
		textNumber.setAttribute("x", dx*(j+1));
		textNumber.setAttribute("y", dy*(i+1));

		if( i == rowNum - 1 && plateLeft <= j && j <= plateRight ) textNumber.setAttribute("fill", "white"); // white
		else if( numbers[i][j] ) textNumber.setAttribute("fill", "#f47920"); // light
		else textNumber.setAttribute("fill", "#181d4b"); // dark

		textNumber.setAttribute("font-size", numberSize);
		textNumber.setAttribute("font-family", "consolas"); // consolas, courier new
		textNumber.innerHTML = numbers[i][j];
		gNumbers.appendChild(textNumber);
		}
	}
	svg.appendChild(gNumbers);
}

NumRain.prototype.movePlate = function(keyCode) {
	var rowNum = this.rowNum;
	var colNum = this.colNum;

	if( keyCode == 37 && 0 < this.plateLeft ) {
		this.plateLeft -= 1;
		this.plateRight -= 1;
	} else if(  keyCode == 39 && this.plateRight < this.colNum - 1  ) {
		this.plateLeft += 1;
		this.plateRight += 1;	
	}
}

NumRain.prototype.updateScore = function() {
	var numbers = this.numbers;
	var audio =this.audio

	var i = this.rowNum - 1;
	for( var j = this.plateLeft; j <= this.plateRight; j++ ) {
		if( numbers[i][j] ) audio.play();
		this.score += numbers[i][j];
	}

	var textScore = document.getElementById('textScore');
	textScore.innerHTML = "Count: "+this.score;

	if( this.score == 11 ) {
		this.score = 0;
		textScore.innerHTML = "Game Over. Press ENTER to continue.";
		this.isOver = 1;
	}
}

NumRain.prototype.run = function()
{
	this.initGame();

	var t = this;
	setInterval(function(){
		if( !t.isOver ) {
			t.updateNumbers();
			t.drawNumbers();
			t.updateScore();			
		}
	}, t.timeInterval);

	window.onkeydown = function(e)
	{
	//	console.log(e.keyCode);
		if( 37 <= e.keyCode && e.keyCode <= 40 && !t.isOver)
		{
			// 37 left, 38 up, 39 right, 40 down
			
			//console.log(e.keyCode);
			t.movePlate(e.keyCode);
		}

		if( e.keyCode == 13 && t.isOver ) {
			t.isOver = 0;
		}
	}
}