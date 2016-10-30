function Matrix(params)
{
	this.dims = params.dims;
	this.dataSet = params.dataSet;

	var disp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	disp.setAttribute("id", "disp");
	disp.setAttribute("x", "10");
	disp.setAttribute("y", "20");
	disp.setAttribute("width", "1000");
	disp.setAttribute("height", "800");
	document.body.appendChild(disp);
}

Matrix.prototype = 
{
	run: function()
	{
		var dims = this.dims;
		var dataSet = this.dataSet;

		var tileSize = 120;
		var tileInterval = 10;

		var disp = document.getElementById("disp");

		for( var i = 1; i < dims.length; i++ )
		{
			var dimName = dims[i];
			dimInfo = {}
			dimInfo.name = dimName;
			dims[i] = dimInfo;
		}

		for( var i = 0; i < dataSet.length; i++ )
		{
			for( var j = 1; j < dims.length; j++ )
			{
				if( dims[j].max == undefined || dims[j].max < dataSet[i][j] )
					dims[j].max = dataSet[i][j];
				if( dims[j].min == undefined || dims[j].min > dataSet[i][j] )
					dims[j].min = dataSet[i][j];
			}
		}

		//for( var i = 1; i < dims.length; i++ )
		//	console.log(dims[i])

		for( var i = 1; i < dims.length ; i++ )
		{
			for( var j = 1; j < dims.length ; j++ )
			{
				var tile = document.createElementNS('http://www.w3.org/2000/svg', 'g');
				tile.setAttribute("id", "g"+i+","+j);
				var x = 100 + (i-1)*(tileSize+tileInterval);
				var y = 50 + (j-1)*(tileSize+tileInterval);
				tile.setAttribute("x", x);
				tile.setAttribute("y", y);
				tile.setAttribute("transform", "translate("+x+","+y+")");
				tile.setAttribute("width", tileSize);
				tile.setAttribute("height", tileSize);
				disp.appendChild(tile);			
			}
		}

		for( var i = 1; i < dims.length; i++ )
		{
			for( var j = 1; j < dims.length; j++ )
			{
				// draw bound
				var tile = document.getElementById("g"+i+","+j);
				var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rect.setAttribute("id", "rect"+i+","+j);
				rect.setAttribute("x", 0);
				rect.setAttribute("y", 0);
				rect.setAttribute("width", tileSize);
				rect.setAttribute("height", tileSize);
				rect.setAttribute("stroke", "#999d9c");
				rect.setAttribute("fill", "white");
				//rect.setAttribute("fill", "none");
				tile.appendChild(rect);	

				if( i == j )
				{
					var dimLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
					dimLabel.setAttribute("id", "dimLabel"+i);
					dimLabel.setAttribute("x", 0);
					dimLabel.setAttribute("y", 10);
					dimLabel.innerHTML = dims[i].name;
					dimLabel.setAttribute("font-size", "10");
					//dimLabel.setAttribute("stroke", "#999d9c");
					//dimLabel.setAttribute("fill", "none");
					tile.appendChild(dimLabel);						
				}

				for( var k = 0; k < dataSet.length; k++ )
				{
					var plot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					plot.setAttribute("id", "plot"+i+","+j+","+k);
					var x = 1.0*(dataSet[k][i]-dims[i].min)/(dims[i].max-dims[i].min)*tileSize;
					var y = 1.0*(dims[j].max-dataSet[k][j])/(dims[j].max-dims[j].min)*tileSize;
					plot.setAttribute("cx", x);
					plot.setAttribute("cy", y);
					plot.setAttribute("r", 2.5);
					plot.setAttribute("width", tileSize);
					plot.setAttribute("height", tileSize);
					//plot.setAttribute("stroke", "#999d9c");

					if( dataSet[k][0] == "setosa")
						var fillColor = "#aa2116";
					else if( dataSet[k][0] == "versicolor")
						var fillColor = "#1d953f";
					else if( dataSet[k][0] == "virginica")
						var fillColor = "#2b4490";

					plot.setAttribute("fill", fillColor);
					plot.setAttribute("fill-opacity", 0.8);
					tile.appendChild(plot);

				}
			}
		}

		var selectSwitch = false;
		var selectedPair = {};
		var selectPos1 = {};
		var selectPos2 = {};

		var _this = this;

		$("#disp").mousedown(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;

			for( var i = 1; i < dims.length ; i++ )
			{
				for( var j = 1; j < dims.length ; j++ )
				{
					var x = 100 + (i-1)*(tileSize+tileInterval);
					var y = 50 + (j-1)*(tileSize+tileInterval);

					if( x <= p.x && p.x <= x + tileSize && y <= p.y && p.y <= y + tileSize )
					{
						selectPos1.x = p.x;
						selectPos1.y = p.y;
						selectedPair.i = i;
						selectedPair.j = j;
						selectSwitch = true;
						//console.log(p);
						return;
					}
				}
			}

			//console.log(p);

		})

		$("#disp").mousemove(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;

			var xt = Math.floor( p.x - 100 ) % (tileSize+tileInterval);
			var yt = Math.floor( p.y - 100 ) % (tileSize+tileInterval);

			if( 0 <= xt && xt <= tileSize && 0 <= yt && yt <= tileSize )
				disp.style.cursor = "crosshair";
			else
				disp.style.cursor = "default";


			if( !selectSwitch )
				return;

			selectPos2 = p;

			var x = 100 + (selectedPair.i-1)*(tileSize+tileInterval);
			var y = 50 + (selectedPair.j-1)*(tileSize+tileInterval);

			if( p.x <= x )
				selectPos2.x = x;
			if( p.y <= y )
				selectPos2.y = y;
			if( p.x >= x + tileSize )
				selectPos2.x = x + tileSize;
			if( p.y >= y + tileSize )
				selectPos2.y = y + tileSize;


			var x1, x2, y1, y2;

			if( selectPos1.x < selectPos2.x )
			{
				x1 = selectPos1.x;
				x2 = selectPos2.x;
			}
			else
			{
				x2 = selectPos1.x;
				x1 = selectPos2.x;				
			}

			if( selectPos1.y < selectPos2.y )
			{
				y1 = selectPos1.y;
				y2 = selectPos2.y;
			}
			else
			{
				y2 = selectPos1.y;
				y1 = selectPos2.y;				
			}


			var selctRect = document.getElementById("selctRect");
			if( selctRect )
				disp.removeChild(selctRect);

			selctRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			selctRect.setAttribute("id", "selctRect");
			selctRect.setAttribute("x", x1);
			selctRect.setAttribute("y", y1);
			selctRect.setAttribute("width", x2-x1);
			selctRect.setAttribute("height", y2-y1);
			selctRect.setAttribute("fill", "grey");
			selctRect.setAttribute("fill-opacity", 0.3);
			disp.appendChild(selctRect);


			for( var k = 0; k < _this.dataSet.length; k++ )
			{
				var plot = document.getElementById("plot"+selectedPair.i+","+selectedPair.j+","+k);
				//console.log(plot)

				cx = parseFloat(plot.getAttribute("cx"))+100+(selectedPair.i-1)*(tileSize+tileInterval);
				cy = parseFloat(plot.getAttribute("cy"))+50 + (selectedPair.j-1)*(tileSize+tileInterval);
				console.log(cx, cy)
				console.log(x1, y1, x2, y2)
				console.log(x1 <= cx && cx <= x2 && y1 <= cy && cy <= y2)
				if( x1 <= cx && cx <= x2 && y1 <= cy && cy <= y2 )
				{
					for( var i = 1; i < _this.dims.length ; i++ )
					{
						for( var j = 1; j < _this.dims.length ; j++ )
						{
							var plot2 = document.getElementById("plot"+i+","+j+","+k);
							if( _this.dataSet[k][0] == "setosa")
								var fillColor = "#aa2116";
							else if( dataSet[k][0] == "versicolor")
								var fillColor = "#1d953f";
							else if( dataSet[k][0] == "virginica")
								var fillColor = "#2b4490";

							plot2.setAttribute("fill", fillColor);
						}
					}
				}
				else
				{
					for( var i = 1; i < _this.dims.length ; i++ )
					{
						for( var j = 1; j < _this.dims.length ; j++ )
						{
							var plot2 = document.getElementById("plot"+i+","+j+","+k);
							plot2.setAttribute("fill", "#8a8c8e");
						}
					}
				}
			}
		})

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

		$("#disp").mouseup(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;

			selectSwitch = false;
		})


	}
}