LESSIONTYPE=
{
	MULTIPLY_TABLE:0,
	MULTIPLY_RANDOM:1,
	ADDITION_RANDOM:2,
	SUBSTRACTION_RANDOM:3
}


function Task()
{
	this.text;
	this.result;
}

function Rule()
{
	this.numMonsters;
	this.speed;
}

function Rules()
{
	this.speedMin;
	this.speedStartDelay;
	this.speedInc;
	this.speedEvery;
	this.speedMax;

	this.monstersToUse=[];
	this.monstersMin;
	this.monstersStartDelay;
	this.monstersInc;
	this.monstersEvery;
	this.monstersMax;

	this.lessionType;
	this.lessionMultiplyTable;
	this.lessionMinValue;
	this.lessionMaxValue;
	this.lessionAllowNegativeResult;


	//Variables for running game rules
	this.gameTime;
	this.nextMonsterIncTime;
	this.maxMonsterDone;
	this.numMonsterAlive;

	this.nextSpeedIncTime;
	this.maxSpeedDone;
	this.actualSpeed;


}

/*
<?xml version="1.0" encoding="UTF-8"?>
<rules>
	<speed min="20" startdelay="60" increment="10" every="20" max="50"/>
	<monsters list="['monster1','monster2']" min="1" startdelay="0" increment="1" every="60" max="5"/>
	<lession type="multiply_table" table="9">
	<lession type="multiply_table" table="9">
	<lession type="multiply_random" min="3" max="10">
	<lession type="addition_random" min="10" max="20">
	<lession type="substraction_random" min="10" max="20" allownegativeresult="false">
</rules>
*/


Rules.prototype.LoadRules = function(xmlurl)
{
	var rulesXmlhttp = new XMLHttpRequest();
	console.log(xmlurl);
	rulesXmlhttp.open("GET",xmlurl,false);
	rulesXmlhttp.send();
	var ruleXmlDoc=rulesXmlhttp.responseXML; 

	var speedNodes=ruleXmlDoc.evaluate("/rules/speed", ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (speedNodes.snapshotLength!=1) return false;

	var speedNode=speedNodes.snapshotItem(0);
	this.speedMin=parseInt(speedNode.getAttribute("min"));
	this.speedStartDelay=parseInt(speedNode.getAttribute("startdelay"));
	this.speedInc=parseInt(speedNode.getAttribute("increment"));
	this.speedEvery=parseInt(speedNode.getAttribute("every"));
	this.speedMax=parseInt(speedNode.getAttribute("max"));

	var monsterNodes=ruleXmlDoc.evaluate("/rules/monsters", ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (monsterNodes.snapshotLength!=1) return false;

	var monsterNode=monsterNodes.snapshotItem(0);
	eval("var tmp=" + monsterNode.getAttribute("list")+";");
	this.monstersToUse=tmp;
	this.monstersMin=parseInt(monsterNode.getAttribute("min"));
	this.monstersStartDelay=parseInt(monsterNode.getAttribute("startdelay"));
	this.monstersInc=parseInt(monsterNode.getAttribute("increment"));
	this.monstersEvery=parseInt(monsterNode.getAttribute("every"));
	this.monstersMax=parseInt(monsterNode.getAttribute("max"));

	var lessionNodes=ruleXmlDoc.evaluate("/rules/lession", ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (lessionNodes.snapshotLength!=1) return false;
	var lessionNode=lessionNodes.snapshotItem(0);
    var tmpType=lessionNode.getAttribute("type").toLowerCase(); 
	switch (tmpType)
	{
		case "multiply_table":
			this.lessionType=LESSIONTYPE.MULTIPLY_TABLE;
			this.lessionMultiplyTable=parseInt(lessionNode.getAttribute("table"));
			break;
		case "multiply_random":
			this.lessionType=LESSIONTYPE.MULTIPLY_RANDOM;
			this.lessionMinValue=parseInt(lessionNode.getAttribute("min"));
			this.lessionMaxValue=parseInt(lessionNode.getAttribute("max"));
			break;
		case "addition_random":
			this.lessionType=LESSIONTYPE.ADDITION_RANDOM;
			this.lessionMinValue=parseInt(lessionNode.getAttribute("min"));
			this.lessionMaxValue=parseInt(lessionNode.getAttribute("max"));
			break;
		case "substraction_random":
			this.lessionType=LESSIONTYPE.SUBSTRACTION_RANDOM;
			this.lessionMinValue=parseInt(lessionNode.getAttribute("min"));
			this.lessionMaxValue=parseInt(lessionNode.getAttribute("max"));
		    var tmpval=lessionNode.getAttribute("allownegativeresult").toLowerCase();
			this.lessionAllowNegativeResult=tmpval=="true"?true:false;

			break;
	}
	return true;
}

Rules.prototype.GetRandomMonsterName=function()
{
	var numMonsters=this.monstersToUse.length;
	var i=getRandomInt(0,numMonsters -1);
	return this.monstersToUse[i];
}

Rules.prototype.GetNextTask_MultiplyTable=function()
{
	var param=getRandomInt(0,10);
	var task=new Task();
	task.text=this.lessionMultiplyTable + " x " + param;
	task.result=this.lessionMultiplyTable*param;
	return task;		
}

Rules.prototype.GetNextTask_MultiplyRandom=function()
{
	var param1=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	var param2=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	var task=new Task();
	task.text=param1 + " x " + param2;
	task.result=param1*param2;
	return task;		
}

Rules.prototype.GetNextTask_AdditionRandom=function()
{
	var param1=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	var param2=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	var task=new Task();
	task.text=param1 + " + " + param2;
	task.result=param1+param2;
	return task;		
}

Rules.prototype.GetNextTask_SubstractionRandom=function()
{
	var param1=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	var param2=0;
	if (this.lessionAllowNegativeResult)
	{
		param2=getRandomInt(this.lessionMinValue,this.lessionMaxValue);
	}
	else
	{
		param2=getRandomInt(this.lessionMinValue,param1);
	}
	var task=new Task();
	task.text=param1 + " - " + param2;
	task.result=param1-param2;
	return task;		
}


Rules.prototype.GetNextTask=function()
{
	switch (this.lessionType)
	{
		case LESSIONTYPE.MULTIPLY_TABLE:
			return this.GetNextTask_MultiplyTable();
		case LESSIONTYPE.MULTIPLY_RANDOM:
			return this.GetNextTask_MultiplyRandom();
		case LESSIONTYPE.ADDITION_RANDOM:
			return this.GetNextTask_AdditionRandom();
		case LESSIONTYPE.SUBSTRACTION_RANDOM:
			return this.GetNextTask_SubstractionRandom();
	}
}

Rules.prototype.Reset=function()
{
	this.gameTime=0;
	if (this.monstersStartDelay!=0)
	{
		this.nextMonsterIncTime=this.monstersStartDelay;
	}
	else
	{
		this.nextMonsterIncTime=this.monstersEvery;
	}
	this.numMonsterAlive=this.monstersMin;
	this.maxMonsterDone=this.numMonsterAlive>=this.monstersMax;

	if (this.speedStartDelay!=0)
	{
		this.nextSpeedIncTime=this.speedStartDelay;
	}
	else
	{
		this.nextSpeedIncTime=this.speedEvery;
	}
	this.actualSpeed=this.speedMin;
	this.maxSpeedDone=this.actualSpeed>=this.speedMax;
}

Rules.prototype.QueryRules=function(dt)
{
	this.gameTime+=dt;

	//Test if it's time to evaluate next monster increase
	if (!this.maxMonsterDone && this.gameTime>=this.nextMonsterIncTime)
	{
		this.nextMonsterIncTime+=this.monstersEvery;
		this.numMonsterAlive+=this.monstersInc;
		this.maxMonsterDone=this.numMonsterAlive>=this.monstersMax;
	}
	
	//Test speed
	if (!this.maxSpeedDone && this.gameTime>=this.nextSpeedIncTime)
	{
		this.nextSpeedIncTime+=this.speedEvery
		this.actualSpeed+=this.speedInc
		this.maxSpeedDone=this.actualSpeed>=this.speedMax;
	}

	var r=new Rule();
	r.numMonsters=this.numMonsterAlive;
	r.speed=this.actualSpeed;
	return r;
}
