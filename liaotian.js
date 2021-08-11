function found(keyword){      //基于分词词库获取关键词
	if(W[keyword]==1){
		return true;
	}else{
		return false;
	}
}
	
function parseChinese(inputSentence){
//正向关键词最长匹配法
	//删除待处理字符串头部的空格
	inputSentence=inputSentence.replace(/(^\s+)/,"");
	var inputSentenceLength=inputSentence.length;
	var wordMaxLength=7;
	var resultArray=new Array();
	var resultString="";
	var recognizedWords="";
	
	//如果输入句长度小于词典词汇长度则令最大长度等于句子长度
	if(inputSentenceLength<=wordMaxLength){
		wordMaxLength=inputSentenceLength;
	}
	
	//增加三个空格方便尾部处理，空格数=wordMaxLength-1
	inputSentence+="      ";
	
	for(var i=0;i<inputSentenceLength;i++){
	//尾部还需特殊处理
		for(var j=wordMaxLength;j>0;j--){
			var checkword=inputSentence.substr(i,j);
			if(found(checkword)){
				//alert(checkword);
				recognizedWords+=checkword+",";
				resultArray.push(checkword);
				//注意后面需要-1，因为FOR循环会自动加1
				i=i+j-1;
				break;
			}else{
				if(j==1){
					resultArray.push(checkword);
				}
			}
			
		}
	}
	
	//处理所得到的结果数组
	//由于前面的过程会把英文单词分割成字母，现在需要连接起来
	for(var i=0;i<resultArray.length-1;i++){
		var regw=/\w/;
		if(regw.test(resultArray[i])&&regw.test(resultArray[i+1])){
			resultArray[i+1]=resultArray[i]+resultArray[i+1];
			resultArray[i]="";
		}
	}
	
	//结果数组转换成结果字符串
	resultString=resultArray.join(" ");
	//替换掉里面多余的空格
	resultString=resultString.replace(/\s{2,}/g," ");
	//替换掉多余的逗号去除尾部空元素
	resultString=resultString.replace(/,$/,"");
	//重新将字符串转换回数组
	//去除识别字符串里的重复元素
	if(resultString==""){
		resultArray=new Array();
	}else{
		resultArray=resultString.split(" ").reverse().join(",").match(/([^,]+)(?!.*\1)/ig).reverse(); 
	}
	
	//本分词函数对象各个属性最终值
	recognizedWords=recognizedWords.replace(/,$/,"");
	this.recognizedWords=recognizedWords;
	//注意输入值为空或者不匹配的情况
	if(this.recognizedWords==""){
		this.recognizedWordsArray=new Array();
	}else{
		this.recognizedWordsArray=recognizedWords.split(",").reverse().join(",").match(/([^,]+)(?!.*\1)/ig).reverse(); //ar.reverse().join(",").match(/([^,]+)(?!.*\1)/ig).reverse()//删除数组中重复元素
	}
	
	this.resultString=resultString;
	this.resultArray=resultArray;
}
 
function matchAllRate(string1,string2){
//任意两句话的话题匹配程度（只考虑二者的关键词）
 
	var matchScore1=0;
	var matchScore2=0;
 
	var chineseWords1=new parseChinese(string1);
	var chineseWords2=new parseChinese(string2);
	
	var keywordsArray1=chineseWords1.resultArray;
	var keywordsArray2=chineseWords2.resultArray;
	
	var keywordsString1="#"+keywordsArray1.join("##")+"#";
	var keywordsString2="#"+keywordsArray2.join("##")+"#";
	
	var keywordsStringRegX1="/"+"#"+keywordsArray1.join("#|#")+"#/gi";
	var keywordsStringRegX2="/"+"#"+keywordsArray2.join("#|#")+"#/gi";
	
	//用string2的关键词去匹配string1
	var matchArray1=new Array();
	matchArray1=keywordsString1.match(eval(keywordsStringRegX2));       //eval为计算
	
	//用string1的关键词去匹配string2
	var matchArray2=new Array();
	matchArray2=keywordsString2.match(eval(keywordsStringRegX1));
	
	if(matchArray1!=null){
		matchScore1=matchArray1.length;
	}else{
		matchScore1=0;
	}
	
	if(keywordsArray2.length>0){
		matchScore1=matchScore1/keywordsArray2.length*100;
	}else{
		matchScore1=0;
	}
	
	if(matchArray2!=null){
		matchScore2=matchArray2.length;
	}else{
		matchScore2=0;
	}
	
	if(keywordsArray1.length>0){
		matchScore2=matchScore2/keywordsArray1.length*100;
	}else{
		matchScore2=0;
	}
	
	//取互相匹配的值的平均值为最终结果
	var averageScore=(matchScore1+matchScore2)*0.5;
	
	return averageScore;
}
 
var sendButton=document.getElementById('button-send')     //找到发送按钮
var inputArea=document.getElementById('textArea')     //找到输入框
var msgList=document.getElementById('message-list')      //找到信息列表

function sendMsg(msg,className){
  var li=document.createElement('li');      //创建li
  li.className=className;
  var childDiv = document.createElement('div');      //创建div
  childDiv.innerText = msg;
  li.appendChild(childDiv);
  msgList.appendChild(li);
}

function sendRobot(msg,className){
  var li=document.createElement('li');      //创建li
  li.className=className;
  var robot=document.createElement('div');
  robot.className='robot';
  var childDiv = document.createElement('div');      //创建div
  childDiv.innerText = msg;
  li.appendChild(robot);
  li.appendChild(childDiv);
  msgList.appendChild(li);
}

function final(){
  var QA_Count=QA.length;
	var bestAnswerIndex=0;
	var bestMatchScore=0;
	
	var questionString=document.getElementById("textArea").value;
	
	//搜寻最接近的问答
	for(var i=0;i<QA_Count;i++){
		var answerQ=QA[i].Q;
		answerQ=answerQ.replace(/\^|\.|\*|\?|\!|\/|\\|\$|\#|\&|\||,|\[|\]|\{|\}|\(|\)|\-|\+|\=/g," ");
		var matchScore=matchAllRate(questionString,answerQ);
		//优选出匹配度最高的
		if(matchScore>=bestMatchScore){
			bestMatchScore=matchScore;
			bestAnswerIndex=i;
		}
		//如果遇到全匹配则跳出搜索循环
		if(matchScore==100){
			break;
		}
		//如果识别率为零则生成一个随机应答索引
		//问答知识库头10条记录是为这种情况设定的
		if(bestMatchScore==0){
			bestAnswerIndex=Math.floor(Math.random()*10);
		}
		
	}
	
	//依据所获的索引号提取出问题的最佳答案
	var answerString=QA[bestAnswerIndex].A;


  var userMsg=inputArea.value;      //获取输入框输入文字
  inputArea.value='';     //清空输入框
  sendMsg(userMsg,'list-user');
  sendRobot(answerString,'list-robot');
}

sendButton.addEventListener('click',final)      //监听鼠标点击事件

inputArea.addEventListener('keyup',function(e){     //监听回车键
  if(e.key=='Enter')
  final();
})