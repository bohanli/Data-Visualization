function Parallel(params)
{
	var dataSet = this.dataSet = params.dataSet;
	var dims = this.dims = params.dims;
	var disp = this.disp = document.getElementById("disp");
	var dispHeight = this.dispHeight = disp.getAttribute("height");
	var dispWidth = this.dispWidth = disp.getAttribute("width");
	var headHeight = this.headHeight = 30;
	var height = this.height = dispHeight - headHeight;
	var dimNum = 0;
	
	for( var item in dims ) dimNum++;

	this.dimNum = dimNum;

	var dx = this.dx = dispWidth/(dimNum+1);

	for( var i = 0; i < dataSet.length; i++ )
	{
		for( var item in dims )
		{
			if( item == "name" )
				continue;

			if( dims[item].max == undefined || dataSet[i][item] > dims[item].max )
				dims[item].max = dataSet[i][item];
			if( dims[item].min == undefined || dataSet[i][item] < dims[item].min )
				dims[item].min = dataSet[i][item];
		}
	}

	var dimTag = this.dimTag = [];
	for( var item in dims )
		dimTag.push(item);

	for( var i = 0; i < dataSet.length; i++ )
	{
		for( var item in dims )
		{
			if( item == "name" )
				continue;

			if( dataSet[i][item] == undefined )
				continue;

			if( dims[item].max == undefined || dataSet[i][item] > dims[item].max )
				dims[item].max = dataSet[i][item];
			if( dims[item].min == undefined || dataSet[i][item] < dims[item].min )
				dims[item].min = dataSet[i][item];
		}
	}

	var AxisSelectRegionArr = this.AxisSelectRegionArr = [];
	for( var i = 0; i < dimNum; i++ )
	{
		var newNode = {};
		newNode.isSelected = 1;
		newNode.y1 = headHeight;
		newNode.y2 = dispHeight;
		AxisSelectRegionArr.push(newNode);
	}

	for( var i = 0; i < dataSet.length; i++ )
	{
		dataSet[i].disp = 2;
		for( var j = 0; j < dimTag.length; j++ )
		{
			var item = dimTag[j];

			if( dataSet[i][item] == undefined )
			{
				dataSet[i].disp = 0;
				break; // how to deal with this kind of problem? 
			}
		}

		if( j != dimTag.length - 1 )
			continue;
	}

	this.selectAxisNum = 2;
	this.mainAxis = 2;
}

Parallel.prototype = 
{
	run: function()
	{
		var dataSet = this.dataSet;
		var dims = this.dims;
		var disp = this.disp;
		var dispHeight = this.dispHeight;
		var dispWidth = this.dispWidth;
		var headHeight = this.headHeight;
		var height = this.height;
		var dimNum = this.dimNum;
		var dx = this.dx;
		var dimTag = this.dimTag;
		var AxisSelectRegionArr = this.AxisSelectRegionArr;


		this.drawLines();
		this.drawAxis();

		var startPos = {};
		var endPos = {};


		var selecting = 0;
		var moving = 0;

		var t = this;

		t.refreshData();

		t.drawLines();
		t.drawAxis();


		$("#disp").mousemove(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;
			//console.log(p);

			var cursorType = "default";

			for( var i = 0; i < dimNum; i++ )
			{
				if( (i+1)*dx-5 < p.x && p.x < (i+1)*dx+5 && headHeight < p.y )
				{
					cursorType = "move"
					break;
				}
				else if( (i+1)*dx-dx/4 < p.x && p.x < (i+1)*dx+dx/4 && headHeight < p.y )
				{
					cursorType = "crosshair"
					break;					
				}			
			}

			disp.style.cursor = cursorType;

			if( selecting )
			{
				endPos = p;

				if( endPos.y-startPos.y > 0 )
				{
					AxisSelectRegionArr[t.selectAxisNum].isSelected = 1;
					AxisSelectRegionArr[t.selectAxisNum].y1 = startPos.y;
					AxisSelectRegionArr[t.selectAxisNum].y2 = endPos.y;
				}
				else
				{
					AxisSelectRegionArr[t.selectAxisNum].isSelected = 1;
					AxisSelectRegionArr[t.selectAxisNum].y1 = endPos.y;
					AxisSelectRegionArr[t.selectAxisNum].y2 = startPos.y;			
				}
				
				t.refreshData();

				t.drawLines();
				t.drawAxis();
			}
			else if( moving )
			{
				var yOffset = ( p.y - startPos.y )/8.0;
				var newY1 = AxisSelectRegionArr[t.selectAxisNum].y1 + yOffset;
				var newY2 = AxisSelectRegionArr[t.selectAxisNum].y2 + yOffset;
				if( headHeight < newY1 && newY2 < dispHeight )
				{
					AxisSelectRegionArr[t.selectAxisNum].y1 = newY1;
					AxisSelectRegionArr[t.selectAxisNum].y2 = newY2;					
				}

				t.refreshData();

				t.drawLines();
				t.drawAxis();

			}
		})


		$("#disp").mousedown(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;
			//console.log(p);

			for( var i = 0; i < dimNum; i++ )
			{
				if( (i+1)*dx-5 < p.x && p.x < (i+1)*dx+5 && headHeight < p.y )
				{
					moving = 1;
					break;
				}
				else if( (i+1)*dx-dx/4 < p.x && p.x < (i+1)*dx+dx/4 && headHeight < p.y )
				{
					selecting = 1;
					break;					
				}			
			}

			if( i != dimNum )
			{
				startPos = p;
				t.selectAxisNum = i;
				t.mainAxis = i;

				var selectRect = document.getElementById("selectAxis"+i)
				if( !selectRect )
					AxisSelectRegionArr[t.selectAxisNum].isSelected = 1;

				t.refreshData();

				t.drawLines();
				t.drawAxis();
			}
		})

		$("#disp").mouseup(function(e){
			var pos = jQuery(this).offset();
			var p = {};

			if( t.selectAxisNum == -1 )
				return;

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;
			
			disp.style.cursor="default";
			t.selectAxisNum = -1;
			selecting = 0;
			moving = 0;
			var startPos = {};
			var endPos = {};
		})
	},

	drawLines: function()
	{
		var dataSet = this.dataSet;
		var dims = this.dims;
		var disp = this.disp;
		var dispHeight = this.dispHeight;
		var dispWidth = this.dispWidth;
		var headHeight = this.headHeight;
		var height = this.height;
		var dimNum = this.dimNum;
		var dx = this.dx;
		var dimTag = this.dimTag;
		var AxisSelectRegionArr = this.AxisSelectRegionArr;

		var gLowLayer = document.getElementById("gLowLayer")
		if( gLowLayer )
			disp.removeChild(gLowLayer);

		gLowLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		gLowLayer.setAttribute("id", "gLowLayer");

		var gHighLayer = document.getElementById("gHighLayer")
		if( gHighLayer )
			disp.removeChild(gHighLayer);

		gHighLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		gHighLayer.setAttribute("id", "gHighLayer");

		for( var i = 0; i < dataSet.length; i++ )
		{
			if( dataSet[i].disp == 0 )
				continue;

			for( var j = 0; j < dimTag.length - 1; j++ )
			{

				var item = dimTag[j];
				var itemNext = dimTag[j+1];

				//var line = document.getElementById("line"+i+","+j)
				//if( line )
				//	disp.removeChild(line);

				var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				
				line.setAttribute("id", "line"+i+","+j);
				line.setAttribute("x1", (j+1)*dx);
				line.setAttribute("y1", headHeight + height*(dims[item].max-dataSet[i][item])/(dims[item].max-dims[item].min));
				line.setAttribute("x2", (j+2)*dx);
				line.setAttribute("y2", headHeight + height*(dims[itemNext].max-dataSet[i][itemNext])/(dims[itemNext].max-dims[itemNext].min));
				if( dataSet[i].disp == 2 )
				{
					//line.setAttribute('stroke', '#2a5caa');
					line.setAttribute('stroke', dataSet[i].color);
					line.setAttribute('stroke-opacity', '0.7');
					gHighLayer.appendChild(line);
				}
				else if( dataSet[i].disp == 1 )
				{
					//line.setAttribute('stroke-opacity', '0.7');
					line.setAttribute('stroke', '#d3d7d4');
					gLowLayer.appendChild(line);
				}
			}
				
			disp.appendChild(gLowLayer);
			disp.appendChild(gHighLayer);
			
		}

	},

	drawAxis: function()
	{
		var dataSet = this.dataSet;
		var dims = this.dims;
		var disp = this.disp;
		var dispHeight = this.dispHeight;
		var dispWidth = this.dispWidth;
		var headHeight = this.headHeight;
		var height = this.height;
		var dimNum = this.dimNum;
		var dx = this.dx;
		var dimTag = this.dimTag;
		var AxisSelectRegionArr = this.AxisSelectRegionArr;

		for( var i = 0; i < dimNum; i++ )
		{
			// draw dim names & units
			var dimName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			var unit = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			var j = 0;
			for( var item in dims )
			{
				if( j == i ) 
				{
					dimName.innerHTML = dims[item].name;
					unit.innerHTML = dims[item].unit;
				}
				j++;
			}

			dimName.setAttribute("x", (i+1)*dx - dimName.innerHTML.length/2*5);
			dimName.setAttribute("y", 10);
			dimName.setAttribute('font-size', 10);
			dimName.setAttribute('font-weight', "bold");
			unit.setAttribute("x", (i+1)*dx - unit.innerHTML.length/2*5);
			unit.setAttribute("y", 20);
			unit.setAttribute('font-size', 10);
			disp.appendChild(dimName);
			disp.appendChild(unit);

			// draw axis
			var gAxis = document.getElementById("gAxis"+i)
			if( gAxis )
				disp.removeChild(gAxis);

			gAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			gAxis.setAttribute("id", "gAxis"+i);

			var axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			axis.setAttribute("x1", (i+1)*dx);
			axis.setAttribute("y1", headHeight);
			axis.setAttribute("x2", (i+1)*dx);
			axis.setAttribute("y2", dispHeight);
			axis.setAttribute('stroke', '#000000');
			axis.setAttribute('stroke-width', '1');
			gAxis.appendChild(axis);

/*			var yAxisRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			yAxisRect.setAttribute("x", (i+1)*dx-5);
			yAxisRect.setAttribute("y", headHeight);
			yAxisRect.setAttribute("width", 10);
			yAxisRect.setAttribute("height", dispHeight);
			yAxisRect.setAttribute('stroke', '#ffffff');
			yAxisRect.setAttribute('fill', '#74787c');
			yAxisRect.setAttribute('fill-opacity', '0.5');
			gAxis.appendChild(yAxisRect);*/

			disp.appendChild(gAxis);
		}

		for( var i = 0; i < dimNum; i++ )
		{
			if( !AxisSelectRegionArr[i].isSelected )
				continue;
				

			var selectRect = document.getElementById("selectAxis"+i)
			if( selectRect )
				disp.removeChild(selectRect);

			selectRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			selectRect.setAttribute("id", "selectAxis"+i);
			selectRect.setAttribute("x", (i+1)*dx-5);
			selectRect.setAttribute("y", AxisSelectRegionArr[i].y1);
			selectRect.setAttribute("width", 10);
			selectRect.setAttribute("height", AxisSelectRegionArr[i].y2-AxisSelectRegionArr[i].y1);
			selectRect.setAttribute('stroke', '#ffffff');
			//selectRect.setAttribute('fill', '#f47920');
			selectRect.setAttribute('fill', '#8552a1');
			if( i != this.mainAxis )
			{
				selectRect.setAttribute('fill', '#74787c');
				selectRect.setAttribute('fill-opacity', '0.5');

			}
			else
			{
				selectRect.setAttribute('fill', '#8552a1');
				selectRect.setAttribute('fill-opacity', '0.9');
			}
			disp.appendChild(selectRect);			
		}

	},

	refreshData: function()
	{
		var dataSet = this.dataSet;
		var dims = this.dims;
		var disp = this.disp;
		var dispHeight = this.dispHeight;
		var dispWidth = this.dispWidth;
		var headHeight = this.headHeight;
		var height = this.height;
		var dimNum = this.dimNum;
		var dx = this.dx;
		var dimTag = this.dimTag;
		var AxisSelectRegionArr = this.AxisSelectRegionArr;

		for( var i = 0; i < dataSet.length; i++ )
		{
			if( dataSet[i].disp == 0 )
				continue;

			for( var j = 0; j < dimTag.length; j++ )
			{

				var item = dimTag[j];

				if( AxisSelectRegionArr[j].isSelected == 1 &&
					( height*(dims[item].max-dataSet[i][item])/(dims[item].max-dims[item].min) + headHeight < AxisSelectRegionArr[j].y1
					|| AxisSelectRegionArr[j].y2  < height*(dims[item].max-dataSet[i][item])/(dims[item].max-dims[item].min) + headHeight ) )
				{
					dataSet[i].disp = 0;
					break;
				}
			}

			if( j == dimTag.length )
			{
				dataSet[i].disp = 2;
			}
			else
			{
				dataSet[i].disp = 1;
			}
		}

		var t = this;

		// sort first
		dataSet.sort(function(a,b){
            return a[dimTag[t.mainAxis]]-b[dimTag[t.mainAxis]]});

		for( var i = 0; i < dataSet.length; i++ )
		{
			var k = Math.floor(70+(i/dataSet.length)*120);
			dataSet[i].color = "rgb("+(255-k)+",100,"+k+")";
			//console.log(dataSet[i].color)
		}
	}
}