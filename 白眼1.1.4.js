//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//监控插件：支持ql spy一键迁移与复原
//支持口令解析、链接解析变量
//支持自定义链接解析转换(内置部分链接解析)，自定义变量转换
//支持多链接解析，多变量监控
//支持不完全静默，支持配置分享
/*************监控****************/
// [rule:[\s\S]*[(|)|#|@|$|%|¥|￥|!|！]([0-9a-zA-Z]{10,14})[(|)|#|@|$|%|¥|￥|!|！][\s\S]*]
//口令监控

//[rule:[\s\S]*https://\S+\.isvjcloud\.com/\S+[\s\S]*]
//[rule:[\s\S]*https://\S+\.isvjd\.com/\S+[\s\S]*]
//[rule:[\s\S]*https://\S+\.jd\.com/\S+[\s\S]*]
//链接监控

// [rule:[\s\S]*export \w+[ ]*=[ ]*"[^"]+"[\s\S]*]
//变量监控

//如果需要具体的执行情况，可自行前往Que_Manager()取消相应注释
/*************监控管理****************/
// [rule:^迁移ql spy$]
//迁移后ql spy数据将移除以避免冲突

// [rule:^恢复ql spy$]

// [rule:^监控管理$]
// 若设置静默模式，如需将监控信息推送到某平台，使用命令"set SpyNotify qq/tg/wx 用户id"或者"set SpyGroupNotify qq/tg/wx 群id"设置推送渠道

//[rule:^导出白眼$]
//导出白眼的配置，导出监控变量过多时可能导出失败

// [rule:^ImportWhiteEye=\S+]
//导入监控配置,将导出信息发给机器人
//社交平台消息长度限制，导出监控变量过多时可能无法发出导入数据，如无法导入可前往命令行导入

//[rule:^监控状态$]

//[rule:^清空监控队列$]

//[rule:^清空监控记录$]

//[rule:^清空白眼数据$]

// [disable: false] 是否禁用


/*
插件中涉及名称：监控任务名称，变量转换名称，链接解析名称，以及内置的链接解析的名称

*/
//2022-8-27 v1.0.0 
//2022-8-27 v1.0.1 修复人形傻妞与tg机器人位于同一个对话时不停互相丢链接的问题，可能修复监控偶尔报错的问题
//2022-8-29 v1.0.2 修复最新版傻妞重复迁移ql spy导致备份数据丢失的问题,修复多容器报错问题
//2022-8-30 v1.1.0 修改任务处理为锁机制，导入配置时默认使用所有非禁用容器,添加一键清除白眼所有数据命令(卸载白眼可用)
//2022-8-30 v1.1.1 紧急修复，人形与机器人位于同一会话，且监控消息含链接且变量为链接时的死循环问题
//2022-8-31 v1.1.2 解决处理队列过程中遭遇不正常退出导致的队列不不处理问题（不完美，也可手动使用"清空监控队列"命令进行重置)，以及监控任务配置时未使用唯一性关键词导致启动青龙多个含相同关键词任务的问题
//2022-8-31 v1.1.3 修复未找到青龙任务时，陷入死循环的问题，以及其他恢复ql spy失败问题
//2022-8-31 v1.1.4 修复监控任务含多变量出现的奇奇怪怪问题




/*****************数据存储******************/

/*jd_cookie env_listens_new：监控任务
[{
	ID:id,
	Name:监控任务名,
	Keyword:脚本关键词或者任务名关键词,
	Envs:[监控变量名],
	Disable:是否禁用,
	Clients:[监控容器client_id],
	Interval:任务间隔(分),
	LastTime:上次执行时间,
	TODO:[[{//未执行队列
		name:监控变量名,
		value:监控变量值
	}]],
	DONE:[[{//已执行队列
		name:监控变量名,
		value:监控变量值		
	}]]
}]

jd_cookie env_listens_new:任务锁，防止多进程同时处理队列

jd_cookie spy_silent_new：bool,是否静默监控

jd_cookie spy_targets_new：监控目标
[{name:监控目标备注名,id:监控目标id}]

jd_cookie spy_envtrans_new：变量转换
[{ori:原变量,redi:转换后变量,name:备注名称}]

jd_cookie spy_urldecode_new：链接解析
[{
	keyword:url关键词,
	trans:[{
		ori:url中需要提取的参数名(-1表示直接使用整段url),
		redi:提取的参数使用的变量名
		}]
	name:备注名称
}]

*/
function main(){
//	let isspy=false
	var msg=GetContent()
			
	if(IsTarget()||isAdmin()||GetImType()=="pgm"){//仅对监控目标和管理员消息监控
//		try{	
		//变量监控
			if(msg.match(/export ([^"]+)="([^"]+)"/)!=null){
				let names=msg.match(/(?<=export[ ]+)\w+(?=[ ]*=[ ]*"[^"]+")/g)
				let values=msg.match(/(?<=export[ ]+\w+[ ]*=[ ]*")[^"]+(?=")/g)
				let envs=[] 
				for(let i=0;i<names.length;i++)
					envs.push({name:names[i],value:values[i]})
				Env_Listen(envs)	
//			isspy=true	
			}
		//链接监控
			else if(msg.indexOf("http")!=-1){
				let urls=msg.match(/https:\/\/[0-9a-zA-Z-&?=\/\.]+/g)
//			sendText(urls.toString())
				Url_Decode(urls)
//			isspy=true	
			}
		//口令监控
			else if(msg.match(/[(|)|#|@|$|%|¥|￥|!|！][0-9a-zA-Z]{10,14}[(|)|#|@|$|%|¥|￥|!|！]/g)!=null){
				JDCODE_Decode(msg)
//			isspy=true	
			}		
/*		}
		catch(err){
			Notify("发生错误，请联系开发者\n"+err)
			return
		}*/
	}
	
	if(!isAdmin()&&GetImType()!="pgm"){//其他命令为管理员命令
		Continue()
		return
	}

	
	if(msg=="迁移ql spy"){
		Migrate_qlspy()
	}
	else if(msg=="恢复ql spy"){
		Recovery_qlspy()
	}
	
	else if(msg=="导出白眼")
		Export_Spy()

	else if(msg.match(/^ImportWhiteEye=\S+/)!=null)
		sendText(Import_Spy(msg.match(/(?<=ImportWhiteEye=)\S+/g)))
			
	else if(msg=="监控管理")
		Spy_Manager()
	
	else if(msg=="清空监控队列"){
		Spy_Clear()	
	}
	
	else if(msg=="清空监控记录")
		Spy_RecordReset()
	
	else if(msg=="监控状态")
		Spy_Status()
	
	else if(msg=="清空白眼数据"){
		SaveData("","","","","")
		sendText("已删除白眼监控任务、静默设置、监控目标、变量转换及链接解析数据")
	}
	
	else //if(!isspy)
		Continue()
	return
}

function Spy_Manager(){	
	const LIMIT=24//循环次数限制，防止意外死循环
	const WAIT=60*1000//输入等待时间
	let notify=""
	let data=bucketGet("qinglong","QLS")
	if(data==""){
		sendText("未对接青龙，请先前往‘青龙管理’添加青龙容器，已退出")
		return
	}
	let QLS=JSON.parse(data)
	let data1=bucketGet("jd_cookie","env_listens_new")
	let silent=bucketGet("jd_cookie","spy_silent_new")
	let data2=bucketGet("jd_cookie","spy_targets_new")
	let data3=bucketGet("jd_cookie","spy_envtrans_new")
	let data4=bucketGet("jd_cookie","spy_urldecode_new")
	if(data1=="")
		Listens=[]
	else
		Listens=JSON.parse(data1)
	if(data2=="")
		targets=[]
	else
		targets=JSON.parse(data2)
	if(data3=="")
		trans=[]
	else
		trans=JSON.parse(data3)
	if(data4=="")
		urldecodes=[]
	else
		urldecodes=JSON.parse(data4)
	
	let limit=LIMIT
	let inp=1//随便什么值，非空即可
	while(true){
		if(limit--<0){
			sendText("由于您长时间未操作，已自动退出，数据未保存")
			return
		}
		if(inp!="")	
			Print_SpyMenu(Listens,silent,targets)
		inp=input(WAIT)
		if(inp=="q"){
			sendText("请确认是否保存？输入\"是\"保存")
			if(input(WAIT)=="是")
				sendText(SaveData(Listens,silent,targets,trans,urldecodes))
			else
				sendText("未保存本次修改内容")
			break
		}
		
		else if(inp=="wq"){
				sendText(SaveData(Listens,silent,targets,trans,urldecodes))
			break
		}
		
		else if(inp=="a"){
			if(silent=="true")
				silent="false"
			else if(silent=="false")
				silent="true"
		}
			
		else if(inp=="b"){
			let limit2=LIMIT
			let inp2=1
			while(true){
				if(limit2--<0){
					sendText("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if(inp2!="")
					Print_SpyTran(trans)
				inp2=input(WAIT)
				if(inp2=="u")
					break
				else if(inp2<0){
					try{
						trans.splice(Math.abs(inp2)-1,1)
					}
					catch(err){
						sendText("输入有误，请重新选择")		
					}
				}
				else if(inp2=="0"){
					let tran={
						ori:"",
						redi:"",
						name:""
					}
					sendText("请输入您想转换的变量名：")
					tran.ori=input(WAIT)
					sendText("请输入您想变为的变量名：")
					tran.redi=input(WAIT)
					sendText("请输入该转换任务的备注名称：")
					tran.name=input(WAIT)
					trans.push(tran)
					sendText("已添加"+tran.name+":"+tran.ori+"-->"+tran.redi+"\n您可以继续添加转换变量或者返回上一级菜单")
				}
			}
		}
		
		else if(inp=="c"){
			let limit2=LIMIT
			let inp2=1
			while(true){
				if(limit2--<0){
					sendText("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if(inp2!="")
					Print_SpyUrl(urldecodes)
				inp2=input(WAIT)
				if(inp2=="u")
					break
				else if(inp2<0){
					try{
						urldecodes.splice(Math.abs(inp2)-1,1)
					}
					catch(err){
						sendText("输入有误，请重新选择")		
					}
				}
				else if(inp2=="0"){
					let decode={
						keyword:"",
						name:"",
						trans:[{
							ori:"",
							redi:""
						}]
					}
					sendText("请输入您想解析链接的关键词(例如：http://xxx.com/yyyy/zzzz/)")
					decode.keyword=input(WAIT)
					sendText("请输入您想提取的参数（例如:http://...../?actid=xxx中的actid,若使用整段链接作为变量请输入-1)")
					decode.trans[0].ori=input(WAIT)
					sendText("请输入您想使用该参数的变量名：")
					decode.trans[0].redi=input(WAIT)
					sendText("请输入该解析任务的备注名称：")
					decode.name=input(WAIT)
					urldecodes.push(decode)
					sendText("已添加"+decode.name+"("+decode.keyword+"):"+decode.trans[0].ori+"-->"+decode.trans[0].redi+"\n您可以继续添加转换变量或者返回上一级菜单")
				}
			}
		}
		
		else if(inp=="d"){
			let limit2=LIMIT
			let inp2=1
			while(true){
				if(limit2--<0){
					sendText("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if(inp2!="")
					Print_SpyTargets(targets)
				inp2=input(WAIT)
				if(inp2=="u")
					break
				else if(inp2<0){
					try{
						targets.splice(Math.abs(inp2)-1,1)
					}
					catch(err){
						sendText("输入有误，请重新选择")
					}
				}
				else if(inp2=="0"){
					sendText("请输入新添加的监听目标的账号ID或者群ID：")
					let id=input(WAIT)
					if(id==""){
						sendText("已超时，请重新添加")
						continue
					}
					sendText("请输入新添加的监听目标的备注名称：")
					let name=input(WAIT)
					if(name==""){
						sendText("已超时，未添加备注名称")
					}
					targets.push({id:id,name:name})				
				}
			}
		}
	
		else if(inp=="0"){
			let spy={
				ID:Listens.length,
				Name:"",
				Keyword:"",
				Envs:[],
				Disable:false,
				Clients:[],
				Interval:1,//默认最小间隔1分钟
				LastTime:0,
				TODO:[],
				DONE:[]
			}
			for(let i=0;i<QLS.length;i++)
				spy.Clients.push(QLS[i].client_id)
			sendText("请输入监视任务名称：")
			spy.Name=input(WAIT)
			sendText("请输入脚本关键词：")
			spy.Keyword=input(WAIT)
			sendText("请输入洞察变量：")
			spy.Envs.push(input(WAIT))
			sendText("请输入运行间隔时间(分钟):")
			spy.Interval=input(WAIT)
			sendText("已添加监视任务，默认作用所有容器，如需修改请在下面主菜单选择编辑")
			Listens.push(spy)
		}
		
		else if(inp<0){
			try{
				Listens.splice(Math.abs(inp)-1,1)
			}
			catch(err){
				sendText("输入有误，请重新选择")
				continue
			}
		}
		
		else if(inp>0&&inp<=Listens.length){
			let inp2=1
			let limit2=LIMIT
			while(true){
				if(limit2--<0){
					sendText("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if(inp2!="")
					Print_SpyItem(Listens[inp-1])
				inp2=input(WAIT)
				if(inp2=="u")
					break
				else if(inp2=="q"){
					sendText("请确认是否保存？输入\"是\"保存")
					if(input(WAIT)=="是")
						sendText(SaveData(Listens,silent,targets,trans,urldecodes))
					else
						sendText("未保存本次修改内容")
					return
				}
				else if(inp2=="wq"){
					sendText(SaveData(Listens,silent,targets,trans,urldecodes))
					return
				}
					
				else if(inp2==1){
					sendText("请输入监视任务名称：")
					Listens[inp-1].Name=input(WAIT)
				}
				else if(inp2==2){
					sendText("请输入脚本关键词：")
					Listens[inp-1].Keyword=input(WAIT)						
				}
				else if(inp2==3){//修改洞察变量
					let inp3=1
					let limit3=LIMIT
					while(true){
						if(limit3--<0){
							sendText("您已经长时间未操作，已自动退出，数据未保存")
							return
						}
						if(inp3!="")
							Print_Spy_Envs(Listens[inp-1].Envs)
						inp3=input(WAIT)
						if(inp3=="u")
							break
						else if(inp3=="0"){
							sendText("请输入新添加的洞察变量：")
							Listens[inp-1].Envs.push(input(WAIT))
						}
						else if(inp3<0){
							try{
								Listens[inp-1].Envs.splice(Math.abs(inp3)-1,1)
							}
							catch(err){
								sendText("输入有误，请重新输入")
							}
						}
					}						
				}
				else if(inp2==4){//修改作用容器
					let inp3=1
					let limit3=LIMIT
					while(true){
						if(limit3--<0){
							sendText("由于您长时间未操作，已自动退出，数据未保存")
							return
						}
						if(inp3!="")	
							Print_SpyClients(QLS,Listens[inp-1].Clients)
						inp3=input(WAIT)
						if(inp3=="u")
							break
						else if(inp3=="0"){
							let tip="请选择添加的青龙容器:\n"
							for(let i=0;i<QLS.length;i++)
								tip+=(i+1)+"、"+QLS[i].name+"\n"
							sendText(tip)
							try{
								Listens[inp-1].Clients.push(QLS[input(WAIT)-1].client_id)
							}
							catch(err){
								sendText("输入有误，请重新选择")						
							}
						}
						else if(inp3<0){
							try{
								Listens[inp-1].Clients.splice(Math.abs(inp3)-1,1)
							}
							catch(err){
								sendText("输入有误，请重新选择")
							}
						}
					}					
				}
				else if(inp2==5){
					Listens[inp-1].Disable=!Listens[inp-1].Disable
				}
				else if(inp2==6){
					sendText("请输入运行间隔时间(分钟):")
					Listens[inp-1].Interval=input(WAIT)						
				}
				
			}
		}
	}
	return
}

function Spy_Status(){
	let data=bucketGet("jd_cookie","env_listens_new")
	if(data!=""){
		let now=(new Date()).getTime()
		if(bucketGet("jd_cookie","spy_locked")!="true")
			notify="☆已完成所有任务☆\n"
		else
			notify="★正在处理队列★\n"
		notify+="任务名 剩余任务 已完成任务 上次任务时间\n------------------------------\n"
		let Listens=JSON.parse(data)
		for(let i=0;i<Listens.length;i++){
/*			if(Listens[i].LastTime){//根据上次执行时间获取任务状态
				last=(new Date(Listens[i].LastTime)).getTime()
				if(now-last<Listens[i].Interval*60*1000||now-last<60*1000)
					notify+="★"
				else
					notify+="☆"
			}
			else
				notify+="☆"*/
			let last=new Date(Listens[i].LastTime)
			let time=last.getHours()+":"+last.getMinutes()+":"+last.getSeconds()
			notify+=Listens[i].Name+" 【"+Listens[i].TODO.length+"】【 "+Listens[i].DONE.length+"】 "+time+"\n"
			
		}
		Notify(notify)
	}
	else
		Notify("未配置监控任务，请先前往‘监控管理’添加")
}

function Spy_Clear(){
	let data=bucketGet("jd_cookie","env_listens_new")
	if(data!=""){
		let Listens=JSON.parse(data)
		for(let i=0;i<Listens.length;i++)
			Listens[i]["TODO"]=[]
		bucketSet("jd_cookie","env_listens_new",JSON.stringify(Listens))
	}
	bucketSet("jd_cookie","spy_locked",false)//开锁
	Notify("清空任务队列完成")
	return	
}

function Spy_RecordReset(){
	let data=bucketGet("jd_cookie","env_listens_new")
	if(data!=""){
		let Listens=JSON.parse(data)
		for(let i=0;i<Listens.length;i++){
			Listens[i]["DONE"]=[]
			Listens[i]["LastTime"]=0
		}
		bucketSet("jd_cookie","env_listens_new",JSON.stringify(Listens))
	}
		bucketSet("jd_cookie","spy_locked",false)//开锁
	Notify("清理记录完成")
	return	
}

function Migrate_qlspy(){
	let notify=""
	//迁移监控配置
	let data=bucketGet("jd_cookie","env_listens")
	let data2=bucketGet("jd_cookie","env_listens_new")
	if(data==""||data=="[]"){
		Notify("ql spy不存在监控配置，或许您已经迁移过,已退出")
		return
	}
	if(data2!="")
		newspy=JSON.parse(data2)
	else
		newspy=[]
	bucketSet("jd_cookie","env_listens_backup",data)//ql spy数据备份
	bucketSet("jd_cookie","env_listens","")//清除ql spy数据，以免冲突
	let result=Add_Spy(newspy,JSON.parse(data))
	for(let i=result.addat;i<result.spys.length;i++){
		notify+=result.spys[i].Name+"\n"
		result.spys[i].Interval=Math.ceil(result.spys[i].Interval/60)
	}
	bucketSet("jd_cookie","env_listens_new",JSON.stringify(result.spys))
	notify="成功迁移"+(result.spys.length-result.addat)+"项监控任务:\n"+notify
	
	//迁移静默设置
	let silent=bucketGet("jd_cookie","spy_slient")
	bucketSet("jd_cookie","spy_silent_new",silent)
	notify+="\n成功迁移静默设置:"+silent+"\n"
	
	//迁移监控目标
	let data3=bucketGet("jd_cookie","spy_targets")
	let targets=data3.split("&")
	let tn=[]
	for(let i=0;i<targets.length;i++)
		tn.push({id:targets[i],name:""})
	bucketSet("jd_cookie","spy_targets_new",JSON.stringify(tn))
	notify+="\n成功迁移监控目标:"+data3+"\n"
	
	sendText(notify+"\nql spy数据已备份至jd_cookie env_listens_backup,可在网页后台查看")
}

function Recovery_qlspy(){
	let data=bucketGet("jd_cookie","env_listens_backup")
	if(data==""||data=="[]"){
		sendText("不存在备份数据")
		return
	}
	else{
		bucketSet("jd_cookie","env_listens",data)
		Notify("已恢复,可前往ql spy查看")		
	}
}

function Env_Listen(envs){
//	sendText(JSON.stringify(envs))
	if(envs.length==0)
		return
// 	检查变量名是否为用户配置的需要转换的变量名，是则先转换
	let data2=bucketGet("jd_cookie","spy_envtrans_new")
	if(data2!=""){
		let trans=JSON.parse(data2)
		for(let i=0;i<envs.length;i++){
			for(let j=0;j<trans.length;j++){
				if(envs[i].name==trans[j].ori){
					envs[i].name=trans[j].redi
					Notify("变量自动转换：export "+envs[i].name+"=\""+envs[i].value+"\"")
				}
			}
		}
	}

	//分析变量是否为监控变量，是否为重复线报，变量对应监控任务是否禁用，以及加入任务队列后是否执行
	let Listens=[]//监控配置数据
	let data=bucketGet("jd_cookie","env_listens_new")
	if(data!=""){
		let notify=""
		let find=false,flag=false
		let unlock=true//是否解锁处理任务队列
		let now=(new Date()).getTime()
		Listens=JSON.parse(data)
		for(let i=0;i<Listens.length;i++){
			if(Listens[i]["TODO"]==undefined)
				Listens[i]["TODO"]=[]
			if(Listens[i]["DONE"]==undefined)
				Listens[i]["DONE"]=[]
			//根据上次任务执行时间,分析处理队列过程中是否不正常退出导致队列没能处理完并开锁
			if(Listens[i].LastTime&&Listens[i].LastTime!=0){
				let last=(new Date(Listens[i].LastTime)).getTime()
				if(Listens[i].Interval!=0){
					if(now-last<Listens[i].Interval*60*1000)
						unlock=false	
				}
				else if(now-last<3*60*1000)
					unlock=false
			}
			
			let record=[]
			for(let j=0;j<Listens[i].Envs.length;j++){
				for(k=0;k<envs.length;k++){
					if(Listens[i].Envs[j]==envs[k].name){
						find=true
						if(!IsIn(envs[k],Listens[i].TODO,Listens[i].DONE)){
							record.push({name:envs[k].name,value:envs[k].value})						
						}
						else{
							notify+="重复的"+Listens[i].Name+"线报，已忽略\n"
						}
						envs.splice(k,1)//删除已添加变量	
					}					
				}
			}
			if(record.length!=0){//检查非重复变量对应任务是否禁用
//				sendText(JSON.stringify(record))
				if(!Listens[i].Disable){
					flag=true
					Listens[i].TODO.push(record)
					bucketSet("jd_cookie","env_listens_new",JSON.stringify(Listens))
					notify+="发现"+record.length+"个洞察变量，加入到【"+Listens[i].Name+"】任务队列\n"	
				}
				else{
					notify+="发现"+record.length+"个洞察变量，检查到【"+Listens[i].Name+"】任务已禁用，已忽略\n"
				}
			}
		}
		
		if(find){
			Notify(notify)
			if(bucketGet("jd_cookie","spy_locked")=="false"&&flag){
				bucketSet("jd_cookie","spy_locked",true)
				Que_Manager()
				return
			}
//			else
//				return -4//变量对应任务已禁用或重复变量
		}
		else{
			Notify("未监控的变量，已忽略")
//			return -5 //监控配置中不存在监控该变量的任务	
		}
		if(unlock){//可能未处理完任务并被重启，导致未能开锁且不存在任务进程处理队列
			bucketSet("jd_cookie","spy_locked",false)
//			Notify("开锁")
		}
	}	

	else{
		return -6//不存在监控配置
	}
}

function JDCODE_Decode(JDCODE){
//	const NotifyMode=bucketGet("jd_cookie","jxjj")//是否精简口令解析通知

	let DSP=""
	let info=NolanDecode(JDCODE)
	if(info!=null)
		DSP="\n\n--本次解析服务由Nolan提供"
	else{
		info=WallDecode(JDCODE)
		if(info!=null)
			DSP="\n\n--本次解析服务由WALL提供"
		else{
			info=WindfggDecode(JDCODE)
			if(info!=null)
				DSP="\n\n--本次解析服务由Windfgg提供"
			else{
				Notify("解析失败")
				return null
			}		
		}	
	}
	
	let imType=GetImType()
	let img=info.img
	let title=info.title
	let sharefrom=info.userName
	let url=info.jumpUrl
	let notify=""
	
	let spy=Decode_Url(url)//从链接中解析变量[{name:监控变量名,value:监控变量值,act:活动任务名}]

	if(imType=="tg"||imType=="pgm")
		notify="["+title+"]("+url+")"
	else if(imType=="qq")
		notify="[CQ:share,url="+url+",title="+title+"]"
	if(spy.length==0){//未解析到变量
		let tip="\n\n未在链接中解析到变量，可在‘监控管理’内添加"
		if(imType=="pgm"||imType=="qq"||imType=="tg")
			Notify(notify+tip,notify+tip)
		else
			Notify("【"+title+"】\n"+url+tip,notify+tip)
		return null
	}
	else{//解析到变量
//	sendText(JSON.stringify(spy))
		let tip="\n\n"
		for(let i=0;i<spy.length;i++)
			tip+="【"+spy[i].act+"】\n"+"export "+spy[i].name+"=\""+spy[i].value+"\"\n"
		if(imType=="qq"||imType=="pgm"||imType=="tg")
			Notify(notify+tip,notify+tip)
		else
			Notify("【"+title+"】\n"+url+tip,notify+tip)
		
		Env_Listen(spy)
		return spy
	}
}

function Url_Decode(urls){
//	sendText(urls.length+"\n"+urls)
	let notify=""
	let envs=[]//记录url中提取的变量
	for(let i=0;i<urls.length;i++){
		let spy=Decode_Url(urls[i])
		if(spy.length==0){
			if(urls.length>1)
				notify+="链接"+(i+1)+"未解析到变量\n可使用\"监控管理\"命令自行添加\n"
			else
				notify+="未解析到变量\n可使用\"监控管理\"命令自行添加\n"
		}
		else{
			for(let i=0;i<spy.length;i++){
				notify+="【"+spy[i].act+"】\n"+"export "+spy[i].name+"=\""+spy[i].value+"\"\n"
				envs.push(spy[i])				
			}
		}
	}	
	Notify(notify)
	if(envs.length!=0)
		Env_Listen(envs)
}

function Export_Spy(){
	let notify=""
	let data=bucketGet("jd_cookie","env_listens_new")
	if(data=="")
		return "不存在监控信息"
	let spys=JSON.parse(data)
	let n=0//监控数组截取位置
	sendText("请输入每条消息导出项数(当导出项数过多时会导致无法导出或者最后无法导入，输入0将一次全部导出)")
	let num=input(15000)
	if(num.match(/[^\d]/g)!=null){
		sendText("输入有误，已退出")
		return
	}
	num=Number(num)
	if(num==0){
		let temp=ClearHistory(spys)
		if(sendText("ImportWhiteEye="+JSON.stringify(temp))=="")
			sendText("导出数量过多，导出失败,请重新导出并减少单次导出项数")
		return		
	}
	while(n+num<spys.length){
		let temp=ClearHistory(spys.slice(n,n+=num))
		
		if(sendText("ImportWhiteEye="+JSON.stringify(temp))=="")
			sendText("导出数量过多，导出失败,请重新导出并减少单次导出项数")
	}
	if(n<spys.length)//导出末尾未截取到的部分
		sendText("ImportWhiteEye="+JSON.stringify(ClearHistory(spys.slice(n))))
}

function Import_Spy(data){
	let notify=""
	let data1=bucketGet("qinglong","QLS")
	if(data1==""){
		Notify("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}	
	let QLS=JSON.parse(data1)
	try{
		var newspy=JSON.parse(data)	
	}
	catch(err){
		return "接收信息有误，或者切换平台导入，或者在命令行交互模式导入"
	}
	let olddata=bucketGet("jd_cookie","env_listens_new")
	if(olddata==""){//不存在监控信息
		for(let i=0;i<newspy.length;i++)
			notify+=(i+1)+"、"+newspy[i].Name+"\n"
		bucketSet("jd_cookie","env_listens_new",data)
		return "共导入"+newspy.length+"个监控信息\n"+notify			
	}
	else{
		let oldspy=JSON.parse(olddata)
		let result=Add_Spy(oldspy,newspy)
		for(let i=result.addat;i<result.spys.length;i++){
			notify+=(i+1-result.addat)+"、"+result.spys[i].Name+"\n"
			for(let j=0;j<QLS.length;j++)
				if(!QLS[j].disable)
					result.spys[i].Clients.push(QLS[j].client_id)
		}
//		sendText(JSON.stringify(result.spys))
		bucketSet("jd_cookie","env_listens_new",JSON.stringify(result.spys))
		return "共导入"+(result.spys.length-result.addat)+"个监控信息\n"+notify	
	}
}


/**************工具函数**************/
//处理任务队列
function Que_Manager(){	
	let data=bucketGet("qinglong","QLS")
	if(data==""){
		Notify("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}	
	let QLS=JSON.parse(data)
	Notify("处理任务队列")
	let count=0
	let limit=25//死循环保险，防止陷入死循环
	//处理队列任务
	while(true){
		let now=(new Date()).getTime()
		if(limit--<0){
			Notify("『白眼』\n死循环了，自动退出")
			Spy_Clear()
			break
		}
			
		//检查是否已完成所有任务，是则开锁并停止循环退出
		let Listens=JSON.parse(bucketGet("jd_cookie","env_listens_new"))
		let done=true
		for(let i=0;i<Listens.length;i++){
			if(Listens[i].TODO.length!=0){
				done=false
				break
			}
		}
		if(done){
			bucketSet("jd_cookie","spy_locked",false)//开锁
			Notify("已完成所有任务")
			break
		}
		else{
			bucketSet("jd_cookie","spy_locked",true)//防止不正常开锁		
		}	
			
			
				
		for(i=0;i<QLS.length;i++){
			QLS[i]["envs"]=[]
			QLS[i]["keywords"]=[]
		}
			
		//执行任务
		let t=60*1000//距离所有任务中最近的下一次任务的时间
		for(let i=0;i<Listens.length;i++){
			//分析距离上次任务时间是否达到执行间隔，并修正下一次任务的最近时间
			let todo=false
			if(Listens[i].LastTime){
				let last=(new Date(Listens[i].LastTime)).getTime()
				if(last+Listens[i].Interval!=0){
					let temp=last+Listens[i].Interval*60*1000-now
					if(temp<0){
						todo=true
						t=0
					}
					else if(temp<t)
						t=temp
				}
			}
			else
				todo=true

//			sendText(Listens[i].Name+":\n"+!Listens[i].Disable+"\n"+todo+"\n"+Listens[i].TODO.length)
			//记录各个容器中需要修改的变量与需要执行的任务关键词
			let more=false//如果
			if(todo&&Listens[i].TODO.length!=0){
			//if(Listens[i].TODO.length!=0){
				for(let j=0;j<Listens[i].Clients.length;j++){
					for(k=0;k<QLS.length;k++){
						if(Listens[i].Clients[j]==QLS[k].client_id){
							for(m=0;m<Listens[i].TODO[0].length;m++){
								//Notify(JSON.stringify(Listens[i].TODO[0][m]))
								QLS[k]["envs"].push(Listens[i].TODO[0][m])
							}
							QLS[k]["keywords"].push(Listens[i].Keyword)
							Listens[i].LastTime=now
							Listens[i].DONE.push(Listens[i].TODO[0])
							if(Listens[i].DONE.length>50)//默认最多保存50个监控记录
								Listens[i].DONE.splice(0,20)
							Listens[i].TODO.shift()
						}
					}
				}					
			}
		}
		
		//对各个容器执行任务
		let task=true
		for(let i=0;i<QLS.length;i++){
//			sendText(JSON.stringify(QLS[i].envs)+"\n\n"+QLS[i].keywords)
			if(QLS[i].disable||QLS[i].envs.length==0)//跳过禁用容器与非监控容器
				continue
			let token=Get_QL_Token(QLS[i].host,QLS[i].client_id,QLS[i].client_secret)
			if(token==null){
				Notify(QLS[i].name+"token获取失败，跳过")
				continue
			}
	
			if(!Modify_QL_Config(QLS[i].host,token,QLS[i].envs)){
				Notify(QLS[i].name+JSON.stringify(QLS[i].envs)+"配置文件变量修改失败，跳过")
				continue
			}
			let crons=Get_QL_Crons(QLS[i].host,token)
			if(crons==null){
				Notify(QLS[i].name+"获取青龙任务失败，跳过")
				continue
			}
			let ids=[],names=[]//记录需要执行的任务
			for(j=0;j<crons.length;j++){
				for(k=0;k<QLS[i].keywords.length;k++){
					if(crons[j].command.indexOf(QLS[i].keywords[k])!=-1||crons[j].name.indexOf(QLS[i].keywords[k])!=-1){
						if(crons[j].id)
							ids.push(crons[j].id)
						else
							ids.push(crons[j]._id)
						names.push(crons[j].name)
						QLS[i].keywords.splice(k,1)//删除以避免执行容器内具有相同关键词的任务
					}
				}
			}
			if(ids.length==0){
				Notify(QLS[i].name+"未找到任务:"+QLS[i].keywords.toString())
				Listens[i].DONE.pop()
				task=true
			}
			if(!Stop_QL_Crons(QLS[i].host,token,ids)){
//				Notify(QLS[i].name+":\n"+names.toString()+"\n停止失败")		
			}
			sleep(1000)
			if(Start_QL_Crons(QLS[i].host,token,ids)){
				Notify(QLS[i].name+":\n"+names.toString()+"\n执行成功")
				task=true
			}
//			else
//				Notify(QLS[i].name+":\n"+names.toString()+"\n执行失败")
		}
		if(task)
			bucketSet("jd_cookie","env_listens_new",JSON.stringify(Listens))
					
		count++
		if(t>0){
			sendText("第"+count+"次循环,等待时长:"+t)
			sleep(10000)
		}
		sleep(t)
	}
}

//清空Listens监控队列与记录
function ClearHistory(Listens){
	for(let i=0;i<Listens.length;i++){
		Listens[i]["TODO"]=[]
		Listens[i]["DONE"]=[]
		Listens[i]["LastTime"]=0
		Listens[i]["Clients"]=[]
		if(Listens[i].UUID)
			delete Listens[i].UUID
		if(Listens[i].Mode)
			delete Listens[i].Mode
		if(Listens[i].MaxRuntime)
			delete Listens[i].MaxRuntime
	}
	return Listens
}

//检查消息源是否监控目标或者管理员
function IsTarget(){
	try{
		let uid=GetUserID(),cid=GetChatID()
		let targets=JSON.parse(bucketGet("jd_cookie","spy_targets_new"))
		for(let i=0;i<targets.length;i++)
			if(targets[i].id==uid||targets[i].id==cid)
				return true			
			
	}
	catch(err){
		return false		
	}
}

//检查env是否已存在队列TODO或者DONE中
function IsIn(env,TODO,DONE){
//	sendText("env:"+JSON.stringify(env)+"\n\ntodo:"+JSON.stringify(TODO)+"\n\ndone:"+JSON.stringify(DONE))
	for(let i=0;i<TODO.length;i++)
		for(j=0;j<TODO[i].length;j++)
			if(TODO[i][j].name==env.name&&TODO[i][j].value==env.value)
				return true
	for(let i=0;i<DONE.length;i++)
		for(j=0;j<DONE[i].length;j++)
			if(DONE[i][j].name==env.name&&DONE[i][j].value==env.value)
				return true
	return false
}

//保存数据
function SaveData(Listens,silent,targets,trans,urldecodes){
	try{
		bucketSet("jd_cookie","env_listens_new",JSON.stringify(Listens))
		bucketSet("jd_cookie","spy_silent_new",silent)
		bucketSet("jd_cookie","spy_targets_new",JSON.stringify(targets))
		bucketSet("jd_cookie","spy_envtrans_new",JSON.stringify(trans))
		bucketSet("jd_cookie","spy_urldecode_new",JSON.stringify(urldecodes))	
		return "已保存本次修改"
	}
	catch(err){
		return "保存失败"
	}		
}

//打印监控主菜单页面
function Print_SpyMenu(Listens,silent,targets){
//	sendText(JSON.stringify(targets))
	let notify="----------------------\n请选择编辑对象\n----------------------\n(-数字删除,0添加,q退出，wq保存)\n"
	for(let i=0;i<Listens.length;i++){
		let name=Listens[i]["Name"]
		if(name==undefined)
			name=Listens[i]["name"]//之前数据存储写错单词
		if(Listens[i].Disable)
			notify+=(i+1)+"、"+name+"-[禁用]\n"
		else
			notify+=(i+1)+"、"+name+"\n"			
	}
	
	if(silent=="true")
		notify+="a、关闭静默\n"
	else
		notify+="a、开启静默\n"
	notify+="b、变量自动转换\n"
	notify+="c、链接自动解析\n"
	notify+="d、监听目标:"
	for(let i=0;i<targets.length;i++){
		if(targets[i].name!="")
			notify+="【"+targets[i].name+"】"
		else
			notify+="【"+targets[i].id+"】"
	}
	sendText(notify)
}

//打印监控菜单-监听目标页面
function Print_SpyTargets(targets){
	let notify="请选择监听目标进行编辑：\n(-数字删除，0增加，u返回)\n"
	for(let i=0;i<targets.length;i++){
		notify+=(i+1)+"、"
		if(targets[i].name!="")
			notify+=targets[i].name+":"
		notify+=targets[i].id+"\n"
	}
	sendText(notify)
}

//打印监控菜单-监听任务-指定容器页面
function Print_SpyClients(QLS,clients){
	notify="请选择指定容器进行编辑：\n(-数字删除，0增加，u返回)\n"
	for(let i=0;i<clients.length;i++){
		let find=false
		for(j=0;j<QLS.length;j++)
			if(clients[i]==QLS[j].client_id){
					find=true
					notify+=(i+1)+"、"+QLS[j].name+"\n"
				}
		if(!find)
			notify+=(i+1)+"、未找到容器"+clients[i]+"\n"
	}
	sendText(notify)
}

//打印监控菜单-监听任务-洞察变量页面
function Print_Spy_Envs(envs){
	let notify="请选择洞察变量进行编辑：\n(-数字删除，0增加，u返回)\n"
	for(let i=0;i<envs.length;i++)
		notify+=(i+1)+"、"+envs[i]+"\n"
	sendText(notify)
}

//打印监控菜单-监控任务页面
function Print_SpyItem(spy){
	let notify="请选择要编辑的属性:\n(u返回,q退出,wq保存)\n"
	notify+="1、监视任务名称："+spy.Name+"\n"
	notify+="2、脚本关键词："+spy.Keyword+"\n"
	notify+="3、洞察变量："+spy.Envs.toString()+"\n"
	notify+="4、指定容器："
	let data=bucketGet("qinglong","QLS")
	if(data!=""){//默认监视所有容器
		let QLS=JSON.parse(data)
		for(let i=0;i<spy.Clients.length;i++){
			let find=false
			for(j=0;j<QLS.length;j++)
				if(spy.Clients[i]==QLS[j].client_id){
					find=true
					notify+="【"+QLS[j].name+"】"
				}
					
			if(!find)
				notify+="["+spy.Clients[i]+"]"
		}
	}
	else
		notify+="未对接青龙"
	notify+="\n"
	if(spy.Disable)
		notify+="5、关闭禁用\n"
	else
		notify+="5、开启禁用\n"
	notify+="6、运行间隔时间："+spy.Interval+"分钟\n"
	sendText(notify)
}

//打印监控菜单-变量转换页面
function Print_SpyTran(trans){
	let notify="请选择添加添加或者删除转换变量：\n(-数字删除，0添加,u返回)\n"
	for(let i=0;i<trans.length;i++)
		notify+=(i+1)+"、"+trans[i].name+":"+trans[i].ori+"-->"+trans[i].redi+"\n"
	sendText(notify)
}

//打印监控菜单-链接解析页面
function Print_SpyUrl(decodes){
	let notify="请选择添加添加或者删除解析链接：\n(-数字删除，0添加,u返回)\n"
	for(let i=0;i<decodes.length;i++){
		notify+=(i+1)+"、"+decodes[i].name+"("+decodes[i].keyword+"):\n"
		for(let j=0;j<decodes[i].trans.length;j++)
			notify+=decodes[i].trans[j].ori+"-->"+decodes[i].trans[j].redi+"\n"
	}
	sendText(notify)
}

//格式化字符串
function strformat(str,n){
	let a=str.match(/[a-z0-9\-]/g)
	let A=str.match(/A-Z\(\)/g)
	let m=0
	if(a==null)
		a=[]
	if(A==null)
		A=[]
	m=a.length*2+A.length*3+(str.length-a.length-A.length)*4
	for(let i=0;m+i<n;i++)
		str+=" "
	return str
}
//导入监控数据
function Add_Spy(oldspy,newspy){
	let start=oldspy.length//保存导入结果数据中新添项开始的位置,即旧数据末尾
	for(let i=0;i<newspy.length;i++){//导入监控配置与现存某项监控的变量相同则不导入此项监控配置
		let find=0
		for(let j=0;j<oldspy.length;j++){
			for(k=0;k<oldspy[j].Envs.length;k++){
				for(m=0;m<newspy[i].Envs.length;m++){
					if(newspy[i].Envs[m]==oldspy[j].Envs[k]){
						find=1
//						notify+=newspy[i].Name+"的"+newspy[i].Envs[m]+"变量已存在于监控中，不导入\n"
						break
					}
				}
				if(find)
					break
			}
			if(find)
				break
		}
		if(!find){
			ClearHistory([newspy[i]])
			oldspy.push(newspy[i])
//			notify+="成功导入【"+newspy[i].Name+"】\n"
		}
	}
//	sendText(JSON.stringify(oldspy))
	return {spys:oldspy,addat:start}
}

//修改青龙配置文件变量
function Modify_QL_Config(host,token,envs){
	//sendText(JSON.stringify(envs))
	let oldConfig=Get_QL_Config(host,token,"config.sh")
	if(oldConfig!=null){
		let newConfig=oldConfig
		for(let i=0;i<envs.length;i++){
			let regstr="(?<=export[ ]+"+envs[i].name+"[ ]*=[ ]*\")[^\"]+"
			let reg=new RegExp(regstr)
//			sendText(regstr)
//			sendText(newConfig.match(reg))
			if(newConfig.search(reg)==-1)
				newConfig+="\nexport "+envs[i].name+"=\""+envs[i].value+"\""
			else 
				newConfig=newConfig.replace(reg,envs[i].value)			
		}
		return Update_QL_Config(host,token,"config.sh",newConfig)
	}
	else return false
}

//修改配置文件变量[{name:变量名,value:变量值}]并执行含关键词keyword的任务
function Spy_QL_Task(QL,envs,keyword){
//	sendText("ql task:"+JSON.stringify(envs)+"\n\n"+keyword)
	let host=QL.host,client_id=QL.client_id,client_secret=QL.client_secret
	let token=Get_QL_Token(host,client_id,client_secret)
//	let token={"token":"fcd177a5-e3e0-4791-8a41-dca51261462f","token_type":"Bearer","expiration":1663494257}
	if(token==null)
		return null
	if(!Modify_QL_Config(host,token,envs)){
		Notify("变量修改失败"+JSON.stringify(envs))
		return false	
	}
	let crons=Get_QL_Crons(host,token)
	for(let i=0;i<crons.length;i++){
		if(crons[i].command.indexOf(keyword)!=-1||crons[i].name.indexOf(keyword)!=-1){
//			sendText(crons[i].command+"\n\n"+crons[i].name)
			if(crons[i]._id){
				if(!Stop_QL_Crons(host,token,[crons[i]._id])){
					Notify([crons[i]._id]+"停止失败")
//					return false
				}
				sleep(3000)
				return Start_QL_Crons(host,token,[crons[i]._id])
			}
			else{
				if(!Stop_QL_Crons(host,token,[crons[i].id]))
					return false
				sleep(3000)
				return Start_QL_Crons(host,token,[crons[i].id])				
			}
		}
	}
	sendText("未找到"+keyword+"任务")
	return false
}

//解析url
function Decode_Url(url){
	let spy=Decode_UrlInSetting(url)//尝试根据用户配置解析链接
	if(spy.length!=0)
		return spy
//	sendText(url)	
	//用户配置解析失败使用内置解析
	let activityId=GetActivityId(url)
//	sendText(activityId)
	if(activityId!=null){
		if(url.indexOf("https://cjhydz-isv.isvjcloud.com/wxTeam/activity")!=-1){
			spy.push({
				name:"jd_cjhy_activityId",
				value:activityId,
				act:"CJ组队瓜分"
				})
		}	
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxTeam/activity")!=-1){
			spy.push({
				name:"jd_zdjr_activityId",
				value:activityId,
				act:"LZ组队瓜分"
			})
			
		}
		
		else if(url.indexOf("https://jinggengjcq-isv.isvjcloud.com")!=-1){
			spy.push({
				name:"DPLHTY",
				value:activityId,
				act:"大牌联合开卡"
			})		
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxInviteActivity/openCard/invitee")!=-1){
			spy.push({
				name:"VENDER_ID",
				value:activityId,
				act:"CJ入会有礼"
			})	
		}
		
		else if(url.indexOf("https://cjhydz-isv.isvjcloud.com/microDz/invite/activity")!=-1){
			spy.push({
				name:"jd_wdz_activityId",
				value:activityId,
				act:"CJ微定制"
			})
		}
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxShareActivity/activity")!=-1){
			spy.push({
				name:"jd_fxyl_activityId",
				value:activityId,
				act:"LZ分享有礼"
			})
		}
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxCollectCard")!=-1){
			spy.push({
				name:"M_WX_COLLECT_CARD_URL",
				value:url,
				act:"LZ集卡抽奖"
			})
			spy.push({
				name:"jd_wxCollectCard_activityId",//KR
				value:activityId,
				act:"LZ集卡抽奖"
			})
		}
				
		else if(url.indexOf("https://lzkj-isv.isvjd.com/wxCollectionActivity/activity2")!=-1||url.indexOf("https://lzkj-isv.isvjcloud.com/wxCollectionActivity/")!=-1){
			spy.push({
				name:"M_WX_ADD_CART_URL",
				value:url,
				act:"LZ加购有礼"
			})									
			spy.push({
				name:"jd_lzaddCart_activityId",//KR
				value:activityId,
				act:"LZ加购有礼"
			})
			spy.push({
				name:"jd_lzkj_wxCollectionActivityId",//环保
				value:activityId,
				act:"LZ加购有礼"
			})
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxCollectionActivity/activity")!=-1){
			spy.push({
				name:"jd_cjhy_wxCollectionActivityId",//环境保护库
				value:activityId,
				act:"CJ加购有礼"
			})		
		}
		
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/lzclient")!=-1){
			spy.push({
				name:"M_WX_LUCK_DRAW_URL",
				value:url,
				act:"LZ幸运抽奖"
			})
			spy.push({
				name:"LUCK_DRAW_URL",
				value:url,
				act:"LZ幸运抽奖"
			})
			spy.push({
				name:"jd_lzkj_wxDrawActivity_Id",
				value:activityId,
				act:"LZ幸运抽奖"
			})
		}
		
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity")!=-1||url.indexOf("https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity")!=-1){
			spy.push({
				name:"LUCK_DRAW_URL",
				value:url,
				act:"LZ幸运抽奖"
			})
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxDrawActivity/activity")!=-1){
			spy.push({
				name:"M_WX_LUCK_DRAW_URL",
				value:url,
				act:"CJ幸运抽奖"
			})
			spy.push({
				name:"LUCK_DRAW_URL",
				value:url,
				act:"CJ幸运抽奖"
			})
			spy.push({
				name:"jd_cjhy_wxDrawActivity_Id",
				value:activityId,
				act:"CJ幸运抽奖"
			})
		}
		
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxgame/activity")!=-1){
			spy.push({
				name:"jd_wxgame_activityId",
				value:activityId,
				act:"LZ店铺游戏"
			})
			
		}
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxSecond")!=-1){
			spy.push({
				name:"jd_wxSecond_activityId",
				value:activityId,
				act:"LZ读秒拼手速"
			})
		}
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxCartKoi/cartkoi")!=-1){
			spy.push({
				name:"jd_wxCartKoi_activityId",
				value:activityId,
				act:"LZ购物车锦鲤"
			})
		}	
			
		else if(url.indexOf("https://lzkj-isv.isvjd.com/drawCenter")!=-1||url.indexOf("https://lzkj-isv.isvjcloud.com/drawCenter")!=-1){
			spy.push({
				name:"jd_drawCenter_activityId",
				value:activityId,
				act:"LZ刮刮乐"
			})
			spy.push({
				name:"M_WX_CENTER_DRAW_URL",
				value:url,
				act:"老虎机抽奖"
			})		
		}
				
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity")!=-1){
			spy.push({
				name:"jd_wxFansInterActionActivity_activityId",
				value:activityId,
				act:"LZ粉丝互动"
			})
		}
					
		else if(url.indexOf("https://prodev.m.jd.com/mall/active/dVF7gQUVKyUcuSsVhuya5d2XD4F")!=-1){
			spy.push({
				name:"yhyauthorCode",
				value:activityId,
				act:"邀好友赢大礼"
			})
		}
			
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxShopFollowActivity")!=-1){		
			spy.push({
				name:"jd_wxShopFollowActivity_activityId",
				value:activityId,
				act:"LZ店铺关注抽奖"
			})
		}	
		
		else if(url.indexOf("https://lzkjdz-isv.isvjd.com/wxShareActivity/activity/")!=-1){		
			spy.push({
				name:"jd_wxShareActivity_activityId",
				value:activityId,
				act:"LZ分享有礼"
			})
		}
					
		else if(url.indexOf("https://jdjoy.jd.com/module/task/v2/doTask")!=-1){		
			spy.push({
				name:"comm_activityIDLis",
				value:activityId,
				act:"JoyJD任务"
			})
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/sign/signActivity")!=-1){		
			spy.push({
				name:"CJHY_SIGN",
				value:activityId,
				act:"超级店铺无线签到"
			})
		}
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/sign/sevenDay/signActivity")!=-1){		
			spy.push({
				name:"CJHY_SEVENDAY",
				value:activityId,
				act:"超级店铺无线签到"
			})
		}
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/sign/signActivity2")!=-1){		
			spy.push({
				name:"LZKJ_SIGN",
				value:activityId,
				act:"超级店铺无线签到"
			})
		}
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/sign/sevenDay/signActivit")!=-1){		
			spy.push({
				name:"LZKJ_SEVENDAY",
				value:activityId,
				act:"超级店铺无线签到"
			})
		}
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxUnPackingActivity/activity/activity")!=-1){		
			spy.push({
				name:"jd_wxUnPackingActivity_activityId",
				value:activityId,
				act:"LZ让福袋飞"
			})
		}
		
	}
	return spy
}

//根据用户配置尝试解析url
function Decode_UrlInSetting(url){
	let spy=[]//[{name:监控变量名,value:监控变量值,act:活动任务名}]
	let data=bucketGet("jd_cookie","spy_urldecode_new")
	if(data!=""){
		let urldecodes=JSON.parse(data)
		for(let i=0;i<urldecodes.length;i++){
			if(url.indexOf(urldecodes[i].keyword)!=-1){
				for(let j=0;j<urldecodes[i].trans.length;j++){
					let temp={
							act:urldecodes[i].name,
							name:urldecodes[i].trans[j].redi
						}
					if(urldecodes[i].trans[j].ori==-1){//使用整段url作为变量
						temp["value"]=url
						spy.push(temp)
					}
					else{//提取参数作为变量
						let reg=new RegExp("(?<="+urldecodes[i].trans[j].ori+"=)[^&]+")
						let actid=url.match(reg)
						if(actid!=null){
							temp["value"]=actid
							spy.push(temp)
						}
						
					}
				}
				if(spy.length!=0)//成功在配置中找到并将url转换为监控变量
					break
			}
		}
	}
	return spy
}

//提取链接的活动id 
function GetActivityId(url){
	try{
		let actid=""
		let params=url.split("?")[1]
		if(params.indexOf("activityId")!=-1)
			actid=params.match(/(?<=activityId=)[^&]+/g)
		else if(params.indexOf("actId")!=-1)
			actid=params.match(/(?<=actId=)[^&]+/g)
		else if(params.indexOf("venderId")!=-1)
			actid=params.match(/(?<=venderId=)[^&]+/g)
		else if(params.indexOf("code")!=-1)
			actid=params.match(/(?<=code=)[^&]+/g)
		return actid[0]
	}
	catch(err){
		return null
	}
	return null
}

//获取傻妞数据库mainkey下设置的通知渠道发送msg消息
function Notify_MainKey(mainKey,isGroup,msg,tgmsg){
	let record=[]//记录已通知[{imType:qq/tg/wx,id:ID}]
	let NotifyTo={
        imType:"",
        userID:"",
        groupCode:"",
		content:msg
    }
	let toType=bucketKeys(mainKey)
	for(let i=0;i<toType.length;i++){
		let ids=bucketGet(mainKey,toType[i]).split("&")
		if(ids=="")
			continue
		NotifyTo.imType=toType[i]
		for(let j=0;j<ids.length;j++){
			if(toType[i]!="tg"){
				if(isGroup)
					NotifyTo.groupCode=ids[j]
				else
					NotifyTo.userID=ids[j]
				push(NotifyTo)	
			}
			else{
				tgmsg=tgmsg.replace(/_/g,"\\_")
				SendToTG(ids[j],tgmsg)
//				sendText(tgmsg)
			}
			record.push({imType:toType[i],id:ids[j]})
		}
	}
//	sendText(JSON.stringify(record))
	return record
}

//根据静默与否发送msg消息,tgmsg:消息目标为tg时的消息(静默时需另行推送消息时使用)
function Notify(msg,tgmsg){
	let imType=GetImType()
	if(tgmsg==undefined)
		tgmsg=msg
	if(bucketGet("jd_cookie","spy_silent_new")!="true"||isAdmin()){
		if(imType!="tg")
			sendText(msg)
		else{
			msg=msg.replace(/_/g,"\\_")
			if(GetChatID()!=0)
				SendToTG(GetChatID(),msg)
			else
				SendToTG(GetUserID(),msg)
		}
	}
	else{
		let message=GetContent()
		if(message.match(/\[CQ:[^\]]+\]/g)==null&&message.match(/\[[^\]]+\]\([^)]+\)/)==null)
			message=message.replace("http","xxxx")
		let from="『白眼』\n处理来自"+GetImType()+"群【"+GetChatname()+"】-【"+GetUsername()+"】的消息:\n\n"+message+"\n---------------------\n"
		if((from+tgmsg).length>800)
			from="『白眼』\n处理来自"+GetImType()+"群【"+GetChatname()+"】-【"+GetUsername()+"】的消息:\n\n"+message.slice(0,80)+"...\n---------------------\n"
		Notify_MainKey("SpyNotify",false,from+msg,from+tgmsg)
		Notify_MainKey("SpyGroupNotify",true,from+msg,from+tgmsg)
	}		
}

//将msg中的链接转为超链接，修正使用tg bot发送消息时msg中"_"导致的发送的信息错误
function TransStr(msg,imType,title){
	if(imType=="pgm"){//消息转为markdown语法
		let urls=msg.match(/https?:\/\/[0-9a-zA-Z-_?,'+&%$=~*!():@\/\.]+/g)
		if(urls!=null){
			for(let i=0;i<urls.length;i++)
				msg=msg.replace(/https?:\/\/[0-9a-zA-Z-_?,'+&%$=~*!():@\/\.]+/,"["+title+"]("+urls[i]+")")
		}
	}
	else if(imType=="qq"){
		let urls=msg.match(/https?:\/\/[0-9a-zA-Z-_?,'+&%$=~*!():@\/\.]+/g)
		if(urls!=null){
			for(let i=0;i<urls.length;i++)
				msg=msg.replace(/https?:\/\/[0-9a-zA-Z-_?,'+&%$=~*!():@\/\.]+/,"[CQ:share,url="+urls[i]+",title="+title+"]")
		}
	}
	return msg
}

/**************青龙api************/
//获取青龙token
function Get_QL_Token(host,client_id,client_secret){
	try{
		let data=request({url:host+"/open/auth/token?client_id="+client_id+"&client_secret="+client_secret})
		return JSON.parse(data).data	
	}
	catch(err){
		return null
	}
}

//获取青龙配置文件内容
function Get_QL_Config(host,token,filename){
	try{
		let data=request({
			url:host+"/open/configs/"+filename,
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
			dataType: "json"
		})
		return data.data	
	}
	catch(err){
		return null
	}
}

//修改配置文件
function Update_QL_Config(host,token,filename,content){
	try{
		let data=request({
			url:host+"/open/configs/save",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{"name":filename,"content":content},
			dataType: "application/json"
		})
		if(JSON.parse(data).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//获取所有任务，返回所有任务对象数组
function Get_QL_Crons(host,token){
	try{
		let data=request({
			url:host+"/open/crons",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
			dataType: "application/json"
		})
		return JSON.parse(data).data	
	}
	catch(err){
		return null
	}
}

//立即执行任务id,id为数组
function Start_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/run",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}

//停止任务id,id为数组
function Stop_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/stop",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}



/*************口令解析api******************/
//WALL接口解析
function WallDecode(code){
	let data = request({
             url: "http://ailoveu.eu.org:19840/jCommand",
             headers: {
				"User-Agent": "Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
				"Content-Type": "application/json;charset=utf-8",
				"token": get("WALL")
			},
            method: "post",
            dataType: "json",
            body: {"code": code}
    })
	try{
//		sendText(data)
		if(data.code==200&&data.data!="无法解析该口令")
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}

//Windfgg接口解析
function WindfggDecode(code){
	let data = request({
			url: "http://api.windfgg.cf/jd/code",
			headers: {
				"User-Agent":
			"Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": "Bearer " + get("WindfggToken")
			},
			method: "post",
			dataType: "json",
			body: { "code": code }
		})
	try{
//		sendText(data)
		if(data.code==200)
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}

//nolan接口解析
function NolanDecode(code){
	let resp=request({
			url:"https://api.nolanstore.top/JComExchange",
			method:"post",
			headers:{
				accept: "application/json",
				contentType:"application/json"
			},
			dataType:"json",
			body:{"code": code}
	})
	try{
//		sendText(resp)
		let data=JSON.parse(resp)
		if(data.code==0)
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}


/****************tg bot API*********************/
function SendToTG(id,msg){
	request({
		url:"https://api.telegram.org/bot"+bucketGet("tg","token")+"/sendMessage",
		method:"post",
		body:{
			"chat_id":id,
			"parse_mode":"markdown",
			"text":msg
		}
	})
}

main()
