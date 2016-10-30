function Scatterplot(params)
{
	this.nations = params.dataSet;
	this.width = 1000;
	this.height = 600;
	this.padding = 30;

	var disp = document.getElementById("disp");
	if( disp )
		document.body.removeChild(disp);

	disp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	disp.setAttribute("id", "disp");
	disp.setAttribute("x", "0");
	disp.setAttribute("y", "0");
	disp.setAttribute("width", this.width);
	disp.setAttribute("height", this.height);
	document.body.appendChild(disp);
}

Scatterplot.prototype = 
{
	run: function()
	{
		var nations = this.nations;
		var _this = this;


		var disp = document.getElementById("disp");

		this.boundWidth = this.width-2*this.padding;
		this.boundHeight = this.height-2*this.padding;

		boundTranslateG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		boundTranslateG.setAttribute("id", "boundTranslateG");
		boundTranslateG.setAttribute("x", this.padding);
		boundTranslateG.setAttribute("y", this.padding);
		boundTranslateG.setAttribute("width", this.boundWidth);
		boundTranslateG.setAttribute("height", this.boundHeight);
		boundTranslateG.setAttribute("transform", "translate("+this.padding+","+(this.height-this.padding)+")");
		disp.appendChild(boundTranslateG);

		boundScaleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		boundScaleG.setAttribute("id", "boundScaleG");
		boundScaleG.setAttribute("transform", "scale(1,-1)");
		boundTranslateG.appendChild(boundScaleG);

		// data preprocessing
		this.initYear = 1800;

		// data sort by year
		var years = this.years = [];


		for( var i = 0; i <= 2009-this.initYear; i++ )
		{
			var thisYear = [];
			years.push(thisYear);
		}

		for( item in nations )
		{
			for( var i = 0; i <= 2009-this.initYear; i++ )
				years[i][item] = {};

			for( var i = 0; i < nations[item]["income"].length; i++ )
			{
				yearNo = nations[item]["income"][i][0] - this.initYear;
				var income = nations[item]["income"][i][1]
				years[yearNo][item].income = income;

				if( this.incomeMax == undefined || income > this.incomeMax )
					this.incomeMax = income;
				if( this.incomeMin == undefined || income < this.incomeMin )
					this.incomeMin = income;	

			}

			for( var i = 0; i < nations[item]["lifeExpectancy"].length; i++ )
			{
				yearNo = nations[item]["lifeExpectancy"][i][0] - this.initYear;
				lifeExpectancy = nations[item]["lifeExpectancy"][i][1];
				years[yearNo][item].lifeExpectancy = lifeExpectancy;

				if( this.lifeExpectancyMax == undefined || lifeExpectancy > this.lifeExpectancyMax )
					this.lifeExpectancyMax = lifeExpectancy;
				if( this.lifeExpectancyMin == undefined || lifeExpectancy < this.lifeExpectancyMin )
					this.lifeExpectancyMin = lifeExpectancy;		
			}


			for( var i = 0; i < nations[item]["population"].length; i++ )
			{
				yearNo = nations[item]["population"][i][0] - this.initYear;
				population = nations[item]["population"][i][1]
				years[yearNo][item].population = population;

				if( this.populationMax == undefined || population > this.populationMax )
					this.populationMax = population;
				if( this.populationMin == undefined || population < this.populationMin )
					this.populationMin = population;		
			}
		}

		this.interpolation("population");
		this.interpolation("income");
		this.interpolation("lifeExpectancy");


		xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxis.setAttribute("id", "xAxis");
		xAxis.setAttribute("x1", 0);
		xAxis.setAttribute("y1", 0);
		xAxis.setAttribute("x2", 0);
		xAxis.setAttribute("y2", this.boundHeight);
		xAxis.setAttribute("stroke", "grey");
		xAxis.setAttribute("fill", "none");
		boundScaleG.appendChild(xAxis);

		yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		yAxis.setAttribute("id", "xAxis");
		yAxis.setAttribute("x1", 0);
		yAxis.setAttribute("y1", 0);
		yAxis.setAttribute("x2", this.boundWidth);
		yAxis.setAttribute("y2", 0);
		yAxis.setAttribute("stroke", "grey");
		yAxis.setAttribute("fill", "none");
		boundScaleG.appendChild(yAxis);


		for( lifeExpectancy = 0; lifeExpectancy < 100; lifeExpectancy += 10 )
		{
			y = 1.0*(lifeExpectancy-10)/90*this.boundHeight;
			mark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			mark.setAttribute("x1", -5);
			mark.setAttribute("y1", y);
			mark.setAttribute("x2", 0);
			mark.setAttribute("y2", y);
			mark.setAttribute("stroke", "grey");
			mark.setAttribute("fill", "none");
			boundScaleG.appendChild(mark);

			text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute("x", -25);
			text.setAttribute("y", -y);
			text.setAttribute("stroke", "grey");
			text.innerHTML = lifeExpectancy;
			boundTranslateG.appendChild(text);
		}

		text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute("x", 10);
		text.setAttribute("y", -this.boundHeight +50);
		text.setAttribute("stroke", "grey");
		text.innerHTML = "health";
		boundTranslateG.appendChild(text);

		
		incomeScaleSet = [300, 400, 500, 600, 1000, 2000, 3000, 10000, 20000, 40000, 100000 ];

		for( item in incomeScaleSet )
		{
			income = incomeScaleSet[item];

			x = 1.0*(Math.log(income)-Math.log(this.incomeMin))/(Math.log(this.incomeMax)-Math.log(this.incomeMin))*this.boundWidth;
			mark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			mark.setAttribute("x1", x);
			mark.setAttribute("y1", 0);
			mark.setAttribute("x2", x);
			mark.setAttribute("y2", -5);
			mark.setAttribute("stroke", "grey");
			mark.setAttribute("fill", "none");
			boundScaleG.appendChild(mark);

			text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute("x", x-10);
			text.setAttribute("y", 20);
			text.setAttribute("stroke", "grey");
			text.innerHTML = income;
			boundTranslateG.appendChild(text);
		}

		text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute("x", x-20);
		text.setAttribute("y", -10);
		text.setAttribute("stroke", "grey");
		text.innerHTML = "wealth";
		boundTranslateG.appendChild(text);


		this.timeInterval = 30;
		this.yearVal = 1800;

		yearValDisp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		yearValDisp.setAttribute("id", "yearValDisp");
		yearValDisp.setAttribute("x", this.boundWidth-300);
		yearValDisp.setAttribute("y", -40);
		yearValDisp.setAttribute("fill", "grey");
		yearValDisp.setAttribute("font-size", "150");
		yearValDisp.innerHTML = this.yearVal;
		boundTranslateG.appendChild(yearValDisp);


		this.drawCircle(1800);

		$("#yearValDisp").mousemove(function(e){
			var pos = jQuery(this).offset();
			var p = {};


			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;

			disp.style.cursor="w-resize";

			_this.yearVal = Math.floor((p.x-20)/280.0*(2013-1800))+1800;
			_this.drawCircle(_this.yearVal);
			yearValDisp.innerHTML = _this.yearVal;
			
		})

		$("#yearValDisp").mouseout(function(e){
			disp.style.cursor="default";
		})


/*		this.timer = setInterval(function(){
				if( _this.yearVal < 2009 )
					_this.yearVal += 1;
				else
					_this.yearVal = 1800;
				_this.drawCircle(_this.yearVal);

				//console.log(yearVal)
				yearValDisp.innerHTML = _this.yearVal;
			},this.timeInterval);
*/

	},

	drawCircle: function(yearVal)
	{
		var years = this.years;
		var nations = this.nations;
		var _this = this;

		boundScaleG = document.getElementById("boundScaleG");

		for( item in nations )
		{
			yearNo = yearVal - this.initYear;

			var circle = document.getElementById(nations[item]["name"]);
			if( !circle )
			{
				circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute("id", nations[item]["name"]);

				if( nations[item]["region"] == "Sub-Saharan Africa" )
					fillColor = "blue";
				else if( nations[item]["region"] == "South Asia" )
					fillColor = "grey";
				else if( nations[item]["region"] == "Middle East & North Africa" )
					fillColor = "green";
				else if( nations[item]["region"] == "America" )
					fillColor = "yellow";
				else if( nations[item]["region"] == "Europe & Central Asia" )
					fillColor = "orange";
				else if( nations[item]["region"] == "East Asia & Pacific" )
					fillColor = "red";
				else
					fillColor = "black";

				circle.setAttribute("fill", fillColor);
				circle.setAttribute("fill-opacity", 0.3);
				circle.setAttribute("stroke", "black");

				// if the circle is clicked
				circle.addEventListener("mouseover", function(e){
					nationNameDisp = document.getElementById("nationNameDisp");
					if( !nationNameDisp )
					{
						nationNameDisp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
						nationNameDisp.setAttribute("id", "nationNameDisp");
						nationNameDisp.setAttribute("x", 10);
						nationNameDisp.setAttribute("y", -_this.boundHeight+100);
						nationNameDisp.setAttribute("fill", "#d3d7d4");
						nationNameDisp.setAttribute("fill-opacity", 0.5);
						nationNameDisp.setAttribute("font-size", "50");
						boundTranslateG.appendChild(nationNameDisp);
					}
					nationNameDisp.innerHTML = e.target.id;

					_this.drawPath(parseInt(e.target.getAttribute("nationID")));

					circle = e.target;
					circle.setAttribute("fill-opacity", 1);
				})
				boundScaleG.appendChild(circle);
			}

			circle.addEventListener("mouseout", function(e){
				circle = e.target;
				circle.setAttribute("fill-opacity", 0.3);

				path = document.getElementById("nationPath");
				if( path )
					boundScaleG.removeChild(path);

				nationNameDisp = document.getElementById("nationNameDisp")
				nationNameDisp.innerHTML = "";
			})

			var selectedCircle;

			circle.addEventListener("click", function(e){
				circle = e.target;
				if( selectedCircle )
					selectedCircle.setAttribute("stroke-width", 1);	

				 circle.setAttribute("stroke-width", 3);
				 selectedCircle = circle;

				 _this.drawPath(parseInt(e.target.getAttribute("nationID")), 1);
			})

			var income = years[yearNo][item].income;
			var lifeExpectancy = years[yearNo][item].lifeExpectancy;
			var population = years[yearNo][item].population;

			// logarithm here!!
			var cx = 1.0*(Math.log(income)-Math.log(this.incomeMin))/(Math.log(this.incomeMax)-Math.log(this.incomeMin))*this.boundWidth;

			var cy = 1.0*(lifeExpectancy-10)/90*this.boundHeight
			var r = Math.sqrt(population)/800;

			circle.setAttribute("nationID", item);	

			if( income == undefined || lifeExpectancy == undefined || population == undefined )
			{
				circle.setAttribute("cx", 0);
				circle.setAttribute("cy", 0);
				circle.setAttribute("r", 0);				
			}
			else
			{
				circle.setAttribute("cx", cx);
				circle.setAttribute("cy", cy);
				circle.setAttribute("r", r);					
			}
		}

	},

	interpolation: function(attr)
	{
		var nations = this.nations;
		var years = this.years;


		for( var i = 0; i <= 2009-this.initYear; i++ )
		{
			for( item in nations )
			{
				if( years[i][item][attr] == undefined )
				{
					if( i == 0 )
					{
						for( var t1 = i ; t1 <= 2009-this.initYear; t1++ ) 
						{
							if( years[t1][item][attr] )
								break;
						}
						years[i][item][attr] = years[t1][item][attr];
					}
					else
					{
						for( var t1 = i-1; t1>=0; t1-- )
						{ 
							if( years[t1][item][attr] )
								break;
						}

						for( var t2 = i+1; t2<=2009-this.initYear; t2++ )
						{
							if( years[t2][item][attr] )
								break;			
						}

						if( t1 >= 0 && t2 <= 2009-this.initYear )
						{
							years[i][item][attr] = 1.0*(i-t1)/(t2-t1)+years[t1][item][attr];							
						}
						else if( t2 > 2009-this.initYear )
						{
							for( t2 = i-1; t2>=0; t2-- )
							{ 
								if( years[t2][item][attr] )
									break;
							}

							years[i][item][attr] = years[t2][item][attr];
						}

					}
				}
			}
		}		
	},

	drawPath: function(nationID, type)
	{
		var years = this.years;
		var nations = this.nations;

		type = type || 0;

		d = "M";

		for( var i = 0; i <= 2009-this.initYear; i++ )
		{
			income = years[i][nationID]["income"];
			lifeExpectancy = years[i][nationID]["lifeExpectancy"];

			x = 1.0*(Math.log(income)-Math.log(this.incomeMin))/(Math.log(this.incomeMax)-Math.log(this.incomeMin))*this.boundWidth;
			y = 1.0*(lifeExpectancy-10)/90*this.boundHeight;

			if( income == undefined || lifeExpectancy == undefined || population == undefined )
				continue;

			if( d != "M" )
				d += " L"

			d += (x + " " + y);
		}
		//d += " Z";

		if( !type )
			path = document.getElementById("nationPath");
		else
			path = document.getElementById("selectedPath");
		
		if( !path )
		{
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			if( !type )
			{
				path.setAttribute("id", "nationPath");
				path.setAttribute("stroke", "#9d9087");
			}
				
			else
			{
				path.setAttribute("id", "selectedPath");
				path.setAttribute("stroke", "#3e4145");
				path.setAttribute("stroke-width", 2);
			}
				
			path.setAttribute("fill", "none");
			boundScaleG = document.getElementById("boundScaleG");
			boundScaleG.appendChild(path);
		}
		path.setAttribute("d", d);
	}
}