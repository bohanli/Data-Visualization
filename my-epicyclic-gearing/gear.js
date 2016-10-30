function Gear(params)
{
		this.width = 800;
		this.height = 800;

		// 60: 120: 300

		this.toothD = 10;

		this.innerR = 20;

		this.sunR = 55;
		this.sunToothNum = 15;

		this.planetR = (this.sunR+this.toothD/2)*2-this.toothD;
		this.planetToothNum = this.sunToothNum*2;

		
		this.annulusD = 20;
		this.annulusR = this.sunR + 2*this.planetR + 2*this.toothD + this.annulusD;
		this.annulusToothNum = this.sunToothNum*5;	

		this.thetaAnnulus = 0;
		this.thetaSun = 0;
		this.thetaPlanet = 0;
		this.thetaPlanets = 0;	

		this.timeInterval = 15;

		var disp = document.getElementById("svg");
		if( disp )
			document.body.removeChild(disp);

		disp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		disp.setAttribute("id", "disp");
		disp.setAttribute("x", "0");
		disp.setAttribute("y", "0");
		disp.setAttribute("width", this.width);
		disp.setAttribute("height", this.height);
		document.body.appendChild(disp);

		// draw translate group
		transform = "translate(" + this.width/2 + "," + this.height/2 + ")";

		var translateG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		translateG.setAttribute("x", this.width/2);
		translateG.setAttribute("y", this.height/2);
		translateG.setAttribute("transform", transform);		


		// draw annulus
		var annulusG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		annulusG.setAttribute("id", "annulus");
		annulusG.setAttribute("x", 0);
		annulusG.setAttribute("y", 0);

		var annulusOuterCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		annulusOuterCircle.setAttribute("cx", 0);
		annulusOuterCircle.setAttribute("cy", 0);
		annulusOuterCircle.setAttribute("r", this.annulusR-this.toothD);
		annulusOuterCircle.setAttribute("stroke", "black");
		annulusOuterCircle.setAttribute("fill", "#33a3dc");
		annulusG.appendChild(annulusOuterCircle);


		for( var i = 0; i < this.annulusToothNum; i++ )
		{
			if( !i )
				annulusToothPath = " M ";
			else
				annulusToothPath += " L ";

			var theta = Math.PI/this.annulusToothNum*2*i-Math.PI/this.annulusToothNum/2;
			var radius = this.annulusR-this.annulusD;
			annulusToothPath += (Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

			theta = Math.PI/this.annulusToothNum*(2*i+1)-Math.PI/this.annulusToothNum/2;
			radius = this.annulusR-this.annulusD;
			annulusToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius )

			theta = Math.PI/this.annulusToothNum*(2*i+1)-Math.PI/this.annulusToothNum/2;
			radius = this.annulusR-this.annulusD-this.toothD;
			annulusToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

			theta = Math.PI/this.annulusToothNum*(2*i+2)-Math.PI/this.annulusToothNum/2;
			radius = this.annulusR-this.annulusD-this.toothD;
			annulusToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 
		}
		annulusToothPath += " Z ";

		var annulusTooth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		annulusTooth.setAttribute("d", annulusToothPath);
		annulusTooth.setAttribute("stroke", "black");
		annulusTooth.setAttribute("fill", "white");
		annulusG.appendChild(annulusTooth);		

		translateG.appendChild(annulusG);


		// draw sun
		var sunG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		sunG.setAttribute("id", "sun");
		sunG.setAttribute("x", 0);
		sunG.setAttribute("y", 0);

		for( var i = 0; i < this.sunToothNum; i++ )
		{
			if( !i )
				sunToothPath = " M ";
			else
				sunToothPath += " L ";

			var theta = Math.PI/this.sunToothNum*2*i+Math.PI/this.sunToothNum/2;
			var radius = this.sunR;
			sunToothPath += (Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

			theta = Math.PI/this.sunToothNum*(2*i+1)+Math.PI/this.sunToothNum/2;
			radius = this.sunR;
			sunToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius )

			theta = Math.PI/this.sunToothNum*(2*i+1)+Math.PI/this.sunToothNum/2;
			radius = this.sunR+this.toothD;
			sunToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

			theta = Math.PI/this.sunToothNum*(2*i+2)+Math.PI/this.sunToothNum/2;
			radius = this.sunR+this.toothD;
			sunToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 
		}
		sunToothPath += " Z ";

		var sunTooth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		sunTooth.setAttribute("d", sunToothPath);
		sunTooth.setAttribute("stroke", "black");
		sunTooth.setAttribute("fill", "#33a3dc");
		sunG.appendChild(sunTooth);		

		var sunInnerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		
		sunInnerCircle.setAttribute("cx", 0);
		sunInnerCircle.setAttribute("cy", 0);
		sunInnerCircle.setAttribute("r", this.innerR);
		sunInnerCircle.setAttribute("stroke", "black");
		sunInnerCircle.setAttribute("fill", "white");
		sunG.appendChild(sunInnerCircle);


		translateG.appendChild(sunG);


		//draw planets
		var planetsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		planetsG.setAttribute("id", "planets");
		planetsG.setAttribute("x", 0);
		planetsG.setAttribute("y", 0);

		for( var i = 0; i < 3; i++ )
		{
			theta = Math.PI*2.0/3*i;
			//console.log(theta)
			//console.log(i)
			radius = this.sunR+this.toothD+this.planetR;
			transform = "translate(" + Math.cos(theta)*radius + "," + Math.sin(theta)*radius + ")";

			var planetG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			//planetG.setAttribute("id", "planet");
			planetG.setAttribute("x", 0);
			planetG.setAttribute("y", 0);
			planetG.setAttribute("transform", transform);

			var planetRotateG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			planetRotateG.setAttribute("id", "planet"+i);
			planetRotateG.setAttribute("x", 0);
			planetRotateG.setAttribute("y", 0);

			for( var j = 0; j < this.planetToothNum; j++ )
			{
				if( !j )
					planetToothPath = " M ";
				else
					planetToothPath += " L ";

				var theta = Math.PI/this.planetToothNum*2*j;
				var radius = this.planetR;
				planetToothPath += (Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

				theta = Math.PI/this.planetToothNum*(2*j+1);
				radius = this.planetR;
				planetToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius )

				theta = Math.PI/this.planetToothNum*(2*j+1);
				radius = this.planetR+this.toothD;
				planetToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 

				theta = Math.PI/this.planetToothNum*(2*j+2);
				radius = this.planetR+this.toothD;
				planetToothPath += ( " L " + Math.sin(theta)*radius + " " + Math.cos(theta)*radius ) 
			}
			planetToothPath += " Z ";

			var planetTooth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			planetTooth.setAttribute("id", "sunTooth");
			planetTooth.setAttribute("d", planetToothPath);
			planetTooth.setAttribute("stroke", "black");
			planetTooth.setAttribute("fill", "#76becc");
			planetRotateG.appendChild(planetTooth);

			var planetInnerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			planetInnerCircle.setAttribute("cx", 0);
			planetInnerCircle.setAttribute("cy", 0);
			planetInnerCircle.setAttribute("r", this.innerR);
			planetInnerCircle.setAttribute("stroke", "black");
			planetInnerCircle.setAttribute("fill", "white");
			planetRotateG.appendChild(planetInnerCircle);

			planetG.appendChild(planetRotateG);
			planetsG.appendChild(planetG);	
		}


		translateG.appendChild(planetsG);

		// append translateG to disp
		disp.appendChild(translateG);	


}

Gear.prototype = 
{
	run: function(rotateMethod)
	{
		//this.toothWidth = 10;
		this.rotateMethod = rotateMethod || 0;


		disp = document.getElementById("disp");

		if( this.timer )
		{
			clearInterval( this.timer );
			this.timer = null;			
		}

		if( this.rotateMethod == 0 )
		{
			// Annulus
			var dThetaAnnulus = 0;

			var dThetaSun = 1;
			var dThetaPlanets = dThetaSun/6.0;
			var dThetaPlanet = -dThetaPlanets*5.0/2;			
		}
		else if( this.rotateMethod == 1 )
		{
			// planets
			var dThetaPlanets = 0;

			var dThetaSun = 1;
			var dThetaPlanet = -dThetaSun/2;
			var dThetaAnnulus = dThetaPlanet*2.0/5;		
		}
		else 
		{
			var dThetaSun = 0;

			var dThetaAnnulus = 1;
			var dThetaPlanets = dThetaAnnulus*5.0/6;
			var dThetaPlanet = dThetaPlanets/2;
		}

		var t = 0;
		var _this = this;
		
		this.timer = setInterval(function(){
				_this.thetaAnnulus += dThetaAnnulus;
				_this.thetaSun += dThetaSun;
				_this.thetaPlanet += dThetaPlanets;
				_this.thetaPlanets += dThetaPlanet;	
				annulusG = document.getElementById("annulus");
				annulusG.setAttribute("transform", "rotate("+_this.thetaAnnulus+")");

				sunG = document.getElementById("sun");
				sunG.setAttribute("transform", "rotate("+_this.thetaSun+")");

				planetsG = document.getElementById("planets");
				planetsG.setAttribute("transform", "rotate("+_this.thetaPlanet+")");
				for( var i = 0; i < 3; i++ )
				{
					planetG = document.getElementById("planet"+i);
					planetG.setAttribute("transform", "rotate("+_this.thetaPlanets+")");					
				}

				t++;
			},this.timeInterval);


	},

}