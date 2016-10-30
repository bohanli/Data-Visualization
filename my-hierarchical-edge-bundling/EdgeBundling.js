function EdgeBundling(params)
{
	var svg = this.svg = params.svg;

	this.data = params.data;
	//console.log(this);
	this.origin = {};
	this.origin.x = svg.getAttribute("width") / 2.0;
	this.origin.y = svg.getAttribute("height") / 2.0;

	this.radius = ( svg.getAttribute("width") < svg.getAttribute("height") ? svg.getAttribute("width") : svg.getAttribute("height") ) / 2.0 * 7 / 10;

	this.dt = 0.008; //this.dt = 0.06;
	this.k = 3;

	//this.beta = 0.9;


	var layout = this.layout = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	var tmpStr = 'translate(' + this.origin.x + ',' + this.origin.y + ')';
	layout.setAttribute('transform', tmpStr);
}

EdgeBundling.prototype = 
{
	run: function()
	{
		this.beta = params.beta;
		this.construct();
		this.drawLeafNodes();
		this.getAllPaths();
		this.drawAllSplines();
	},

	construct: function()
	{
		// travel leaf nodes

		var data = this.data;
		var leafCnt = 0;
		var depth = 0;

		for( var i = 0; i < data.length; i++ )
		{
			data[i].nameArr = data[i].name.split(".");
			data[i].lastName = data[i].nameArr[data[i].nameArr.length-1];
			if( depth < data[i].nameArr.length )
				depth = data[i].nameArr.length;
			leafCnt++;
			if( i > 0 && data[i-1].name.substring(0, data[i-1].name.length-data[i-1].nameArr[data[i-1].nameArr.length-1].length) 
				!= data[i].name.substring(0, data[i].name.length-data[i].nameArr[data[i].nameArr.length-1].length) )
			{
				leafCnt++;			
			}

			data[i].n = leafCnt;

		}
		leafCnt++;

		this.depth = depth;
		this.dR = this.radius / depth;
		this.dTheta = Math.PI * 2.0 / leafCnt;


		// construct the whole tree

		var level = this.level = [];
		level[depth-1] = data;
		for( var i = depth-1; i > 0; i-- )
		{
			var startIdx = 0;
			var endIdx = 0;
			for( var j = 0; j < level[i].length; j++ )
			{
				level[i][j].nameArr = level[i][j].name.split(".");

				level[i][j].fatherName = level[i][j].name.substring(0, 
					level[i][j].name.length - level[i][j].nameArr[level[i][j].nameArr.length-1].length-1);
				
				if( j == level[i].length - 1 || ( j > 0 && level[i][j-1].fatherName != level[i][j].fatherName ) )
				{
					if( j == level[i].length - 1 )
						endIdx = j;
					else
						endIdx = j - 1;

					var newNode = {};
					newNode.name = level[i][endIdx].fatherName;
					newNode.n = ( level[i][startIdx].n + level[i][endIdx].n ) / 2;
					newNode.d = level[i][endIdx].nameArr.length-2;

					if( level[newNode.d] == undefined )
						level[newNode.d] = [];

					for( var k = 0; k < level[newNode.d].length; k++ )
						if( level[newNode.d][k].name == newNode.name )
							break;

					if( k == level[newNode.d].length )
						level[newNode.d].push(newNode);

					startIdx = j;
				}
			}
		}

		level[0][0].lastName = level[0][0].name;		

		// check the tree structure
		//for( var i = depth-1; i >= 0; i-- )
		//	for( var j = 0; j < level[i].length; j++ )
		//		console.log(i, level[i][j].name); //


		// record all the paths
	},

	drawLeafNodes: function()
	{
		var data = this.data;

		var dTheta = this.dTheta;

		var layout = this.layout;

		//draw labels of the vertices
		var singleNode = [];
		for( var i = 0; i < data.length; i++ )
		{
			singleNode[i] = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			var tmpStr = 'rotate(' + data[i].n*dTheta/Math.PI*180.0 + ')';

			singleNode[i].setAttribute('x', this.radius);
			singleNode[i].setAttribute('y', 0);
			singleNode[i].setAttribute('transform', tmpStr);

			singleNode[i].setAttribute('font-size', 5);
			//singleNode[i].setAttribute('font-family', 'consolas');
			//singleNode[i].setAttribute('fill', '#102b6a');

			singleNode[i].innerHTML = "&nbsp;"+data[i].lastName;
			layout.appendChild(singleNode[i]);
		}
		this.svg.appendChild(layout);

	},

	drawAllSplines: function()
	{
		var paths = this.paths;
		var layout = this.layout;

		for( var i = 0; i < paths.length; i++ )
		{
			layout = this.drawSpline(paths[i], layout);
			//if( i > 0 ) break;
		}

		this.svg.appendChild(layout);

	},

	drawSpline: function(nodePath, layout)
	{
		var ctx = this.ctx;
		var dTheta = this.dTheta;

		var beta = this.beta;

		// normalize position in x-y coordinate
		for( var i = 0; i < nodePath.length; i++ )
		{
			nodePath[i].r = this.radius * 1.0 / ( this.depth - 1 ) * nodePath[i].depth;	
			nodePath[i].theta = nodePath[i].n * dTheta;
			nodePath[i].x = nodePath[i].x = nodePath[i].r * Math.cos( nodePath[i].theta );
			nodePath[i].y = nodePath[i].y = nodePath[i].r * Math.sin( nodePath[i].theta );		
		}

		// calculate new control point
		var Q = [];

		for( var i = 0; i < nodePath.length; i++ )
		{
			Q[i] = {};
			Q[i].x = beta * nodePath[i].x 
				+ (1-beta) * (nodePath[0].x + 1.0*i/(nodePath.length-1)*(nodePath[nodePath.length-1].x-nodePath[0].x) );
			Q[i].y = beta * nodePath[i].y 
				+ (1-beta) * (nodePath[0].y + 1.0*i/(nodePath.length-1)*(nodePath[nodePath.length-1].y-nodePath[0].y) );
		}


		// Cox-deBoor
		var N = function(i, k, t, u)
		{
			if( k == 1 )
			{
				if( ( u[i] <= t ) && ( t <= u[i+1] ) ) return 1.0;
				else return 0.0;
			}
			else
			{
				var len1 = (u[i+k-1]-u[i]);
				var len2 = (u[i+k]-u[i+1]);

				if( len1 == 0 ) len1 = 1;
				if( len2 == 0 ) len2 = 1;

				var c1 = 1.0*(t-u[i])/len1;
				var c2 = 1.0*(u[i+k]-t)/len2;

				return c1*N(i,k-1,t,u) + c2*N(i+1,k-1,t,u); 
			}
		}

		var k = this.k;
		var n = Q.length - 1;

		// generate node vector 
		var u = [];
		for( var j = 0; j < k; j++ )
			u[j] = 0;
		for( ; j <= n; j++ )
			u[j] = (j-k+1)*1.0/(n-k+2);
		for( ; j <= n+k+1; j++ )
			u[j] = 1.0;

		var lineSeg = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
		lineSeg.setAttribute("fill", "none");
		lineSeg.setAttribute("stroke", "#2a5caa");
		lineSeg.setAttribute("stroke-width", "0.5");

		//points = " "+Q[0].x +","+Q[0].y+" ";
		var points = "";
		for( var t = 0; t <= 1; t = t + this.dt)
		{

			var p = {};
			p.x = p.y = 0;
			
			for( var i = 0; i <= n; i++ )
			{
				p.x = p.x + Q[i].x * N(i, k, t, u);
				p.y = p.y + Q[i].y * N(i, k, t, u);
			}

			points = points + p.x + "," + p.y + " ";
		}
		lineSeg.setAttribute("points", points);
		layout.appendChild(lineSeg);
		points = "";

		return layout;
	},

	getAllPaths: function()
	{
		var data = this.data;
		var paths = this.paths = [];

		for( var i = 0; i < data.length; i++ )
		{
			for( var j = 0; j < data[i].imports.length; j++ )
			{
				for( var k = 0; k < data.length; k++ )
				{
					if( data[i].imports[j] == data[k].name )
					{
						var newPath = this.getPath(i, k);
						paths.push(newPath);
						break;
					}
				}
			}
		}

	},

	getPath: function(startIdx, endIdx)
	{
		var data = this.data;
		var depth = this.depth;

		for( var m = 0; m < ( data[startIdx].nameArr.length < data[endIdx].nameArr.length ? data[startIdx].nameArr.length:data[endIdx].nameArr.length); m++ )
		{
			if( data[startIdx].nameArr[m] != data[endIdx].nameArr[m] ) break;
		}

		var path = [];
		for( var i = data[startIdx].nameArr.length - 1; i >= m; i-- )
		{
			var tmpName = "";
			for( var j = 0; j <= i; j++ )
			{
				tmpName = tmpName + data[startIdx].nameArr[j];
				if( j < i ) tmpName = tmpName + "."
			}
			path.push(tmpName);
		}

		for( var i = m - 1; i < data[endIdx].nameArr.length; i++ )
		{
			// LCA is ommitted if the original control polygon is comprised of more than 3 control points
			if( i == m - 1 && data[startIdx].nameArr.length - 1 - m + data[endIdx].nameArr.length - 1 - m > 2 ) continue;

			var tmpName = "";
			for( var j = 0; j <= i; j++ )
			{
				tmpName = tmpName + data[endIdx].nameArr[j];
				if( j < i ) tmpName = tmpName + "."
			}
			path.push(tmpName);
		}

		var nodePath = [];
		for( var i = 0; i < path.length; i++ )
		{
			var newNode;
			newNode = this.getNodeByName(path[i]);
			nodePath.push(newNode);
		}
		return nodePath;

	},

	getNodeByName: function(name)
	{
		var level = this.level;

		for( var i = 0; i < level.length; i++ )
		{
			for( var j = 0; j < level[i].length; j++ )
			{
				if( level[i][j].name == name )
				{
					level[i][j].depth = i;
					return level[i][j];
				}
			}
		}
		console.log(name, "ERROR!");
	}
}